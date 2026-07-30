import { Router } from 'express';
import {
  retrieveEvidence,
  getEvidence
} from '../controllers/evidence.controller.js';

const router = Router();

router.post('/evidence/retrieve', retrieveEvidence);
router.get('/evidence/:researchId', getEvidence);

export default router;
