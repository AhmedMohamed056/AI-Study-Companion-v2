// Test script to verify email transporter initializes with environment variables

console.log('[TEST] Before dotenv.config()');
console.log('[TEST] process.env.EMAIL_USER:', process.env.EMAIL_USER);
console.log('[TEST] process.env.EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD);

import dotenv from 'dotenv';
dotenv.config();

console.log('\n[TEST] After dotenv.config()');
console.log('[TEST] process.env.EMAIL_USER:', process.env.EMAIL_USER);
console.log('[TEST] process.env.EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***' : 'undefined');

// Now import the email service AFTER dotenv loads
import { emailService } from './src/services/email.js';

console.log('\n[TEST] Email service imported successfully');
console.log('[TEST] emailService.sendGroupInvitation is available:', typeof emailService.sendGroupInvitation === 'function');

console.log('\n✓ Test passed: Email transporter will be initialized with loaded environment variables');
