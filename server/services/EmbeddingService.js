import { GoogleGenAI } from '@google/genai';
import { ApiError } from '../utils/apiResponse.js';

class EmbeddingService {
  static async generateDocumentEmbedding(text) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new ApiError(
        500,
        'GEMINI_API_KEY is missing in environment variables.'
      );
    }

    if (!text || !text.trim()) {
      throw new ApiError(400, 'Text cannot be empty.');
    }

    const ai = new GoogleGenAI({ apiKey });

    const result = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: text,
      config: {
        taskType: 'RETRIEVAL_DOCUMENT',
        outputDimensionality: 768
      }
    });

    const embedding = result?.embeddings?.[0]?.values;

    if (!embedding || embedding.length === 0) {
      throw new ApiError(
        502,
        'Failed to generate document embedding.'
      );
    }

    return embedding;
  }

  static async generateQueryEmbedding(text) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new ApiError(
        500,
        'GEMINI_API_KEY is missing in environment variables.'
      );
    }

    if (!text || !text.trim()) {
      throw new ApiError(400, 'Query cannot be empty.');
    }

    const ai = new GoogleGenAI({ apiKey });

    const result = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: text,
      config: {
        taskType: 'RETRIEVAL_QUERY',
        outputDimensionality: 768
      }
    });

    const embedding = result?.embeddings?.[0]?.values;

    if (!embedding || embedding.length === 0) {
      throw new ApiError(
        502,
        'Failed to generate query embedding.'
      );
    }

    return embedding;
  }
}

export default EmbeddingService;