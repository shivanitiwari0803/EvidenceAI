import { Router } from 'express';
import {
  generateBrief,
  getBrief,
  getBriefVersion,
  getBriefVersions,
  regenerateBrief,
  exportPdf,
  exportMarkdown
} from '../controllers/brief.controller.js';

const router = Router();

router.post('/research-brief/generate', generateBrief);
router.get('/research-brief/:researchId', getBrief);
router.get('/research-brief/version/:versionId', getBriefVersion);
router.get('/research-brief/versions/:researchId', getBriefVersions);
router.post('/research-brief/regenerate', regenerateBrief);
router.post('/research-brief/export/pdf', exportPdf);
router.post('/research-brief/export/markdown', exportMarkdown);

// Support shorthand /brief legacy endpoint
router.post('/brief', generateBrief);

export default router;
