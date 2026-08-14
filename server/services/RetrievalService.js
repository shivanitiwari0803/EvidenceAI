import mongoose from 'mongoose';
import { DocumentChunk } from '../models/DocumentChunk.js';
import EmbeddingService from './EmbeddingService.js';
import { logInfo, logError } from '../middleware/logger.js';

class RetrievalService {
  static async retrieveRelevantChunks(researchId, userPrompt, limit = 5) {
    try {
      if (!researchId || !userPrompt?.trim()) {
        return [];
      }

      // 1. Convert user's question into the same 768-dimensional
      // embedding space used for document chunks.
      const queryEmbedding =
  await EmbeddingService.generateQueryEmbedding(userPrompt.trim());

      logInfo(
        'RETRIEVAL_SERVICE',
        `Query embedding generated: ${queryEmbedding.length} dimensions`
      );

      // 2. Search MongoDB Vector Search index.
      const results = await DocumentChunk.aggregate([
        {
          $vectorSearch: {
            index: 'evidence_chunks_vector_index',
            path: 'embedding',
            queryVector: queryEmbedding,
            numCandidates: 50,
            limit,
//             filter: {
//   researchId: new mongoose.Types.ObjectId(researchId)
// }
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
            score: { $meta: 'vectorSearchScore' }
          }
        }
      ]);

      logInfo(
        'RETRIEVAL_SERVICE',
        `Vector search returned ${results.length} chunks`
      );

      return results;
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