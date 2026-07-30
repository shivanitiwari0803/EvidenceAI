import mongoose from 'mongoose';

const userSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: 'default_user',
      unique: true
    },
    defaultModel: {
      type: String,
      default: 'gpt-4o-mini'
    },
    theme: {
      type: String,
      default: 'dark'
    },
    citationStyle: {
      type: String,
      default: 'IEEE'
    },
    retrievalCount: {
      type: Number,
      default: 5
    },
    temperature: {
      type: Number,
      default: 0.2
    },
    exportFormat: {
      type: String,
      default: 'markdown'
    }
  },
  {
    timestamps: true
  }
);

export const UserSettings = mongoose.model('UserSettings', userSettingsSchema);
export default UserSettings;
