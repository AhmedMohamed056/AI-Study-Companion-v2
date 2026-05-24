# Storage & Upload Implementation Audit

**Date:** 2026-05-23  
**Status:** ⚠️ CRITICAL ISSUE IDENTIFIED  
**Severity:** HIGH - Core workflow affected

---

## Executive Summary

The application has a **critical gap**: Supabase Storage credentials are missing from `.env`, causing all PDF uploads to use **placeholder URLs** instead of real file storage. This breaks the core workflow because:

1. **PDFs are uploaded but not actually stored** — Only placeholder URLs are saved
2. **PDF text extraction still works** — The raw PDF buffer is extracted locally before upload attempt
3. **Downstream features work with extracted text** — Summaries, flashcards, quizzes use `rawText`, not the stored file
4. **File deletion silently fails** — Placeholder URLs are skipped, no error thrown

**Bottom Line:** The application appears to work, but PDF files are never persisted. This is a **silent failure** that only manifests when trying to access stored files later.

---

## Required Environment Variables

### Currently Missing (BLOCKING)
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Currently Set (OK)
```
GROQ_API_KEY=GROQ_API_KEY_REDACTEDvbsu6vppL7DtHgpwDLoKWGdyb3FYn8FXWjFBfCHe5VNjipY4UOAn
DATABASE_URL=postgresql://postgres.eduovjbtvjlywmljceko:...
DIRECT_URL=postgresql://postgres.eduovjbtvjlywmljceko:...
JWT_SECRET=mysecretkey123
```

### Documented but Not Required
```
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  (frontend only, not used in backend)
```

---

## Impacted Code Paths

### 1. **Upload Flow** (`backend/src/routes/lectures.ts:34-78`)
```
POST /api/lectures/upload
  ├─ validatePDFFile() ✅ Works
  ├─ extractTextFromPDF() ✅ Works (uses buffer directly)
  ├─ uploadPDFToStorage() ⚠️ RETURNS PLACEHOLDER URL
  │   └─ storage.service.ts:19-21 (no supabase → placeholder)
  └─ prisma.lecture.create() ✅ Saves placeholder URL to DB
```

**Result:** Lecture created with `fileUrl: "https://storage.example.com/{lectureId}.pdf"` (fake)

### 2. **Summary Generation** (`backend/src/routes/lectures.ts:120-168`)
```
GET /api/lectures/:id/summary
  └─ generateSummary(lecture.rawText) ✅ Works
     (Uses extracted text, not stored file)
```

**Result:** Summary generated successfully despite missing file storage

### 3. **Flashcard Generation** (`backend/src/routes/flashcards.ts:49-120`)
```
POST /api/flashcards/generate
  └─ generateFlashcards(summaryText) ✅ Works
     (Uses summary, not stored file)
```

**Result:** Flashcards generated successfully despite missing file storage

### 4. **Quiz Generation** (`backend/src/routes/quiz.ts:10-59`)
```
POST /api/quiz/generate
  └─ generateQuiz(lecture.summary) ✅ Works
     (Uses summary, not stored file)
```

**Result:** Quiz generated successfully despite missing file storage

### 5. **File Deletion** (`backend/src/routes/lectures.ts:170-188`)
```
DELETE /api/lectures/:id
  └─ deletePDFFromStorage(lecture.fileUrl) ⚠️ SILENTLY SKIPS
     └─ storage.service.ts:61-65
        (Checks if URL contains 'supabase' → placeholder doesn't)
```

**Result:** Deletion succeeds but no file is actually deleted (no error thrown)

---

## Current Behavior with Missing Credentials

### What Works ✅
- User registration and login
- Course creation
- PDF upload (file accepted, text extracted)
- Lecture summary generation
- Flashcard generation
- Quiz generation
- Flashcard review with SM-2 scheduling
- Analytics and weak area tracking
- Study plan generation

### What Fails Silently ⚠️
- **PDF file persistence** — Files not stored in Supabase
- **File URL validity** — Placeholder URLs are fake (`https://storage.example.com/...`)
- **File retrieval** — Stored files cannot be accessed later
- **File deletion** — Deletion silently skips placeholder URLs

### What Breaks Eventually 🔴
- **Frontend PDF viewer** — If frontend tries to display `fileUrl` from database
- **Audit trails** — No record of actual file storage
- **Compliance** — No way to verify files are stored securely
- **Data recovery** — If `rawText` is lost, original PDF cannot be recovered

---

## Is This a Blocker for Core Functionality?

### Classification: **PARTIAL BLOCKER**

**Core Features That Work:**
- ✅ Flashcard generation (uses `rawText`, not stored file)
- ✅ Quiz generation (uses `rawText`, not stored file)
- ✅ Summary generation (uses `rawText`, not stored file)
- ✅ Spaced repetition (uses database, not stored file)
- ✅ Analytics (uses database, not stored file)

**Features That Require File Storage:**
- ❌ PDF viewer/display (if implemented in frontend)
- ❌ Re-extraction of PDF text (if `rawText` is deleted)
- ❌ File audit/compliance (if required)
- ❌ Long-term file retention (if required)

**Verdict:** The application **functions for core study features** because it extracts and stores PDF text in the database (`rawText` field). However, **actual PDF files are never persisted**, which is a **silent failure** that violates the design intent.

---

## Code Analysis

### storage.service.ts (Lines 1-91)

**Problem 1: Missing Credentials Not Enforced**
```typescript
// Line 6-8: Warning logged but execution continues
if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('[SUPABASE] Missing Supabase credentials...');
}

// Line 10-12: Supabase client is null
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;
```

**Problem 2: Placeholder URL Returned on Missing Credentials**
```typescript
// Line 19-21: No error thrown, just returns fake URL
if (!supabase) {
  console.warn('[SUPABASE] Supabase not configured, returning placeholder URL');
  return `https://storage.example.com/${lectureId}.pdf`;
}
```

**Problem 3: Deletion Silently Skips Placeholder URLs**
```typescript
// Line 61-65: Checks if URL contains 'supabase' to skip deletion
if (!supabase || !fileUrl.includes('supabase')) {
  console.log('[SUPABASE] Skipping deletion for non-Supabase URL');
  return true; // ← Returns success even though nothing was deleted
}
```

### lectures.ts (Lines 34-78)

**Problem: No Error Handling for Failed Upload**
```typescript
// Line 63: No error handling if uploadPDFToStorage fails
const fileUrl = await uploadPDFToStorage(req.file.originalname || 'lecture.pdf', req.file.buffer, lectureId);

// Line 66-74: Saves whatever URL was returned (even if placeholder)
const lecture = await prisma.lecture.create({
  data: {
    courseId,
    userId: req.userId!,
    title,
    fileUrl, // ← Could be placeholder URL
    rawText,
  },
});
```

---

## Documentation Issues

### .env.example (Lines 8-11)
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Issues:**
- ✅ Variables are documented
- ❌ No explanation of which are required vs optional
- ❌ No explanation of consequences if missing
- ❌ `SUPABASE_ANON_KEY` is documented but not used in backend

### README.md (Lines 27-44)

**Issues:**
- ✅ Mentions Supabase setup
- ❌ Says "Supabase account (free tier available)" but doesn't explain why
- ❌ No mention of Supabase Storage bucket creation
- ❌ References `ANTHROPIC_API_KEY` (outdated, should be `GROQ_API_KEY`)
- ❌ No warning about what happens if Supabase credentials are missing
- ❌ Troubleshooting section mentions "Verify Supabase Storage bucket exists" but doesn't explain how to create it

### Troubleshooting Section (Lines 258-261)
```
### PDF upload fails
- Check file is < 50MB
- Verify Supabase Storage bucket exists
- Check `SUPABASE_SERVICE_ROLE_KEY` is correct
```

**Issues:**
- ❌ Doesn't mention missing `SUPABASE_URL`
- ❌ Doesn't explain how to create the bucket
- ❌ Doesn't mention that uploads will silently fail with placeholder URLs
- ❌ Doesn't explain the difference between `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`

---

## Recommended Fixes

### Priority 1: Add Supabase Credentials to .env
**Action:** User must provide Supabase credentials
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Priority 2: Update .env.example with Clear Documentation
```diff
# Supabase
+ # Required for PDF file storage
+ # Get from: https://supabase.com → Project Settings → API
SUPABASE_URL=https://xxxxx.supabase.co
- SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
+ # Service Role Key (NOT Anon Key) - required for server-side uploads
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Priority 3: Update README.md with Setup Instructions
Add detailed Supabase Storage setup section:
```markdown
#### 2.1 Create Supabase Storage Bucket

1. Go to https://supabase.com and sign in
2. Select your project
3. Go to Storage → Buckets
4. Click "New Bucket"
5. Name: `lecture-pdfs`
6. Make it **Public** (for file access)
7. Click "Create Bucket"

#### 2.2 Get API Keys

1. Go to Project Settings → API
2. Copy `Project URL` → `SUPABASE_URL`
3. Copy `Service Role Key` → `SUPABASE_SERVICE_ROLE_KEY`
   (NOT Anon Key - that's for frontend only)
```

### Priority 4: Add Validation to storage.service.ts
```typescript
// At startup, throw error if credentials missing
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[SUPABASE] FATAL: Missing Supabase credentials');
  console.error('[SUPABASE] Required environment variables:');
  console.error('[SUPABASE]   - SUPABASE_URL');
  console.error('[SUPABASE]   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('[SUPABASE] See README.md for setup instructions');
  process.exit(1); // Fail fast instead of silently degrading
}
```

### Priority 5: Update Troubleshooting Section
```markdown
### PDF upload fails

**Symptom:** Upload succeeds but files are not accessible later

**Causes:**
1. Missing `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY`
   - Check `backend/.env` has both variables
   - Verify values are correct (not placeholders)

2. Supabase Storage bucket doesn't exist
   - Go to Supabase dashboard → Storage → Buckets
   - Create bucket named `lecture-pdfs`
   - Make it Public

3. Service Role Key is incorrect
   - Use Service Role Key, NOT Anon Key
   - Get from Project Settings → API

**Verification:**
- Backend logs should show: `[SUPABASE] Uploading file: ...`
- If you see: `[SUPABASE] Supabase not configured, returning placeholder URL`
  → Credentials are missing
```

---

## Recommended Next Step

**Immediate Action:** Add Supabase credentials to `.env`

1. Go to https://supabase.com
2. Create or select a project
3. Go to Storage → Create bucket named `lecture-pdfs` (make it Public)
4. Go to Project Settings → API
5. Copy `Project URL` and `Service Role Key`
6. Add to `backend/.env`:
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
7. Restart backend: `npm run dev`
8. Test PDF upload

**Expected Result:** Backend logs will show `[SUPABASE] File uploaded successfully: ...` instead of placeholder warning.

---

## Summary Table

| Aspect | Status | Impact |
|--------|--------|--------|
| **Supabase URL** | ❌ Missing | Uploads fail silently |
| **Service Role Key** | ❌ Missing | Uploads fail silently |
| **PDF Extraction** | ✅ Works | Text stored in `rawText` |
| **Summary Generation** | ✅ Works | Uses `rawText` |
| **Flashcard Generation** | ✅ Works | Uses `rawText` |
| **Quiz Generation** | ✅ Works | Uses `rawText` |
| **File Persistence** | ❌ Broken | Placeholder URLs only |
| **File Deletion** | ⚠️ Silent Fail | No error thrown |
| **Core Study Features** | ✅ Functional | Don't depend on stored files |
| **File Retrieval** | ❌ Impossible | No real files stored |

---

**Status:** ⚠️ **REQUIRES SUPABASE CONFIGURATION**

The application is **functionally complete for study features** but **missing file storage**. This is a **configuration issue, not a code issue**. The architecture gracefully degrades to placeholder URLs when Supabase is not configured, but this is a **silent failure** that should be made explicit.
