import { Router, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { generateFlashcards } from '../services/claude.service.js';
import { calculateNextReview } from '../services/spaced-repetition.service.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

// Get flashcards for a lecture
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { lectureId } = req.query;

    if (!lectureId) {
      return res.status(400).json({ error: 'lectureId is required' });
    }

    const flashcards = await prisma.flashcard.findMany({
      where: { lectureId: lectureId as string, userId: req.userId },
      orderBy: { createdAt: 'asc' },
    });

    res.json(flashcards);
  })
);

// Get due flashcards
router.get(
  '/due',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const now = new Date();

    const flashcards = await prisma.flashcard.findMany({
      where: {
        userId: req.userId,
        nextReview: { lte: now },
      },
      orderBy: { nextReview: 'asc' },
    });

    res.json(flashcards);
  })
);

// Generate flashcards for a lecture
router.post(
  '/generate',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('[FLASHCARDS_ROUTE] Received flashcard generation request');
    const { lectureId } = req.body;

    if (!lectureId) {
      console.error('[FLASHCARDS_ROUTE] Missing lectureId');
      return res.status(400).json({ error: 'lectureId is required' });
    }

    console.log('[FLASHCARDS_ROUTE] Fetching lecture:', lectureId);

    // Get lecture
    const lecture = await prisma.lecture.findUnique({ where: { id: lectureId } });

    if (!lecture || lecture.userId !== req.userId) {
      console.error('[FLASHCARDS_ROUTE] Lecture not found or unauthorized');
      return res.status(404).json({ error: 'Lecture not found' });
    }

    // Check if summary exists
    if (!lecture.summary) {
      console.error('[FLASHCARDS_ROUTE] No summary for lecture');
      return res.status(400).json({ error: 'Please generate summary first' });
    }

    // Use raw_text if available, otherwise use summary
    const textToUse = lecture.rawText || lecture.summary;

    // Generate flashcards
    console.log('[FLASHCARDS_ROUTE] Calling generateFlashcards service');
    const generatedCards = await generateFlashcards(textToUse);

    console.log('[FLASHCARDS_ROUTE] Flashcards generated, count:', Array.isArray(generatedCards) ? generatedCards.length : 0);
    if (Array.isArray(generatedCards) && generatedCards.length === 0) {
      console.log('[FLASHCARDS_ROUTE] Empty flashcards array returned:', JSON.stringify(generatedCards, null, 2));
    }
    if (Array.isArray(generatedCards) && generatedCards.length > 0) {
      console.log('[FLASHCARDS_ROUTE] First flashcard:', JSON.stringify(generatedCards[0], null, 2));
    }

    // Save flashcards
    const flashcards = await Promise.all(
      generatedCards.map((card) =>
        prisma.flashcard.create({
          data: {
            lectureId,
            userId: req.userId!,
            front: card.front,
            back: card.back,
            nextReview: new Date(),
          },
        })
      )
    );

    console.log('[FLASHCARDS_ROUTE] Flashcards saved to database, count:', flashcards.length);
    res.status(201).json(flashcards);
  })
);

// Review flashcard
router.patch(
  '/:id/review',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { ease } = req.body;

    if (!['easy', 'hard', 'again'].includes(ease)) {
      return res.status(400).json({ error: 'Invalid ease value' });
    }

    const flashcard = await prisma.flashcard.findUnique({ where: { id: req.params.id } });

    if (!flashcard || flashcard.userId !== req.userId) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }

    // Calculate next review date
    const nextReview = calculateNextReview(flashcard.reviewCount);

    // Update flashcard
    const updated = await prisma.flashcard.update({
      where: { id: req.params.id },
      data: {
        nextReview,
        reviewCount: flashcard.reviewCount + 1,
      },
    });

    res.json({ nextReview: updated.nextReview });
  })
);

// Delete flashcard
router.delete(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const flashcard = await prisma.flashcard.findUnique({ where: { id: req.params.id } });

    if (!flashcard || flashcard.userId !== req.userId) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }

    await prisma.flashcard.delete({ where: { id: req.params.id } });

    res.json({ success: true });
  })
);

export default router;
