# Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in another terminal)
cd frontend
npm install
```

### 2. Create Environment Files

**Backend:**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and add:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_study_companion
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your_key_here
SUPABASE_SERVICE_ROLE_KEY=your_key_here
ANTHROPIC_API_KEY=sk-ant-v0-xxxxx
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

**Frontend:**
```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local` and add:
```
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_key_here
```

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 4. Open in Browser

Visit http://localhost:5173

---

## Getting Supabase Keys

1. Go to https://supabase.com
2. Create a new project
3. Go to Settings → API
4. Copy:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` → `SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`
5. Go to Settings → Database
6. Copy connection string → `DATABASE_URL`

---

## Getting Claude API Key

1. Go to https://console.anthropic.com
2. Create API key
3. Copy to `ANTHROPIC_API_KEY`

---

## Test the App

1. **Register:** Click "Register" and create an account
2. **Login:** Login with your credentials
3. **Create Course:** Click "New Course" and create a course
4. **Upload PDF:** Select course and upload a PDF (will fail without Supabase Storage setup)
5. **View Dashboard:** See analytics and quick actions

---

## Troubleshooting

### Backend won't start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process if needed
kill -9 <PID>
```

### Frontend won't load
- Clear browser cache (Ctrl+Shift+Delete)
- Check console for errors (F12)
- Verify backend is running

### Database connection fails
```bash
# Test connection
psql $DATABASE_URL

# If fails, check DATABASE_URL in .env
```

---

## Next Steps

1. **Setup Supabase Storage** for PDF uploads
2. **Run database migrations:** `npx prisma migrate dev`
3. **Test end-to-end flow:** Register → Upload PDF → Generate summary
4. **Deploy to production** (Railway + Vercel)

---

For more details, see README.md and PROGRESS.md
