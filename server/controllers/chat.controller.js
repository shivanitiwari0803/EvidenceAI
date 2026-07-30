import { asyncHandler } from '../middleware/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import ChatService from '../services/ChatService.js';

export const sendMessage = asyncHandler(async (req, res) => {
  const { researchId, message } = req.body;
  const result = await ChatService.sendMessage(researchId, message);
  sendSuccess(res, 201, result, 'Chat response generated with citations');
});

export const getHistory = asyncHandler(async (req, res) => {
  const { researchId } = req.params;
  const history = await ChatService.getHistory(researchId);
  sendSuccess(res, 200, history, 'Chat history retrieved successfully');
});

export const clearHistory = asyncHandler(async (req, res) => {
  const { researchId } = req.params;
  const result = await ChatService.clearHistory(researchId);
  sendSuccess(res, 200, result, 'Chat history cleared successfully');
});
