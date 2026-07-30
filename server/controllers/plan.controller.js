import { asyncHandler } from '../middleware/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import PlanService from '../services/PlanService.js';

export const generatePlan = asyncHandler(async (req, res) => {
  const { researchId } = req.body;
  const plan = await PlanService.generatePlan(researchId);
  sendSuccess(res, 201, plan, 'AI Research plan generated successfully');
});

export const updatePlan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { steps } = req.body;
  const updatedPlan = await PlanService.updatePlan(id, steps);
  sendSuccess(res, 200, updatedPlan, 'Research plan updated successfully');
});

export const approvePlan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await PlanService.approvePlan(id);
  sendSuccess(res, 200, result, 'Research plan approved successfully');
});
