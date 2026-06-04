# 🚨 NETWORK ERROR - COMPLETE TROUBLESHOOTING GUIDE

## 🔴 The Error

```
[LOGIN] Error: AxiosError: Network Error
```

This happens when the **frontend cannot connect to the backend API**.

---

## 🔍 Root Cause: Backend NOT Running

When you see "Network Error", it means:

| Check | Status |
|-------|--------|
| Backend running on port 3000 | ❌ NO |
| Backend accessible at `localhost:3000` | ❌ NO |
| API endpoint working | ❌ NO |
| Frontend can reach backend | ❌ NO |

**Result:** Login/Register fails with "Network Error" ❌

---

## ✅ SOLUTION

### **The ONLY Fix:**

Start the backend server on port 3000

---

## 🚀 HOW TO START BACKEND

### **Method 1: Quick PowerShell Command**

Open PowerShell and run:

```powershell
cd "C:\Users\Ahmed Mohamed\Desktop\sw-project\backend" && npm run dev
```

### **Method 2: Double-Click Script**

Double-click this file:
```
C:\Users\Ahmed Mohamed\Desktop\sw-project\start-all.bat
```

Opens 2 windows:
- Window 1: Backend ✅
- Window 2: Frontend ✅

### **Method 3: Manual Steps**

1. Open PowerShell
2. Type: `cd "C:\Users\Ahmed Mohamed\Desktop\sw-project\backend"`
3. Press Enter
4. Type: `npm run dev`
5. Press Enter
6. Wait for "Server running on http://localhost:3000" ✅

---

## 🧪 VERIFY BACKEND IS RUNNING

After starting, verify with:

```powershell
curl http://localhost:3000/api/health
```

**Expected response:**
```json
{"status":"ok"}
```

**If you get:**
```
Connection refused
```

**Then:** Backend is not running. Start it again!

---

## 📊 What Each Message Means

### **✅ Backend Running Correctly**
```
✓ Server running on http://localhost:3000
✓ Environment: development
```

### **❌ Backend Not Running**
```
curl: (7) Failed to connect to localhost port 3000
Network Error: connect ECONNREFUSED 127.0.0.1:3000
```

### **❌ Backend Running But Database Error**
```
[DATABASE] ✗ Connection failed
Error: Cannot connect to PostgreSQL
```
**Fix:** Check DATABASE_URL in .env is correct

### **❌ Backend Running But Port Conflict**
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Fix:** Kill process on port 3000:
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
npm run dev
```

---

## 🔄 Complete Workflow to Fix

### **Step 1: Check Current Status**
```powershell
# Test if backend is accessible
curl http://localhost:3000/api/health

# If this fails → backend not running
# If this works → problem is elsewhere
```

### **Step 2: Start Backend**
```powershell
cd "C:\Users\Ahmed Mohamed\Desktop\sw-project\backend"
npm run dev

# Wait for: "✓ Server running on http://localhost:3000"
```

### **Step 3: Verify Connection**
```powershell
# In a NEW terminal:
curl http://localhost:3000/api/health

# Should return: {"status":"ok"}
```

### **Step 4: Start Frontend (if not running)**
```powershell
# In another NEW terminal:
cd "C:\Users\Ahmed Mohamed\Desktop\sw-project\frontend"
npm run dev

# Wait for: "VITE v5.x.x ready"
```

### **Step 5: Test Login**
```
1. Open http://localhost:5173
2. Try to login
3. Should work now! ✅
```

---

## 🎯 Quick Checklist

When everything is working:

- [ ] `curl http://localhost:3000/api/health` returns `{"status":"ok"}`
- [ ] Backend terminal shows: "✓ Server running on http://localhost:3000"
- [ ] Frontend terminal shows: "VITE v5.x.x ready in XXX ms"
- [ ] Browser shows login page at http://localhost:5173
- [ ] Console (F12) shows: "[API] Configured base URL: http://localhost:3000/api"
- [ ] Can type credentials and click Sign in
- [ ] No "Network Error" message
- [ ] Redirects to dashboard ✅

---

## 🆘 Advanced Troubleshooting

### **Symptom: "Network Error" still shows**

**Step 1: Verify backend is actually running**
```powershell
# Check if process exists
netstat -ano | findstr :3000

# Check if it's responding
curl -v http://localhost:3000/api/health
```

**Step 2: Check browser console (F12)**
- Go to **Console** tab
- Look at Network errors
- Copy the full error message
- It will tell you what's wrong

**Step 3: Check backend console**
- Look at terminal where you ran `npm run dev`
- Any errors shown?
- Look for: `[LOGIN]`, `[ERROR]`, `[FATAL]`

**Step 4: Check .env files**

Backend `.env`:
```env
PORT=3000
DATABASE_URL=...
JWT_SECRET=mysecretkey123
```

Frontend `.env.local`:
```env
VITE_API_URL=http://localhost:3000/api
```

---

## 📞 Still Having Issues?

### **Error: Database Connection Failed**
```
Fix: 1. Check DATABASE_URL in backend/.env
     2. Verify internet connection (Supabase is cloud)
     3. Verify database credentials are correct
```

### **Error: Cannot find module npm**
```
Fix: 1. Install Node.js from nodejs.org
     2. Restart terminal
     3. Run: npm run dev
```

### **Error: EADDRINUSE Port 3000 Already in Use**
```
Fix: 1. Kill process: taskkill /PID <PID> /F
     2. Or use different port: PORT=3001 npm run dev
```

### **Error: CORS Issue**
```
Fix: Backend CORS is already configured
     Should not happen with current setup
     If it does, check backend/src/index.ts cors config
```

---

## 🎯 Quick Reference Commands

| Action | Command |
|--------|---------|
| Start Backend | `cd backend && npm run dev` |
| Start Frontend | `cd frontend && npm run dev` |
| Test Backend | `curl http://localhost:3000/api/health` |
| Kill Port 3000 | `netstat -ano \| findstr :3000` then `taskkill /PID <PID> /F` |
| Check Port Status | `netstat -ano \| findstr :3000` |
| Clear npm Cache | `npm cache clean --force` |
| Reinstall Dependencies | `npm install` |

---

## ✨ FINAL ANSWER

**The "Network Error" occurs because:**
- Backend is NOT running on port 3000
- Frontend can't connect to API

**The FIX is simple:**
1. Open PowerShell
2. Run: `cd "C:\Users\Ahmed Mohamed\Desktop\sw-project\backend" && npm run dev`
3. Wait for: "✓ Server running on http://localhost:3000"
4. Try login again ✅

**That's it!** 🚀
