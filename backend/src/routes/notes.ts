import { Router, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

// Get all notes for a lecture
router.get(
  '/:lectureId',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { lectureId } = req.params;

    // Verify lecture belongs to user
    const lecture = await prisma.lecture.findUnique({ where: { id: lectureId } });
    if (!lecture || lecture.userId !== req.userId) {
      return res.status(404).json({ error: 'Lecture not found' });
    }

    const notes = await prisma.note.findMany({
      where: { lectureId, userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ data: notes });
  })
);

// Create note
router.post(
  '/:lectureId',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { lectureId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Note content is required' });
    }

    // Verify lecture belongs to user
    const lecture = await prisma.lecture.findUnique({ where: { id: lectureId } });
    if (!lecture || lecture.userId !== req.userId) {
      return res.status(404).json({ error: 'Lecture not found' });
    }

    const note = await prisma.note.create({
      data: {
        content,
        lectureId,
        userId: req.userId,
      },
    });

    res.status(201).json({ data: note });
  })
);

// Update note
router.patch(
  '/:noteId',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { noteId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Note content is required' });
    }

    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note || note.userId !== req.userId) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const updated = await prisma.note.update({
      where: { id: noteId },
      data: { content },
    });

    res.json({ data: updated });
  })
);

// Delete note
router.delete(
  '/:noteId',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { noteId } = req.params;

    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note || note.userId !== req.userId) {
      return res.status(404).json({ error: 'Note not found' });
    }

    await prisma.note.delete({ where: { id: noteId } });

    res.json({ success: true });
  })
);

export default router;
