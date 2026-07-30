import { Router } from 'express';
import { globalSearch } from '../controllers/search.controller.js';

const router = Router();

router.get('/search', globalSearch);

export default router;
