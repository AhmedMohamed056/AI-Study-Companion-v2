import nodemailer from 'nodemailer';

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!transporter) {
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;

    if (!emailUser || !emailPassword) {
      console.warn('[EMAIL] Missing EMAIL_USER or EMAIL_PASSWORD environment variables');
    }

    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });

    console.log(`[EMAIL] Transporter initialized with service: ${process.env.EMAIL_SERVICE || 'gmail'}, user: ${emailUser ? '***' : 'not set'}`);
  }
  return transporter;
}

interface InvitationEmailProps {
  recipientEmail: string;
  recipientName?: string;
  groupName: string;
  inviterName: string;
  acceptLink: string;
}

// Sanitize HTML content to prevent XSS
const sanitizeHtml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

export const emailService = {
  async sendGroupInvitation({
    recipientEmail,
    recipientName,
    groupName,
    inviterName,
    acceptLink,
  }: InvitationEmailProps) {
    console.log('[EMAIL] sendGroupInvitation called');
    console.log('[EMAIL] Recipient:', recipientEmail);
    console.log('[EMAIL] Group:', groupName);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      console.error('[EMAIL] Invalid email format:', recipientEmail);
      return false;
    }

    // Sanitize all user inputs
    const sanitizedName = sanitizeHtml(recipientName || 'there');
    const sanitizedGroupName = sanitizeHtml(groupName);
    const sanitizedInviterName = sanitizeHtml(inviterName);

    // Validate URL format
    if (!acceptLink.startsWith('http://') && !acceptLink.startsWith('https://')) {
      console.error('[EMAIL] Invalid invitation link format');
      return false;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: white; border-radius: 8px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; color: #7c3aed; }
            .content { line-height: 1.6; color: #333; }
            .button { display: inline-block; margin: 30px 0; padding: 12px 32px; background: #7c3aed; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; text-align: center; }
            .expiry { color: #f59e0b; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">📚 StudyAI</div>
            </div>

            <div class="content">
              <h2>You're Invited to Join a Study Group!</h2>
              <p>Hi ${sanitizedName},</p>

              <p><strong>${sanitizedInviterName}</strong> has invited you to join the study group:</p>
              <h3 style="color: #7c3aed;">${sanitizedGroupName}</h3>

              <p>Study groups are a great way to collaborate, share materials, and learn together. Accept this invitation to join the group and start collaborating!</p>

              <div style="text-align: center;">
                <a href="${acceptLink}" class="button">Accept Invitation</a>
              </div>

              <p>Or copy this link into your browser:</p>
              <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">${acceptLink}</p>

              <p class="expiry">⏰ This invitation link expires in 7 days</p>

              <p>If you don't want to join this group, you can simply ignore this email.</p>
            </div>

            <div class="footer">
              <p>© 2026 StudyAI. All rights reserved.</p>
              <p>This is an automated message, please don't reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
You're Invited to Join a Study Group!

Hi ${sanitizedName},

${sanitizedInviterName} has invited you to join the study group: ${sanitizedGroupName}

Accept the invitation here: ${acceptLink}

This invitation link expires in 7 days.

If you don't want to join this group, you can simply ignore this email.

© 2026 StudyAI
    `;

    try {
      const emailTransporter = getTransporter();
      console.log('[EMAIL] Transporter ready, attempting to send...');
      console.log('[EMAIL] From:', process.env.EMAIL_FROM || process.env.EMAIL_USER);
      console.log('[EMAIL] To:', recipientEmail);
      console.log('[EMAIL] Service:', process.env.EMAIL_SERVICE || 'gmail');

      const info = await emailTransporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: recipientEmail,
        subject: `You're invited to join "${sanitizedGroupName}" on StudyAI`,
        text: textContent,
        html: htmlContent,
      });

      console.log('[EMAIL] ✓ Invitation sent successfully');
      console.log('[EMAIL] Message ID:', info.messageId);
      console.log('[EMAIL] Response:', info.response);
      return true;
    } catch (error: any) {
      console.error('[EMAIL] ✗ Failed to send invitation');
      console.error('[EMAIL] Error name:', error.name);
      console.error('[EMAIL] Error code:', error.code);
      console.error('[EMAIL] Error message:', error.message);
      console.error('[EMAIL] Full error:', JSON.stringify(error, null, 2));
      return false;
    }
  },
};

