import dotenv from 'dotenv';
import ResearchService from '../services/ResearchService.js';
import PlanService from '../services/PlanService.js';
import DocumentService from '../services/DocumentService.js';
import EvidenceService from '../services/EvidenceService.js';
import BriefService from '../services/BriefService.js';

import { connectDB } from '../config/database.js';

dotenv.config();

async function runPhase4Tests() {
  console.log('--- Starting Phase 4 Integration Tests ---');
  if (process.env.MONGODB_URI) await connectDB();

  try {
    // 1. Setup Full Workflow
    console.log('Test 1: Setting up complete workspace with approved plan and classified evidence...');
    const research = await ResearchService.createResearch({
      title: 'Multi-Agent Security Architecture Synthesis',
      researchQuestion: 'What isolation protocols mitigate prompt injection cascades in multi-agent tool execution loops?',
      context: 'Production-grade enterprise benchmark analysis.'
    });

    const plan = await PlanService.generatePlan(research._id);
    await PlanService.approvePlan(plan._id);

    const docText = `
    Section 1: Multi-Agent Isolation Architecture
    Deploying subagents in ephemeral process sandboxes reduced high-severity prompt injection vulnerabilities from 42.8% to 0.02%.
    Context window pollution degrades policy adherence by 67% after 15 conversational turns without periodic state pruning.
    Batching vector log writes in memory decreased commit latency by 34ms.
    `.repeat(4);

    await DocumentService.uploadDocument({
      researchId: research._id,
      filename: 'enterprise_security_spec.md',
      textContent: docText,
      mimeType: 'text/markdown'
    });

    await EvidenceService.retrieveAndClassify(research._id);
    console.log('✓ Setup complete for ResearchID:', research._id);

    // 2. Generate Initial Research Brief v1.0
    console.log('\nTest 2: Generating Evidence-Based Research Brief v1.0...');
    const briefV1 = await BriefService.generateBrief(research._id, false);
    console.log('✓ Brief Generated: Version = v' + briefV1.version + '.0', 'Title =', briefV1.title);
    console.log('  - Total Sections:', briefV1.sections.length);
    console.log('  - High Quality Evidence Count:', briefV1.evidenceQuality.highCount);
    console.log('  - Follow-up Questions:', briefV1.followUpQuestions.length);

    // 3. Test Regeneration v2.0
    console.log('\nTest 3: Regenerating Research Brief narrative (v2.0)...');
    const briefV2 = await BriefService.generateBrief(research._id, true);
    console.log('✓ Brief Regenerated: Version = v' + briefV2.version + '.0', 'BriefID =', briefV2._id);

    // 4. Test Version Switching
    console.log('\nTest 4: Retrieving versions list and specific version...');
    const versionsList = await BriefService.getVersionsByResearchId(research._id);
    console.log('✓ Total Versions Found:', versionsList.length);

    const fetchedV1 = await BriefService.getBriefByVersionId(briefV1._id);
    console.log('✓ Fetched Version 1.0 explicitly:', fetchedV1?.version);

    // 5. Test Exports
    console.log('\nTest 5: Testing Markdown and PDF exports...');
    const markdown = BriefService.exportMarkdown(briefV2);
    console.log('✓ Markdown Export Generated (Length:', markdown.length, 'chars)');

    const pdfHtml = BriefService.exportPdf(briefV2);
    console.log('✓ PDF/HTML Export Generated (Length:', pdfHtml.length, 'chars)');

    console.log('\n✅ ALL PHASE 4 BACKEND TESTS PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Phase 4 Backend Test Failed:', error);
    process.exit(1);
  }
}

runPhase4Tests();
