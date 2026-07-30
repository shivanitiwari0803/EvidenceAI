import { Router } from 'express';
import {
  generatePlan,
  updatePlan,
  approvePlan
} from '../controllers/plan.controller.js';

const router = Router();

router.post('/plan/generate', generatePlan);
router.put('/plan/:id', updatePlan);
router.post('/plan/:id/approve', approvePlan);

export default router;
