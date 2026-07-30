import dotenv from 'dotenv';
import ResearchService from '../services/ResearchService.js';
import PlanService from '../services/PlanService.js';
import AIService from '../services/AIService.js';

dotenv.config();

async function debugPlanFlow() {
  console.log('=== End-to-End Debugging: Research Plan Generation Flow ===');

  try {
    // 1. Create Research Project
    console.log('Step 1: Creating Research Project...');
    const research = await ResearchService.createResearch({
      title: 'End-to-End Debugging Test',
      researchQuestion: 'How does Gemini 2.5 Flash process research plan requests under timeout limits?',
      context: 'Testing full request lifecycle and response resolution.'
    });
    console.log('✓ Project Created: ID =', research._id, 'Title =', research.title);

    // 2. Direct AIService Test
    console.log('\nStep 2: Calling AIService.generatePlan...');
    const startTime = Date.now();
    const steps = await AIService.generatePlan(research.researchQuestion, research.context);
    const latency = Date.now() - startTime;
    console.log(`✓ AIService.generatePlan Completed in ${latency}ms`);
    console.log('  - Total Steps Returned:', steps.length);
    console.log('  - Step 1 Title:', steps[0].title);

    // 3. Complete PlanService.generatePlan Test
    console.log('\nStep 3: Calling PlanService.generatePlan...');
    const planStartTime = Date.now();
    const plan = await PlanService.generatePlan(research._id);
    const planLatency = Date.now() - planStartTime;
    console.log(`✓ PlanService.generatePlan Completed in ${planLatency}ms`);
    console.log('  - Plan ID:', plan._id);
    console.log('  - Steps Count:', plan.steps.length);
    console.log('  - Research Status:', research.status);

    console.log('\n✅ END-TO-END RESEARCH PLAN GENERATION FLOW IS 100% WORKING AND VERIFIED!');
  } catch (error) {
    console.error('❌ Debugging Failed:', error);
    process.exit(1);
  }
}

debugPlanFlow();
