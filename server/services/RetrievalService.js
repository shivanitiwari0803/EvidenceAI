import mongoose from 'mongoose';
import { DocumentChunk } from '../models/DocumentChunk.js';
import EmbeddingService from './EmbeddingService.js';
import { logInfo, logError } from '../middleware/logger.js';

class RetrievalService {
  static async retrieveRelevantChunks(
    researchId,
    userPrompt,
    limit = 5
  ) {
    try {
      if (!researchId || !userPrompt?.trim()) {
        return [];
      }

      // Validate research ID
      if (!mongoose.Types.ObjectId.isValid(researchId)) {
        logError(
          'RETRIEVAL_SERVICE',
          `Invalid researchId: ${researchId}`
        );

        return [];
      }

      // 1. Generate embedding for the user's query
      const queryEmbedding =
        await EmbeddingService.generateQueryEmbedding(
          userPrompt.trim()
        );

      logInfo(
        'RETRIEVAL_SERVICE',
        `Query embedding generated: ${queryEmbedding.length} dimensions`
      );

      // Retrieve more than the final limit so we can apply
      // a relevance threshold before selecting final chunks.
      const candidateLimit = Math.max(limit * 4, 20);

      // 2. Search only chunks belonging to the current research workspace
      const results = await DocumentChunk.aggregate([
        {
          $vectorSearch: {
            index: 'evidence_chunks_vector_index',
            path: 'embedding',
            queryVector: queryEmbedding,

            numCandidates: Math.max(candidateLimit * 5, 100),

            limit: candidateLimit,

            filter: {
              researchId: new mongoose.Types.ObjectId(researchId)
            }
          }
        },
        {
          $project: {
            _id: 1,
            documentId: 1,
            researchId: 1,
            chunkNumber: 1,
            text: 1,
            startPosition: 1,
            endPosition: 1,
            score: {
              $meta: 'vectorSearchScore'
            }
          }
        }
      ]);

      logInfo(
        'RETRIEVAL_SERVICE',
        `Vector search returned ${results.length} candidate chunks`
      );

      // TEMPORARY threshold.
      // We will tune this using real scores from your tests.
      const MIN_RELEVANCE_SCORE = 0.7;

      const relevantChunks = results
        .filter((chunk) => {
          const score = Number(chunk.score);

          return (
            chunk.text &&
            Number.isFinite(score) &&
            score >= MIN_RELEVANCE_SCORE
          );
        })
        .slice(0, limit);

      logInfo(
        'RETRIEVAL_SERVICE',
        `After relevance filtering: ${relevantChunks.length} chunks`
      );

      console.log(
        '[RAG DEBUG] Retrieval scores:',
        results.map((chunk) => ({
          chunkNumber: chunk.chunkNumber,
          documentId: String(chunk.documentId),
          researchId: String(chunk.researchId),
          score: chunk.score,
          preview: chunk.text?.slice(0, 120)
        }))
      );

      return relevantChunks;

    } catch (error) {
      logError(
        'RETRIEVAL_SERVICE',
        `Vector search failed: ${error.message}`
      );

      throw error;
    }
  }
}

export default RetrievalService;