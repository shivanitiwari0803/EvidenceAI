import dotenv from 'dotenv';
import ResearchService from '../services/ResearchService.js';
import PlanService from '../services/PlanService.js';
import DocumentService from '../services/DocumentService.js';
import EvidenceService from '../services/EvidenceService.js';
import ChatService from '../services/ChatService.js';
import SearchService from '../services/SearchService.js';
import SettingsService from '../services/SettingsService.js';

dotenv.config();

async function runFinalPhaseTests() {
  console.log('--- Starting Final Phase Integration Tests ---');

  try {
    // 1. Setup Workspace with evidence
    console.log('Test 1: Setting up complete RAG research workspace...');
    const research = await ResearchService.createResearch({
      title: 'Distributed Subagent Consensus Evaluation',
      researchQuestion: 'What isolation protocols minimize latency in multi-agent tool execution loops?',
      context: 'Testing context window security and vector log flushing.'
    });

    const plan = await PlanService.generatePlan(research._id);
    await PlanService.approvePlan(plan._id);

    const docText = `
    Section 1: Multi-Agent Execution Benchmarks
    Deploying subagents in ephemeral process sandboxes reduced high-severity prompt injection vulnerabilities from 42.8% to 0.02%.
    Context window pollution degrades policy adherence by 67% after 15 conversational turns without periodic state pruning.
    Batching vector log writes in memory decreased commit latency by 34ms.
    `.repeat(3);

    await DocumentService.uploadDocument({
      researchId: research._id,
      filename: 'consensus_benchmarks.md',
      textContent: docText,
      mimeType: 'text/markdown'
    });

    await EvidenceService.retrieveAndClassify(research._id);
    console.log('✓ Setup complete for ResearchID:', research._id);

    // 2. Test RAG AI Chat Messaging
    console.log('\nTest 2: Sending question to RAG Chat Engine...');
    const chatRes = await ChatService.sendMessage(research._id, 'What evidence exists for latency reduction?');
    console.log('✓ Chat Assistant Response Generated (Length:', chatRes.assistantMessage.content.length, 'chars)');
    console.log('  - Citations Attached:', chatRes.assistantMessage.citations.length);
    console.log('  - Response Latency:', chatRes.assistantMessage.latencyMs + 'ms');

    // 3. Test Chat History Retrieval & Clearing
    console.log('\nTest 3: Retrieving and clearing chat history...');
    const historyBefore = await ChatService.getHistory(research._id);
    console.log('✓ Chat History Count:', historyBefore.length);

    await ChatService.clearHistory(research._id);
    const historyAfter = await ChatService.getHistory(research._id);
    console.log('✓ Chat History Count after clear:', historyAfter.length);

    // 4. Test Global Search
    console.log('\nTest 4: Executing Global Search...');
    const searchRes = await SearchService.search('subagent');
    console.log('✓ Global Search Completed. Matches Found:', searchRes.resultsCount);
    console.log('  - Projects matched:', searchRes.projects.length);
    console.log('  - Documents matched:', searchRes.documents.length);

    // 5. Test Project Management (Duplicate, Archive, Delete)
    console.log('\nTest 5: Testing Project Management (Duplicate, Archive)...');
    const dupProject = await ResearchService.duplicateResearch(research._id);
    console.log('✓ Project Duplicated: ID =', dupProject._id, 'Title =', dupProject.title);

    const archivedProject = await ResearchService.toggleArchive(dupProject._id, true);
    console.log('✓ Project Archived: isArchived =', archivedProject.isArchived);

    await ResearchService.deleteResearch(dupProject._id);
    console.log('✓ Duplicated Project Deleted');

    // 6. Test Settings
    console.log('\nTest 6: Testing Settings Service...');
    const settings = await SettingsService.getSettings();
    console.log('✓ Settings Retrieved. Default Model:', settings.defaultModel);

    const updatedSettings = await SettingsService.updateSettings({ temperature: 0.1, citationStyle: 'APA' });
    console.log('✓ Settings Updated. Citation Style:', updatedSettings.citationStyle);

    console.log('\n✅ ALL FINAL PHASE BACKEND TESTS PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Final Phase Backend Test Failed:', error);
    process.exit(1);
  }
}

runFinalPhaseTests();
