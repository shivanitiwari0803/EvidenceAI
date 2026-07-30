import dotenv from 'dotenv';
import GeminiService from '../services/GeminiService.js';
import AIService from '../services/AIService.js';
import PlanService from '../services/PlanService.js';
import EvidenceService from '../services/EvidenceService.js';
import BriefService from '../services/BriefService.js';
import ChatService from '../services/ChatService.js';
import ResearchService from '../services/ResearchService.js';
import DocumentService from '../services/DocumentService.js';

dotenv.config();

async function runGeminiTests() {
  console.log('--- Starting Google Gemini 2.5 Flash Integration Tests ---');

  try {
    // 1. Verify Environment Key configuration check
    console.log('Test 1: Verifying GEMINI_API_KEY detection...');
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      console.log('✓ GEMINI_API_KEY is configured in environment.');
    } else {
      console.log('ℹ GEMINI_API_KEY is missing. Verification will test graceful error & fallback handling.');
    }

    // 2. Test Plan Generation via AIService & GeminiService
    console.log('\nTest 2: Testing Research Plan Generation via Gemini / Fallback...');
    const steps = await AIService.generatePlan(
      'What isolation protocols prevent context window contamination in multi-agent tool execution loops?',
      'Testing sandbox isolation and vector log flushing under concurrency.'
    );
    console.log('✓ Research Plan Steps Generated:', steps.length);
    console.log('  - Step 1 Title:', steps[0].title);

    // 3. Setup Workspace & Test Document Upload
    console.log('\nTest 3: Setting up workspace with approved plan for Evidence Classification & RAG Chat...');
    const research = await ResearchService.createResearch({
      title: 'Gemini 2.5 Flash Architecture Audit',
      researchQuestion: 'How does Gemini 2.5 Flash optimize low-latency RAG synthesis for technical documentation?',
      context: 'Testing official @google/genai SDK integration.'
    });

    const plan = await PlanService.generatePlan(research._id);
    await PlanService.approvePlan(plan._id);

    const sampleDoc = `
    Section 1: Gemini 2.5 Flash Performance Benchmarks
    Google Gemini 2.5 Flash offers state-of-the-art inference speed for retrieval-augmented generation.
    In benchmark evaluations, Gemini 2.5 Flash achieved 98.4% precision in evidence classification.
    Batching prompt tokens reduced first-token latency by 45ms across multi-turn subagent execution loops.
    `.repeat(3);

    await DocumentService.uploadDocument({
      researchId: research._id,
      filename: 'gemini_flash_whitepaper.md',
      textContent: sampleDoc,
      mimeType: 'text/markdown'
    });
    console.log('✓ Document uploaded and approved workspace ready for ResearchID:', research._id);

    // 4. Test Evidence Retrieval & Classification
    console.log('\nTest 4: Testing Evidence Retrieval & Classification...');
    const evidences = await EvidenceService.retrieveAndClassify(research._id);
    console.log('✓ Evidence Items Classified:', evidences.length);
    if (evidences.length > 0) {
      console.log('  - Sample Evidence Classification:', evidences[0].classification);
      console.log('  - Confidence Score:', evidences[0].confidence + '%');
    }

    // 5. Test Research Brief Generation
    console.log('\nTest 5: Testing Research Brief Synthesis...');
    const brief = await BriefService.generateBrief(research._id);
    console.log('✓ Research Brief v' + brief.version + '.0 Generated:', brief.title);
    console.log('  - Model Engine:', brief.settings.model);
    console.log('  - Total Report Sections:', brief.sections.length);

    // 6. Test RAG Chat Response
    console.log('\nTest 6: Testing RAG Chat Response...');
    const chatRes = await ChatService.sendMessage(research._id, 'What are the benchmark evaluations for Gemini 2.5 Flash?');
    console.log('✓ Chat Assistant Response Generated (Length:', chatRes.assistantMessage.content.length, 'chars)');
    console.log('  - Latency:', chatRes.assistantMessage.latencyMs + 'ms');
    console.log('  - Citations Attached:', chatRes.assistantMessage.citations.length);

    console.log('\n✅ ALL GEMINI 2.5 FLASH INTEGRATION TESTS PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Gemini Integration Test Failed:', error);
    process.exit(1);
  }
}

runGeminiTests();
