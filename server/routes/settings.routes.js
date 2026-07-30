import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';

const router = Router();

router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
