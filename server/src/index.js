import dotenv from 'dotenv';
import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { connectToDatabase } from './config/db.js';
import { createLogger } from './config/logger.js';
import apiRouter from './routes/index.js';
import { initializeSockets } from './sockets/index.js';

dotenv.config();

const logger = createLogger();
const app = express();
const server = http.createServer(app);

// Socket.IO initialization
initializeSockets(server, logger);

// Core middleware
const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // same-origin or curl
    if (allowedOrigins.some((o) => origin === o)) return callback(null, true);
    if (/^http:\/\/localhost:51\d{2}$/.test(origin)) return callback(null, true);
    return callback(new Error('CORS not allowed'), false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Healthcheck
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', apiRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found', path: req.originalUrl });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  logger.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal Server Error' });
});

const PORT = Number(process.env.PORT || 5000);

// Start server after DB connection
connectToDatabase()
  .then(() => {
    server.listen(PORT, () => {
      logger.info(`Server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error('Failed to connect to MongoDB', error);
    process.exit(1);
  });


