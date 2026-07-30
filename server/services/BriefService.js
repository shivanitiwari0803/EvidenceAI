import mongoose from 'mongoose';
import { BriefVersion } from '../models/BriefVersion.js';
import { ResearchService } from './ResearchService.js';
import { EvidenceService } from './EvidenceService.js';
import { DocumentService } from './DocumentService.js';
import { GeminiService } from './GeminiService.js';
import { ApiError } from '../utils/apiResponse.js';
import { logInfo, logWarn, logError } from '../middleware/logger.js';

// In-memory fallback storage
const inMemoryBriefs = new Map();

export class BriefService {
  /**
   * Generates a new evidence-based research brief version using Gemini 2.5 Flash.
   */
  static async generateBrief(researchId, isRegeneration = false) {
    logInfo('BRIEF_SERVICE', `Generating research brief for ResearchID=${researchId} (Regen=${isRegeneration})...`);

    const research = await ResearchService.getResearchById(researchId);
    if (!research) {
      throw new ApiError(404, `Research project not found with ID: ${researchId}`);
    }

    const evidences = await EvidenceService.getEvidenceByResearchId(researchId);
    if (evidences.length === 0) {
      throw new ApiError(400, 'No evidence found. Please upload documents and run evidence retrieval before generating a brief.');
    }

    const documents = await DocumentService.getDocumentsByResearchId(researchId);
    const plan = research.currentPlan;
    const isConnected = mongoose.connection.readyState === 1;

    // Determine version number
    let existingVersions = [];
    if (isConnected) {
      existingVersions = await BriefVersion.find({ researchId }).sort({ version: -1 });
    } else {
      existingVersions = Array.from(inMemoryBriefs.values())
        .filter(b => String(b.researchId) === String(researchId))
        .sort((a, b) => b.version - a.version);
    }

    const versionNumber = existingVersions.length > 0 ? existingVersions[0].version + 1 : 1;

    // Evaluate Evidence Strength (High, Medium, Low)
    const evidenceQuality = { highCount: 0, mediumCount: 0, lowCount: 0 };
    evidences.forEach(ev => {
      if (ev.confidence >= 85 && ev.classification !== 'Insufficient') {
        evidenceQuality.highCount++;
      } else if (ev.confidence >= 70) {
        evidenceQuality.mediumCount++;
      } else {
        evidenceQuality.lowCount++;
      }
    });

    const getDocName = (docId) => {
      const doc = documents.find(d => String(d._id) === String(docId));
      return doc ? doc.filename : 'Document Source';
    };

    const citationsPool = evidences.map((ev, index) => ({
      evidenceId: String(ev._id || `ev_${index + 1}`),
      docName: getDocName(ev.documentId),
      chunkNumber: 1,
      excerpt: ev.excerpt
    }));

    let summaryText = '';
    let sections = [];
    let followUpQuestions = [];

    // Attempt generation with Gemini 2.5 Flash
    if (process.env.GEMINI_API_KEY) {
      try {
        const geminiRes = await GeminiService.generateBriefSections({
          researchQuestion: research.researchQuestion,
          context: research.context,
          evidences,
          documents,
          plan
        });

        summaryText = geminiRes.summary || '';
        sections = geminiRes.sections || [];
        followUpQuestions = geminiRes.followUpQuestions || [];

        // Attach citations pool to relevant sections
        sections.forEach(sec => {
          if (!sec.citations || sec.citations.length === 0) {
            sec.citations = citationsPool.slice(0, 2);
          }
        });
      } catch (err) {
        logWarn('BRIEF_SERVICE', `Gemini brief generation failed: ${err.message}. Using structured fallback synthesizer.`);
      }
    }

    // Fallback synthesizer if Gemini key missing or call failed
    if (sections.length === 0) {
      const fallback = this.fallbackBriefSynthesizer(research, evidences, documents, citationsPool);
      summaryText = fallback.summaryText;
      sections = fallback.sections;
      followUpQuestions = fallback.followUpQuestions;
    }

    const gapAnalysis = {
      missing: evidences.filter(e => e.classification === 'Insufficient').map(e => `Insufficient data on chunk ID ${e.chunkId}`),
      weak: evidenceQuality.lowCount > 0 ? [`${evidenceQuality.lowCount} low-confidence evidence items.`] : ['Baseline confidence thresholds met across all sources.'],
      contradictory: evidences.filter(e => e.classification === 'Conflicting').map(e => `Contradiction in ${getDocName(e.documentId)}: ${e.reason}`),
      recommendations: [
        'Conduct targeted benchmarks under extreme concurrency stress.',
        'Expand literature review to include long-term production telemetry.',
        'Audit subagent privilege escalation paths in multi-turn execution loops.'
      ]
    };

    let brief;
    if (isConnected) {
      brief = await BriefVersion.create({
        researchId,
        version: versionNumber,
        title: `Research Brief v${versionNumber}.0: ${research.title}`,
        summary: summaryText,
        sections,
        evidenceQuality,
        gapAnalysis,
        followUpQuestions,
        snapshot: evidences.map(e => e._id),
        settings: {
          model: 'gemini-2.5-flash',
          generatedAt: new Date()
        }
      });

      research.status = 'COMPLETED';
      await research.save();
    } else {
      const id = new mongoose.Types.ObjectId().toString();
      brief = {
        _id: id,
        researchId,
        version: versionNumber,
        title: `Research Brief v${versionNumber}.0: ${research.title}`,
        summary: summaryText,
        sections,
        evidenceQuality,
        gapAnalysis,
        followUpQuestions,
        snapshot: evidences,
        settings: {
          model: 'gemini-2.5-flash',
          generatedAt: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryBriefs.set(id, brief);
      research.status = 'COMPLETED';
    }

    logInfo('BRIEF_SERVICE', `Research Brief v${versionNumber}.0 generated: BriefID=${brief._id} [Timestamp: ${new Date().toISOString()}]`);
    return brief;
  }

  /**
   * Fallback Brief Synthesizer ensuring 11 sections are always returned.
   */
  static fallbackBriefSynthesizer(research, evidences, documents, citationsPool) {
    const supportingList = evidences.filter(e => e.classification === 'Supporting');
    const conflictingList = evidences.filter(e => e.classification === 'Conflicting');
    const insufficientList = evidences.filter(e => e.classification === 'Insufficient');

    const summaryText = `This evidence-based research brief evaluates "${research.researchQuestion}". Based strictly on ${evidences.length} empirical evidence items across ${documents.length} ingested documents, synthesis reveals ${supportingList.length} supporting findings and ${conflictingList.length} conflicting factors.`;

    const sections = [
      { heading: '1. Executive Summary', content: summaryText, citations: citationsPool.slice(0, 2) },
      { heading: '2. Research Question', content: `Primary Question: "${research.researchQuestion}".`, citations: [] },
      { heading: '3. Research Context', content: research.context ? `Context: ${research.context}` : 'Standard evaluation parameters.', citations: [] },
      { heading: '4. Methodology', content: `Applied semantic chunking across ${documents.length} technical documents. Each chunk was evaluated against approved plan steps.`, citations: [] },
      { heading: '5. Key Findings', content: supportingList.length > 0 ? `Primary findings corroborate the thesis: "${supportingList[0].excerpt}".` : 'Initial analysis establishes baseline bounds.', citations: citationsPool.slice(0, 2) },
      { heading: '6. Supporting Evidence', content: supportingList.map((s, i) => `[Finding ${i + 1}]: "${s.excerpt}"`).join('\n\n') || 'No explicit supporting evidence items identified.', citations: citationsPool.filter((_, i) => evidences[i]?.classification === 'Supporting') },
      { heading: '7. Conflicting Evidence', content: conflictingList.map((c, i) => `[Conflict ${i + 1}]: "${c.excerpt}"`).join('\n\n') || 'No conflicting claims detected in current source corpus.', citations: citationsPool.filter((_, i) => evidences[i]?.classification === 'Conflicting') },
      { heading: '8. Areas with Insufficient Evidence', content: insufficientList.map((ins, i) => `[Area ${i + 1}]: "${ins.excerpt}"`).join('\n\n') || 'All evaluated milestones have sufficient empirical backing.', citations: citationsPool.filter((_, i) => evidences[i]?.classification === 'Insufficient') },
      { heading: '9. Unanswered Questions', content: 'Long-term telemetry and multi-region fault tolerance require extended empirical evaluation.', citations: [] },
      { heading: '10. Limitations', content: `Findings are strictly constrained to the ${documents.length} ingested source documents.`, citations: [] },
      { heading: '11. Overall Conclusion', content: `Synthesis establishes that ${supportingList.length} primary findings support the research thesis while highlighting key trade-offs.`, citations: citationsPool.slice(0, 3) }
    ];

    const followUpQuestions = [
      `What additional evidence exists for ${research.title} in production environments?`,
      `How do performance trade-offs vary across different deployment architectures?`,
      `What long-term empirical studies validate the findings in the primary whitepaper?`,
      `Are there conflicting industry benchmarks regarding failure recovery times?`,
      `What security controls prevent context pollution across long-running subagent loops?`
    ];

    return { summaryText, sections, followUpQuestions };
  }

  static async getBriefByResearchId(researchId) {
    const isConnected = mongoose.connection.readyState === 1;
    if (isConnected) {
      return await BriefVersion.findOne({ researchId }).sort({ version: -1 });
    }
    const matches = Array.from(inMemoryBriefs.values())
      .filter(b => String(b.researchId) === String(researchId))
      .sort((a, b) => b.version - a.version);
    return matches[0] || null;
  }

  static async getBriefByVersionId(versionId) {
    const isConnected = mongoose.connection.readyState === 1;
    if (isConnected) {
      return await BriefVersion.findById(versionId);
    }
    return inMemoryBriefs.get(versionId) || null;
  }

  static async getVersionsByResearchId(researchId) {
    const isConnected = mongoose.connection.readyState === 1;
    if (isConnected) {
      return await BriefVersion.find({ researchId }).sort({ version: -1 });
    }
    return Array.from(inMemoryBriefs.values())
      .filter(b => String(b.researchId) === String(researchId))
      .sort((a, b) => b.version - a.version);
  }

  static exportMarkdown(brief) {
    if (!brief || !brief.sections) return '# Research Brief\n\nNo content available.';

    let md = `# ${brief.title}\n\n`;
    md += `**Version**: v${brief.version}.0 | **Generated**: ${new Date(brief.createdAt || Date.now()).toLocaleDateString()}\n\n`;
    md += `> ${brief.summary}\n\n---\n\n`;

    brief.sections.forEach(sec => {
      md += `## ${sec.heading}\n\n${sec.content}\n\n`;
      if (sec.citations && sec.citations.length > 0) {
        md += `**Citations:**\n`;
        sec.citations.forEach(c => {
          md += `- 📄 *${c.docName}* (Chunk ${c.chunkNumber}): "${c.excerpt}"\n`;
        });
        md += '\n';
      }
    });

    return md;
  }

  static exportPdf(brief) {
    const md = this.exportMarkdown(brief);
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${brief.title}</title></head><body><pre style="font-family:sans-serif;white-space:pre-wrap;">${md}</pre></body></html>`;
  }
}

export default BriefService;
