import mongoose from 'mongoose';
import { ResearchPlan } from '../models/ResearchPlan.js';
import { Research } from '../models/Research.js';
import { AIService } from './AIService.js';
import { ResearchService } from './ResearchService.js';
import { ApiError } from '../utils/apiResponse.js';
import { logInfo } from '../middleware/logger.js';

// In-memory fallback storage when MongoDB is not connected
const inMemoryPlans = new Map();

export class PlanService {
  /**
   * Generates a new AI research plan for a given research project.
   */
  static async generatePlan(researchId) {
    const research = await ResearchService.getResearchById(researchId);
    if (!research) {
      throw new ApiError(404, `Research project not found with ID: ${researchId}`);
    }

    // Call AIService to get structured steps
    const steps = await AIService.generatePlan(research.researchQuestion, research.context);

    const isConnected = mongoose.connection.readyState === 1;

    let plan;
    if (isConnected) {
      plan = await ResearchPlan.create({
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
    } else {
      const id = new mongoose.Types.ObjectId().toString();
      plan = {
        _id: id,
        researchId: research._id,
        generatedBy: process.env.OPENAI_MODEL || 'OpenAI-Compatible AI Engine',
        steps,
        approved: false,
        edited: false,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryPlans.set(id, plan);

      research.currentPlan = plan;
      research.status = 'PLAN_GENERATED';
      research.updatedAt = new Date();
    }

    logInfo('PLAN_SERVICE', `Plan generated: PlanID=${plan._id}, ResearchID=${research._id}, StepsCount=${steps.length} [Timestamp: ${new Date().toISOString()}]`);

    return plan;
  }

  /**
   * Updates an existing plan's steps (editing titles, descriptions, objectives, order).
   * Marks edited = true.
   */
  static async updatePlan(planId, steps) {
    if (!Array.isArray(steps) || steps.length === 0) {
      throw new ApiError(400, 'Steps array is required and cannot be empty.');
    }

    const isConnected = mongoose.connection.readyState === 1;

    // Normalize and reorder steps
    const updatedSteps = steps.map((s, index) => ({
      id: s.id || `step_${index + 1}`,
      title: s.title ? s.title.trim() : `Step ${index + 1}`,
      description: s.description ? s.description.trim() : '',
      objective: s.objective ? s.objective.trim() : '',
      order: index + 1,
      status: s.status || 'PENDING'
    }));

    let plan;
    if (isConnected) {
      plan = await ResearchPlan.findById(planId);
      if (!plan) {
        throw new ApiError(404, `Research plan not found with ID: ${planId}`);
      }

      plan.steps = updatedSteps;
      plan.edited = true;
      await plan.save();
    } else {
      plan = inMemoryPlans.get(planId);
      if (!plan) {
        throw new ApiError(404, `Research plan not found with ID: ${planId}`);
      }

      plan.steps = updatedSteps;
      plan.edited = true;
      plan.updatedAt = new Date();
      inMemoryPlans.set(planId, plan);
    }

    logInfo('PLAN_SERVICE', `Plan edited: PlanID=${plan._id}, StepsCount=${updatedSteps.length} [Timestamp: ${new Date().toISOString()}]`);

    return plan;
  }

  /**
   * Approves a research plan.
   * Marks approved = true, approvedAt = now, and sets Research status = 'PLAN_APPROVED'.
   */
  static async approvePlan(planId) {
    const isConnected = mongoose.connection.readyState === 1;

    let plan;
    let research;

    if (isConnected) {
      plan = await ResearchPlan.findById(planId);
      if (!plan) {
        throw new ApiError(404, `Research plan not found with ID: ${planId}`);
      }

      plan.approved = true;
      plan.approvedAt = new Date();
      await plan.save();

      research = await Research.findById(plan.researchId);
      if (research) {
        research.status = 'PLAN_APPROVED';
        await research.save();
      }
    } else {
      plan = inMemoryPlans.get(planId);
      if (!plan) {
        throw new ApiError(404, `Research plan not found with ID: ${planId}`);
      }

      plan.approved = true;
      plan.approvedAt = new Date();
      inMemoryPlans.set(planId, plan);

      research = await ResearchService.getResearchById(plan.researchId);
      if (research) {
        research.status = 'PLAN_APPROVED';
        if (typeof research.save === 'function') {
          await research.save();
        }
      }
    }

    logInfo('PLAN_SERVICE', `Plan approved: PlanID=${plan._id}, ResearchID=${plan ? plan.researchId : 'N/A'} [Timestamp: ${new Date().toISOString()}]`);

    return { plan, research };
  }
}

export default PlanService;
