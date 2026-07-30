import { asyncHandler } from '../middleware/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import ResearchService from '../services/ResearchService.js';

export const createResearch = asyncHandler(async (req, res) => {
  const { title, researchQuestion, context } = req.body;
  const research = await ResearchService.createResearch({ title, researchQuestion, context });
  sendSuccess(res, 201, research, 'Research project created successfully');
});

export const getResearchById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const research = await ResearchService.getResearchById(id);
  sendSuccess(res, 200, research, 'Research project retrieved successfully');
});

export const updateResearch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, researchQuestion, context } = req.body;
  const research = await ResearchService.updateResearch(id, { title, researchQuestion, context });
  sendSuccess(res, 200, research, 'Research project updated successfully');
});

export const getHistory = asyncHandler(async (req, res) => {
  const history = await ResearchService.getAllResearch();
  sendSuccess(res, 200, history, 'Research history retrieved successfully');
});

export const duplicateResearch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const duplicated = await ResearchService.duplicateResearch(id);
  sendSuccess(res, 201, duplicated, 'Research project duplicated successfully');
});

export const toggleArchive = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isArchived } = req.body;
  const research = await ResearchService.toggleArchive(id, isArchived);
  sendSuccess(res, 200, research, `Research project ${isArchived ? 'archived' : 'unarchived'} successfully`);
});

export const deleteResearch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await ResearchService.deleteResearch(id);
  sendSuccess(res, 200, result, 'Research project deleted successfully');
});
