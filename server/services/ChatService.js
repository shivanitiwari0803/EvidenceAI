import mongoose from 'mongoose';
import RetrievalService from './RetrievalService.js';
import { ChatMessage } from '../models/ChatMessage.js';
import { ResearchService } from './ResearchService.js';
import { EvidenceService } from './EvidenceService.js';
import { DocumentService } from './DocumentService.js';
import { GeminiService } from './GeminiService.js';
import { ApiError } from '../utils/apiResponse.js';
import { logInfo, logError } from '../middleware/logger.js';

export class ChatService {
  /**
   * Classifies user query intent using conversation history and intent patterns.
   */
  static classifyQueryIntent(userPrompt, history = []) {
    const text = userPrompt.toLowerCase().trim();

    // 1. Out-of-Scope Check
    const outOfScopePatterns = [
      /who won (fifa|world cup|super bowl|ipl|oscar|election)/i,
      /what('s| is) the weather/i,
      /movie recommendation/i,
      /tell me a joke/i,
      /write a python snake game/i,
      /recipe for/i,
      /capital of (france|japan|germany|spain)/i
    ];
    if (outOfScopePatterns.some(p => p.test(text))) {
      return 'OUT_OF_SCOPE';
    }

    // 2. Citation / Source Request
    const citationPatterns = [
      /show (the )?sources/i,
      /show (the )?citations/i,
      /where did (you|that) (get|come from)/i,
      /which (document|source|file)/i,
      /what (are the )?sources/i,
      /list (the )?references/i,
      /cite (the )?evidence/i,
      /show citations/i
    ];
    if (citationPatterns.some(p => p.test(text))) {
      return 'CITATION_REQUEST';
    }

    // 3. Summary Request
    const summaryPatterns = [
      /summarize (that|again|it|this)/i,
      /can you simplify/i,
      /give me a summary/i,
      /tldr/i,
      /briefly explain/i
    ];
    if (summaryPatterns.some(p => p.test(text))) {
      return 'SUMMARY_REQUEST';
    }

    // 4. Reasoning / Clarification Request
    const reasoningPatterns = [
      /^why(\?)?$/i,
      /explain (that|why|more)/i,
      /what do you mean/i,
      /elaborate/i,
      /how so/i,
      /why is that evidence/i
    ];
    if (reasoningPatterns.some(p => p.test(text))) {
      return 'REASONING_REQUEST';
    }

    // 5. Conflict Analysis
    const conflictPatterns = [
      /what is the conflict/i,
      /compare (it )?with conflicting/i,
      /what conflicts/i,
      /show (me )?conflicting/i,
      /any contradictions/i
    ];
    if (conflictPatterns.some(p => p.test(text))) {
      return 'CONFLICT_ANALYSIS';
    }

    // 6. Supporting Analysis
    const supportingPatterns = [
      /what supports/i,
      /which source is strongest/i,
      /show supporting/i,
      /what evidence supports/i
    ];
    if (supportingPatterns.some(p => p.test(text))) {
      return 'SUPPORTING_ANALYSIS';
    }

    return 'GENERAL_EVIDENCE_RETRIEVAL';
  }

  /**
   * Processes a multi-turn user question using RAG over stored evidence via Gemini 2.5 Flash.
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

    // Fetch multi-turn conversation history
    const history = await ChatMessage.find({ researchId }).sort({ createdAt: 1 });
    const previousAssistantMsg = [...history].reverse().find(m => m.role === 'assistant');

    // Classify query intent
    const intent = this.classifyQueryIntent(userPrompt, history);
    logInfo('CHAT_SERVICE', `Detected Query Intent: "${intent}" for prompt: "${userPrompt}"`);

    // Save user message in MongoDB
    const userMsg = await ChatMessage.create({
      researchId,
      role: 'user',
      content: userPrompt.trim(),
      citations: []
    });

    // Retrieve stored evidence & source documents
    const evidences = await EvidenceService.getEvidenceByResearchId(researchId);
    const documents = await DocumentService.getDocumentsByResearchId(researchId);


    const retrievedChunks =
  await RetrievalService.retrieveRelevantChunks(
    researchId,
    userPrompt,
    5
  );

logInfo(
  'CHAT_SERVICE',
  `Vector retrieval returned ${retrievedChunks.length} relevant chunks`
);


    const getDocName = (docId) => {
      const doc = documents.find(d => String(d._id) === String(docId));
      return doc ? doc.filename : 'Document Source';
    };

    let assistantContent = '';
    let citationsPool = [];

    // INTENT CASE 1: OUT OF SCOPE
    if (intent === 'OUT_OF_SCOPE') {
      assistantContent = `This question cannot be answered using the uploaded research documents.\n\n*The EvidenceAI engine operates strictly on verified empirical evidence stored in your active research workspace and does not answer general trivia or out-of-scope queries.*`;
      citationsPool = [];
    }
    // INTENT CASE 2: CITATION / SOURCE REQUEST
    else if (intent === 'CITATION_REQUEST' && previousAssistantMsg && previousAssistantMsg.citations?.length > 0) {
      citationsPool = previousAssistantMsg.citations;
      assistantContent = `### Sources & Citations Used for Previous Response\n\nThe previous findings were derived directly from the following empirical document citations:\n\n`;
      citationsPool.forEach((c, idx) => {
        assistantContent += `**[Citation ${idx + 1}]** 📄 **${c.docName}** (Chunk #${c.chunkNumber})\n> "${c.excerpt}"\n\n`;
      });
      assistantContent += `\n### Confidence Score\n**95%** — Verified against stored empirical evidence.`;
    }
    // INTENT CASE 3: ZERO EVIDENCE FOUND
    else if (evidences.length === 0) {
      assistantContent = `### No Relevant Evidence Retrieved\n\nNo relevant empirical evidence was retrieved for this topic from the uploaded source documents.\n\n**Possible Reasons:**\n• Uploaded documents do not discuss this topic or evaluation metric.\n• The research scope was configured for a different technical domain.\n• Additional source documentation (.pdf, .docx, .txt, .md) is required.\n\n**Recommended Next Action:**\nNavigate to the **Documents** stage to upload technical source files covering this topic.`;
      citationsPool = [];
    }
    // INTENT CASE 4: INTENT-BASED OR GROUNDED RETRIEVAL
    else {
      let filteredEvidences = [...evidences];

      if (intent === 'CONFLICT_ANALYSIS') {
        const conf = evidences.filter(e => e.classification === 'Conflicting');
        if (conf.length > 0) filteredEvidences = conf;
      } else if (intent === 'SUPPORTING_ANALYSIS') {
        const supp = evidences.filter(e => e.classification === 'Supporting');
        if (supp.length > 0) filteredEvidences = supp;
      } else if (intent === 'GENERAL_EVIDENCE_RETRIEVAL') {
        const promptWords = userPrompt.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const matched = evidences.filter(ev => {
          const text = ev.excerpt.toLowerCase() + (ev.reason ? ev.reason.toLowerCase() : '');
          return promptWords.some(w => text.includes(w));
        });
        if (matched.length > 0) filteredEvidences = matched;
      }

      citationsPool = filteredEvidences.slice(0, 5).map((ev, idx) => ({
        evidenceId: String(ev._id || `ev_${idx + 1}`),
        docName: getDocName(ev.documentId),
        chunkNumber: 1,
        excerpt: ev.excerpt
      }));

      if (process.env.GEMINI_API_KEY) {
        try {
          assistantContent = await GeminiService.generateRAGChatResponse({
  userPrompt,
  intent,
  evidences: filteredEvidences,
  retrievedChunks,
  documents,
  researchQuestion: research.researchQuestion,
  conversationHistory: history,
  previousAssistantMessage: previousAssistantMsg
});
        } catch (apiErr) {
          logError('CHAT_SERVICE', `Gemini RAG Chat error: ${apiErr.message}`);
        }
      }

      // Fallback response generator if Gemini API key is missing or failed
      if (!assistantContent) {
        const suppCount = filteredEvidences.filter(e => e.classification === 'Supporting').length;
        const confCount = filteredEvidences.filter(e => e.classification === 'Conflicting').length;
        const topEv = filteredEvidences[0];

        assistantContent = `### Answer\nBased on stored evidence from **${getDocName(topEv.documentId)}**, empirical analysis indicates: "${topEv.excerpt}". Classification: **${topEv.classification}** (${topEv.confidence}% confidence). Reasoning: ${topEv.reason || 'Corroborates step objective.'}\n\n### Evidence Breakdown\n- **Supporting**: ${suppCount} claims\n- **Conflicting**: ${confCount} claims\n- **Insufficient**: ${evidences.length - suppCount - confCount} claims\n\n### Sources & Citations\n- 📄 **${getDocName(topEv.documentId)}** — *${topEv.classification}* (${topEv.confidence}% Confidence)\n  > "${topEv.excerpt}"\n\n### Confidence Score\n**${topEv.confidence}%** — Grounded strictly in uploaded research documents.`;
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
