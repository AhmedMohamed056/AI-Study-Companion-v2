# 🧪 QUICK TEST GUIDE

## ✅ Verify Fixes Are Working

### **Step 1: Start the Servers**
```powershell
# Terminal 1: Backend
cd "C:\Users\Ahmed Mohamed\Desktop\sw-project\backend"
npm run dev

# Wait for: "✓ Server running on http://localhost:3000"

# Terminal 2: Frontend  
cd "C:\Users\Ahmed Mohamed\Desktop\sw-project\frontend"
npm run dev

# Wait for: "VITE v5.x.x  ready in XXX ms"
```

---

### **Step 2: Test Registration**

**Open Browser:** http://localhost:5173

**Click:** "Create one" link

**Fill Form:**
```
Full Name:  TestUser
Email:      test@example.com
Password:   Password123!
```

**Expected Result:** ✅
- Page shows "Creating account..."
- Redirects to dashboard
- No errors in console

**If Error:** Check console (F12) for message

---

### **Step 3: Test Login**

**Click:** Sign in link (or go to http://localhost:5173/login)

**Fill Form:**
```
Email:      test@example.com
Password:   Password123!
```

**Expected Result:** ✅
- Page shows "Signing in..."
- Redirects to dashboard
- Console shows: "[LOGIN] Token and user set, navigating to dashboard..."

**If Error:** Check error message displayed

---

### **Step 4: Check Browser Console**

Press **F12** and go to **Console** tab

**Look for:**
```
[API] Configured base URL: http://localhost:3000/api
[LOGIN] Success response: {...}
[LOGIN] Token and user set, navigating to dashboard...
```

**If you see this:** ✅ Everything working!

---

### **Step 5: Test Study Groups Feature**

After successful login:

1. **Click:** Sidebar → Study Groups
2. **Click:** [+ New Group]
3. **Enter:** Group name: "Test Group"
4. **Click:** [Create]
5. **Expected:** ✅ Group created, showing members section

---

### **Step 6: Verify API Calls in Network Tab**

Press **F12** → **Network** tab → Perform login

**Look for requests like:**
- ✅ POST `http://localhost:3000/api/auth/login` (200 OK)
- ✅ GET `http://localhost:3000/api/study-groups` (200 OK)

**NOT:**
- ❌ `http://localhost:3000/api/api/...` (WRONG)
- ❌ `404 Not Found` (WRONG)

---

## 🚨 Troubleshooting

### **"Connection Refused"**
```
Fix: Make sure backend is running
Terminal 1: cd backend && npm run dev
```

### **"Invalid email or password"**
```
This is CORRECT - means credentials were rejected
Try: email: test@example.com (must exist)
```

### **"Cannot POST /api/auth/login"**
```
Fix: Frontend has wrong API URL
Check: frontend/.env.local contains:
VITE_API_URL=http://localhost:3000/api
```

### **Blank page or infinite loading**
```
Fix: 1. Clear browser cache (Ctrl+Shift+Delete)
     2. Restart frontend (Ctrl+C, npm run dev)
     3. Hard refresh (Ctrl+Shift+R)
```

### **Console shows errors**
```
Fix: 1. Check backend is running
     2. Look at error message (will indicate what's wrong)
     3. Check network tab to see actual request
```

---

## ✨ Success Indicators

| Check | Status |
|-------|--------|
| Backend running on port 3000 | ✅ Terminal shows "Server running" |
| Frontend running on port 5173 | ✅ Terminal shows "VITE ready" |
| Registration works | ✅ Can create account → Dashboard |
| Login works | ✅ Can login → Dashboard |
| API URLs correct | ✅ Network tab shows no `/api/api` |
| Console clean | ✅ No error messages, proper logs shown |
| Study Groups work | ✅ Can create group after login |

---

## 📋 Test Cases

### **Test 1: New Registration**
```
Action: Register new account
Input: test1@example.com / Test123 / John
Result: ✅ Should see dashboard
```

### **Test 2: Login Existing**
```
Action: Login with registered account
Input: test1@example.com / Test123
Result: ✅ Should see dashboard
```

### **Test 3: Wrong Password**
```
Action: Login with wrong password
Input: test1@example.com / WrongPassword
Result: ✅ Should see error message
```

### **Test 4: Non-existent Email**
```
Action: Try to login non-existent email
Input: notreal@example.com / Password123
Result: ✅ Should see error message
```

### **Test 5: Empty Fields**
```
Action: Try to submit empty form
Result: ✅ Form should validate and show message
```

---

## 🎯 All Tests Pass When:

✅ Registration creates account and logs in automatically
✅ Login works with correct credentials
✅ Wrong credentials show proper error
✅ Network tab shows correct URLs (no double `/api`)
✅ Console shows authentication logs
✅ Study Groups page loads after login
✅ Can create a new study group
✅ Sidebar shows all features

---

**Ready to test? Start the servers and go! 🚀**
