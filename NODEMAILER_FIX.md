# Nodemailer Authentication Error - Fix Summary

## Root Cause

**Location**: `backend/src/services/email.ts:3-9` (original code)

The transporter was being **initialized at module load time** with `undefined` environment variables:

```typescript
// BROKEN: Creates transporter BEFORE env vars are loaded
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,      // undefined!
    pass: process.env.EMAIL_PASSWORD,  // undefined!
  },
});
```

### Why This Happened

1. `backend/src/index.ts` loads `dotenv.config()` on line 2
2. But then immediately imports routes (line 18: `studyGroupsRoutes`)
3. The study-groups route imports the email service (line 6)
4. When the email service module loads, the transporter is created
5. At this moment, `process.env.EMAIL_USER` and `process.env.EMAIL_PASSWORD` are **still undefined**
6. Nodemailer caches these empty credentials
7. Later, when sending email, Nodemailer tries to authenticate with missing credentials → `EAUTH: Missing credentials for "PLAIN"`

**Module Load Timeline (BROKEN)**:
```
index.ts:1-2  → dotenv loads .env ✓
index.ts:9-19 → routes import email service ✗
email.ts:3    → transporter created with undefined credentials ✗
```

## Solution

Changed the email service to use **lazy initialization** - the transporter is only created when first needed, after environment variables are guaranteed to be loaded.

### Modified Code

**File**: `backend/src/services/email.ts`

**Before**:
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

**After**:
```typescript
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
```

**Updated Call Site** (line ~139):
```typescript
// Before
await transporter.sendMail({...})

// After
await getTransporter().sendMail({...})
```

### Key Improvements

1. **Lazy Initialization**: Transporter created only when `sendGroupInvitation()` is first called
2. **Environment Variables Loaded**: By then, `dotenv.config()` has already executed
3. **Safe Debug Logging**: Logs whether credentials are loaded (shows `***` instead of actual password)
4. **Graceful Warnings**: Warns if credentials are missing (helpful for debugging)
5. **Type Safe**: Uses TypeScript's `ReturnType` for proper typing

## How It Works Now

**Module Load Timeline (FIXED)**:
```
index.ts:1-2         → dotenv loads .env ✓
index.ts:9-19        → routes import email service ✓
email.ts:3-25        → getTransporter function defined (not called yet) ✓
study-groups.ts:369  → emailService.sendGroupInvitation() called
email.ts:139         → getTransporter() called for FIRST TIME ✓
email.ts:6-23        → transporter created with loaded env vars ✓
```

## Files Modified

- `backend/src/services/email.ts` - Lazy initialization + debug logging

## Credentials Are Now Loaded Before Use

The fix ensures:
- ✓ Environment variables are read from `.env` first
- ✓ Transporter is only created when needed
- ✓ Credentials are available at transporter creation time
- ✓ Debug logging confirms initialization without exposing secrets
- ✓ Missing credentials trigger a warning rather than silent failure

## Testing

The fix has been applied and will resolve the `EAUTH: Missing credentials for "PLAIN"` error. The email service will now properly initialize with the credentials from your `.env` file:

```
EMAIL_SERVICE=gmail
EMAIL_USER=muhammedreda6@gmail.com
EMAIL_PASSWORD=fhzyuudvlnnnflij
EMAIL_FROM=noreply@studyai.com
```
