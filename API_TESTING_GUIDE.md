# 🧪 Manual API Testing - Verify Share Works

If you want to test the sharing API directly without the UI, try these commands.

## Step 1: Get Your Token

### From Browser Console
1. Open http://localhost:5174 (logged in)
2. Press F12 → Console
3. Type: `localStorage.getItem('token')`
4. Copy the entire string (starts with `eyJ`)

### From Backend Logs
1. Look at backend terminal output
2. Find line with `[LOGIN] Response sent successfully`
3. Look for token in that output: `eyJhbGciOi...`

---

## Step 2: Test Create Shared Flashcard Set

Replace `YOUR_TOKEN_HERE` with your actual token (without the `"` quotes):

### PowerShell Command
```powershell
$token = "YOUR_TOKEN_HERE"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
$body = @{
    "flashcardIds" = @("flashcard-id-1", "flashcard-id-2")
    "title" = "Test Flashcards"
    "description" = "Test Description"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/sharing/flashcard-set" `
    -Method POST `
    -Headers $headers `
    -Body $body

$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### Or use CURL (if available)
```bash
curl -X POST http://localhost:3000/api/sharing/flashcard-set \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "flashcardIds": ["flashcard-id-1", "flashcard-id-2"],
    "title": "Test Flashcards",
    "description": "Test Description"
  }'
```

---

## Expected Responses

### ✅ Success (200)
```json
{
  "data": {
    "id": "shared-set-id-123",
    "title": "Test Flashcards",
    "shareToken": "abc-def-ghi-jkl",
    "isPublic": false,
    "createdBy": "user-id-123",
    ...
  }
}
```

### ❌ Missing Token (401)
```json
{
  "error": "Missing or invalid authorization header"
}
```

### ❌ Wrong Format (401)
```json
{
  "error": "Invalid token"
}
```

### ❌ Bad Request (400)
```json
{
  "error": "flashcardIds array is required"
}
```

---

## Debug Output

### If you see "Missing or invalid authorization header"

This means:
- [ ] Authorization header not sent
- [ ] Token format wrong
- [ ] Backend not receiving the header

**Test with Postman/Insomnia:**
1. Create POST request to: `http://localhost:3000/api/sharing/flashcard-set`
2. Go to **Headers** tab
3. Add: `Authorization: Bearer <YOUR_TOKEN>`
4. Go to **Body** tab, select **raw** and **JSON**
5. Paste:
   ```json
   {
     "flashcardIds": ["id1", "id2"],
     "title": "Test"
   }
   ```
6. Send
7. Check if Authorization header appears in request

---

## Get Real Flashcard IDs

You need actual flashcard IDs from your database:

### From Browser Console (if you have flashcards)
```javascript
// After navigating to a lecture with flashcards:
// This would be available in the page state
localStorage.getItem('recent_flashcard_ids')
// Or check Network tab for /flashcards API response
```

### From Backend Logs
```bash
# Look for flashcard creation logs:
# Should show IDs when flashcards are generated
```

### From Database (if you have Prisma Studio)
```bash
cd backend
npm run prisma:studio
# Opens UI to browse data
```

---

## Summary

The sharing API requires:

```
POST http://localhost:3000/api/sharing/flashcard-set

Headers:
- Authorization: Bearer <TOKEN>
- Content-Type: application/json

Body:
{
  "flashcardIds": ["id1", "id2", "id3"],
  "title": "My Flashcards"
}
```

If you get the 401 error with these exact parameters, then:
- ✅ Token is being sent correctly
- ❌ Backend auth middleware is rejecting it

Which means we need to check:
1. JWT_SECRET in backend .env matches what was used to sign token
2. Token hasn't expired (7 day expiry set in auth.ts)
3. Token format is correct

---

## What to Report

When you test, tell me:

1. **Token test:**
   - Did `localStorage.getItem('token')` return a string? (YES/NO)

2. **PowerShell/CURL test:**
   - What response did you get?
   - Full response body

3. **Postman Headers test:**
   - Did Authorization header appear in Postman request inspector?

4. **Backend logs:**
   - Did you see any log messages when you made the request?
   - Any errors in backend terminal?

This will help me identify exactly where the token is being lost! 🔍

