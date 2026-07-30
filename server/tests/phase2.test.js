import dotenv from 'dotenv';
import ResearchService from '../services/ResearchService.js';
import PlanService from '../services/PlanService.js';

dotenv.config();

async function runPhase2Tests() {
  console.log('--- Starting Phase 2 Backend Verification ---');

  try {
    // 1. Create Research Project
    console.log('Test 1: Creating research project...');
    const research = await ResearchService.createResearch({
      title: 'LLM Context Window Contamination Evaluation',
      researchQuestion: 'How does context window pollution affect multi-agent decision making over extended execution loops?',
      context: 'Evaluated across 100 conversational turns with isolated subagent states.'
    });
    console.log('✓ Research Created:', research._id, research.title, research.status);

    // 2. Generate AI Research Plan
    console.log('\nTest 2: Generating AI research plan...');
    const plan = await PlanService.generatePlan(research._id);
    console.log('✓ Plan Generated:', plan._id, 'Steps:', plan.steps.length, 'GeneratedBy:', plan.generatedBy);

    // 3. Edit Plan Steps
    console.log('\nTest 3: Editing plan steps...');
    const modifiedSteps = [...plan.steps];
    modifiedSteps[0].title = 'Modified Step 1: Baseline Context Isolation Audit';
    const updatedPlan = await PlanService.updatePlan(plan._id, modifiedSteps);
    console.log('✓ Plan Updated: Edited status =', updatedPlan.edited, 'Title =', updatedPlan.steps[0].title);

    // 4. Approve Plan
    console.log('\nTest 4: Approving plan...');
    const approvalResult = await PlanService.approvePlan(plan._id);
    console.log('✓ Plan Approved:', approvalResult.plan.approved, 'ApprovedAt:', approvalResult.plan.approvedAt);
    console.log('✓ Associated Research Status:', approvalResult.research.status);

    // 5. Retrieve Updated Research
    console.log('\nTest 5: Retrieving research project by ID...');
    const fetchedResearch = await ResearchService.getResearchById(research._id);
    console.log('✓ Research Retrieved:', fetchedResearch._id, 'Status:', fetchedResearch.status, 'CurrentPlan steps:', fetchedResearch.currentPlan?.steps?.length);

    console.log('\n✅ ALL PHASE 2 BACKEND TESTS PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Phase 2 Backend Test Failed:', error);
    process.exit(1);
  }
}

runPhase2Tests();
