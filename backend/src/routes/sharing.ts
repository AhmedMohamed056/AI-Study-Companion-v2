import { Router, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { sendSuccess } from '../utils/response.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Create a shareable flashcard set
router.post(
  '/flashcard-set',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { flashcardIds, title, description } = req.body;

    if (!flashcardIds || !Array.isArray(flashcardIds) || flashcardIds.length === 0) {
      return res.status(400).json({ error: 'flashcardIds array is required' });
    }

    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    // Verify all flashcards belong to the user
    const flashcards = await prisma.flashcard.findMany({
      where: {
        id: { in: flashcardIds },
        userId: req.userId,
      },
    });

    if (flashcards.length !== flashcardIds.length) {
      return res.status(403).json({ error: 'You can only share your own flashcards' });
    }

    // Create shared set
    const sharedSet = await prisma.sharedFlashcardSet.create({
      data: {
        title,
        description,
        createdBy: req.userId!,
        isPublic: false,
        shareToken: uuidv4(),
        flashcards: {
          create: flashcardIds.map(flashcardId => ({
            flashcardId,
          })),
        },
      },
      include: {
        flashcards: {
          include: {
            flashcard: true,
          },
        },
      },
    });

    return sendSuccess(res, sharedSet, 201);
  })
);

// Create a shareable quiz set
router.post(
  '/quiz-set',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { quizIds, title, description } = req.body;

    if (!quizIds || !Array.isArray(quizIds) || quizIds.length === 0) {
      return res.status(400).json({ error: 'quizIds array is required' });
    }

    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    // Verify all quizzes belong to the user
    const quizzes = await prisma.quiz.findMany({
      where: {
        id: { in: quizIds },
        userId: req.userId,
      },
    });

    if (quizzes.length !== quizIds.length) {
      return res.status(403).json({ error: 'You can only share your own quizzes' });
    }

    // Create shared set
    const sharedSet = await prisma.sharedQuizSet.create({
      data: {
        title,
        description,
        createdBy: req.userId!,
        isPublic: false,
        shareToken: uuidv4(),
        quizzes: {
          create: quizIds.map(quizId => ({
            quizId,
          })),
        },
      },
      include: {
        quizzes: {
          include: {
            quiz: true,
          },
        },
      },
    });

    return sendSuccess(res, sharedSet, 201);
  })
);

// Toggle public/private for flashcard set
router.patch(
  '/flashcard/:id/toggle-public',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Check ownership
    const set = await prisma.sharedFlashcardSet.findUnique({
      where: { id },
    });

    if (!set) {
      return res.status(404).json({ error: 'Flashcard set not found' });
    }

    if (set.createdBy !== req.userId) {
      return res.status(403).json({ error: 'You can only modify your own sets' });
    }

    const updated = await prisma.sharedFlashcardSet.update({
      where: { id },
      data: { isPublic: !set.isPublic },
      include: {
        flashcards: {
          include: {
            flashcard: true,
          },
        },
      },
    });

    return sendSuccess(res, updated);
  })
);

// Toggle public/private for quiz set
router.patch(
  '/quiz/:id/toggle-public',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Check ownership
    const set = await prisma.sharedQuizSet.findUnique({
      where: { id },
    });

    if (!set) {
      return res.status(404).json({ error: 'Quiz set not found' });
    }

    if (set.createdBy !== req.userId) {
      return res.status(403).json({ error: 'You can only modify your own sets' });
    }

    const updated = await prisma.sharedQuizSet.update({
      where: { id },
      data: { isPublic: !set.isPublic },
      include: {
        quizzes: {
          include: {
            quiz: true,
          },
        },
      },
    });

    return sendSuccess(res, updated);
  })
);

// Share flashcard set with specific users
router.post(
  '/flashcard/:id/share-with',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds array is required' });
    }

    // Check ownership
    const set = await prisma.sharedFlashcardSet.findUnique({
      where: { id },
    });

    if (!set) {
      return res.status(404).json({ error: 'Flashcard set not found' });
    }

    if (set.createdBy !== req.userId) {
      return res.status(403).json({ error: 'You can only share your own sets' });
    }

    // Validate and resolve users - accept both email and user ID
    const resolvedUsers = await Promise.all(
      userIds.map(async (identifier) => {
        // Try to find by ID first
        let user = await prisma.user.findUnique({
          where: { id: identifier },
          select: { id: true },
        });

        // If not found by ID, try by email
        if (!user) {
          user = await prisma.user.findUnique({
            where: { email: identifier },
            select: { id: true },
          });
        }

        return { identifier, userId: user?.id };
      })
    );

    // Find valid and invalid users
    const validUserIds = resolvedUsers.filter(u => u.userId).map(u => u.userId!);
    const invalidIdentifiers = resolvedUsers.filter(u => !u.userId).map(u => u.identifier);

    if (invalidIdentifiers.length > 0) {
      return res.status(400).json({
        error: `The following users were not found: ${invalidIdentifiers.join(', ')}. Make sure emails are correct.`,
        notFound: invalidIdentifiers,
      });
    }

    if (validUserIds.length === 0) {
      return res.status(400).json({ error: 'No valid users to share with' });
    }

    // Create share records (upsert to avoid duplicates)
    await Promise.all(
      validUserIds.map(userId =>
        prisma.sharedWith.upsert({
          where: { setId_userId: { setId: id, userId } },
          update: {},
          create: { setId: id, userId },
        })
      )
    );

    const updated = await prisma.sharedFlashcardSet.findUnique({
      where: { id },
      include: {
        sharedWith: true,
      },
    });

    return sendSuccess(res, updated);
  })
);

// Share quiz set with specific users
router.post(
  '/quiz/:id/share-with',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds array is required' });
    }

    // Check ownership
    const set = await prisma.sharedQuizSet.findUnique({
      where: { id },
    });

    if (!set) {
      return res.status(404).json({ error: 'Quiz set not found' });
    }

    if (set.createdBy !== req.userId) {
      return res.status(403).json({ error: 'You can only share your own sets' });
    }

    // Validate and resolve users - accept both email and user ID
    const resolvedUsers = await Promise.all(
      userIds.map(async (identifier) => {
        // Try to find by ID first
        let user = await prisma.user.findUnique({
          where: { id: identifier },
          select: { id: true },
        });

        // If not found by ID, try by email
        if (!user) {
          user = await prisma.user.findUnique({
            where: { email: identifier },
            select: { id: true },
          });
        }

        return { identifier, userId: user?.id };
      })
    );

    // Find valid and invalid users
    const validUserIds = resolvedUsers.filter(u => u.userId).map(u => u.userId!);
    const invalidIdentifiers = resolvedUsers.filter(u => !u.userId).map(u => u.identifier);

    if (invalidIdentifiers.length > 0) {
      return res.status(400).json({
        error: `The following users were not found: ${invalidIdentifiers.join(', ')}. Make sure emails are correct.`,
        notFound: invalidIdentifiers,
      });
    }

    if (validUserIds.length === 0) {
      return res.status(400).json({ error: 'No valid users to share with' });
    }

    // Create share records (upsert to avoid duplicates)
    await Promise.all(
      validUserIds.map(userId =>
        prisma.sharedQuizWith.upsert({
          where: { setId_userId: { setId: id, userId } },
          update: {},
          create: { setId: id, userId },
        })
      )
    );

    const updated = await prisma.sharedQuizSet.findUnique({
      where: { id },
      include: {
        sharedWith: true,
      },
    });

    return sendSuccess(res, updated);
  })
);

// Get all content shared with me (flashcards)
router.get(
  '/flashcards/shared-with-me',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const sharedSets = await prisma.sharedFlashcardSet.findMany({
      where: {
        OR: [
          { sharedWith: { some: { userId: req.userId } } },
          { isPublic: true },
        ],
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        flashcards: {
          include: {
            flashcard: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, sharedSets);
  })
);

// Get all content shared with me (quizzes)
router.get(
  '/quizzes/shared-with-me',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const sharedSets = await prisma.sharedQuizSet.findMany({
      where: {
        OR: [
          { sharedWith: { some: { userId: req.userId } } },
          { isPublic: true },
        ],
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        quizzes: {
          include: {
            quiz: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, sharedSets);
  })
);

// Get public shared flashcard set by token (no auth required)
router.get(
  '/flashcard/public/:shareToken',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { shareToken } = req.params;

    const sharedSet = await prisma.sharedFlashcardSet.findUnique({
      where: { shareToken },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        flashcards: {
          include: {
            flashcard: true,
          },
        },
      },
    });

    if (!sharedSet) {
      return res.status(404).json({ error: 'Shared set not found' });
    }

    if (!sharedSet.isPublic) {
      return res.status(403).json({ error: 'This set is private' });
    }

    return sendSuccess(res, sharedSet);
  })
);

// Get public shared quiz set by token (no auth required)
router.get(
  '/quiz/public/:shareToken',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { shareToken } = req.params;

    const sharedSet = await prisma.sharedQuizSet.findUnique({
      where: { shareToken },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        quizzes: {
          include: {
            quiz: true,
          },
        },
      },
    });

    if (!sharedSet) {
      return res.status(404).json({ error: 'Shared set not found' });
    }

    if (!sharedSet.isPublic) {
      return res.status(403).json({ error: 'This set is private' });
    }

    return sendSuccess(res, sharedSet);
  })
);

// Get shared flashcard set by token (auth required or public)
router.get(
  '/flashcard/:shareToken',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { shareToken } = req.params;

    const sharedSet = await prisma.sharedFlashcardSet.findUnique({
      where: { shareToken },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        flashcards: {
          include: {
            flashcard: true,
          },
        },
      },
    });

    if (!sharedSet) {
      return res.status(404).json({ error: 'Shared set not found' });
    }

    // Allow access if: public, or user is creator, or user is in sharedWith list
    const isPublic = sharedSet.isPublic;
    const isCreator = sharedSet.createdBy === req.userId;
    const isSharedWithUser = req.userId && await prisma.sharedWith.findUnique({
      where: { setId_userId: { setId: sharedSet.id, userId: req.userId } },
    }).catch(() => null);

    if (!isPublic && !isCreator && !isSharedWithUser) {
      return res.status(403).json({ error: 'You do not have access to this set' });
    }

    return sendSuccess(res, sharedSet);
  })
);

// Get shared quiz set by token (auth required or public)
router.get(
  '/quiz/:shareToken',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { shareToken } = req.params;

    const sharedSet = await prisma.sharedQuizSet.findUnique({
      where: { shareToken },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        quizzes: {
          include: {
            quiz: true,
          },
        },
      },
    });

    if (!sharedSet) {
      return res.status(404).json({ error: 'Shared set not found' });
    }

    // Allow access if: public, or user is creator, or user is in sharedWith list
    const isPublic = sharedSet.isPublic;
    const isCreator = sharedSet.createdBy === req.userId;
    const isSharedWithUser = req.userId && await prisma.sharedQuizWith.findUnique({
      where: { setId_userId: { setId: sharedSet.id, userId: req.userId } },
    }).catch(() => null);

    if (!isPublic && !isCreator && !isSharedWithUser) {
      return res.status(403).json({ error: 'You do not have access to this set' });
    }

    return sendSuccess(res, sharedSet);
  })
);

// Duplicate shared flashcard set to my library
router.post(
  '/flashcard/:id/duplicate',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const sharedSet = await prisma.sharedFlashcardSet.findUnique({
      where: { id },
      include: {
        flashcards: {
          include: {
            flashcard: true,
          },
        },
      },
    });

    if (!sharedSet) {
      return res.status(404).json({ error: 'Shared set not found' });
    }

    // Create new flashcards for the user
    const newFlashcards = await Promise.all(
      sharedSet.flashcards.map(item =>
        prisma.flashcard.create({
          data: {
            lectureId: item.flashcard.lectureId,
            userId: req.userId!,
            front: item.flashcard.front,
            back: item.flashcard.back,
            sourceLectureTitle: item.flashcard.sourceLectureTitle,
            sourceCreatedAt: item.flashcard.sourceCreatedAt,
          },
        })
      )
    );

    return sendSuccess(res, {
      duplicatedCount: newFlashcards.length,
      flashcards: newFlashcards,
    }, 201);
  })
);

// Duplicate shared quiz set to my library
router.post(
  '/quiz/:id/duplicate',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const sharedSet = await prisma.sharedQuizSet.findUnique({
      where: { id },
      include: {
        quizzes: {
          include: {
            quiz: true,
          },
        },
      },
    });

    if (!sharedSet) {
      return res.status(404).json({ error: 'Shared set not found' });
    }

    // Create new quizzes for the user
    const newQuizzes = await Promise.all(
      sharedSet.quizzes.map(item =>
        prisma.quiz.create({
          data: {
            lectureId: item.quiz.lectureId,
            userId: req.userId!,
            score: item.quiz.score,
            total: item.quiz.total,
            sourceLectureTitle: item.quiz.sourceLectureTitle,
            sourceCreatedAt: item.quiz.sourceCreatedAt,
          },
        })
      )
    );

    return sendSuccess(res, {
      duplicatedCount: newQuizzes.length,
      quizzes: newQuizzes,
    }, 201);
  })
);

// Remove user from shared flashcard set
router.delete(
  '/flashcard/:id/remove-user/:userId',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id, userId } = req.params;

    // Check ownership
    const set = await prisma.sharedFlashcardSet.findUnique({
      where: { id },
    });

    if (!set) {
      return res.status(404).json({ error: 'Flashcard set not found' });
    }

    if (set.createdBy !== req.userId) {
      return res.status(403).json({ error: 'You can only modify your own sets' });
    }

    await prisma.sharedWith.deleteMany({
      where: { setId: id, userId },
    });

    return sendSuccess(res, { message: 'User removed from shared set' });
  })
);

// Remove user from shared quiz set
router.delete(
  '/quiz/:id/remove-user/:userId',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id, userId } = req.params;

    // Check ownership
    const set = await prisma.sharedQuizSet.findUnique({
      where: { id },
    });

    if (!set) {
      return res.status(404).json({ error: 'Quiz set not found' });
    }

    if (set.createdBy !== req.userId) {
      return res.status(403).json({ error: 'You can only modify your own sets' });
    }

    await prisma.sharedQuizWith.deleteMany({
      where: { setId: id, userId },
    });

    return sendSuccess(res, { message: 'User removed from shared set' });
  })
);

export default router;
