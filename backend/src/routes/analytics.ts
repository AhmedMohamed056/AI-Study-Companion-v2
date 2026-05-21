import { Router, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { calculateSchedulingStats } from '../services/spaced-repetition.service.js';
import { prisma } from '../lib/prisma.js';

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

export default router;
