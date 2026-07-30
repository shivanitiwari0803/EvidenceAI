import { asyncHandler } from '../middleware/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import SettingsService from '../services/SettingsService.js';

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await SettingsService.getSettings();
  sendSuccess(res, 200, settings, 'Settings retrieved');
});

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await SettingsService.updateSettings(req.body);
  sendSuccess(res, 200, settings, 'Settings updated');
});
