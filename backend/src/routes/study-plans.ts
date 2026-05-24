import { Router, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { generateStudyPlan } from '../services/claude.service.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

// Generate personalized study plan
router.post(
  '/generate',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('[STUDY_PLAN_ROUTE] Received study plan generation request');
    const { examDate } = req.body;

    if (!examDate) {
      console.error('[STUDY_PLAN_ROUTE] Missing examDate');
      return res.status(400).json({ error: 'examDate is required' });
    }

    // Get weak areas from quiz performance
    const quizQuestions = await prisma.quizQuestion.findMany({
      where: { userId: req.userId },
    });

    const topicPerformance: { [key: string]: { correct: number; total: number } } = {};

    for (const question of quizQuestions) {
      const topic = question.topic || 'General';
      if (!topicPerformance[topic]) {
        topicPerformance[topic] = { correct: 0, total: 0 };
      }
      topicPerformance[topic].total++;
      if (question.isCorrect) {
        topicPerformance[topic].correct++;
      }
    }

    const weakAreas = Object.entries(topicPerformance)
      .map(([topic, perf]) => ({
        topic,
        percentage: Math.round((perf.correct / perf.total) * 100),
      }))
      .sort((a, b) => a.percentage - b.percentage);

    // Get lecture count
    const lectureCount = await prisma.lecture.count({
      where: { userId: req.userId },
    });

    // Generate study plan
    console.log('[STUDY_PLAN_ROUTE] Calling generateStudyPlan service');
    const studyPlan = await generateStudyPlan(examDate, weakAreas, lectureCount);

    console.log('[STUDY_PLAN_ROUTE] Study plan generated successfully');
    res.json({ data: studyPlan });
  })
);

export default router;
