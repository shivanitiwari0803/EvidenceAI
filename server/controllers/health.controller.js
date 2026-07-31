import mongoose from 'mongoose';
import { asyncHandler } from '../middleware/asyncHandler.js';

/**
 * Root GET / Endpoint Status
 */
export const getRootStatus = asyncHandler(async (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'EvidenceAI Backend is running',
    version: '1.0.0'
  });
});

/**
 * Health GET /health Endpoint Status
 */
export const getHealthStatus = asyncHandler(async (req, res) => {
  const dbState = mongoose.connection && mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'healthy',
    database: dbState,
    uptime: process.uptime()
  });
});

// Backward compatibility checkHealth alias
export const checkHealth = getHealthStatus;
