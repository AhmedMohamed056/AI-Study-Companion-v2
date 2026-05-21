import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../middleware/errorHandler.js';
import { prisma } from '../lib/prisma.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

// Register
router.post(
  '/register',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body as RegisterRequest;

      console.log(`[REGISTER] Register attempt for: ${email}`);

      if (!email || !password || !name) {
        console.log('[REGISTER] Missing required fields');
        return res.status(400).json({ error: 'Email, password, and name are required' });
      }

      console.log('[REGISTER] Checking if user exists...');
      const existingUser = await prisma.user.findUnique({ where: { email } });
      console.log(`[REGISTER] User exists: ${existingUser ? 'YES' : 'NO'}`);

      if (existingUser) {
        console.log(`[REGISTER] User already exists with email: ${email}`);
        return res.status(409).json({ error: 'Email already exists' });
      }

      console.log('[REGISTER] Hashing password...');
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('[REGISTER] Password hashed successfully');

      console.log('[REGISTER] Creating user in DB...');
      const newUser = await prisma.user.create({
        data: { email, name, password: hashedPassword },
      });
      console.log(`[REGISTER] User created: ${JSON.stringify({ id: newUser.id, email: newUser.email, name: newUser.name })}`);

      console.log('[REGISTER] Generating JWT token...');
      const token = jwt.sign({ sub: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
      console.log('[REGISTER] Token generated successfully');

      console.log('[REGISTER] Sending response...');
      const responseData = {
        data: {
          token: token,
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name
          }
        }
      };
      console.log('[REGISTER] Response data prepared:', JSON.stringify(responseData).substring(0, 100));
      res.status(201).json(responseData);
      console.log('[REGISTER] Response sent successfully');
    } catch (error: any) {
      console.log("[REGISTER] FATAL ERROR:", error.message);
      console.log("[REGISTER] Error stack:", error.stack);
      res.status(500).json({ error: `Server error: ${error.message}` });
    }
  })
);

// Login
router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body as LoginRequest;

      console.log(`[LOGIN] Login attempt for: ${email}`);

      if (!email || !password) {
        console.log('[LOGIN] Missing email or password');
        return res.status(400).json({ error: 'Email and password are required' });
      }

      console.log('[LOGIN] Finding user...');
      const user = await prisma.user.findUnique({ where: { email } });
      console.log(`[LOGIN] User found: ${user ? 'YES' : 'NO'}`);

      if (!user) {
        console.log(`[LOGIN] User not found with email: ${email}`);
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      console.log('[LOGIN] Comparing password...');
      const passwordMatch = await bcrypt.compare(password, user.password);
      console.log(`[LOGIN] Password match: ${passwordMatch}`);

      if (!passwordMatch) {
        console.log('[LOGIN] Password does not match');
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      console.log('[LOGIN] Generating JWT token...');
      const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      console.log('[LOGIN] Token generated successfully');

      console.log('[LOGIN] Sending response...');
      const responseData = {
        data: {
          token: token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name
          }
        }
      };
      console.log('[LOGIN] Response data prepared:', JSON.stringify(responseData).substring(0, 100));
      res.json(responseData);
      console.log('[LOGIN] Response sent successfully');
    } catch (error: any) {
      console.log("[LOGIN] FATAL ERROR:", error.message);
      console.log("[LOGIN] Error stack:", error.stack);
      res.status(500).json({ error: `Server error: ${error.message}` });
    }
  })
);

// Logout
router.post('/logout', (req: Request, res: Response) => {
  console.log('[LOGOUT] Logout request');
  res.json({ success: true });
});

export default router;
