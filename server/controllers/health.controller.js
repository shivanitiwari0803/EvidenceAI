import { asyncHandler } from '../middleware/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const checkHealth = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, {
    service: 'EvidenceAI Research Assistant API',
    status: 'UP',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  }, 'Health check passed');
});
