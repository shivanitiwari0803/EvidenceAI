import { Router } from 'express';
import {
  createResearch,
  getResearchById,
  updateResearch,
  getHistory,
  duplicateResearch,
  toggleArchive,
  deleteResearch
} from '../controllers/research.controller.js';

const router = Router();

router.post('/research', createResearch);
router.get('/research/:id', getResearchById);
router.put('/research/:id', updateResearch);
router.get('/history', getHistory);
router.post('/research/:id/duplicate', duplicateResearch);
router.put('/research/:id/archive', toggleArchive);
router.delete('/research/:id', deleteResearch);

export default router;
