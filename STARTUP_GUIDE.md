# 🚀 COMPLETE STARTUP GUIDE

## ⚡ Quick Start (30 seconds)

### **Option 1: Run All Servers at Once (Recommended)**

Just double-click this file:
```
sw-project/start-all.bat
```

It will open 2 new windows:
- ✅ Backend on http://localhost:3000
- ✅ Frontend on http://localhost:5173

---

### **Option 2: Manual Startup (Full Control)**

**Terminal 1: Start Backend**
```powershell
cd backend
npm run dev
```

Wait for:
```
✓ Server running on http://localhost:3000
✓ Environment: development
```

**Terminal 2: Start Frontend**
```powershell
cd frontend
npm run dev
```

Wait for:
```
VITE v5.x.x  ready in XXX ms
```

**Then open:** http://localhost:5173

---

## ✅ Verification Checklist

### **1. Backend Running?**
```powershell
curl http://localhost:3000/api/health
# Expected: {"status":"ok"}
```

### **2. Frontend Running?**
```powershell
curl http://localhost:5173
# Should return HTML
```

### **3. Can Frontend Reach Backend?**
Open browser console (F12) and look for:
```
[API] Configured base URL: http://localhost:3000/api
[LOGIN] Attempting to connect to: http://localhost:3000/api
```

### **4. Try Login**
```
Email: test@example.com
Password: test123
Click [Sign In]
```

If you see "Attempting to connect..." in console, backend is responding ✅

---

## 🔧 Configuration Files

### **Backend: `.env`**
```env
GROQ_API_KEY=GROQ_API_KEY_REDACTEDvbsu6vppL7DtHgpwDLoKWGdyb3FYn8FXWjFBfCHe5VNjipY4UOAn
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
JWT_SECRET=mysecretkey123
FRONTEND_URL=http://localhost:5173

# Email (optional, for invitations)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@studyai.com
```

### **Frontend: `.env.local`**
```env
VITE_API_URL=http://localhost:3000/api
```

---

## ⚠️ Troubleshooting

### **"Connection Refused"**
```
❌ Error: net::ERR_CONNECTION_REFUSED
```
**Solution:** Backend is not running
```powershell
cd backend && npm run dev
```

### **"Cannot GET /api/auth/login"**
```
❌ Error: 404
```
**Solution:** API URL is wrong. Check frontend `.env.local`:
```env
VITE_API_URL=http://localhost:3000/api  ← Must have /api
```

### **"Failed to load resource"**
```
❌ Blank response, no data
```
**Solution:** 
1. Restart frontend: `Ctrl+C` then `npm run dev`
2. Check browser cache: `Ctrl+Shift+Delete`
3. Verify backend is running on port 3000

### **Port 3000 Already in Use**
```
❌ EADDRINUSE: address already in use :::3000
```
**Solution:** Kill the process
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## 📋 Complete Startup Process

### **First Time Setup**
```powershell
# 1. Install dependencies (if needed)
cd backend && npm install
cd ../frontend && npm install

# 2. Create .env files
# Backend: Copy .env.example to .env (or use existing)
# Frontend: Already created .env.local

# 3. Run both servers
# Use start-all.bat OR start manually
```

### **Daily Startup**
```powershell
# Just double-click start-all.bat
# OR run manually:

# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev

# Browser
Open http://localhost:5173
```

---

## 🎯 What to Expect

### **Backend Startup (Terminal 1)**
```
[STARTUP] Connecting to database...
[DATABASE] ✓ Connected to PostgreSQL
[EXPRESS] ✓ Express server initialized
[ROUTES] ✓ Auth routes loaded
[ROUTES] ✓ Course routes loaded
[ROUTES] ✓ Flashcard routes loaded
[ROUTES] ✓ Study groups routes loaded
✓ Server running on http://localhost:3000
✓ Environment: development
```

### **Frontend Startup (Terminal 2)**
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

### **Browser Console (F12)**
```
[API] Configured base URL: http://localhost:3000/api
[AUTH STORE] Setting user: { id: '...', email: '...', name: '...' }
[LOGIN] Success: { token: '...', user: {...} }
```

---

## 🚀 Success Indicators

✅ **Backend:**
- Terminal shows "Server running on http://localhost:3000"
- `curl http://localhost:3000/api/health` returns `{"status":"ok"}`

✅ **Frontend:**
- Browser shows login page without errors
- Console shows "[API] Configured base URL: http://localhost:3000/api"
- Network tab shows requests to `http://localhost:3000/api/...`

✅ **Connection:**
- Can login successfully OR
- See "Failed to login" message (not "Connection refused")
- Network requests appear in browser Network tab

---

## 🔗 Important URLs

| Service | URL | What It Is |
|---------|-----|-----------|
| **Frontend** | http://localhost:5173 | React app (UI) |
| **Backend** | http://localhost:3000 | Express server (API) |
| **API** | http://localhost:3000/api | API endpoints |
| **Health** | http://localhost:3000/api/health | Backend status |
| **Database** | Supabase (cloud) | PostgreSQL data |

---

## 📞 Need Help?

**Issue: Still getting "Connection Refused"?**
```
1. Check backend is running: `npm run dev` in backend folder
2. Verify port 3000: `curl http://localhost:3000/api/health`
3. Check frontend .env.local has: VITE_API_URL=http://localhost:3000/api
4. Restart frontend: Ctrl+C, then npm run dev
```

**Issue: Backend won't start?**
```
1. Check dependencies: npm install
2. Check .env file exists
3. Check database connection in .env is valid
4. Check port 3000 is free: netstat -ano | findstr :3000
```

**Issue: Database won't connect?**
```
1. Check DATABASE_URL in .env
2. Check internet connection (Supabase is cloud)
3. Test connection: psql <DATABASE_URL>
```

---

**Status: ✅ READY TO START!**

Just run `start-all.bat` and you're done! 🎯
