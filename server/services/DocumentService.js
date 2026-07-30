import crypto from 'crypto';
import mongoose from 'mongoose';
import pdfParse from 'pdf-parse';
import { Document } from '../models/Document.js';
import { DocumentChunk } from '../models/DocumentChunk.js';
import { Evidence } from '../models/Evidence.js';
import { ApiError } from '../utils/apiResponse.js';
import { logInfo, logWarn, logError } from '../middleware/logger.js';

// In-memory fallback stores
const inMemoryDocs = new Map();
const inMemoryChunks = new Map();

export class DocumentService {
  /**
   * Upload and process a document (file upload or raw text paste).
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
      } else {
        rawText = buffer.toString('utf-8').trim();
      }
    }

    if (!rawText) {
      throw new ApiError(400, `Failed to extract text from "${filename}". File appears to be empty or unreadable.`);
    }

    // Hash generation for duplicate detection (filename + rawText)
    const hash = crypto.createHash('sha256').update(`${filename}_${rawText}`).digest('hex');

    const isConnected = mongoose.connection.readyState === 1;

    // Check Duplicate
    let existing;
    if (isConnected) {
      existing = await Document.findOne({ researchId, hash });
    } else {
      existing = Array.from(inMemoryDocs.values()).find(d => String(d.researchId) === String(researchId) && d.hash === hash);
    }

    if (existing) {
      logWarn('DOCUMENT_SERVICE', `Duplicate upload attempt rejected for file "${filename}" (Hash=${hash.slice(0, 10)}).`);
      throw new ApiError(409, `Duplicate document detected: "${filename}" has already been uploaded for this research project.`);
    }

    // Save Document Entity
    const fileSize = buffer ? buffer.length : Buffer.byteLength(rawText, 'utf-8');

    let doc;
    if (isConnected) {
      doc = await Document.create({
        researchId,
        filename,
        mimeType: normalizedMime,
        fileSize,
        rawText,
        status: 'PROCESSING',
        hash,
        chunkCount: 0
      });
    } else {
      const id = new mongoose.Types.ObjectId().toString();
      doc = {
        _id: id,
        researchId,
        filename,
        mimeType: normalizedMime,
        fileSize,
        rawText,
        status: 'PROCESSING',
        hash,
        chunkCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryDocs.set(id, doc);
    }

    logInfo('DOCUMENT_SERVICE', `Upload completed: DocID=${doc._id}, Filename="${filename}" [Timestamp: ${new Date().toISOString()}]`);

    // Perform Semantic Chunking (~500 words, 75 words overlap)
    const chunks = await this.chunkDocument(doc);

    return { document: doc, chunksCount: chunks.length };
  }

  /**
   * Splits a document into semantic chunks (~500 words, 75 overlap).
   */
  static async chunkDocument(doc) {
    logInfo('DOCUMENT_SERVICE', `Chunking started for DocID=${doc._id}, Filename="${doc.filename}"...`);

    const words = doc.rawText.split(/\s+/).filter(Boolean);
    const chunkSize = 500;
    const overlap = 75;
    const stepSize = chunkSize - overlap;

    const createdChunks = [];
    let chunkNumber = 1;
    const isConnected = mongoose.connection.readyState === 1;

    for (let start = 0; start < words.length; start += stepSize) {
      const end = Math.min(start + chunkSize, words.length);
      const chunkWords = words.slice(start, end);
      const chunkText = chunkWords.join(' ');

      if (chunkText.trim().length === 0) continue;

      let chunkObj;
      if (isConnected) {
        chunkObj = await DocumentChunk.create({
          documentId: doc._id,
          researchId: doc.researchId,
          chunkNumber,
          text: chunkText,
          startPosition: start,
          endPosition: end
        });
      } else {
        const id = new mongoose.Types.ObjectId().toString();
        chunkObj = {
          _id: id,
          documentId: doc._id,
          researchId: doc.researchId,
          chunkNumber,
          text: chunkText,
          startPosition: start,
          endPosition: end,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        inMemoryChunks.set(id, chunkObj);
      }

      createdChunks.push(chunkObj);
      chunkNumber++;

      if (end >= words.length) break;
    }

    // Update document status & count
    if (isConnected) {
      doc.chunkCount = createdChunks.length;
      doc.status = 'PROCESSED';
      await doc.save();
    } else {
      doc.chunkCount = createdChunks.length;
      doc.status = 'PROCESSED';
      doc.updatedAt = new Date();
      inMemoryDocs.set(String(doc._id), doc);
    }

    logInfo('DOCUMENT_SERVICE', `Chunking completed for DocID=${doc._id}: ${createdChunks.length} chunks generated. [Timestamp: ${new Date().toISOString()}]`);

    return createdChunks;
  }

  /**
   * Retrieves all documents for a research project.
   */
  static async getDocumentsByResearchId(researchId) {
    const isConnected = mongoose.connection.readyState === 1;
    if (isConnected) {
      return await Document.find({ researchId }).sort({ createdAt: -1 });
    }
    return Array.from(inMemoryDocs.values())
      .filter(d => String(d.researchId) === String(researchId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Retrieves all document chunks for a research project.
   */
  static async getChunksByResearchId(researchId) {
    const isConnected = mongoose.connection.readyState === 1;
    if (isConnected) {
      return await DocumentChunk.find({ researchId }).sort({ chunkNumber: 1 });
    }
    return Array.from(inMemoryChunks.values())
      .filter(c => String(c.researchId) === String(researchId));
  }

  /**
   * Deletes a document, its chunks, and associated evidence.
   */
  static async deleteDocument(id) {
    const isConnected = mongoose.connection.readyState === 1;

    let doc;
    if (isConnected) {
      doc = await Document.findByIdAndDelete(id);
      if (doc) {
        await DocumentChunk.deleteMany({ documentId: id });
        await Evidence.deleteMany({ documentId: id });
      }
    } else {
      doc = inMemoryDocs.get(id);
      if (doc) {
        inMemoryDocs.delete(id);
        for (const [cId, chunk] of inMemoryChunks.entries()) {
          if (String(chunk.documentId) === String(id)) {
            inMemoryChunks.delete(cId);
          }
        }
      }
    }

    if (!doc) {
      throw new ApiError(404, `Document not found with ID: ${id}`);
    }

    logInfo('DOCUMENT_SERVICE', `Document deleted: ID=${id}, Filename="${doc.filename}" [Timestamp: ${new Date().toISOString()}]`);

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
