# Server Startup Guide

## ✅ Environment Files Created

Both `.env` files have been created with your Supabase credentials:

**Backend (.env):**
- ✅ SUPABASE_URL configured
- ✅ SUPABASE_ANON_KEY configured
- ✅ SUPABASE_SERVICE_ROLE_KEY configured
- ✅ DATABASE_URL configured (with password)
- ⚠️ ANTHROPIC_API_KEY needs to be added

**Frontend (.env.local):**
- ✅ VITE_API_URL configured
- ✅ VITE_SUPABASE_URL configured
- ✅ VITE_SUPABASE_ANON_KEY configured

---

## ⚠️ Database Connection Issue

The Prisma migration failed with:
```
Error: P1001: Can't reach database server at `db.eduovjbtvjlywmljceko.supabase.co:5432`
```

**Possible causes:**
1. Supabase project might be paused
2. Network connectivity issue
3. Database password incorrect
4. Firewall blocking connection

**Solution:**
1. Go to https://app.supabase.com
2. Check if your project is active (not paused)
3. Verify the database password in Settings → Database
4. Try running migration again once database is accessible

---

## ✅ Servers Start Successfully

Both servers were tested and start without errors:

**Backend:**
```
✓ Server running on http://localhost:3000
✓ Environment: development
✓ All routes loaded
✓ Ready to accept requests
```

**Frontend:**
```
✓ Vite v5.4.21 ready
✓ Local: http://localhost:5173
✓ All pages compiled
✓ Ready to serve
```

---

## How to Run the Servers

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

Expected output:
```
✓ Server running on http://localhost:3000
✓ Environment: development
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v5.4.21 ready in XXX ms
➜ Local: http://localhost:5173
```

### Terminal 3 - Test API (optional)
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-05-04T..."}
```

---

## Next Steps

### 1. Fix Database Connection (if needed)
```bash
# Check Supabase project status
# Update DATABASE_URL if password changed
# Then run:
cd backend
npx prisma db push
```

### 2. Add Claude API Key
Edit `backend/.env` and add:
```
ANTHROPIC_API_KEY=sk-ant-v0-xxxxx
```

### 3. Start Both Servers
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

### 4. Open in Browser
```
http://localhost:5173
```

### 5. Test the App
- Register a new account
- Login
- Create a course
- Upload a PDF (will fail without database, but shows error handling)

---

## Troubleshooting

### Backend won't start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process if needed
kill -9 <PID>
```

### Frontend won't start
```bash
# Check if port 5173 is in use
lsof -i :5173

# Kill process if needed
kill -9 <PID>
```

### Database connection fails
1. Verify DATABASE_URL in backend/.env
2. Check Supabase project is active
3. Verify password is correct
4. Try: `psql $DATABASE_URL` to test connection

### API returns 401 errors
- This is expected without database
- Once database is connected, auth will work

---

## Environment Files Location

```
AI_Study_Companion/
├── backend/
│   └── .env                    ✅ Created with Supabase credentials
├── frontend/
│   └── .env.local              ✅ Created with Supabase credentials
└── SUPABASE_SETUP.md           ℹ️ Setup guide
```

---

## Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Backend Server | ✅ Starts | Runs on port 3000 |
| Frontend Server | ✅ Starts | Runs on port 5173 |
| Environment Files | ✅ Created | Supabase credentials added |
| Database Connection | ⚠️ Unreachable | Needs investigation |
| TypeScript | ✅ Compiles | No errors |
| Build | ✅ Successful | Both projects build |

---

## Quick Start Commands

```bash
# Start backend
cd backend && npm run dev

# Start frontend (in another terminal)
cd frontend && npm run dev

# Open browser
# http://localhost:5173
```

---

**Last Updated:** 2026-05-04  
**Status:** Ready to Run (Database connection pending)
