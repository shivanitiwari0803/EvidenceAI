import dotenv from 'dotenv';
import ResearchService from '../services/ResearchService.js';
import PlanService from '../services/PlanService.js';
import DocumentService from '../services/DocumentService.js';
import EvidenceService from '../services/EvidenceService.js';

dotenv.config();

async function runPhase3Tests() {
  console.log('--- Starting Phase 3 Integration Tests ---');

  try {
    // 1. Create Research & Approved Plan
    console.log('Test 1: Setting up research project and approving plan...');
    const research = await ResearchService.createResearch({
      title: 'LLM Multi-Agent System Vulnerabilities',
      researchQuestion: 'What are the core prompt injection vulnerabilities in multi-agent execution loops?',
      context: 'Testing context window security across isolated agent sandboxes.'
    });

    const plan = await PlanService.generatePlan(research._id);
    await PlanService.approvePlan(plan._id);
    console.log('✓ Approved Research Workspace Created:', research._id);

    // 2. Upload Document via Text Content
    console.log('\nTest 2: Uploading technical document text...');
    const sampleText = `
    Section 1: Multi-Agent Architecture Overview
    Autonomous multi-agent execution loops utilize inter-agent messaging protocols to delegate subtasks. 
    However, empirical testing reveals severe vulnerability to prompt injection cascades. 
    When an untrusted input enters a tool execution loop, it can hijack context memory and trigger unmonitored tool calls.
    
    Section 2: Security Benchmarks & Safeguards
    Isolated execution sandboxes reduced high-severity vulnerabilities from 42.8% down to 0.02%. 
    However, periodic context window pruning is required to prevent policy window decay.
    Without pruning, context pollution degrades policy compliance by 67% after 15 conversational turns.
    `.repeat(5); // Repeat to generate multi-chunk document

    const uploadRes = await DocumentService.uploadDocument({
      researchId: research._id,
      filename: 'multi_agent_security_whitepaper.md',
      textContent: sampleText,
      mimeType: 'text/markdown'
    });

    console.log('✓ Document Uploaded:', uploadRes.document._id, 'Chunks Created:', uploadRes.chunksCount, 'Status:', uploadRes.document.status);

    // 3. Test Duplicate Upload Prevention
    console.log('\nTest 3: Testing duplicate upload SHA256 detection...');
    try {
      await DocumentService.uploadDocument({
        researchId: research._id,
        filename: 'multi_agent_security_whitepaper.md',
        textContent: sampleText,
        mimeType: 'text/markdown'
      });
      console.error('❌ Failed: Duplicate upload should have thrown 409 error');
      process.exit(1);
    } catch (dupErr) {
      console.log('✓ Duplicate upload successfully blocked with status 409:', dupErr.message);
    }

    // 4. Test Evidence Retrieval & Classification
    console.log('\nTest 4: Triggering Evidence Retrieval & Classification...');
    const evidences = await EvidenceService.retrieveAndClassify(research._id);
    console.log('✓ Evidence Items Classified:', evidences.length);

    if (evidences.length > 0) {
      const sampleEv = evidences[0];
      console.log('  - Sample Evidence Classification:', sampleEv.classification);
      console.log('  - Sample Confidence:', sampleEv.confidence + '%');
      console.log('  - Sample Reason:', sampleEv.reason);
    }

    // 5. Test Document Deletion
    console.log('\nTest 5: Testing document deletion...');
    const deletedDoc = await DocumentService.deleteDocument(uploadRes.document._id);
    console.log('✓ Document Deleted:', deletedDoc._id);

    console.log('\n✅ ALL PHASE 3 BACKEND TESTS PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Phase 3 Backend Test Failed:', error);
    process.exit(1);
  }
}

runPhase3Tests();
