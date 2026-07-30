import { asyncHandler } from '../middleware/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import BriefService from '../services/BriefService.js';

export const generateBrief = asyncHandler(async (req, res) => {
  const { researchId } = req.body;
  const brief = await BriefService.generateBrief(researchId, false);
  sendSuccess(res, 201, brief, 'Research Brief generated successfully');
});

export const getBrief = asyncHandler(async (req, res) => {
  const { researchId } = req.params;
  const brief = await BriefService.getBriefByResearchId(researchId);
  if (!brief) {
    return sendError(res, 404, 'No research brief version found for this project.');
  }
  sendSuccess(res, 200, brief, 'Latest research brief retrieved successfully');
});

export const getBriefVersion = asyncHandler(async (req, res) => {
  const { versionId } = req.params;
  const brief = await BriefService.getBriefByVersionId(versionId);
  if (!brief) {
    return sendError(res, 404, `Research brief version not found with ID: ${versionId}`);
  }
  sendSuccess(res, 200, brief, 'Research brief version retrieved successfully');
});

export const getBriefVersions = asyncHandler(async (req, res) => {
  const { researchId } = req.params;
  const versions = await BriefService.getVersionsByResearchId(researchId);
  sendSuccess(res, 200, versions, 'Brief versions retrieved successfully');
});

export const regenerateBrief = asyncHandler(async (req, res) => {
  const { researchId } = req.body;
  const newVersion = await BriefService.generateBrief(researchId, true);
  sendSuccess(res, 201, newVersion, 'Research Brief regenerated as a new version');
});

export const exportPdf = asyncHandler(async (req, res) => {
  const { briefId } = req.body;
  const brief = await BriefService.getBriefByVersionId(briefId);
  if (!brief) {
    return sendError(res, 404, 'Research brief not found for PDF export.');
  }
  const pdfHtml = BriefService.exportPdf(brief);
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Disposition', `attachment; filename="${brief.title || 'brief'}.html"`);
  return res.status(200).send(pdfHtml);
});

export const exportMarkdown = asyncHandler(async (req, res) => {
  const { briefId } = req.body;
  const brief = await BriefService.getBriefByVersionId(briefId);
  if (!brief) {
    return sendError(res, 404, 'Research brief not found for Markdown export.');
  }
  const md = BriefService.exportMarkdown(brief);
  sendSuccess(res, 200, { markdown: md, filename: `${brief.title || 'brief'}.md` }, 'Markdown exported successfully');
});
