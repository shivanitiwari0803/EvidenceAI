import crypto from 'crypto';
import mongoose from 'mongoose';
import pdfParse from 'pdf-parse';
import { Document } from '../models/Document.js';
import { DocumentChunk } from '../models/DocumentChunk.js';
import { Evidence } from '../models/Evidence.js';
import { ApiError } from '../utils/apiResponse.js';
import { logInfo, logWarn, logError } from '../middleware/logger.js';

export class DocumentService {
  /**
   * Upload and process a document (file upload or raw text paste) into MongoDB.
   */
  static async uploadDocument({ researchId, filename, buffer, textContent, mimeType }) {
    logInfo('DOCUMENT_SERVICE', `Upload started: File="${filename}", ResearchID=${researchId} [Timestamp: ${new Date().toISOString()}]`);

    if (!researchId) {
      throw new ApiError(400, 'researchId is required.');
    }

    if (!filename) {
      throw new ApiError(400, 'filename is required.');
    }

    let rawText = '';
    const normalizedMime = mimeType || this.inferMimeType(filename);

    // Text Extraction
    if (textContent && textContent.trim()) {
      rawText = textContent.trim();
    } else if (buffer && buffer.length > 0) {
      if (normalizedMime === 'application/pdf' || filename.toLowerCase().endsWith('.pdf')) {
        try {
          const parsed = await pdfParse(buffer);
          rawText = parsed.text ? parsed.text.trim() : '';
          logInfo('DOCUMENT_SERVICE', `PDF parsing completed for "${filename}". Length: ${rawText.length} chars.`);
        } catch (pdfErr) {
          logWarn('DOCUMENT_SERVICE', `pdf-parse warning for "${filename}": ${pdfErr.message}. Attempting text buffer conversion.`);
          rawText = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim();
        }
      } else if (filename.toLowerCase().endsWith('.docx') || normalizedMime.includes('wordprocessingml')) {
        try {
          const textMatches = buffer.toString('utf-8').match(/<w:t[^>]*>(.*?)<\/w:t>/gi);
          if (textMatches && textMatches.length > 0) {
            rawText = textMatches.map(m => m.replace(/<[^>]+>/g, '')).join(' ').trim();
          } else {
            rawText = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim();
          }
          logInfo('DOCUMENT_SERVICE', `DOCX text extraction completed for "${filename}". Length: ${rawText.length} chars.`);
        } catch (docxErr) {
          rawText = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim();
        }
      } else {
        rawText = buffer.toString('utf-8').trim();
      }
    }

    if (!rawText) {
      throw new ApiError(400, `Failed to extract text from "${filename}". File appears to be empty or unreadable.`);
    }

    // Hash generation for duplicate detection (filename + rawText)
    const hash = crypto.createHash('sha256').update(`${filename}_${rawText}`).digest('hex');

    // Check Duplicate in MongoDB
    const existing = await Document.findOne({ researchId, hash });
    if (existing) {
      logWarn('DOCUMENT_SERVICE', `Duplicate upload attempt rejected for file "${filename}" (Hash=${hash.slice(0, 10)}).`);
      throw new ApiError(409, `Duplicate document detected: "${filename}" has already been uploaded for this research project.`);
    }

    // Save Document Entity in MongoDB
    const fileSize = buffer ? buffer.length : Buffer.byteLength(rawText, 'utf-8');

    const doc = await Document.create({
      researchId,
      filename,
      mimeType: normalizedMime,
      fileSize,
      rawText,
      status: 'PROCESSING',
      hash,
      chunkCount: 0
    });

    logInfo('DOCUMENT_SERVICE', `[DB_WRITE] Document saved in collection 'documents': DocID=${doc._id}, Filename="${filename}", ExtractedTextLength=${rawText.length} chars [Timestamp: ${new Date().toISOString()}]`);

    // Perform Semantic Chunking (~500 words, 75 words overlap)
    const chunks = await this.chunkDocument(doc);
    const docCount = await Document.countDocuments({ researchId });
    logInfo('DOCUMENT_SERVICE', `[DB_WRITE] Total Document Count in 'documents' collection for ResearchID=${researchId}: ${docCount}`);

    return { document: doc, chunksCount: chunks.length };
  }

  /**
   * Splits a document into semantic chunks (~500 words, 75 overlap) and inserts them into MongoDB.
   */
  static async chunkDocument(doc) {
    logInfo('DOCUMENT_SERVICE', `Chunking started for DocID=${doc._id}, Filename="${doc.filename}"...`);

    const words = doc.rawText.split(/\s+/).filter(Boolean);
    const chunkSize = 500;
    const overlap = 75;
    const stepSize = chunkSize - overlap;

    const chunkDocs = [];
    let chunkNumber = 1;

    for (let start = 0; start < words.length; start += stepSize) {
      const end = Math.min(start + chunkSize, words.length);
      const chunkWords = words.slice(start, end);
      const chunkText = chunkWords.join(' ');

      if (chunkText.trim().length === 0) continue;

      chunkDocs.push({
        documentId: doc._id,
        researchId: doc.researchId,
        chunkNumber,
        text: chunkText,
        startPosition: start,
        endPosition: end
      });

      chunkNumber++;

      if (end >= words.length) break;
    }

    let createdChunks = [];
    if (chunkDocs.length > 0) {
      createdChunks = await DocumentChunk.insertMany(chunkDocs);
    }

    // Update document status & chunk count in MongoDB
    doc.chunkCount = createdChunks.length;
    doc.status = 'PROCESSED';
    await doc.save();

    logInfo('DOCUMENT_SERVICE', `[DB_WRITE] Chunks inserted into collection 'documentchunks': DocID=${doc._id}, ChunksInserted=${createdChunks.length}. [Timestamp: ${new Date().toISOString()}]`);

    return createdChunks;
  }

  /**
   * Retrieves all documents for a research project from MongoDB.
   */
  static async getDocumentsByResearchId(researchId) {
    return await Document.find({ researchId }).sort({ createdAt: -1 });
  }

  /**
   * Retrieves all document chunks for a research project from MongoDB.
   */
  static async getChunksByResearchId(researchId) {
    return await DocumentChunk.find({ researchId }).sort({ chunkNumber: 1 });
  }

  /**
   * Deletes a document, its chunks, and associated evidence from MongoDB.
   */
  static async deleteDocument(id) {
    const doc = await Document.findByIdAndDelete(id);
    if (!doc) {
      throw new ApiError(404, `Document not found with ID: ${id}`);
    }

    await DocumentChunk.deleteMany({ documentId: id });
    await Evidence.deleteMany({ documentId: id });

    logInfo('DOCUMENT_SERVICE', `[DB_WRITE] Document and associated chunks/evidence deleted from collections for DocID=${id}`);

    return doc;
  }

  /**
   * Utility to infer mime type from extension.
   */
  static inferMimeType(filename) {
    const lower = filename.toLowerCase();
    if (lower.endsWith('.pdf')) return 'application/pdf';
    if (lower.endsWith('.md') || lower.endsWith('.markdown')) return 'text/markdown';
    if (lower.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    return 'text/plain';
  }
}

export default DocumentService;
