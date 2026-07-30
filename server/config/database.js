import mongoose from 'mongoose';
import { logInfo, logError } from '../middleware/logger.js';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      logError('DB', 'MONGODB_URI is not defined in environment variables.');
      process.exit(1);
    }

    const dbName = process.env.DB_NAME || 'EvidenceAI';
    const conn = await mongoose.connect(mongoURI, {
      dbName
    });

    logInfo('DB', `[DB_CONNECTED] Host: ${conn.connection.host} | DB Name: ${conn.connection.name} | readyState: ${conn.connection.readyState}`);
    return conn;
  } catch (error) {
    logError('DB', `MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};
