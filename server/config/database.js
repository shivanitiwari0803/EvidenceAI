import mongoose from 'mongoose';
import { logInfo, logError } from '../middleware/logger.js';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      logError('DB', 'MONGODB_URI is not defined in environment variables.');
      process.exit(1);
    }

    const conn = await mongoose.connect(mongoURI);

    logInfo('DB', `MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logError('DB', `MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};
