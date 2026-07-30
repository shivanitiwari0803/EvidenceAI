import { asyncHandler } from '../middleware/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import EvidenceService from '../services/EvidenceService.js';

export const retrieveEvidence = asyncHandler(async (req, res) => {
  const { researchId } = req.body;
  const evidences = await EvidenceService.retrieveAndClassify(researchId);
  sendSuccess(res, 200, evidences, 'Evidence retrieval and classification completed successfully');
});

export const getEvidence = asyncHandler(async (req, res) => {
  const { researchId } = req.params;
  const evidences = await EvidenceService.getEvidenceByResearchId(researchId);
  sendSuccess(res, 200, evidences, 'Evidences retrieved successfully');
});
