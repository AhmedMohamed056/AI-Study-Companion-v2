import { Router, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { calculateSchedulingStats } from '../services/spaced-repetition.service.js';
import { prisma } from '../lib/prisma.js';
import { sendSuccess } from '../utils/response.js';

const router = Router();

// Get user analytics
router.get(
  '/me',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // Get quizzes
    const quizzes = await prisma.quiz.findMany({
      where: { userId: req.userId },
    });

    const quizzesTaken = quizzes.length;
    const avgScore = quizzes.length > 0 ? Math.round(quizzes.reduce((sum, q) => sum + q.score / q.total, 0) / quizzes.length * 100) : 0;

    // Get flashcards
    const flashcards = await prisma.flashcard.findMany({
      where: { userId: req.userId },
    });

    const stats = calculateSchedulingStats(flashcards);

    // Get lectures
    const lecturesCompleted = await prisma.lecture.count({
      where: { userId: req.userId },
    });

    res.json({
      quizzesTaken,
      avgScore,
      flashcardsDue: stats.dueToday,
      lecturesCompleted,
      flashcardStats: stats,
    });
  })
);

// Get weak areas (topics with low performance)
router.get(
  '/weak-areas',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // Get all quiz questions for user
    const quizQuestions = await prisma.quizQuestion.findMany({
      where: { userId: req.userId },
    });

    // Group by topic and calculate performance
    const topicPerformance: { [key: string]: { correct: number; total: number; percentage: number } } = {};

    for (const question of quizQuestions) {
      const topic = question.topic || 'General';
      if (!topicPerformance[topic]) {
        topicPerformance[topic] = { correct: 0, total: 0, percentage: 0 };
      }
      topicPerformance[topic].total++;
      if (question.isCorrect) {
        topicPerformance[topic].correct++;
      }
    }

    // Calculate percentages and sort by weakest first
    const weakAreas = Object.entries(topicPerformance)
      .map(([topic, perf]) => ({
        topic,
        correct: perf.correct,
        total: perf.total,
        percentage: Math.round((perf.correct / perf.total) * 100),
      }))
      .sort((a, b) => a.percentage - b.percentage);

    res.json({ data: weakAreas });
  })
);

export default router;
