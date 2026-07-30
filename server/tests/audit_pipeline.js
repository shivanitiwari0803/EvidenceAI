import dotenv from 'dotenv';
import mongoose from 'mongoose';
import ResearchService from '../services/ResearchService.js';
import PlanService from '../services/PlanService.js';
import DocumentService from '../services/DocumentService.js';
import EvidenceService from '../services/EvidenceService.js';
import BriefService from '../services/BriefService.js';
import { Document } from '../models/Document.js';
import { DocumentChunk } from '../models/DocumentChunk.js';
import { Evidence } from '../models/Evidence.js';

dotenv.config();

async function auditPipeline() {
  console.log('====================================================');
  console.log('STARTING EVIDENCE RETRIEVAL PIPELINE AUDIT');
  console.log('====================================================\n');

  try {
    // 0. Database Connection Check
    console.log('[Step 0] Checking Database Connection...');
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log(`✓ MongoDB Connected: ${mongoose.connection.host} (readyState=${mongoose.connection.readyState})`);
    } else {
      console.log('⚠️ MONGODB_URI not set. Running in offline/memory mode.');
    }
    const isConnected = mongoose.connection.readyState === 1;

    // 1. Create Project & Approved Plan
    console.log('\n[Step 1] Creating Test Research Project & Approved Plan...');
    const research = await ResearchService.createResearch({
      title: 'Audit Test Project',
      researchQuestion: 'How to audit and verify evidence retrieval pipelines in production systems?',
      context: 'Pipeline validation and diagnostic test suite.'
    });
    console.log(`✓ Research Project Created: ID=${research._id}`);

    const plan = await PlanService.generatePlan(research._id);
    await PlanService.approvePlan(plan._id);
    console.log(`✓ Research Plan Approved: PlanID=${plan._id}, Steps=${plan.steps?.length}`);

    // 2. Upload Document
    console.log('\n[Step 2] Uploading Document...');
    const sampleText = `
    Section 1: Audit Systems and Vector Logs
    Deploying subagents in ephemeral process sandboxes reduced high-severity prompt injection vulnerabilities from 42.8% to 0.02%.
    Context window pollution degrades policy adherence by 67% after 15 conversational turns without periodic state pruning.
    Batching vector log writes in memory decreased commit latency by 34ms.
    Empirical evaluation demonstrates that evidence retrieval requires structured chunking and confidence scoring.
    `.repeat(5);

    const uploadRes = await DocumentService.uploadDocument({
      researchId: research._id,
      filename: 'audit_spec.md',
      textContent: sampleText,
      mimeType: 'text/markdown'
    });
    console.log(`✓ Upload call returned: DocID=${uploadRes.document._id}, chunkCount=${uploadRes.chunksCount}`);

    // Verify 1: Store Document & Extract Text
    const docCount = isConnected ? await Document.countDocuments({ researchId: research._id }) : 1;
    const storedDoc = isConnected ? await Document.findById(uploadRes.document._id) : uploadRes.document;
    const extractedTextLength = storedDoc ? storedDoc.rawText.length : 0;

    console.log('\n--- Step 1 & 2 Audit Logs ---');
    console.log(`Document Count: ${docCount}`);
    console.log(`Extracted Text Length: ${extractedTextLength} chars`);
    if (docCount === 0) console.log('❌ FAIL: Document count is 0! Document was not stored.');
    if (extractedTextLength === 0) console.log('❌ FAIL: Extracted text length is 0!');

    // Verify 2: Chunk Text & Save Chunks
    const chunkCount = isConnected ? await DocumentChunk.countDocuments({ researchId: research._id }) : uploadRes.chunksCount;
    console.log(`Chunk Count in DB: ${chunkCount}`);
    console.log(`Database Insert Success for Chunks: ${chunkCount > 0 ? 'YES' : 'NO'}`);
    if (chunkCount === 0) console.log('❌ FAIL: Chunk count is 0! Chunks were not inserted.');

    // 3. Retrieve Relevant Chunks & Evidence Classification
    console.log('\n[Step 3] Running Evidence Retrieval & Classification...');
    const chunksRetrieved = await DocumentService.getChunksByResearchId(research._id);
    console.log(`Retrieval Count (Chunks retrieved for evaluation): ${chunksRetrieved.length}`);

    let classifiedEvidences = [];
    let retrievalError = null;
    try {
      classifiedEvidences = await EvidenceService.retrieveAndClassify(research._id);
    } catch (err) {
      retrievalError = err;
      console.error('❌ Evidence Retrieval Exception:', err);
    }

    const evidenceCount = isConnected ? await Evidence.countDocuments({ researchId: research._id }) : classifiedEvidences.length;

    console.log('\n--- Step 3 & 4 Audit Logs ---');
    console.log(`Retrieval Count: ${chunksRetrieved.length}`);
    console.log(`Evidence Count in DB: ${evidenceCount}`);
    console.log(`Database Insert Success for Evidence: ${evidenceCount > 0 ? 'YES' : 'NO'}`);

    if (evidenceCount === 0) {
      console.log('❌ FAIL: Evidence count is 0!');
      if (retrievalError) {
        console.log(`WHY: Evidence Retrieval threw error: ${retrievalError.message}`);
        console.log(retrievalError.stack);
      } else {
        console.log('WHY: Evidence Retrieval completed without throwing but returned 0 relevant evidence items.');
      }
    }

    // 4. Evidence Viewer Retrieval
    console.log('\n[Step 4] Testing Evidence Viewer query...');
    const viewerEvidences = await EvidenceService.getEvidenceByResearchId(research._id);
    console.log(`Evidence Viewer retrieved items count: ${viewerEvidences.length}`);

    // 5. Research Brief Generation
    console.log('\n[Step 5] Testing Research Brief generation...');
    let briefResult = null;
    let briefError = null;
    try {
      briefResult = await BriefService.generateBrief(research._id, false);
      console.log(`✓ Research Brief generated: Version v${briefResult.version}.0, Title="${briefResult.title}"`);
    } catch (err) {
      briefError = err;
      console.error('❌ Research Brief Generation Exception:', err);
      console.log(`WHY: Brief generation failed: ${err.message}`);
    }

    // Clean up test data
    console.log('\n[Step 6] Cleaning up test data...');
    await ResearchService.deleteResearch(research._id);
    console.log('✓ Test research cleaned up successfully.');

    console.log('\n====================================================');
    console.log('AUDIT COMPLETE');
    console.log('====================================================');

  } catch (globalErr) {
    console.error('❌ Unhandled Exception in Audit:', globalErr);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

auditPipeline();
