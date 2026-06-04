# 🎯 Study Groups & Sharing - Visual Quick Start

## 🔴 RED = Owner only | 🟢 GREEN = Everyone | 🔵 BLUE = Recipient only

---

## Study Groups Flow

```
┌─────────────────────────────────────────────────────────┐
│          STUDY GROUPS PAGE                              │
│          (Sidebar → Study Groups)                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [🔴 NEW GROUP BUTTON]                                  │
│                                                          │
│  Your Groups:                                            │
│  ├─ [Math Study Group]  (3 members, 5 materials)        │
│  ├─ [Biology Class]     (2 members, 3 materials)        │
│  └─ [Chemistry 101]     (4 members, 2 materials)        │
│                                                          │
└─────────────────────────────────────────────────────────┘
                           ↓ (click group)
┌─────────────────────────────────────────────────────────┐
│          GROUP DETAIL PAGE                              │
│          Math Study Group                               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📊 STATS:                                              │
│  • Members: 3  • Materials: 5                           │
│                                                          │
│  👥 MEMBERS [🔴 Invite Member Button]                  │
│  ├─ You (Owner) [🔴 Remove button]                      │
│  ├─ john@email.com (Member) [🔴 Remove button]         │
│  └─ jane@email.com (Member) [🔴 Remove button]         │
│                                                          │
│  📚 SHARED MATERIALS [🔴 Add Materials Button]          │
│  ├─ Flashcard Sets                                      │
│  │  ├─ Chapter 3 Vocab [🔴 Delete button]              │
│  │  └─ Chapter 4 Formulas [🔴 Delete button]           │
│  ├─ Quiz Sets                                           │
│  │  └─ Chapter 3 Practice [🔴 Delete button]           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Invite Members Flow

```
[Invite Member Button] 
            ↓
┌─────────────────────────────────┐
│  INVITE MEMBERS MODAL           │
├─────────────────────────────────┤
│                                 │
│  Email: [input] (press Enter)   │
│                                 │
│  Added Emails:                  │
│  • john@email.com [✕]           │
│  • jane@email.com [✕]           │
│                                 │
│  [Cancel]  [Invite] (disabled)  │
│                                 │
└─────────────────────────────────┘
```

---

## Add Materials Flow

```
[Add Materials Button]
            ↓
┌────────────────────────────────────┐
│  ADD MATERIALS MODAL               │
├────────────────────────────────────┤
│                                    │
│  Set Name: [input]                 │
│  Description: [textarea]           │
│                                    │
│  [Flashcards] [Quizzes]            │
│                                    │
│  Material ID: [paste ID + Enter]   │
│                                    │
│  Added IDs:                        │
│  • fc_123456 [✕]                   │
│  • fc_789012 [✕]                   │
│                                    │
│  [Cancel]  [Add Materials]         │
│                                    │
└────────────────────────────────────┘
            ↓
   ✅ Flashcards added to group!
   All members can now see them!
```

---

## Share Content Flow

```
FROM LECTURES PAGE:
└─ Sidebar → Lectures
   ├─ Click lecture
   └─ [Share Button] (top right) ──┐
                                    ↓
FROM FLASHCARD REVIEW:           ┌──────────────────────────┐
└─ Study Groups or Sidebar       │  SHARE MODAL             │
   ├─ Click "Review"             ├──────────────────────────┤
   └─ [Share Button] (top right) │                          │
                         ──┐     │  [Public Link] [Users]   │
                           │     │                          │
FROM QUIZ RESULTS:        │     │  Public Link:            │
└─ After taking quiz      │     │  [OFF] → [ON]            │
   ├─ View results        │     │  📋 Copy Link            │
   └─ [Share Button] ─────┘     │                          │
                                 │  Share with Users:       │
                                 │  Search: [input]         │
                                 │  [Add User]              │
                                 │                          │
                                 │  Shared with:            │
                                 │  • user@email.com [✕]    │
                                 │                          │
                                 │  [Close/Done]            │
                                 │                          │
                                 └──────────────────────────┘
```

---

## Sharing Modes Comparison

```
┌────────────────┬─────────────────┬──────────────────┐
│ PUBLIC LINK    │ TARGETED SHARE  │ GROUP MEMBERS    │
├────────────────┼─────────────────┼──────────────────┤
│ Anyone with    │ Only invited    │ All group        │
│ the link can   │ users can see   │ members see      │
│ access         │                 │ automatically    │
│                │                 │                  │
│ No login       │ Requires login  │ Requires group   │
│ required       │                 │ membership       │
│                │                 │                  │
│ Read-only      │ Read-only       │ Read-only in     │
│                │                 │ group, edit in   │
│                │                 │ library          │
│                │                 │                  │
│ Best for: Open │ Best for:       │ Best for:        │
│ sharing, demos │ Specific people │ Collaborative    │
│ collaboration  │ friend sharing  │ studying        │
└────────────────┴─────────────────┴──────────────────┘
```

---

## "Shared with Me" Page

```
┌─────────────────────────────────────────┐
│  SHARED WITH ME                         │
│  (Sidebar → Shared with Me)             │
├─────────────────────────────────────────┤
│                                         │
│  [Flashcard Sets (3)] [Quiz Sets (2)]   │
│                                         │
│  FLASHCARD SETS CONTENT:                │
│  ├─ Biology Chapter 1                   │
│  │  Shared by: Professor Smith          │
│  │  [View] [Copy to Library]             │
│  │                                      │
│  ├─ Math Formulas                       │
│  │  Shared by: John Doe                 │
│  │  [View] [Copy to Library]             │
│  │                                      │
│  └─ Chemistry Lab                       │
│     Shared by: Study Group               │
│     [View] [Copy to Library]             │
│                                         │
└─────────────────────────────────────────┘
                    ↓
   Click [Copy to Library]
                    ↓
  ✅ Added to your library! 
  Now you own a copy.
```

---

## Permission Matrix

```
┌──────────────────┬────────┬────────┬────────────┐
│ ACTION           │ OWNER  │ MEMBER │ NON-MEMBER │
├──────────────────┼────────┼────────┼────────────┤
│ View group       │   ✅   │   ✅   │     ❌     │
│ Invite members   │   ✅   │   ❌   │     ❌     │
│ Remove members   │   ✅   │   ❌   │     ❌     │
│ Add materials    │   ✅   │   ❌   │     ❌     │
│ Remove materials │   ✅   │   ❌   │     ❌     │
│ View materials   │   ✅   │   ✅   │     ❌     │
│ Share content    │   ✅   │   ✅   │     ✅     │
│ Access shared    │   ✅   │   ✅   │     ✅*    │
└──────────────────┴────────┴────────┴────────────┘
* If you have public link or were specifically shared with
```

---

## Button Colors & Meanings

```
🟣 PURPLE BUTTONS
├─ Primary actions
├─ Share
├─ Invite Member
└─ Create Group

🔵 BLUE BUTTONS
├─ Secondary actions
├─ Add Materials
└─ Create/Confirm

🔴 RED BUTTONS
├─ Destructive actions
├─ Delete group
├─ Remove member
└─ Remove material

⚫ GRAY BUTTONS
├─ Cancel/Close
├─ Back
└─ Neutral actions
```

---

## Step-by-Step Examples

### Example 1: Study Group for Class

```
1. Create Group
   → "Biology 101 Study Friends"
   → Description: "Studying chapters 1-5"

2. Invite Members
   → alice@uni.edu
   → bob@uni.edu
   → charlie@uni.edu

3. Add Materials
   → My Chapter 1-3 Flashcards (50 cards)
   → My Practice Quiz (10 questions)

4. Members Access Group
   → See all 3 members
   → Study your 50 flashcards
   → Practice the quiz
   → Can't edit (read-only)

5. Members Share Theirs
   → Alice adds her flashcards (30 cards)
   → Bob adds his quiz (15 questions)
   → Charlie shares his notes
   
6. Everyone Gets Materials
   → 3 sets of flashcards total
   → 2 quizzes total
   → Collaborative learning!
```

### Example 2: Share with Friend

```
1. Make Public
   → Go to Lecture → Share
   → Toggle "Public" ON
   → Copy link

2. Send Link to Friend
   → Send via email/message
   → Friend clicks link
   → Sees content (NO LOGIN NEEDED!)

3. Friend Copies It
   → Clicks "Copy to Library"
   → Now owns their own copy
   → Can study whenever

4. You Keep Control
   → Original stays in your account
   → Friend can't edit your copy
   → Both have independent versions
```

### Example 3: Targeted Sharing

```
1. Share with Specific Person
   → Click Share button
   → Go to "Share with Users" tab
   → Search: alice@email.com
   → Click "Add User"
   → Click "Share"

2. Alice Gets Notification
   → Sees item in "Shared with Me"
   → Can preview
   → Can copy to her library

3. You Can Revoke
   → Click Share again
   → See "Shared with: alice@email.com"
   → Click X to remove her access
```

---

## Keyboard Shortcuts (Modal Forms)

```
ENTER KEY
├─ In "Add Email" field → Add email to list
├─ In "Add Material ID" field → Add ID to list
└─ In forms (when ready) → Submit form

ESCAPE KEY
└─ Close any modal/dialog

TAB KEY
└─ Move between form fields

CLICK X BUTTON
└─ Remove item from list
└─ Close modal
```

---

## Troubleshooting Quick Ref

```
❓ Don't see Share button?
→ Make sure you're on Lecture, Flashcard Review, or Quiz Results page

❓ Invited user doesn't see group?
→ Check email spelling
→ User might need to refresh their browser
→ User should see it in Study Groups list

❓ Can't remove member?
→ Only OWNER can remove members
→ You must be the group creator

❓ Material IDs not working?
→ Copy full ID from the detail page
→ Check for spaces in the ID

❓ Public link not working?
→ Make sure Public is toggled ON
→ Share the full URL from the modal
→ Link should include /shared/flashcard/ or /shared/quiz/

❓ Can't add materials to group?
→ Only owner can add materials
→ Make sure you have material IDs
→ Check that you're in the group
```

---

## Color Guide

```
BACKGROUNDS
├─ Darkest: #020617 (slate-950) - Main background
├─ Dark: #1e293b (slate-900) - Cards & panels
├─ Medium: #334155 (slate-700) - Borders
└─ Light: #94a3b8 (slate-400) - Text

ACCENTS
├─ Purple: #a855f7 (Primary)
├─ Blue: #3b82f6 (Secondary)
├─ Red: #ef4444 (Danger)
├─ Green: #22c55e (Success)
└─ Yellow: #eab308 (Warning)
```

---

## 🎓 Tips for Best Results

1. **Before Inviting Someone**
   - Make sure you have their correct email
   - They should have an account in the system
   - They should be online to accept invites

2. **Before Sharing**
   - Test the link works (open in incognito)
   - Make sure content is complete
   - Consider if it should be public or private

3. **Adding Materials**
   - Copy full IDs from your library
   - Verify materials exist before adding
   - Good set name helps others understand

4. **Best Practices**
   - Keep group names descriptive
   - Add descriptions to material sets
   - Remove old materials to keep group clean
   - Share actively with study partners

---

**Last Updated**: 2026-06-03
**Status**: ✅ All Features Live & Working
