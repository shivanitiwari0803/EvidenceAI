import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// CORS Middleware
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));

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
