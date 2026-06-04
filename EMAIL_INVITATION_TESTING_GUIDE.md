# End-to-End Invitation System Testing Guide

## 🚀 Quick Start - Test the Complete Flow

### Prerequisites
- Backend running: `npm run dev` (in backend folder)
- Frontend running: `npm run dev` (in frontend folder)
- Email service configured in `.env`

### Step-by-Step Testing

#### Part 1: Send Invitations

```
1. Navigate to http://localhost:5173/study-groups
2. Click on a study group you own
3. Click "Invite Member" button
4. Type first email: alice@example.com
5. Click "Add" button
6. Type second email: bob@example.com
7. Click "Add" button
8. Click "Invite (2)" button
9. Should see: "Successfully invited 2 members! Invitations sent via email."
```

#### Part 2: Receive Invitation Email

```
Check email inbox (or console if using test email):
  - Sender: noreply@studyai.com
  - Subject: You're invited to join "Study Group Name" on StudyAI
  - Contains: "Accept Invitation" button
  - Contains: Join link with token
  - Contains: 7-day expiration notice
```

#### Part 3: Join via Invitation Link

```
Option A: Click Button in Email
  1. Click "Accept Invitation" button in email
  2. Should redirect to /accept-invitation/:token
  3. Shows loading spinner
  4. Shows success message: "Successfully joined Study Group Name!"
  5. Button: "View Study Group"
  6. Click button → redirected to group page

Option B: Copy-Paste Link
  1. Copy link from email
  2. Paste into browser address bar
  3. Same as Option A above
```

#### Part 4: Verify Membership

```
1. After joining, go to study groups
2. Click on the joined group
3. You should appear in the members list
4. Group materials are visible to you
5. You can now invite others or add materials
```

## 🔍 Debugging

### Check Backend Logs

Look for these messages in backend console:

```
[INVITE] Sending invitations for group: 123abc
[EMAIL] Invitation sent to alice@example.com
[EMAIL] Invitation sent to bob@example.com
[INVITE] Success response: { results: { invited: 2, failed: 0 } }

[ACCEPT] Processing invitation token: abc123def456
[ACCEPT] User email: alice@example.com matches invitation email: alice@example.com
[ACCEPT] Successfully added user to group
[ACCEPT] Marked invitation as accepted
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Email not received | Service not configured | Set EMAIL_USER, EMAIL_PASSWORD in .env |
| "Invalid email format" | Wrong format entered | Use format: user@example.com |
| "This email is already added" | Duplicate email | Remove and re-add |
| "Invitation not found" | Expired or invalid token | Request new invitation |
| "Invitation has expired" | 7+ days passed | Request new invitation |
| Button stays disabled | No emails added | Click "Add" button first |

## 📊 Test Matrix

### Happy Path
- [ ] Send invitation to new user
- [ ] Email received correctly
- [ ] Click link in email
- [ ] Successfully join group
- [ ] Appear in members list
- [ ] Can see group materials

### Error Cases
- [ ] Invalid email format → Shows error
- [ ] Duplicate email → Shows error
- [ ] Too many emails (50+) → Shows error
- [ ] Expired token → Shows error
- [ ] Already accepted → Shows error
- [ ] Email mismatch → Shows error
- [ ] Network failure → Shows error

### Edge Cases
- [ ] User already in group → Marked as skipped
- [ ] User without account → Gets invitation email
- [ ] Token used twice → Second attempt rejected
- [ ] Old invitation resent → New token issued
- [ ] Cancel during send → Graceful error handling

## 🔒 Security Tests

### Token Security
```
1. Generate invitation link
2. Try to guess other tokens (should fail)
3. Try to use expired token (should fail)
4. Try to use token twice (second should fail)
```

### Email Validation
```
1. Try invalid format: "notanemail"
   Result: ❌ "Invalid email format"

2. Try with spaces: "test @example.com"
   Result: ❌ "Invalid email format"

3. Try very long email (255+ chars)
   Result: ❌ "Email too long"

4. Try SQL injection: "test'; DROP TABLE--@example.com"
   Result: ❌ Sanitized and rejected
```

### XSS Prevention
```
Try HTML in group name:
  "Group <script>alert('xss')</script>"
  Result: ✅ Sanitized in email

Try HTML in invitation message:
  Email should show escaped HTML, not execute scripts
  Result: ✅ Safe
```

## 📈 Performance Tests

### Bulk Invitations
```
1. Send 50 invitations at once
   Expected: Takes 5-10 seconds
   Result: ✅ or ❌

2. Send 100 invitations
   Expected: ❌ Error "Max 50 per request"
   Result: ✅ or ❌
```

### Token Lookup
```
1. Accept invitation immediately after sending
   Expected: <100ms response
   Result: ✅ or ❌

2. Accept after 1 day
   Expected: <100ms response
   Result: ✅ or ❌
```

## 📝 Acceptance Criteria

For the invitation system to be production-ready:

- [ ] Email sends successfully
- [ ] Token is secure (UUID v4)
- [ ] Token expires after 7 days
- [ ] Join link works correctly
- [ ] User added to group on join
- [ ] Invitation marked as accepted
- [ ] All error cases handled
- [ ] Security tests pass
- [ ] UI provides clear feedback
- [ ] Performance is acceptable

## 🎯 Manual Testing Checklist

### Day 1: Basic Flow
- [ ] Send 2 invitations
- [ ] Receive emails
- [ ] Click join link
- [ ] Successfully join
- [ ] Appear in members list

### Day 2: Error Handling
- [ ] Test invalid email
- [ ] Test duplicate email
- [ ] Test cancellation
- [ ] Test network error

### Day 3: Edge Cases
- [ ] Test expired token
- [ ] Test already accepted
- [ ] Test user already member
- [ ] Test XSS prevention

### Day 4: Performance
- [ ] Test 50 invitations
- [ ] Test joining after delay
- [ ] Monitor email sending
- [ ] Check database records

## 📞 Support

If you encounter issues:

1. Check backend logs
2. Verify email service credentials
3. Check database for invitation records
4. Review error messages in UI
5. Check browser console (F12)
6. Review INVITATION_SYSTEM_ARCHITECTURE.md

## 🎉 Success Indicators

System is working correctly when:

✅ Email arrives within 2 seconds
✅ Join link works immediately
✅ User appears in members list
✅ Group materials visible to member
✅ All error messages show correctly
✅ No emails sent on errors
✅ Tokens expire as expected
✅ Security tests pass

---

**Ready to test!** Start with Part 1 above.
