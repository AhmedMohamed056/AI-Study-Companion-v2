# 🔴 BACKEND NOT RUNNING - QUICK FIX

## The Problem
```
curl: (7) Failed to connect to localhost port 3000
```

**Backend is NOT running on port 3000!**

---

## ✅ Solution: Start the Backend

### **Option 1: Using PowerShell (Recommended)**

```powershell
cd "C:\Users\Ahmed Mohamed\Desktop\sw-project\backend"
npm run dev
```

**Wait for this output:**
```
[STARTUP] Connecting to database...
[DATABASE] ✓ Connected to PostgreSQL
[EXPRESS] ✓ Express server initialized
[ROUTES] ✓ Auth routes loaded
✓ Server running on http://localhost:3000
✓ Environment: development
```

---

### **Option 2: Using start-all.bat (Easiest)**

Double-click this file in your project:
```
C:\Users\Ahmed Mohamed\Desktop\sw-project\start-all.bat
```

This opens **2 new windows**:
- Window 1: Backend (port 3000)
- Window 2: Frontend (port 5173)

---

### **Option 3: Using the Diagnostic Script**

```powershell
C:\Users\Ahmed Mohamed\Desktop\sw-project\check-status.bat
```

This shows you what's running and what's not.

---

## 🧪 Verify Backend is Running

After starting, test it:

```powershell
curl http://localhost:3000/api/health
```

**Should return:**
```json
{"status":"ok","timestamp":"2026-06-03T..."}
```

---

## 📋 Checklist

- [ ] **Backend Terminal Shows:** "Server running on http://localhost:3000"
- [ ] **Test Passes:** `curl http://localhost:3000/api/health` returns OK
- [ ] **Frontend Terminal Shows:** "VITE v5.x.x ready in XXX ms"
- [ ] **Browser:** Open http://localhost:5173
- [ ] **Try Login:** Use test credentials
- [ ] **Check Console:** F12 → Console tab (should see no errors)

---

## 🚀 Quick Start Command

**Copy & paste this into PowerShell:**

```powershell
cd "C:\Users\Ahmed Mohamed\Desktop\sw-project\backend"; npm run dev
```

---

**Once the backend is running, the "network error" will disappear!** ✅
