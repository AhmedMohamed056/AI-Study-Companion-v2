# Study Groups Feature Test Plan

## Test Checklist

### 1. User Registration & Login
- [ ] Register User A (email: usera@test.com)
- [ ] Register User B (email: userb@test.com)
- [ ] Login as User A

### 2. Create Study Group
- [ ] Click "Study Groups" in navigation
- [ ] Click "Create Group" button
- [ ] Fill in: Name = "Test Study Group", Description = "Testing invitations and materials"
- [ ] Submit and verify group is created
- [ ] Verify you are added as owner

### 3. Test Add Member / Invite Button
- [ ] In Study Group detail page, click "Invite Member" button
- [ ] Verify modal opens
- [ ] Add email: userb@test.com
- [ ] Click "Invite" button
- [ ] Verify success message shows
- [ ] Check that user B has not joined yet (should show pending)

### 4. Test Email Sending (Verify in Email Service)
- [ ] Check backend logs for email sending
- [ ] Verify invitation token is generated
- [ ] Generate invitation link manually if needed: /accept-invitation/{token}

### 5. Test Accept Invitation as User B
- [ ] Logout as User A
- [ ] Login as User B (userb@test.com)
- [ ] Navigate to: /accept-invitation/{token} (from email or manually)
- [ ] Verify success page shows
- [ ] Verify it redirects to study group
- [ ] Verify User B is now shown in members list

### 6. Create Flashcards & Quizzes (User A)
- [ ] Login as User A
- [ ] Go to Lectures section
- [ ] Create/select a lecture
- [ ] Create at least 2 flashcards
- [ ] Create at least 1 quiz
- [ ] Note the material IDs

### 7. Test Add Materials Modal
- [ ] Go to Study Group detail
- [ ] Click "Add Materials" button
- [ ] Verify modal opens
- [ ] Verify it shows fetched flashcards list
- [ ] Select at least 2 flashcards
- [ ] Fill in set name: "Shared Flashcards"
- [ ] Click "Add Materials"
- [ ] Verify success and materials appear in group

### 8. Test Quiz Materials
- [ ] Click "Add Materials" again
- [ ] Switch to "Quizzes" tab
- [ ] Verify quizzes are loaded
- [ ] Select at least 1 quiz
- [ ] Fill in set name: "Shared Quizzes"
- [ ] Click "Add Materials"
- [ ] Verify materials appear

### 9. Verify User B Can See Materials
- [ ] Login as User B
- [ ] Go to Study Group detail
- [ ] Verify all shared materials are visible
- [ ] Click on flashcard set to view details
- [ ] Verify can see the shared flashcards

### 10. Test Remove Member
- [ ] Login as User A (owner)
- [ ] Go to Study Group detail
- [ ] Click X button next to User B
- [ ] Confirm removal
- [ ] Verify User B removed from members list

## Expected Outcomes

✅ Invite button activates and sends emails
✅ Accept invitation link works and adds user to group
✅ Add materials button shows list of user's materials
✅ Users can select and add materials to group
✅ Group members can view shared materials
✅ Material removal works correctly

## Notes

- Email service should log to console in development
- Invitation links expire after 7 days
- Only group owner can invite members and add materials
- All members can view shared materials
