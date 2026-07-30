import mongoose from 'mongoose';
import { ResearchPlan } from '../models/ResearchPlan.js';
import { Research } from '../models/Research.js';
import { AIService } from './AIService.js';
import { ResearchService } from './ResearchService.js';
import { ApiError } from '../utils/apiResponse.js';
import { logInfo } from '../middleware/logger.js';

export class PlanService {
  /**
   * Generates a new AI research plan and stores it in MongoDB.
   */
  static async generatePlan(researchId) {
    const research = await ResearchService.getResearchById(researchId);
    if (!research) {
      throw new ApiError(404, `Research project not found with ID: ${researchId}`);
    }

    // Call AIService to get structured steps
    const steps = await AIService.generatePlan(research.researchQuestion, research.context);

    const plan = await ResearchPlan.create({
      researchId: research._id,
      generatedBy: process.env.OPENAI_MODEL || 'OpenAI-Compatible AI Engine',
      steps,
      approved: false,
      edited: false,
      version: 1
    });

    research.currentPlan = plan._id;
    research.status = 'PLAN_GENERATED';
    await research.save();

    logInfo('PLAN_SERVICE', `[DB_WRITE] Plan created in collection 'researchplans': PlanID=${plan._id}, ResearchID=${research._id}, StepsCount=${steps.length} [Timestamp: ${new Date().toISOString()}]`);

    return plan;
  }

  /**
   * Updates an existing plan's steps in MongoDB.
   */
  static async updatePlan(planId, steps) {
    if (!Array.isArray(steps) || steps.length === 0) {
      throw new ApiError(400, 'Steps array is required and cannot be empty.');
    }

    const updatedSteps = steps.map((s, index) => ({
      id: s.id || `step_${index + 1}`,
      title: s.title ? s.title.trim() : `Step ${index + 1}`,
      description: s.description ? s.description.trim() : '',
      objective: s.objective ? s.objective.trim() : '',
      order: index + 1,
      status: s.status || 'PENDING'
    }));

    const plan = await ResearchPlan.findById(planId);
    if (!plan) {
      throw new ApiError(404, `Research plan not found with ID: ${planId}`);
    }

    plan.steps = updatedSteps;
    plan.edited = true;
    await plan.save();

    logInfo('PLAN_SERVICE', `[DB_WRITE] Plan updated in collection 'researchplans': PlanID=${plan._id}, StepsCount=${updatedSteps.length} [Timestamp: ${new Date().toISOString()}]`);

    return plan;
  }

  /**
   * Approves a research plan in MongoDB.
   */
  static async approvePlan(planId) {
    const plan = await ResearchPlan.findById(planId);
    if (!plan) {
      throw new ApiError(404, `Research plan not found with ID: ${planId}`);
    }

    plan.approved = true;
    plan.approvedAt = new Date();
    await plan.save();

    const research = await Research.findById(plan.researchId);
    if (research) {
      research.status = 'PLAN_APPROVED';
      await research.save();
    }

    logInfo('PLAN_SERVICE', `[DB_WRITE] Plan approved in collection 'researchplans' & Research status updated in 'researches': PlanID=${plan._id}, ResearchID=${plan.researchId}`);

    return { plan, research };
  }
}

export default PlanService;
