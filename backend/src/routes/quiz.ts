import { Router, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { generateQuiz } from '../services/claude.service.js';
import { prisma } from '../lib/prisma.js';
import { sendSuccess } from '../utils/response.js';

const router = Router();

// Generate quiz for a lecture
router.post(
  '/generate',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('[QUIZ_ROUTE] Received quiz generation request');
    const { lectureId } = req.body;

    if (!lectureId) {
      console.error('[QUIZ_ROUTE] Missing lectureId');
      return res.status(400).json({ error: 'lectureId is required' });
    }

    console.log('[QUIZ_ROUTE] Fetching lecture:', lectureId);

    // Get lecture
    const lecture = await prisma.lecture.findUnique({ where: { id: lectureId } });

    if (!lecture || lecture.userId !== req.userId) {
      console.error('[QUIZ_ROUTE] Lecture not found or unauthorized');
      return res.status(404).json({ error: 'Lecture not found' });
    }

    // Check if summary exists
    if (!lecture.summary) {
      console.error('[QUIZ_ROUTE] No summary for lecture');
      return res.status(400).json({ error: 'Lecture summary not generated yet' });
    }

    // Check minimum lecture length
    const summary = JSON.parse(lecture.summary);
    if (summary.summary.length < 500) {
      console.error('[QUIZ_ROUTE] Summary too short:', summary.summary.length);
      return res.status(400).json({ error: 'Lecture too short to generate quiz (min 500 words)' });
    }

    // Generate quiz
    console.log('[QUIZ_ROUTE] Calling generateQuiz service');
    const questions = await generateQuiz(lecture.summary);

    console.log('[QUIZ_ROUTE] Quiz generated, questions count:', Array.isArray(questions) ? questions.length : 0);
    if (Array.isArray(questions) && questions.length === 0) {
      console.log('[QUIZ_ROUTE] Empty questions array returned:', JSON.stringify(questions, null, 2));
    }
    if (Array.isArray(questions) && questions.length > 0) {
      console.log('[QUIZ_ROUTE] First question:', JSON.stringify(questions[0], null, 2));
    }

    res.json(questions);
  })
);

// Submit quiz
router.post(
  '/submit',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { lectureId, answers } = req.body;

    if (!lectureId || !answers) {
      return res.status(400).json({ error: 'lectureId and answers are required' });
    }

    // Get lecture
    const lecture = await prisma.lecture.findUnique({ where: { id: lectureId } });

    if (!lecture || lecture.userId !== req.userId) {
      return res.status(404).json({ error: 'Lecture not found' });
    }

    // Calculate score
    let score = 0;
    const quizQuestions = [];

    for (const answer of answers) {
      const isCorrect = answer.userAnswer === answer.correct;
      if (isCorrect) score++;

      quizQuestions.push({
        question: answer.question,
        options: JSON.stringify(answer.options),
        correct: answer.correct,
        userAnswer: answer.userAnswer,
        isCorrect,
        topic: answer.topic || 'General',
      });
    }

    // Create quiz record
    const quiz = await prisma.quiz.create({
      data: {
        lectureId,
        userId: req.userId!,
        score,
        total: answers.length,
        questions: {
          create: quizQuestions.map((q) => ({
            ...q,
            userId: req.userId!,
          })),
        },
      },
      include: { questions: true },
    });

    res.status(201).json({
      score: quiz.score,
      total: quiz.total,
      percentage: Math.round((quiz.score / quiz.total) * 100),
      questions: quiz.questions,
    });
  })
);

// Get quiz history
router.get(
  '/history',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const quizzes = await prisma.quiz.findMany({
      where: { userId: req.userId },
      orderBy: { takenAt: 'desc' },
      include: { lecture: { select: { title: true } } },
    });

    const history = quizzes.map((q) => ({
      id: q.id,
      lectureTitle: q.lecture.title,
      score: q.score,
      total: q.total,
      percentage: Math.round((q.score / q.total) * 100),
      takenAt: q.takenAt,
    }));

    return sendSuccess(res, history);
  })
);

export default router;
