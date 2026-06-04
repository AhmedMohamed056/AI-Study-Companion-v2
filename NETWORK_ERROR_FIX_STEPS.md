# 🎬 STEP-BY-STEP: FIX THE NETWORK ERROR

## 📍 Current Status

```
❌ Backend:   NOT running (port 3000)
❌ Frontend:  May or may not be running
❌ Result:    "Network Error" when trying to login
```

---

## 🔧 FIX IN 3 STEPS

### **STEP 1️⃣: Open PowerShell Window**

**Windows + R** → Type `powershell` → Press Enter

Or just open PowerShell from Start Menu

---

### **STEP 2️⃣: Navigate to Backend Folder**

Copy & paste this into PowerShell:

```powershell
cd "C:\Users\Ahmed Mohamed\Desktop\sw-project\backend"
```

Press **Enter**

---

### **STEP 3️⃣: Start the Backend**

Type this:

```powershell
npm run dev
```

Press **Enter**

---

## ⏳ Wait for This Output

```
╭─────────────────────────────────────╮
│  [STARTUP] Connecting to database   │
│  [DATABASE] ✓ Connected             │
│  [EXPRESS] ✓ Server initialized     │
│  ✓ Server running on                │
│    http://localhost:3000            │
│  ✓ Environment: development         │
╰─────────────────────────────────────╯
```

When you see this, the backend is **READY** ✅

---

## 🌐 Test It Works

**While backend is running, open a NEW PowerShell window:**

```powershell
curl http://localhost:3000/api/health
```

Should see:
```json
{"status":"ok","timestamp":"2026-06-03T..."}
```

---

## 🎉 Now Try Login Again

1. **Open Browser:** http://localhost:5173
2. **Fill Form:**
   ```
   Email:    test@example.com
   Password: Password123!
   ```
3. **Click:** [Sign in]
4. **Result:** ✅ Should work now!

---

## ✨ What You Should See

### **Terminal Output:**
```
[LOGIN] Login attempt for: test@example.com
[LOGIN] Finding user...
[LOGIN] User found: YES
[LOGIN] Comparing password...
[LOGIN] Password match: true
[LOGIN] Generating JWT token...
[LOGIN] Token generated successfully
[LOGIN] Response data prepared
[LOGIN] Response sent successfully
```

### **Browser Console (F12):**
```
[API] Configured base URL: http://localhost:3000/api
[LOGIN] Attempting to connect to: http://localhost:3000/api
[LOGIN] Success response: {...}
[LOGIN] Token and user set, navigating to dashboard...
```

---

## 🆘 If Still Getting Error

### **Check 1: Is Backend Still Running?**
Look at the terminal where you started `npm run dev`
- If it shows errors: backend crashed
- If blank/no output: terminal lost focus
- **Solution:** Restart with `npm run dev`

### **Check 2: Is Frontend Running?**
Should have a separate terminal showing:
```
VITE v5.x.x ready in XXX ms
```
- If not: Open new terminal, `cd frontend && npm run dev`

### **Check 3: Clear Browser Cache**
- Press **Ctrl + Shift + Delete**
- Select "All time"
- Click "Clear"
- Refresh page

### **Check 4: Check Console for Real Error**
- Press **F12**
- Go to **Console** tab
- Look for actual error message (not just "network error")
- Copy error and we can debug it

---

## 📚 Reference: What Each Component Does

| Component | Port | Status Check |
|-----------|------|--------------|
| Backend (Express API) | 3000 | `curl http://localhost:3000/api/health` |
| Frontend (React/Vite) | 5173 | Open http://localhost:5173 in browser |
| Database (Supabase) | Cloud | `ping supabase.com` |

---

## 🚀 Full Command Reference

**Start Backend:**
```powershell
cd "C:\Users\Ahmed Mohamed\Desktop\sw-project\backend"
npm run dev
```

**Start Frontend (in NEW terminal):**
```powershell
cd "C:\Users\Ahmed Mohamed\Desktop\sw-project\frontend"
npm run dev
```

**Or Start Both at Once:**
```
Double-click: C:\Users\Ahmed Mohamed\Desktop\sw-project\start-all.bat
```

---

## ✅ Success Criteria

When everything works:
1. ✅ Backend terminal shows "Server running on http://localhost:3000"
2. ✅ Frontend terminal shows "VITE ready"
3. ✅ Browser shows login page at http://localhost:5173
4. ✅ Can enter credentials and click Sign in
5. ✅ Redirects to dashboard (no error)

---

**Follow these steps and the "network error" will disappear! 🎯**
