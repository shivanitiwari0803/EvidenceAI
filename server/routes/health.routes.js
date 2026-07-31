import { Router } from 'express';
import { getRootStatus, getHealthStatus } from '../controllers/health.controller.js';

const router = Router();

// GET / - Root Welcome & Status
router.get('/', getRootStatus);

// GET /health - System Health Check
router.get('/health', getHealthStatus);

export default router;
