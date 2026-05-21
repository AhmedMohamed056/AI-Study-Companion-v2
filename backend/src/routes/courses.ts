import { Router, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

// Get all courses for user
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const courses = await prisma.course.findMany({
        where: { userId: req.userId },
        include: { _count: { select: { lectures: true } } },
        orderBy: { createdAt: 'desc' },
      });

      console.log('[COURSES GET] Returning courses:', courses);
      res.json({ data: courses });
    } catch (error: any) {
      console.log('[COURSES] Error fetching courses:', error.message);
      res.status(500).json({ error: `Failed to fetch courses: ${error.message}` });
    }
  })
);

// Create course
router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { title, description, examDate } = req.body;
      console.log('[COURSES POST] Creating course for userId:', req.userId, 'with data:', { title, description, examDate });

      if (!title) {
        return res.status(400).json({ error: 'Course title is required' });
      }

      const course = await prisma.course.create({
        data: {
          userId: req.userId,
          title,
          description,
          examDate: examDate ? new Date(examDate) : null,
        },
        include: { _count: { select: { lectures: true } } },
      });

      console.log('[COURSES POST] Course created successfully:', course);
      res.status(201).json({ data: course });
    } catch (error: any) {
      console.log('[COURSES] Error creating course:', error.message);
      res.status(500).json({ error: `Failed to create course: ${error.message}` });
    }
  })
);

// Get course by ID
router.get(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const course = await prisma.course.findUnique({
        where: { id: req.params.id },
        include: { lectures: true },
      });

      if (!course || course.userId !== req.userId) {
        return res.status(404).json({ error: 'Course not found' });
      }

      res.json({ data: course });
    } catch (error: any) {
      console.log('[COURSES] Error fetching course:', error.message);
      res.status(500).json({ error: `Failed to fetch course: ${error.message}` });
    }
  })
);

// Update course
router.patch(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const course = await prisma.course.findUnique({ where: { id: req.params.id } });

      if (!course || course.userId !== req.userId) {
        return res.status(404).json({ error: 'Course not found' });
      }

      const updated = await prisma.course.update({
        where: { id: req.params.id },
        data: req.body,
      });

      res.json({ data: updated });
    } catch (error: any) {
      console.log('[COURSES] Error updating course:', error.message);
      res.status(500).json({ error: `Failed to update course: ${error.message}` });
    }
  })
);

// Delete course
router.delete(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const course = await prisma.course.findUnique({ where: { id: req.params.id } });

      if (!course || course.userId !== req.userId) {
        return res.status(404).json({ error: 'Course not found' });
      }

      await prisma.course.delete({ where: { id: req.params.id } });

      res.json({ success: true });
    } catch (error: any) {
      console.log('[COURSES] Error deleting course:', error.message);
      res.status(500).json({ error: `Failed to delete course: ${error.message}` });
    }
  })
);

export default router;
