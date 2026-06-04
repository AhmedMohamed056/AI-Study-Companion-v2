# 🔧 Debugging Authentication Error in Share Feature

## Error Message
```
{"error":"Missing or invalid authorization header"} 
server responded with a status of 500 (Internal Server Error)
```

## Root Cause
The sharing API requires authentication, but the authorization token is either:
1. Not being saved properly during login
2. Not being sent with the request
3. Being sent in wrong format
4. Token expired

## Steps to Debug & Fix

### Step 1: Check if you're logged in
1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Check LocalStorage for:
   - `token` key should exist with a long string value
   - `user` key should exist with JSON user data

**If missing → Log in again and check if they appear**

### Step 2: Check the API requests
1. Open DevTools Console (F12)
2. Go to Network tab
3. Click Share button and look for `/api/sharing/flashcard-set` request
4. Click on that request and check:
   - Request Headers → should have `Authorization: Bearer <token>`
   - Response → should show error details

### Step 3: Check Console Logs
1. Open DevTools Console (F12)
2. Look for logs with `[API]` prefix:
   ```
   [API] Added token to POST /sharing/flashcard-set
   [API] No token available for POST /sharing/flashcard-set  ← This is the problem!
   ```

**If you see "No token available" → Token is not being saved**

### Step 4: Fresh Login
Try this:
1. Click "Logout" if there's a logout button, or
2. Clear localStorage:
   - DevTools → Application → LocalStorage → Delete all
3. Go to http://localhost:5174/login
4. Register or login with new account
5. Check Console for: `[AUTH STORE] Setting token: token set`
6. Try Share again

### Step 5: Verify Backend is Accepting Token
Open a new tab and run this test:

**Test 1: Get your token from DevTools**
```javascript
// In DevTools Console:
localStorage.getItem('token')
// Copy the token value (remove quotes)
```

**Test 2: Test API with token**
```bash
# Replace TOKEN_HERE with your actual token
curl -H "Authorization: Bearer TOKEN_HERE" \
  http://localhost:3000/api/sharing/flashcard-set
```

If you get auth error → Backend issue
If you get success → Frontend issue with sending token

---

## Common Issues & Solutions

### ❌ Issue: LocalStorage has no token
**Solution:**
1. Logout and login again
2. Check browser console for auth errors
3. If login page doesn't have token after login, auth endpoint is broken

### ❌ Issue: Token exists but Share fails
**Solution:**
1. Check Network tab for actual request headers
2. Verify `Authorization: Bearer ...` is present
3. If token format is wrong, check api.ts interceptor

### ❌ Issue: Backend returns "Invalid token"
**Solution:**
1. Check that JWT_SECRET in backend .env matches
2. Token might be expired (check token expiry in auth.ts - should be 7d)
3. Try fresh login

---

## What I Changed (New Logging)

I added enhanced logging to help debug:

```typescript
// In api.ts - now shows when token is added/missing:
console.log(`[API] Added token to POST /sharing/flashcard-set`);
console.warn(`[API] No token available for POST /sharing/flashcard-set`);

// In LectureDetailPage.tsx - now shows share flow:
console.log('[SHARE] Auth token present:', !!token);
console.log('[SHARE] Fetched flashcards count:', flashcards.length);
console.error('[SHARE] Error response:', error.response?.data);
```

---

## Quick Test Commands

**In Browser DevTools Console:**

```javascript
// 1. Check token exists
console.log('Token:', localStorage.getItem('token'));

// 2. Check auth store state
import { useAuthStore } from './store/auth';
console.log('Store token:', useAuthStore.getState().token);

// 3. Check if interceptor works
// Just make any API call and watch console for [API] logs
```

---

## What to Report If Still Broken

When you test and it still fails, open DevTools Console (F12) and tell me:

1. **What you see in LocalStorage:**
   ```
   token: [present/missing]
   user: [present/missing]
   ```

2. **What console shows when you click Share:**
   ```
   [SHARE] Auth token present: [true/false]
   [API] Added token to POST... [shows/doesn't show]
   [SHARE] Error response: {error: "..."}
   ```

3. **The exact error message you see:**
   ```
   {"error": "..."}
   ```

4. **Network tab shows:**
   - Request headers: Authorization header [present/missing]
   - Response status: [401/500/other]

---

## Steps to Try Right Now

1. ✅ Refresh the page (Ctrl+Shift+R for hard refresh)
2. ✅ Clear browser cache: DevTools → Application → Clear storage
3. ✅ Logout completely (if logout button exists)
4. ✅ Login again
5. ✅ Open DevTools Console (F12)
6. ✅ Navigate to a lecture with flashcards
7. ✅ Click Share button
8. ✅ Watch the console logs
9. ✅ Screenshot the error and console logs

Then tell me what you see! 🔍

