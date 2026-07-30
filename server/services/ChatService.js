import mongoose from 'mongoose';
import { ChatMessage } from '../models/ChatMessage.js';
import { ResearchService } from './ResearchService.js';
import { EvidenceService } from './EvidenceService.js';
import { DocumentService } from './DocumentService.js';
import { GeminiService } from './GeminiService.js';
import { ApiError } from '../utils/apiResponse.js';
import { logInfo, logError } from '../middleware/logger.js';

export class ChatService {
  /**
   * Processes a user question using RAG over stored evidence via Gemini 2.5 Flash, persisting messages in MongoDB.
   */
  static async sendMessage(researchId, userPrompt) {
    const startTime = Date.now();
    logInfo('CHAT_SERVICE', `Question received for ResearchID=${researchId}: "${userPrompt.slice(0, 50)}..."`);

    if (!researchId) {
      throw new ApiError(400, 'researchId is required.');
    }
    if (!userPrompt || !userPrompt.trim()) {
      throw new ApiError(400, 'Message prompt cannot be empty.');
    }

    const research = await ResearchService.getResearchById(researchId);
    if (!research) {
      throw new ApiError(404, `Research workspace not found with ID: ${researchId}`);
    }

    // Save user message in MongoDB
    const userMsg = await ChatMessage.create({
      researchId,
      role: 'user',
      content: userPrompt.trim(),
      citations: []
    });
    logInfo('CHAT_SERVICE', `[DB_WRITE] Chat message stored in collection 'chatmessages': Role=user, ID=${userMsg._id}`);

    // Retrieve stored evidence
    const evidences = await EvidenceService.getEvidenceByResearchId(researchId);
    const documents = await DocumentService.getDocumentsByResearchId(researchId);

    const getDocName = (docId) => {
      const doc = documents.find(d => String(d._id) === String(docId));
      return doc ? doc.filename : 'Document Source';
    };

    const promptWords = userPrompt.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const relevantEvidences = evidences.filter(ev => {
      const text = ev.excerpt.toLowerCase() + (ev.reason ? ev.reason.toLowerCase() : '');
      return promptWords.some(w => text.includes(w)) || evidences.length <= 4;
    });

    let assistantContent = '';
    let citationsPool = [];

    if (evidences.length === 0 || relevantEvidences.length === 0) {
      assistantContent = `Insufficient empirical evidence found in uploaded source documents to answer this query. The EvidenceAI engine operates strictly on verified empirical evidence and does not hallucinate answers from external LLM training knowledge. Please upload additional source documents to extract evidence for this topic.`;
    } else {
      citationsPool = relevantEvidences.map((ev, idx) => ({
        evidenceId: String(ev._id || `ev_${idx + 1}`),
        docName: getDocName(ev.documentId),
        chunkNumber: 1,
        excerpt: ev.excerpt
      }));

      // Call Gemini 2.5 Flash
      if (process.env.GEMINI_API_KEY) {
        try {
          assistantContent = await GeminiService.generateRAGChatResponse({
            userPrompt,
            evidences: relevantEvidences,
            documents,
            researchQuestion: research.researchQuestion
          });
        } catch (apiErr) {
          logError('CHAT_SERVICE', `Gemini RAG Chat error: ${apiErr.message}`);
        }
      }

      // Fallback synthesis if Gemini key missing or error occurred
      if (!assistantContent) {
        const topEv = relevantEvidences[0];
        assistantContent = `Based on stored evidence from **${getDocName(topEv.documentId)}**, empirical findings indicate: "${topEv.excerpt}". Classification: **${topEv.classification}** (${topEv.confidence}% confidence). Reasoning: ${topEv.reason || 'Corroborates step objective.'}`;
      }
    }

    const latencyMs = Date.now() - startTime;

    // Save assistant message in MongoDB
    const assistantMsg = await ChatMessage.create({
      researchId,
      role: 'assistant',
      content: assistantContent,
      citations: citationsPool,
      latencyMs
    });
    logInfo('CHAT_SERVICE', `[DB_WRITE] Chat message stored in collection 'chatmessages': Role=assistant, ID=${assistantMsg._id}, Citations=${citationsPool.length}`);

    logInfo('CHAT_SERVICE', `Response generated for ResearchID=${researchId} [Latency: ${latencyMs}ms, Citations: ${citationsPool.length}]`);

    return {
      userMessage: userMsg,
      assistantMessage: assistantMsg
    };
  }

  static async getHistory(researchId) {
    return await ChatMessage.find({ researchId }).sort({ createdAt: 1 });
  }

  static async clearHistory(researchId) {
    await ChatMessage.deleteMany({ researchId });
    logInfo('CHAT_SERVICE', `[DB_WRITE] Chat history deleted from collection 'chatmessages' for ResearchID=${researchId}`);
    return { success: true };
  }
}

export default ChatService;
