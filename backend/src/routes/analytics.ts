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

// Get recent activity feed
router.get(
  '/activity',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;

    const [courses, lectures, flashcardBatches, quizzes] = await Promise.all([
      prisma.course.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, title: true, createdAt: true },
      }),
      prisma.lecture.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, title: true, createdAt: true },
      }),
      prisma.flashcard.groupBy({
        by: ['lectureId'],
        where: { userId },
        _max: { createdAt: true },
        orderBy: { _max: { createdAt: 'desc' } },
        take: 10,
      }),
      prisma.quiz.findMany({
        where: { userId },
        orderBy: { takenAt: 'desc' },
        take: 10,
        include: { lecture: { select: { title: true } } },
      }),
    ]);

    // Resolve lecture titles for flashcard batches
    const flashcardLectureIds = flashcardBatches.map((b) => b.lectureId);
    const flashcardLectures = await prisma.lecture.findMany({
      where: { id: { in: flashcardLectureIds } },
      select: { id: true, title: true },
    });
    const lectureMap = new Map(flashcardLectures.map((l) => [l.id, l.title]));

    const events: { type: string; label: string; subLabel?: string; time: string }[] = [];

    for (const c of courses) {
      events.push({ type: 'course', label: 'Created course', subLabel: c.title, time: c.createdAt.toISOString() });
    }
    for (const l of lectures) {
      events.push({ type: 'lecture', label: 'Added lecture', subLabel: l.title, time: l.createdAt.toISOString() });
    }
    for (const b of flashcardBatches) {
      const t = b._max.createdAt;
      if (t) {
        events.push({ type: 'flashcards', label: 'Generated flashcards', subLabel: lectureMap.get(b.lectureId) ?? 'Unknown lecture', time: t.toISOString() });
      }
    }
    for (const q of quizzes) {
      const pct = Math.round((q.score / q.total) * 100);
      events.push({ type: 'quiz', label: `Completed quiz — ${pct}%`, subLabel: q.lecture.title, time: q.takenAt.toISOString() });
    }

    events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return sendSuccess(res, events.slice(0, 5));
  })
);

export default router;
