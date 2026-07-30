import { asyncHandler } from '../middleware/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import SearchService from '../services/SearchService.js';

export const globalSearch = asyncHandler(async (req, res) => {
  const { q, type } = req.query;
  const results = await SearchService.search(q, type);
  sendSuccess(res, 200, results, 'Global search completed');
});
