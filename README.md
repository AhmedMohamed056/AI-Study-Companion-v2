# AI Study Companion

> Purpose-built academic learning platform for university students using AI-powered study tools

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier available)
- Anthropic API key (groq API)

### Setup

#### 1. Clone and Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

#### 2. Setup Supabase

1. Create a project at https://supabase.com
2. Get your connection string and API keys
3. Create a `.env` file in `backend/`:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ANTHROPIC_API_KEY=sk-ant-v0-xxxxx
```

#### 3. Setup Frontend

Create `frontend/.env.local`:

```bash
cp frontend/.env.example frontend/.env.local
```

Edit `frontend/.env.local`:
```
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 4. Run Database Migrations

```bash
cd backend
npx prisma migrate dev --name init
```

#### 5. Start Development Servers

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

Open http://localhost:5173 in your browser.

---

## Features

### Core Features (Week 1-3)
- ✅ User authentication (register/login)
- ✅ Course management
- ✅ PDF lecture uploads
- ✅ AI-powered summaries (Claude API)
- ✅ Flashcard generation
- ✅ Quiz generation
- ✅ Spaced repetition scheduling
- ✅ Analytics dashboard

### Tech Stack

**Backend:**
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL (Supabase)
- Claude API (Anthropic)
- pdf-parse
- Express Rate Limit
- Sentry

**Frontend:**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router v6
- React Query
- Zustand
- Axios

---

## Project Structure

```
AI_Study_Companion/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express app entry point
│   │   ├── middleware/           # Auth, error handling
│   │   ├── routes/               # API endpoints
│   │   ├── services/             # Claude, PDF, scheduling
│   │   └── utils/                # Helpers
│   ├── prisma/
│   │   └── schema.prisma         # Database schema
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/                # Page components
│   │   ├── components/           # Reusable components
│   │   ├── services/             # API client
│   │   ├── store/                # Zustand stores
│   │   └── App.tsx               # Main app
│   ├── index.html
│   ├── package.json
│   └── .env.example
└── PROGRESS.md
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login user
- `POST /api/auth/logout` — Logout user

### Courses
- `GET /api/courses` — Get all courses
- `POST /api/courses` — Create course
- `GET /api/courses/:id` — Get course details
- `PATCH /api/courses/:id` — Update course
- `DELETE /api/courses/:id` — Delete course

### Lectures
- `GET /api/lectures?courseId=xxx` — Get lectures for course
- `POST /api/lectures/upload` — Upload PDF lecture
- `GET /api/lectures/:id` — Get lecture details
- `GET /api/lectures/:id/summary` — Get/generate summary
- `DELETE /api/lectures/:id` — Delete lecture

### Flashcards
- `GET /api/flashcards?lectureId=xxx` — Get flashcards
- `GET /api/flashcards/due` — Get due flashcards
- `POST /api/flashcards/generate` — Generate flashcards
- `PATCH /api/flashcards/:id/review` — Review flashcard
- `DELETE /api/flashcards/:id` — Delete flashcard

### Quiz
- `POST /api/quiz/generate` — Generate quiz
- `POST /api/quiz/submit` — Submit quiz answers
- `GET /api/quiz/history` — Get quiz history

### Analytics
- `GET /api/analytics/me` — Get user analytics

---

## Development

### Running Tests

```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run test
```

### Type Checking

```bash
# Backend
cd backend
npm run type-check

# Frontend
cd frontend
npm run type-check
```

### Linting

```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

---

## Deployment

### Backend (Railway)

1. Push code to GitHub
2. Connect Railway to GitHub repo
3. Set environment variables in Railway dashboard
4. Deploy

### Frontend (Vercel)

1. Push code to GitHub
2. Connect Vercel to GitHub repo
3. Set environment variables in Vercel dashboard
4. Deploy

---

## Troubleshooting

### Backend won't start
- Check `.env` file is created and has all required variables
- Verify database connection: `psql $DATABASE_URL`
- Check port 3000 is not in use

### Frontend won't load
- Check `.env.local` file is created
- Verify backend is running on port 3000
- Clear browser cache and reload

### PDF upload fails
- Check file is < 50MB
- Verify Supabase Storage bucket exists
- Check `SUPABASE_SERVICE_ROLE_KEY` is correct

### Claude API errors
- Verify `ANTHROPIC_API_KEY` is correct
- Check API key hasn't expired
- Monitor rate limiting (5 calls/hour per feature)

---

## Contributing

1. Create a feature branch: `git checkout -b feat/feature-name`
2. Commit changes: `git commit -m "feat: add feature"`
3. Push to branch: `git push origin feat/feature-name`
4. Create a Pull Request

---

## License

MIT

---

## Support

For issues or questions:
- Check PROGRESS.md for current status
- Review API documentation in this README
- Check backend logs: `npm run dev` output
- Check frontend console: F12 in browser

---

**Last Updated:** 2026-05-04  
**Status:** Week 1 Implementation Complete
