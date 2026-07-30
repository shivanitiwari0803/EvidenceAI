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

export class ResearchService {
  /**
   * Creates a new research project in MongoDB.
   */
  static async createResearch({ title, researchQuestion, context }) {
    if (!researchQuestion || researchQuestion.trim().length < 10) {
      throw new ApiError(400, 'Research question is required and must be at least 10 characters.');
    }

    const researchTitle = title && title.trim() ? title.trim() : 'Untitled Research Project';

    const research = await Research.create({
      title: researchTitle,
      researchQuestion: researchQuestion.trim(),
      context: context ? context.trim() : '',
      status: 'DRAFT'
    });

    logInfo('RESEARCH_SERVICE', `[DB_WRITE] Research created in collection 'researches': ID=${research._id}, Title="${research.title}" [Timestamp: ${new Date().toISOString()}]`);

    return research;
  }

  /**
   * Updates research title, question, or context in MongoDB.
   */
  static async updateResearch(id, { title, researchQuestion, context }) {
    if (researchQuestion !== undefined && researchQuestion.trim().length < 10) {
      throw new ApiError(400, 'Research question must be at least 10 characters.');
    }

    const research = await Research.findById(id);
    if (!research) {
      throw new ApiError(404, `Research project not found with ID: ${id}`);
    }

    if (title !== undefined) research.title = title.trim();
    if (researchQuestion !== undefined) research.researchQuestion = researchQuestion.trim();
    if (context !== undefined) research.context = context.trim();

    await research.save();

    logInfo('RESEARCH_SERVICE', `[DB_WRITE] Research updated in collection 'researches': ID=${id} [Timestamp: ${new Date().toISOString()}]`);
    return research;
  }

  /**
   * Retrieves research by ID from MongoDB with populated currentPlan.
   */
  static async getResearchById(id) {
    const research = await Research.findById(id).populate('currentPlan');

    if (!research) {
      throw new ApiError(404, `Research project not found with ID: ${id}`);
    }

    return research;
  }

  /**
   * Retrieves all historical research projects from MongoDB.
   */
  static async getAllResearch() {
    return await Research.find().sort({ createdAt: -1 }).populate('currentPlan');
  }

  /**
   * Duplicates a research project in MongoDB.
   */
  static async duplicateResearch(id) {
    const original = await this.getResearchById(id);
    const duplicated = await this.createResearch({
      title: `Copy of ${original.title}`,
      researchQuestion: original.researchQuestion,
      context: original.context
    });
    logInfo('RESEARCH_SERVICE', `[DB_WRITE] Research duplicated in collection 'researches': OriginalID=${id}, NewID=${duplicated._id}`);
    return duplicated;
  }

  /**
   * Archives or unarchives a research project in MongoDB.
   */
  static async toggleArchive(id, isArchived) {
    const research = await Research.findByIdAndUpdate(id, { isArchived }, { new: true });
    if (!research) {
      throw new ApiError(404, `Research project not found with ID: ${id}`);
    }
    logInfo('RESEARCH_SERVICE', `[DB_WRITE] Research archive status updated in collection 'researches': ID=${id}, isArchived=${isArchived}`);
    return research;
  }

  /**
   * Deletes a research project and all associated data from MongoDB collections.
   */
  static async deleteResearch(id) {
    const deleted = await Research.findByIdAndDelete(id);
    if (!deleted) {
      throw new ApiError(404, `Research project not found with ID: ${id}`);
    }

    await ResearchPlan.deleteMany({ researchId: id });
    await Document.deleteMany({ researchId: id });
    await DocumentChunk.deleteMany({ researchId: id });
    await Evidence.deleteMany({ researchId: id });
    await BriefVersion.deleteMany({ researchId: id });
    await ChatMessage.deleteMany({ researchId: id });

    logInfo('RESEARCH_SERVICE', `[DB_WRITE] Research and all associated collection documents deleted for ID=${id}`);
    return { success: true, id };
  }
}

export default ResearchService;
