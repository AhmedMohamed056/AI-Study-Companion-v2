import { Router, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { sendSuccess } from '../utils/response.js';

const router = Router();

// Create a comment
router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { content, targetId, targetType, parentCommentId } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'content is required' });
    }

    if (!targetId || !targetType) {
      return res.status(400).json({ error: 'targetId and targetType are required' });
    }

    const validTargetTypes = ['flashcard', 'quiz', 'sharedFlashcard', 'sharedQuiz', 'studyGroup'];
    if (!validTargetTypes.includes(targetType)) {
      return res.status(400).json({ error: 'Invalid targetType' });
    }

    // Build comment data based on target type
    const commentData: any = {
      content,
      authorId: req.userId!,
      parentCommentId: parentCommentId || null,
    };

    switch (targetType) {
      case 'flashcard':
        commentData.flashcardId = targetId;
        break;
      case 'quiz':
        commentData.quizId = targetId;
        break;
      case 'sharedFlashcard':
        commentData.sharedFlashcardSetId = targetId;
        break;
      case 'sharedQuiz':
        commentData.sharedQuizSetId = targetId;
        break;
      case 'studyGroup':
        commentData.studyGroupId = targetId;
        break;
    }

    // Verify access to target
    if (targetType === 'flashcard') {
      const flashcard = await prisma.flashcard.findUnique({
        where: { id: targetId },
      });
      if (!flashcard || flashcard.userId !== req.userId) {
        return res.status(403).json({ error: 'Access denied to this flashcard' });
      }
    } else if (targetType === 'quiz') {
      const quiz = await prisma.quiz.findUnique({
        where: { id: targetId },
      });
      if (!quiz || quiz.userId !== req.userId) {
        return res.status(403).json({ error: 'Access denied to this quiz' });
      }
    } else if (targetType === 'sharedFlashcard') {
      const set = await prisma.sharedFlashcardSet.findUnique({
        where: { id: targetId },
        include: {
          sharedWith: true,
        },
      });
      if (!set) {
        return res.status(404).json({ error: 'Shared flashcard set not found' });
      }
      const hasAccess = set.createdBy === req.userId ||
        set.isPublic ||
        set.sharedWith.some(s => s.userId === req.userId);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied to this shared set' });
      }
    } else if (targetType === 'sharedQuiz') {
      const set = await prisma.sharedQuizSet.findUnique({
        where: { id: targetId },
        include: {
          sharedWith: true,
        },
      });
      if (!set) {
        return res.status(404).json({ error: 'Shared quiz set not found' });
      }
      const hasAccess = set.createdBy === req.userId ||
        set.isPublic ||
        set.sharedWith.some(s => s.userId === req.userId);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied to this shared set' });
      }
    } else if (targetType === 'studyGroup') {
      const member = await prisma.studyGroupMember.findUnique({
        where: { groupId_userId: { groupId: targetId, userId: req.userId! } },
      });
      if (!member) {
        return res.status(403).json({ error: 'You are not a member of this group' });
      }
    }

    const comment = await prisma.comment.create({
      data: commentData,
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return sendSuccess(res, comment, 201);
  })
);

// Get comments for a target
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { targetId, targetType } = req.query;

    if (!targetId || !targetType) {
      return res.status(400).json({ error: 'targetId and targetType query params are required' });
    }

    const validTargetTypes = ['flashcard', 'quiz', 'sharedFlashcard', 'sharedQuiz', 'studyGroup'];
    if (!validTargetTypes.includes(targetType as string)) {
      return res.status(400).json({ error: 'Invalid targetType' });
    }

    // Build where clause based on target type
    const whereClause: any = {
      parentCommentId: null, // Only get top-level comments
    };

    switch (targetType) {
      case 'flashcard':
        whereClause.flashcardId = targetId as string;
        break;
      case 'quiz':
        whereClause.quizId = targetId as string;
        break;
      case 'sharedFlashcard':
        whereClause.sharedFlashcardSetId = targetId as string;
        break;
      case 'sharedQuiz':
        whereClause.sharedQuizSetId = targetId as string;
        break;
      case 'studyGroup':
        whereClause.studyGroupId = targetId as string;
        break;
    }

    const comments = await prisma.comment.findMany({
      where: whereClause,
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        replies: {
          include: {
            author: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, comments);
  })
);

// Edit a comment
router.patch(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'content is required' });
    }

    // Check ownership
    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.authorId !== req.userId) {
      return res.status(403).json({ error: 'You can only edit your own comments' });
    }

    const updated = await prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return sendSuccess(res, updated);
  })
);

// Delete a comment
router.delete(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Check ownership
    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.authorId !== req.userId) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    // Delete comment and all replies
    await prisma.comment.deleteMany({
      where: {
        OR: [
          { id },
          { parentCommentId: id },
        ],
      },
    });

    return sendSuccess(res, { message: 'Comment deleted' });
  })
);

// Pin/unpin a comment (group owner only)
router.patch(
  '/:id/toggle-pin',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Get comment
    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // If comment is on a study group, check ownership
    if (comment.studyGroupId) {
      const group = await prisma.studyGroup.findUnique({
        where: { id: comment.studyGroupId },
      });

      if (!group || group.createdBy !== req.userId) {
        return res.status(403).json({ error: 'Only group owner can pin comments' });
      }
    } else {
      // For other types, only the author can pin their own comment
      if (comment.authorId !== req.userId) {
        return res.status(403).json({ error: 'You can only pin your own comments' });
      }
    }

    const updated = await prisma.comment.update({
      where: { id },
      data: { isPinned: !comment.isPinned },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return sendSuccess(res, updated);
  })
);

export default router;
