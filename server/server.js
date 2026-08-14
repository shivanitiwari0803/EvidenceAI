import dotenv from 'dotenv';

dotenv.config({
  path: '../.env'
});

import express from 'express';
import cors from 'cors';

import { connectDB } from './config/database.js';
import { requestLogger, logInfo } from './middleware/logger.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

import healthRoutes from './routes/health.routes.js';
import researchRoutes from './routes/research.routes.js';
import planRoutes from './routes/plan.routes.js';
import documentRoutes from './routes/document.routes.js';
import briefRoutes from './routes/brief.routes.js';
import chatRoutes from './routes/chat.routes.js';
import evidenceRoutes from './routes/evidence.routes.js';
import searchRoutes from './routes/search.routes.js';
import settingsRoutes from './routes/settings.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Dynamic CORS Configuration for Production Vercel & Local Development
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  CLIENT_URL.replace(/\/+$/, '')
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // 1. Allow requests with no Origin header (health checks, Render pings, Postman, cURL)
    if (!origin) {
      return callback(null, true);
    }

    const cleanOrigin = origin.replace(/\/+$/, '');

    // 2. Allow exact match, configured CLIENT_URL, or Vercel preview subdomains
    const isAllowed = allowedOrigins.includes(cleanOrigin) ||
      allowedOrigins.some(allowed => allowed && cleanOrigin.startsWith(allowed)) ||
      /\.vercel\.app$/i.test(cleanOrigin);

    if (isAllowed) {
      return callback(null, true);
    }

    logInfo('CORS', `Blocked request from unapproved origin: "${origin}"`);
    return callback(new Error(`CORS policy violation: Origin '${origin}' is not allowed.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request Logging Middleware
app.use(requestLogger);

// Mount Routes (supporting direct routes as well as /api prefixes)
app.use('/', healthRoutes);
app.use('/api', healthRoutes);

app.use('/', researchRoutes);
app.use('/api', researchRoutes);

app.use('/', planRoutes);
app.use('/api', planRoutes);

app.use('/', documentRoutes);
app.use('/api', documentRoutes);

app.use('/', evidenceRoutes);
app.use('/api', evidenceRoutes);

app.use('/', briefRoutes);
app.use('/api', briefRoutes);

app.use('/', chatRoutes);
app.use('/api', chatRoutes);

app.use('/', searchRoutes);
app.use('/api', searchRoutes);

app.use('/', settingsRoutes);
app.use('/api', settingsRoutes);

// 404 & Centralized Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Database Connection & Server Bootstrap
const bootstrapServer = async () => {
  if (process.env.MONGODB_URI) {
    await connectDB();
  } else {
    logInfo('SERVER', 'MONGODB_URI not set.');
  }

  const server = app.listen(PORT, () => {
    logInfo('SERVER', `EvidenceAI Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });

  process.on('unhandledRejection', (err) => {
    logInfo('SERVER', `Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

bootstrapServer();

export default app;
