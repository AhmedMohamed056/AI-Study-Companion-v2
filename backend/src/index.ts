import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import * as Sentry from '@sentry/node';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import lectureRoutes from './routes/lectures.js';
import flashcardRoutes from './routes/flashcards.js';
import quizRoutes from './routes/quiz.js';
import analyticsRoutes from './routes/analytics.js';
import notesRoutes from './routes/notes.js';

import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';
import { prisma } from './lib/prisma.js';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Initialize Sentry
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
  });
  app.use(Sentry.Handlers.requestHandler());
}

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(
  cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        callback(null, true);
        return;
      }

      // Allow localhost on any port
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1',
});

app.use('/api/', limiter);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test Claude API
app.get('/api/test-claude', async (req: Request, res: Response) => {
  console.log('[TEST] Testing Claude API...');
  try {
    const { generateSummary } = await import('./services/claude.service.js');
    const testText = 'This is a test lecture about machine learning. Machine learning is a subset of artificial intelligence that focuses on enabling computers to learn from data without being explicitly programmed. Key concepts include supervised learning, unsupervised learning, and reinforcement learning.';

    console.log('[TEST] Calling generateSummary with test text...');
    const result = await generateSummary(testText);
    console.log('[TEST] Result:', JSON.stringify(result).substring(0, 200));

    res.json({ success: true, result });
  } catch (error: any) {
    console.error('[TEST] Error:', error.message);
    console.error('[TEST] Full error:', JSON.stringify(error));
    res.status(500).json({ error: error.message, details: JSON.stringify(error) });
  }
});

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes (require authentication)
app.use('/api/courses', authMiddleware, courseRoutes);
app.use('/api/lectures', authMiddleware, lectureRoutes);
app.use('/api/flashcards', authMiddleware, flashcardRoutes);
app.use('/api/quiz', authMiddleware, quizRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/notes', authMiddleware, notesRoutes);

// Sentry error handler
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

// Global error handler
app.use(errorHandler);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n[SHUTDOWN] SIGINT received, closing gracefully...');
  server.close(async () => {
    console.log('[SHUTDOWN] Server closed');
    await prisma.$disconnect();
    console.log('[SHUTDOWN] Database disconnected');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('\n[SHUTDOWN] SIGTERM received, closing gracefully...');
  server.close(async () => {
    console.log('[SHUTDOWN] Server closed');
    await prisma.$disconnect();
    console.log('[SHUTDOWN] Database disconnected');
    process.exit(0);
  });
});

export default app;
