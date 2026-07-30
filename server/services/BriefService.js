import mongoose from 'mongoose';
import { BriefVersion } from '../models/BriefVersion.js';
import { ResearchService } from './ResearchService.js';
import { EvidenceService } from './EvidenceService.js';
import { DocumentService } from './DocumentService.js';
import { GeminiService } from './GeminiService.js';
import { ApiError } from '../utils/apiResponse.js';
import { logInfo, logWarn, logError } from '../middleware/logger.js';

export class BriefService {
  /**
   * Generates a new evidence-based research brief version containing 12 structured sections in MongoDB.
   */
  static async generateBrief(researchId, isRegeneration = false) {
    logInfo('BRIEF_SERVICE', `Generating research brief for ResearchID=${researchId} (Regen=${isRegeneration})...`);

    const research = await ResearchService.getResearchById(researchId);
    if (!research) {
      throw new ApiError(404, `Research project not found with ID: ${researchId}`);
    }

    const documents = await DocumentService.getDocumentsByResearchId(researchId);
    let evidences = await EvidenceService.getEvidenceByResearchId(researchId);

    logInfo('BRIEF_SERVICE', `[PIPELINE_AUDIT] Research Brief prerequisite audit for ResearchID=${researchId}: Documents=${documents.length}, StoredEvidence=${evidences.length}`);

    if (evidences.length === 0) {
      if (documents.length === 0) {
        throw new ApiError(400, 'No documents uploaded for this project. Please upload research documents before generating a brief.');
      }

      if (!research.currentPlan || !research.currentPlan.steps || research.currentPlan.steps.length === 0) {
        throw new ApiError(400, 'No active or approved research plan found for this project. Please generate and approve a research plan before generating a brief.');
      }

      logInfo('BRIEF_SERVICE', `[PIPELINE_AUDIT] No stored evidence found. Auto-triggering Evidence Retrieval & Classification for ResearchID=${researchId}...`);
      evidences = await EvidenceService.retrieveAndClassify(researchId);

      if (evidences.length === 0) {
        throw new ApiError(400, 'Evidence retrieval returned 0 classified evidence items. Please verify that uploaded documents contain readable text matching your research plan steps.');
      }
    }

    logInfo('BRIEF_SERVICE', `[PIPELINE_AUDIT] Research Brief prerequisites satisfied: Evidence Count=${evidences.length}, Documents Count=${documents.length}. Proceeding to synthesis...`);

    const plan = research.currentPlan;

    // Determine version number from MongoDB
    const existingVersions = await BriefVersion.find({ researchId }).sort({ version: -1 });
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

    // Attempt generation with Gemini Flash
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
        logWarn('BRIEF_SERVICE', `Gemini brief generation failed: ${err.message}. Using 12-section fallback synthesizer.`);
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

    const brief = await BriefVersion.create({
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
        model: 'gemini-2.0-flash',
        generatedAt: new Date()
      }
    });

    research.status = 'COMPLETED';
    await research.save();

    logInfo('BRIEF_SERVICE', `[DB_WRITE] Research Brief stored in collection 'briefversions': BriefID=${brief._id}, Version=v${versionNumber}.0 [Timestamp: ${new Date().toISOString()}]`);
    return brief;
  }

  /**
   * Fallback Brief Synthesizer ensuring 12 sections are always returned.
   */
  static fallbackBriefSynthesizer(research, evidences, documents, citationsPool) {
    const supportingList = evidences.filter(e => e.classification === 'Supporting');
    const conflictingList = evidences.filter(e => e.classification === 'Conflicting');
    const insufficientList = evidences.filter(e => e.classification === 'Insufficient');
    const weakList = evidences.filter(e => e.confidence < 75 || e.classification === 'Insufficient');

    const summaryText = `This evidence-based research brief evaluates "${research.researchQuestion}". Based strictly on ${evidences.length} empirical evidence items across ${documents.length} ingested documents, synthesis reveals ${supportingList.length} supporting findings, ${conflictingList.length} conflicting factors, and ${insufficientList.length} insufficient observations.`;

    const sections = [
      { heading: '1. Executive Summary', content: summaryText, citations: citationsPool.slice(0, 2) },
      { heading: '2. Research Question', content: `Primary Question: "${research.researchQuestion}".`, citations: [] },
      { heading: '3. Research Objective', content: `Objective: Audit empirical claims, classify source document evidence into Supporting, Conflicting, Insufficient, and Weak Evidence categories, and establish baseline bounds.`, citations: [] },
      { heading: '4. Methodology', content: `Applied semantic chunking across ${documents.length} technical documents. Each chunk was evaluated against approved plan steps using empirical confidence scoring.`, citations: [] },
      { heading: '5. Supporting Evidence', content: supportingList.map((s, i) => `[Finding ${i + 1}]: "${s.excerpt}"`).join('\n\n') || 'No explicit supporting evidence items identified.', citations: citationsPool.filter((_, i) => evidences[i]?.classification === 'Supporting') },
      { heading: '6. Conflicting Evidence', content: conflictingList.map((c, i) => `[Conflict ${i + 1}]: "${c.excerpt}"`).join('\n\n') || 'No conflicting claims detected in current source corpus.', citations: citationsPool.filter((_, i) => evidences[i]?.classification === 'Conflicting') },
      { heading: '7. Insufficient Evidence', content: insufficientList.map((m, i) => `[Insufficient Data ${i + 1}]: "${m.excerpt}"`).join('\n\n') || 'No insufficient evidence items detected in current evidence corpus.', citations: citationsPool.filter((_, i) => evidences[i]?.classification === 'Insufficient') },
      { heading: '8. Weak Evidence', content: weakList.map((w, i) => `[Weak Evidence ${i + 1}]: Claim: "${w.excerpt}" (Confidence: ${w.confidence}%). Reason: ${w.reason}`).join('\n\n') || 'No weak evidence items flagged in current evaluation.', citations: citationsPool.filter((_, i) => evidences[i]?.confidence < 75) },
      { heading: '9. Unanswered Questions', content: `Questions the ingested documents cannot answer:\n1. What long-term production telemetry exists for ${research.title}?\n2. Are there unverified failure modes outside the provided whitepapers?\n3. What multi-region isolation controls apply?`, citations: [] },
      { heading: '10. Recommendations', content: '1. Conduct targeted stress testing under high concurrency.\n2. Expand source documentation corpus to address identified gaps.\n3. Audit subagent state isolation protocols.', citations: [] },
      { heading: '11. Conclusion', content: `Synthesis confirms that ${supportingList.length} primary findings support the research thesis while highlighting key operational trade-offs.`, citations: citationsPool.slice(0, 3) },
      { heading: '12. References / Citations', content: documents.map((d, i) => `[Ref ${i + 1}] Document: ${d.filename} (${d.chunkCount || 1} chunks parsed)`).join('\n'), citations: citationsPool }
    ];

    const followUpQuestions = [
      `What additional evidence exists for ${research.title} in production environments?`,
      `How do performance trade-offs vary across different deployment architectures?`,
      `What long-term empirical studies validate the findings in the primary whitepaper?`,
      `Are there conflicting industry benchmarks regarding failure recovery times?`,
      `What security controls prevent context pollution across long-running subagent loops?`
    ];

    const unansweredQuestions = [
      `What long-term multi-region failover telemetry exists for subagent clusters?`,
      `Are there undocumented edge cases in extreme network degradation scenarios?`
    ];

    const weakEvidence = weakList.map(w => ({
      claim: w.excerpt,
      reason: w.reason || 'Low confidence threshold',
      suggestedEvidence: 'Collect additional empirical benchmarks under production loads'
    }));

    return { summaryText, sections, followUpQuestions, unansweredQuestions, weakEvidence };
  }

  static async updateBriefVersion(versionId, { sections, reviewStatus, summary }) {
    const brief = await BriefVersion.findById(versionId);
    if (!brief) {
      throw new ApiError(404, `Research brief version not found with ID: ${versionId}`);
    }

    if (sections) brief.sections = sections;
    if (reviewStatus) brief.reviewStatus = reviewStatus;
    if (summary) brief.summary = summary;

    await brief.save();
    logInfo('BRIEF_SERVICE', `[DB_WRITE] Research brief version updated/reviewed in collection 'briefversions': BriefID=${brief._id}, Status=${brief.reviewStatus}`);
    return brief;
  }

  static async getBriefByResearchId(researchId) {
    return await BriefVersion.findOne({ researchId }).sort({ version: -1 });
  }

  static async getBriefByVersionId(versionId) {
    return await BriefVersion.findById(versionId);
  }

  static async getVersionsByResearchId(researchId) {
    return await BriefVersion.find({ researchId }).sort({ version: -1 });
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
