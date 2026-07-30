import mongoose from 'mongoose';
import { UserSettings } from '../models/UserSettings.js';
import { logInfo } from '../middleware/logger.js';

const defaultSettings = {
  userId: 'default_user',
  defaultModel: 'gpt-4o-mini',
  theme: 'dark',
  citationStyle: 'IEEE',
  retrievalCount: 5,
  temperature: 0.2,
  exportFormat: 'markdown'
};

export class SettingsService {
  static async getSettings() {
    let settings = await UserSettings.findOne({ userId: 'default_user' });
    if (!settings) {
      settings = await UserSettings.create(defaultSettings);
      logInfo('SETTINGS_SERVICE', `[DB_WRITE] Default settings created in collection 'usersettings'`);
    }
    return settings;
  }

  static async updateSettings(data) {
    const settings = await UserSettings.findOneAndUpdate(
      { userId: 'default_user' },
      { $set: data },
      { new: true, upsert: true }
    );
    logInfo('SETTINGS_SERVICE', `[DB_WRITE] Settings updated in collection 'usersettings'`);
    return settings;
  }
}

export default SettingsService;
