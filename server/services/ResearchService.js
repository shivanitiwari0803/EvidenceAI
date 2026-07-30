import mongoose from 'mongoose';
import { Research } from '../models/Research.js';
import { ResearchPlan } from '../models/ResearchPlan.js';
import { Document } from '../models/Document.js';
import { DocumentChunk } from '../models/DocumentChunk.js';
import { Evidence } from '../models/Evidence.js';
import { BriefVersion } from '../models/BriefVersion.js';
import { ChatMessage } from '../models/ChatMessage.js';
import { ApiError } from '../utils/apiResponse.js';
import { logInfo, logError } from '../middleware/logger.js';

// In-memory fallback map for offline development
const inMemoryResearch = new Map();

export class ResearchService {
  /**
   * Creates a new research project.
   */
  static async createResearch({ title, researchQuestion, context }) {
    if (!researchQuestion || researchQuestion.trim().length < 10) {
      throw new ApiError(400, 'Research question is required and must be at least 10 characters.');
    }

    const researchTitle = title && title.trim() ? title.trim() : 'Untitled Research Project';
    const isConnected = mongoose.connection.readyState === 1;

    let research;
    if (isConnected) {
      research = await Research.create({
        title: researchTitle,
        researchQuestion: researchQuestion.trim(),
        context: context ? context.trim() : '',
        status: 'DRAFT'
      });
    } else {
      const id = new mongoose.Types.ObjectId().toString();
      research = {
        _id: id,
        title: researchTitle,
        researchQuestion: researchQuestion.trim(),
        context: context ? context.trim() : '',
        status: 'DRAFT',
        isArchived: false,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryResearch.set(id, research);
    }

    logInfo('RESEARCH_SERVICE', `Research created: ID=${research._id}, Question="${researchQuestion.slice(0, 30)}..." [Timestamp: ${new Date().toISOString()}]`);

    return research;
  }

  /**
   * Updates research title, question, or context.
   */
  static async updateResearch(id, { title, researchQuestion, context }) {
    if (researchQuestion !== undefined && researchQuestion.trim().length < 10) {
      throw new ApiError(400, 'Research question must be at least 10 characters.');
    }

    const isConnected = mongoose.connection.readyState === 1;
    let research;

    if (isConnected) {
      research = await Research.findById(id);
      if (!research) {
        throw new ApiError(404, `Research project not found with ID: ${id}`);
      }

      if (title !== undefined) research.title = title.trim();
      if (researchQuestion !== undefined) research.researchQuestion = researchQuestion.trim();
      if (context !== undefined) research.context = context.trim();

      await research.save();
    } else {
      research = inMemoryResearch.get(id);
      if (!research) {
        throw new ApiError(404, `Research project not found with ID: ${id}`);
      }

      if (title !== undefined) research.title = title.trim();
      if (researchQuestion !== undefined) research.researchQuestion = researchQuestion.trim();
      if (context !== undefined) research.context = context.trim();
      research.updatedAt = new Date();

      inMemoryResearch.set(id, research);
    }

    logInfo('RESEARCH_SERVICE', `Research updated: ID=${id} [Timestamp: ${new Date().toISOString()}]`);
    return research;
  }

  /**
   * Retrieves research by ID with populated currentPlan.
   */
  static async getResearchById(id) {
    const isConnected = mongoose.connection.readyState === 1;
    let research;

    if (isConnected) {
      research = await Research.findById(id).populate('currentPlan');
    } else {
      research = inMemoryResearch.get(id);
    }

    if (!research) {
      throw new ApiError(404, `Research project not found with ID: ${id}`);
    }

    return research;
  }

  /**
   * Retrieves all historical research projects.
   */
  static async getAllResearch() {
    const isConnected = mongoose.connection.readyState === 1;
    if (isConnected) {
      return await Research.find().sort({ createdAt: -1 }).populate('currentPlan');
    }
    return Array.from(inMemoryResearch.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Duplicates a research project.
   */
  static async duplicateResearch(id) {
    const original = await this.getResearchById(id);
    const duplicated = await this.createResearch({
      title: `Copy of ${original.title}`,
      researchQuestion: original.researchQuestion,
      context: original.context
    });
    logInfo('RESEARCH_SERVICE', `Research duplicated: OriginalID=${id}, NewID=${duplicated._id}`);
    return duplicated;
  }

  /**
   * Archives or unarchives a research project.
   */
  static async toggleArchive(id, isArchived) {
    const isConnected = mongoose.connection.readyState === 1;
    let research;
    if (isConnected) {
      research = await Research.findByIdAndUpdate(id, { isArchived }, { new: true });
    } else {
      research = inMemoryResearch.get(id);
      if (research) {
        research.isArchived = isArchived;
        inMemoryResearch.set(id, research);
      }
    }
    return research;
  }

  /**
   * Deletes a research project and all associated documents, plans, evidence, briefs, and chat messages.
   */
  static async deleteResearch(id) {
    const isConnected = mongoose.connection.readyState === 1;
    if (isConnected) {
      await Research.findByIdAndDelete(id);
      await ResearchPlan.deleteMany({ researchId: id });
      await Document.deleteMany({ researchId: id });
      await DocumentChunk.deleteMany({ researchId: id });
      await Evidence.deleteMany({ researchId: id });
      await BriefVersion.deleteMany({ researchId: id });
      await ChatMessage.deleteMany({ researchId: id });
    } else {
      inMemoryResearch.delete(id);
    }
    logInfo('RESEARCH_SERVICE', `Research deleted: ID=${id}`);
    return { success: true, id };
  }
}

export default ResearchService;
