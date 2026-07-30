import { ApiError } from '../utils/apiResponse.js';
import { logError } from './logger.js';

export const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Resource not found: ${req.originalUrl}`);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for resource: ${err.path}`;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Failure';
    errors = Object.values(err.errors).map((el) => el.message);
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value entered';
  }

  logError('EXPRESS_ERROR', `${statusCode} - ${message} - ${req.originalUrl}`);

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
};
