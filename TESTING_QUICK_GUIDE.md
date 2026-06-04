# Quick Start - Study Groups Testing Guide

## 🚀 How to Test the Feature

### Step 1: Start the Application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Step 2: Create Test Accounts
1. Go to http://localhost:5173/register
2. Create User A:
   - Email: `alice@example.com`
   - Name: `Alice`
   - Password: `Test123!@`
3. Create User B:
   - Email: `bob@example.com`
   - Name: `Bob`
   - Password: `Test123!@`

### Step 3: Test Invitation Flow (Main Feature)

#### As User A (alice@example.com):
1. Login to application
2. Click "Study Groups" in sidebar
3. Click "Create Group"
4. Fill in:
   - Name: `Biology Study Group`
   - Description: `Preparing for final exam`
5. Click "Create"
6. You should see the group in the list
7. Click on the group to view details

#### Invite User B:
1. On Study Group detail page, click "Invite Member" button
2. Type `bob@example.com` in the email field
3. Press Enter or comma
4. Email should appear in the list
5. Click "Invite (1)"
6. See success message: "Successfully invited 1 members!"

#### As User B (bob@example.com):
1. Open email client or check backend logs
2. Look for invitation email from StudyAI
3. Click the "Accept Invitation" button in the email
4. Or go to: http://localhost:5173/accept-invitation/{token}
5. You should see success page
6. Click "View Study Group"
7. You should see User A and yourself in members list

### Step 4: Test Material Sharing

#### Add Flashcards (As User A):
1. Go to Lectures section
2. Create/select a lecture
3. Create at least 2 flashcards
4. Go back to Study Group detail
5. Click "Add Materials" button
6. Click on "Flashcards" tab
7. Select at least 2 flashcards
8. Fill in Set Name: `Biology Chapter 1`
9. Click "Add Materials"
10. Materials should appear in group

#### View Materials (As User B):
1. Login as User B
2. Go to Study Groups
3. Click on the study group
4. You should see shared materials
5. Click on materials to view details

## ✅ Final Checklist

- [ ] Study group created successfully
- [ ] Invitation sent via email
- [ ] Invitation accepted successfully
- [ ] User joined group
- [ ] Materials added to group
- [ ] Other member can see materials
- [ ] No console errors
- [ ] No server errors

---

**All features implemented and secured!** 🎉
