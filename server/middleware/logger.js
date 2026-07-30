import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.join(__dirname, '../logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFilePath = path.join(logsDir, 'app.log');

const writeToFile = (message) => {
  const timestamp = new Date().toISOString();
  const formattedMsg = `[${timestamp}] ${message}\n`;
  fs.appendFile(logFilePath, formattedMsg, (err) => {
    if (err) console.error('Failed to write to log file:', err);
  });
};

export const logInfo = (category, message) => {
  const logMsg = `[INFO] [${category}] ${message}`;
  console.log(`\x1b[36m${logMsg}\x1b[0m`);
  writeToFile(logMsg);
};

export const logWarn = (category, message) => {
  const logMsg = `[WARN] [${category}] ${message}`;
  console.warn(`\x1b[33m${logMsg}\x1b[0m`);
  writeToFile(logMsg);
};

export const logError = (category, message) => {
  const logMsg = `[ERROR] [${category}] ${message}`;
  console.error(`\x1b[31m${logMsg}\x1b[0m`);
  writeToFile(logMsg);
};

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const color = statusCode >= 400 ? '\x1b[31m' : statusCode >= 300 ? '\x1b[33m' : '\x1b[32m';
    const logMsg = `${method} ${originalUrl} ${statusCode} ${duration}ms - ${ip}`;
    
    console.log(`${color}[HTTP] ${logMsg}\x1b[0m`);
    writeToFile(`[HTTP] ${logMsg}`);
  });

  next();
};
