import { Router } from 'express';
import {
  sendMessage,
  getHistory,
  clearHistory
} from '../controllers/chat.controller.js';

const router = Router();

router.post('/chat/message', sendMessage);
router.get('/chat/:researchId', getHistory);
router.delete('/chat/:researchId', clearHistory);

export default router;
