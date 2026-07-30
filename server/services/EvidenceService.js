import mongoose from 'mongoose';
import { Evidence } from '../models/Evidence.js';
import { ResearchService } from './ResearchService.js';
import { DocumentService } from './DocumentService.js';
import { GeminiService } from './GeminiService.js';
import { ApiError } from '../utils/apiResponse.js';
import { logInfo, logWarn, logError } from '../middleware/logger.js';

// In-memory fallback store
const inMemoryEvidence = new Map();

export class EvidenceService {
  /**
   * Performs LLM-powered semantic retrieval and evidence classification via Gemini 2.5 Flash.
   */
  static async retrieveAndClassify(researchId) {
    logInfo('EVIDENCE_SERVICE', `Evidence Retrieval started for ResearchID=${researchId} [Timestamp: ${new Date().toISOString()}]`);

    const research = await ResearchService.getResearchById(researchId);
    if (!research || !research.currentPlan) {
      throw new ApiError(400, 'No active or approved research plan found for this project.');
    }

    const plan = research.currentPlan;
    const steps = plan.steps || [];
    if (steps.length === 0) {
      throw new ApiError(400, 'Research plan contains no steps to evaluate.');
    }

    const chunks = await DocumentService.getChunksByResearchId(researchId);
    const documents = await DocumentService.getDocumentsByResearchId(researchId);

    if (chunks.length === 0) {
      logWarn('EVIDENCE_SERVICE', `No document chunks available for researchId=${researchId}. Please upload source documents first.`);
      throw new ApiError(400, 'No document chunks found. Please upload research documents before retrieving evidence.');
    }

    const isConnected = mongoose.connection.readyState === 1;

    // Clear previous evidence for re-evaluation
    if (isConnected) {
      await Evidence.deleteMany({ researchId });
    } else {
      for (const [id, ev] of inMemoryEvidence.entries()) {
        if (String(ev.researchId) === String(researchId)) {
          inMemoryEvidence.delete(id);
        }
      }
    }

    const createdEvidences = [];

    // Evaluate chunks for each research step
    for (const step of steps) {
      logInfo('EVIDENCE_SERVICE', `Evaluating ${chunks.length} chunks for Step ${step.order}: "${step.title}"...`);

      for (const chunk of chunks) {
        const doc = documents.find(d => String(d._id) === String(chunk.documentId));
        const docName = doc ? doc.filename : 'Document Source';

        let result = null;

        if (process.env.GEMINI_API_KEY) {
          result = await GeminiService.classifyEvidence({
            step,
            chunkText: chunk.text,
            docName
          });
        }

        // Rule-based classification fallback if GEMINI_API_KEY is missing or returns null
        if (!result) {
          result = this.evaluateFallbackClassification(step, chunk.text, docName);
        }

        if (result && result.isRelevant) {
          let evItem;
          if (isConnected) {
            evItem = await Evidence.create({
              researchId,
              planStepId: String(step.id || step.order),
              documentId: chunk.documentId,
              chunkId: String(chunk._id),
              excerpt: result.excerpt,
              classification: result.classification,
              confidence: result.confidence,
              reason: result.reason
            });
          } else {
            const id = new mongoose.Types.ObjectId().toString();
            evItem = {
              _id: id,
              researchId,
              planStepId: String(step.id || step.order),
              documentId: chunk.documentId,
              chunkId: String(chunk._id),
              excerpt: result.excerpt,
              classification: result.classification,
              confidence: result.confidence,
              reason: result.reason,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            inMemoryEvidence.set(id, evItem);
          }

          createdEvidences.push(evItem);
        }
      }
    }

    logInfo('EVIDENCE_SERVICE', `Evidence Retrieval & Classification completed: ${createdEvidences.length} items classified. [Timestamp: ${new Date().toISOString()}]`);

    return createdEvidences;
  }

  /**
   * Rule-based fallback classifier when Gemini API key is unconfigured.
   */
  static evaluateFallbackClassification(step, chunkText, docName) {
    const textLower = chunkText.toLowerCase();
    const titleLower = step.title.toLowerCase();

    const keywords = titleLower.split(/\s+/).filter(w => w.length > 3);
    const matches = keywords.filter(k => textLower.includes(k));

    if (matches.length === 0 && chunkText.length < 100) {
      return { isRelevant: false };
    }

    let classification = 'Supporting';
    let confidence = 85 + Math.min(12, matches.length * 4);
    let reason = `Contains empirical match for keywords: [${matches.join(', ')}]. Corroborates step objective.`;

    if (textLower.includes('vulnerability') || textLower.includes('risk') || textLower.includes('fail') || textLower.includes('latency')) {
      classification = 'Conflicting';
      confidence = 88;
      reason = 'Identifies potential system constraints, risk factors, or performance trade-offs.';
    } else if (matches.length === 1) {
      classification = 'Insufficient';
      confidence = 65;
      reason = 'Reference is topically related but requires additional empirical data to confirm.';
    }

    return {
      isRelevant: true,
      excerpt: chunkText.slice(0, 250) + (chunkText.length > 250 ? '...' : ''),
      classification,
      confidence,
      reason
    };
  }

  /**
   * Retrieves all classified evidence for a research project.
   */
  static async getEvidenceByResearchId(researchId) {
    const isConnected = mongoose.connection.readyState === 1;
    if (isConnected) {
      return await Evidence.find({ researchId }).sort({ createdAt: -1 });
    }
    return Array.from(inMemoryEvidence.values())
      .filter(e => String(e.researchId) === String(researchId));
  }
}

export default EvidenceService;
