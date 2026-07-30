import mongoose from 'mongoose';
import { UserSettings } from '../models/UserSettings.js';

let inMemorySettings = {
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
    const isConnected = mongoose.connection.readyState === 1;
    if (isConnected) {
      let settings = await UserSettings.findOne({ userId: 'default_user' });
      if (!settings) {
        settings = await UserSettings.create(inMemorySettings);
      }
      return settings;
    }
    return inMemorySettings;
  }

  static async updateSettings(data) {
    const isConnected = mongoose.connection.readyState === 1;
    if (isConnected) {
      let settings = await UserSettings.findOneAndUpdate(
        { userId: 'default_user' },
        { $set: data },
        { new: true, upsert: true }
      );
      return settings;
    }
    inMemorySettings = { ...inMemorySettings, ...data };
    return inMemorySettings;
  }
}

export default SettingsService;
