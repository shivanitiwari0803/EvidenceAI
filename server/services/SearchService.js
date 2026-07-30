import mongoose from 'mongoose';
import { Research } from '../models/Research.js';
import { Document } from '../models/Document.js';
import { Evidence } from '../models/Evidence.js';
import { BriefVersion } from '../models/BriefVersion.js';
import { ChatMessage } from '../models/ChatMessage.js';
import ResearchService from './ResearchService.js';
import DocumentService from './DocumentService.js';
import EvidenceService from './EvidenceService.js';
import BriefService from './BriefService.js';
import ChatService from './ChatService.js';

export class SearchService {
  /**
   * Universal search across all entities.
   */
  static async search(query, type = 'all') {
    if (!query || !query.trim()) {
      return { projects: [], documents: [], evidence: [], briefs: [], messages: [] };
    }

    const qLower = query.toLowerCase().trim();
    const isConnected = mongoose.connection.readyState === 1;

    let projects = [];
    let documents = [];
    let evidence = [];
    let briefs = [];
    let messages = [];

    if (isConnected) {
      if (type === 'all' || type === 'projects') {
        projects = await Research.find({
          $or: [
            { title: { $regex: qLower, $options: 'i' } },
            { researchQuestion: { $regex: qLower, $options: 'i' } },
            { context: { $regex: qLower, $options: 'i' } }
          ]
        }).limit(10);
      }

      if (type === 'all' || type === 'documents') {
        documents = await Document.find({
          $or: [
            { filename: { $regex: qLower, $options: 'i' } },
            { rawText: { $regex: qLower, $options: 'i' } }
          ]
        }).limit(10);
      }

      if (type === 'all' || type === 'evidence') {
        evidence = await Evidence.find({
          $or: [
            { excerpt: { $regex: qLower, $options: 'i' } },
            { reason: { $regex: qLower, $options: 'i' } }
          ]
        }).limit(10);
      }

      if (type === 'all' || type === 'briefs') {
        briefs = await BriefVersion.find({
          $or: [
            { title: { $regex: qLower, $options: 'i' } },
            { summary: { $regex: qLower, $options: 'i' } }
          ]
        }).limit(10);
      }

      if (type === 'all' || type === 'messages') {
        messages = await ChatMessage.find({
          content: { $regex: qLower, $options: 'i' }
        }).limit(10);
      }
    } else {
      // In-memory fallback search
      const allProjects = await ResearchService.getAllResearch();
      projects = allProjects.filter(p =>
        p.title.toLowerCase().includes(qLower) ||
        p.researchQuestion.toLowerCase().includes(qLower) ||
        (p.context && p.context.toLowerCase().includes(qLower))
      );
    }

    return {
      query,
      resultsCount: projects.length + documents.length + evidence.length + briefs.length + messages.length,
      projects,
      documents,
      evidence,
      briefs,
      messages
    };
  }
}

export default SearchService;
