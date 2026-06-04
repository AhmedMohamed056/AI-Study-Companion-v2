import { Router, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { sendSuccess } from '../utils/response.js';
import { emailService } from '../services/email.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Create a new study group
router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const group = await prisma.studyGroup.create({
      data: {
        name,
        description,
        createdBy: req.userId!,
        members: {
          create: {
            userId: req.userId!,
            role: 'owner',
          },
        },
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    return sendSuccess(res, group, 201);
  })
);

// Get all study groups for user (as owner or member)
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const groups = await prisma.studyGroup.findMany({
      where: {
        OR: [
          { createdBy: req.userId },
          { members: { some: { userId: req.userId } } },
        ],
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        sharedFlashcardSets: true,
        sharedQuizSets: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, groups);
  })
);

// Get study group details
router.get(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Check if user is member of group
    const member = await prisma.studyGroupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId: req.userId! } },
    });

    if (!member) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    const group = await prisma.studyGroup.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        sharedFlashcardSets: {
          include: {
            creator: {
              select: { id: true, name: true },
            },
          },
        },
        sharedQuizSets: {
          include: {
            creator: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    return sendSuccess(res, group);
  })
);

// Update study group
router.patch(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { name, description } = req.body;

    // Check ownership
    const group = await prisma.studyGroup.findUnique({
      where: { id },
    });

    if (!group) {
      return res.status(404).json({ error: 'Study group not found' });
    }

    if (group.createdBy !== req.userId) {
      return res.status(403).json({ error: 'Only the owner can update this group' });
    }

    const updated = await prisma.studyGroup.update({
      where: { id },
      data: {
        name,
        description,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    return sendSuccess(res, updated);
  })
);

// Delete study group (owner only)
router.delete(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Check ownership
    const group = await prisma.studyGroup.findUnique({
      where: { id },
    });

    if (!group) {
      return res.status(404).json({ error: 'Study group not found' });
    }

    if (group.createdBy !== req.userId) {
      return res.status(403).json({ error: 'Only the owner can delete this group' });
    }

    await prisma.studyGroup.delete({
      where: { id },
    });

    return sendSuccess(res, { message: 'Study group deleted' });
  })
);

// Invite users to study group
router.post(
  '/:id/invite',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { userIds, emails } = req.body;

    // Validate inputs
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid group ID' });
    }

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ error: 'Please provide emails or user IDs' });
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emails && !emails.every(e => emailRegex.test(e))) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check for duplicate emails
    if (emails && new Set(emails).size !== emails.length) {
      return res.status(400).json({ error: 'Duplicate emails provided' });
    }

    // Check for duplicate user IDs
    if (userIds && new Set(userIds).size !== userIds.length) {
      return res.status(400).json({ error: 'Duplicate user IDs provided' });
    }

    // Limit invitations per request (prevent abuse)
    const totalInvites = (emails?.length || 0) + (userIds?.length || 0);
    if (totalInvites > 50) {
      return res.status(400).json({ error: 'Cannot invite more than 50 users at once' });
    }

    // Check ownership
    const group = await prisma.studyGroup.findUnique({
      where: { id },
      include: { owner: true },
    });

    if (!group) {
      return res.status(404).json({ error: 'Study group not found' });
    }

    if (group.createdBy !== req.userId) {
      return res.status(403).json({ error: 'Only the owner can invite members' });
    }

    const inviter = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { name: true, email: true },
    });

    if (!inviter) {
      return res.status(404).json({ error: 'User not found' });
    }

    const results = { invited: 0, failed: 0, skipped: 0 };

    // Handle direct user IDs (existing users)
    if (userIds && userIds.length > 0) {
      for (const userId of userIds) {
        try {
          // Prevent self-invitation
          if (userId === req.userId) {
            results.skipped++;
            continue;
          }

          // Check if user exists
          const user = await prisma.user.findUnique({
            where: { id: userId },
          });

          if (!user) {
            results.failed++;
            continue;
          }

          // Check if already a member
          const existing = await prisma.studyGroupMember.findUnique({
            where: { groupId_userId: { groupId: id, userId } },
          });

          if (existing) {
            results.skipped++;
            continue;
          }

          await prisma.studyGroupMember.create({
            data: { groupId: id, userId, role: 'member' },
          });

          results.invited++;
        } catch (error) {
          console.error(`Failed to invite ${userId}:`, error);
          results.failed++;
        }
      }
    }

    // Handle emails (send invitations)
    if (emails && emails.length > 0) {
      for (const email of emails) {
        try {
          // Normalize email
          const normalizedEmail = email.toLowerCase().trim();

          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
          });

          if (existingUser) {
            // Check if already a member
            const isMember = await prisma.studyGroupMember.findUnique({
              where: { groupId_userId: { groupId: id, userId: existingUser.id } },
            });

            if (isMember) {
              results.skipped++;
              continue;
            }

            // Add directly if user exists and not already member
            await prisma.studyGroupMember.upsert({
              where: { groupId_userId: { groupId: id, userId: existingUser.id } },
              update: {},
              create: { groupId: id, userId: existingUser.id, role: 'member' },
            });
            results.invited++;
          } else {
            // Create invitation for non-existent user
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            // Check if invitation already exists and is not expired
            const existingInvitation = await prisma.studyGroupInvitation.findUnique({
              where: { groupId_email: { groupId: id, email: normalizedEmail } },
            });

            if (existingInvitation && existingInvitation.expiresAt > new Date()) {
              results.skipped++;
              continue;
            }

            // Create or update invitation
            const invitation = await prisma.studyGroupInvitation.upsert({
              where: { groupId_email: { groupId: id, email: normalizedEmail } },
              update: { expiresAt, createdBy: req.userId! },
              create: {
                groupId: id,
                email: normalizedEmail,
                createdBy: req.userId!,
                expiresAt,
              },
            });

            // Send email
            const acceptLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-invitation/${invitation.token}`;
            const emailSent = await emailService.sendGroupInvitation({
              recipientEmail: normalizedEmail,
              groupName: group.name,
              inviterName: inviter.name || 'A user',
              acceptLink,
            });

            if (emailSent) {
              results.invited++;
            } else {
              results.failed++;
            }
          }
        } catch (error) {
          console.error(`Failed to invite ${email}:`, error);
          results.failed++;
        }
      }
    }

    const updated = await prisma.studyGroup.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        invitations: {
          select: { email: true, createdAt: true, expiresAt: true, acceptedAt: true },
          where: { expiresAt: { gt: new Date() } },
        },
      },
    });

    return sendSuccess(res, {
      group: updated,
      results,
      message: `Sent ${results.invited} invitations, ${results.failed} failed, ${results.skipped} skipped`,
    });
  })
);

// Remove member from study group
router.delete(
  '/:id/members/:userId',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id, userId } = req.params;

    // Check ownership
    const group = await prisma.studyGroup.findUnique({
      where: { id },
    });

    if (!group) {
      return res.status(404).json({ error: 'Study group not found' });
    }

    if (group.createdBy !== req.userId) {
      return res.status(403).json({ error: 'Only the owner can remove members' });
    }

    if (userId === req.userId) {
      return res.status(400).json({ error: 'Owner cannot remove themselves' });
    }

    await prisma.studyGroupMember.delete({
      where: { groupId_userId: { groupId: id, userId } },
    });

    return sendSuccess(res, { message: 'Member removed from group' });
  })
);

// Add flashcard set to study group
router.post(
  '/:id/flashcard-set',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { flashcardIds, title, description } = req.body;

    // Validate inputs
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid group ID' });
    }

    if (!flashcardIds || !Array.isArray(flashcardIds) || flashcardIds.length === 0) {
      return res.status(400).json({ error: 'flashcardIds array is required and cannot be empty' });
    }

    if (flashcardIds.length > 100) {
      return res.status(400).json({ error: 'Cannot add more than 100 flashcards at once' });
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'title is required and cannot be empty' });
    }

    if (title.length > 255) {
      return res.status(400).json({ error: 'title is too long (max 255 characters)' });
    }

    if (description && (typeof description !== 'string' || description.length > 1000)) {
      return res.status(400).json({ error: 'description is too long (max 1000 characters)' });
    }

    // Check membership
    const member = await prisma.studyGroupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId: req.userId! } },
    });

    if (!member) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    // Verify all flashcards belong to the user
    const flashcards = await prisma.flashcard.findMany({
      where: {
        id: { in: flashcardIds },
        userId: req.userId,
      },
    });

    if (flashcards.length !== flashcardIds.length) {
      return res.status(403).json({ error: 'You can only add your own flashcards' });
    }

    // Create shared flashcard set for group
    const sharedSet = await prisma.sharedFlashcardSet.create({
      data: {
        title: title.trim(),
        description: description?.trim(),
        createdBy: req.userId!,
        isPublic: false,
        shareToken: uuidv4(),
        groupId: id,
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

// Add quiz set to study group
router.post(
  '/:id/quiz-set',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { quizIds, title, description } = req.body;

    // Validate inputs
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid group ID' });
    }

    if (!quizIds || !Array.isArray(quizIds) || quizIds.length === 0) {
      return res.status(400).json({ error: 'quizIds array is required and cannot be empty' });
    }

    if (quizIds.length > 100) {
      return res.status(400).json({ error: 'Cannot add more than 100 quizzes at once' });
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'title is required and cannot be empty' });
    }

    if (title.length > 255) {
      return res.status(400).json({ error: 'title is too long (max 255 characters)' });
    }

    if (description && (typeof description !== 'string' || description.length > 1000)) {
      return res.status(400).json({ error: 'description is too long (max 1000 characters)' });
    }

    // Check membership
    const member = await prisma.studyGroupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId: req.userId! } },
    });

    if (!member) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    // Verify all quizzes belong to the user
    const quizzes = await prisma.quiz.findMany({
      where: {
        id: { in: quizIds },
        userId: req.userId,
      },
    });

    if (quizzes.length !== quizIds.length) {
      return res.status(403).json({ error: 'You can only add your own quizzes' });
    }

    // Create shared quiz set for group
    const sharedSet = await prisma.sharedQuizSet.create({
      data: {
        title: title.trim(),
        description: description?.trim(),
        createdBy: req.userId!,
        isPublic: false,
        shareToken: uuidv4(),
        groupId: id,
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

// Remove material from study group
router.delete(
  '/:id/materials/:materialId/:type',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id, materialId, type } = req.params;

    // Check membership
    const member = await prisma.studyGroupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId: req.userId! } },
    });

    if (!member) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    if (type === 'flashcard') {
      const set = await prisma.sharedFlashcardSet.findUnique({
        where: { id: materialId },
      });

      if (!set) {
        return res.status(404).json({ error: 'Material not found' });
      }

      if (set.createdBy !== req.userId) {
        return res.status(403).json({ error: 'You can only remove your own materials' });
      }

      await prisma.sharedFlashcardSet.delete({
        where: { id: materialId },
      });
    } else if (type === 'quiz') {
      const set = await prisma.sharedQuizSet.findUnique({
        where: { id: materialId },
      });

      if (!set) {
        return res.status(404).json({ error: 'Material not found' });
      }

      if (set.createdBy !== req.userId) {
        return res.status(403).json({ error: 'You can only remove your own materials' });
      }

      await prisma.sharedQuizSet.delete({
        where: { id: materialId },
      });
    } else {
      return res.status(400).json({ error: 'Invalid material type' });
    }

    return sendSuccess(res, { message: 'Material removed from group' });
  })
);

// Accept study group invitation (must be before /:id routes)
router.post(
  '/invitations/accept/:token',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { token } = req.params;

    // Validate token format
    if (!token || typeof token !== 'string' || token.length < 10) {
      return res.status(400).json({ error: 'Invalid invitation token' });
    }

    const invitation = await prisma.studyGroupInvitation.findUnique({
      where: { token },
      include: { group: true },
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    // Check expiration
    const now = new Date();
    if (now > invitation.expiresAt) {
      return res.status(410).json({ error: 'Invitation has expired' });
    }

    // Check if already accepted
    if (invitation.acceptedAt) {
      return res.status(400).json({ error: 'Invitation has already been accepted' });
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check email matches
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return res.status(403).json({
        error: 'This invitation is not for your email address',
        details: `Invitation for: ${invitation.email}, Your email: ${user.email}`,
      });
    }

    // Check if already a member
    const existingMember = await prisma.studyGroupMember.findUnique({
      where: { groupId_userId: { groupId: invitation.groupId, userId: req.userId! } },
    });

    if (existingMember) {
      return res.status(400).json({ error: 'You are already a member of this group' });
    }

    // Add user to group
    try {
      await prisma.studyGroupMember.create({
        data: {
          groupId: invitation.groupId,
          userId: req.userId!,
          role: 'member',
        },
      });

      // Mark invitation as accepted
      await prisma.studyGroupInvitation.update({
        where: { token },
        data: { acceptedAt: now },
      });

      const group = await prisma.studyGroup.findUnique({
        where: { id: invitation.groupId },
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
          sharedFlashcardSets: {
            include: {
              creator: {
                select: { id: true, name: true },
              },
            },
          },
          sharedQuizSets: {
            include: {
              creator: {
                select: { id: true, name: true },
              },
            },
          },
        },
      });

      return sendSuccess(res, {
        message: 'Successfully joined the study group!',
        group,
      });
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      return res.status(500).json({ error: 'Failed to process invitation' });
    }
  })
);

// Leave study group
router.post(
  '/:id/leave',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Check if user is member
    const member = await prisma.studyGroupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId: req.userId! } },
    });

    if (!member) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    // Check if user is the owner
    const group = await prisma.studyGroup.findUnique({
      where: { id },
    });

    if (group?.createdBy === req.userId) {
      return res.status(400).json({ error: 'Owner cannot leave the group. Delete the group instead.' });
    }

    await prisma.studyGroupMember.delete({
      where: { groupId_userId: { groupId: id, userId: req.userId! } },
    });

    return sendSuccess(res, { message: 'Left study group' });
  })
);

export default router;
