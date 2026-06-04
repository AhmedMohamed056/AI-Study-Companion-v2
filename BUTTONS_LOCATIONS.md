# 🎯 VISUAL REFERENCE - Where Everything Is Located

## App is Running at: http://localhost:5173

---

## 📍 NAVIGATION MAP

```
START HERE: Open http://localhost:5173
                          ↓
                    Login Page
                          ↓
                    Dashboard
                          ↓
            Left Sidebar (always visible)
                          ↓
    ┌───────────────────────────────────────┐
    │ 🏠 Dashboard                          │
    │ 📚 Lectures                           │
    │ 👥 Study Groups          ← MAIN HUB  │
    │ 📤 Shared with Me        ← VIEW SHARED│
    │ 🎯 Other Pages...                     │
    └───────────────────────────────────────┘
```

---

## 1️⃣ STUDY GROUPS PAGE

**How to Get There:**
```
Click: Sidebar → Study Groups
URL: http://localhost:5173/study-groups
```

**What You See:**
```
┌─────────────────────────────────────────────────────┐
│ Study Groups                                        │
│ Collaborate with classmates...                      │
│                                    [+ New Group]    │  ← PURPLE BUTTON #1
│                                    (top right)      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Search box - "Search groups..."]                  │
│                                                     │
│  Your Groups:                                       │
│  ┌───────────────────────────────────────────────┐  │
│  │ Group Name              [3 members, 5 items]  │  │
│  │ Description...          [View]  [Delete]      │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │ Another Group           [2 members, 0 items]  │  │
│  │ Description...          [View]  [Delete]      │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Buttons Here:**
- 🟣 **[+ New Group]** (purple, top-right) → Opens create modal
- ⚫ **[View]** (gray) → Go to group detail
- 🔴 **[Delete]** (red) → Delete group (owner only)

---

## 2️⃣ GROUP DETAIL PAGE

**How to Get There:**
```
Click: Study Groups → [View] button on any group
URL: http://localhost:5173/study-groups/{groupId}
```

**What You See:**

### TOP SECTION:
```
┌─────────────────────────────────────────────────────┐
│ ← Biology 101 Study Group                           │
│    Group Description Here                           │
│                                                     │
│ Members: 3  |  Materials: 2                         │
│                                                     │
│ [Stats showing member & material count]             │
└─────────────────────────────────────────────────────┘
```

### MEMBERS SECTION:
```
┌─────────────────────────────────────────────────────┐
│ 👥 MEMBERS                                          │
│    [Invite Member] ← PURPLE BUTTON #2 (top-right)  │
├─────────────────────────────────────────────────────┤
│                                                     │
│ • You (Owner)                           [✕ Remove] │
│ • john@email.com (Member)               [✕ Remove] │
│ • jane@email.com (Member)               [✕ Remove] │
│   (remove buttons only show for owner)              │
│                                                     │
└─────────────────────────────────────────────────────┘

Buttons Here:
- 🟣 [Invite Member] → Opens invite modal
- 🔴 [✕ Remove] → Remove member (owner only)
```

### MATERIALS SECTION:
```
┌─────────────────────────────────────────────────────┐
│ 📚 SHARED MATERIALS                                 │
│    [Add Materials] ← BLUE BUTTON #3 (top-right)    │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Flashcard Sets:                                     │
│ • Chapter 3 Vocab                       [🗑 Delete] │
│ • Chapter 4 Formulas                    [🗑 Delete] │
│                                                     │
│ Quiz Sets:                                          │
│ • Practice Quiz 1                       [🗑 Delete] │
│                                                     │
│ (No materials yet if empty)                         │
│                                                     │
└─────────────────────────────────────────────────────┘

Buttons Here:
- 🔵 [Add Materials] → Opens add materials modal
- 🔴 [🗑 Delete] → Remove material (owner only)
```

---

## 3️⃣ INVITE MEMBER MODAL

**Opens When You Click:** [Invite Member] button

**Modal Shows:**
```
┌────────────────────────────────────────────┐
│ Invite Members                         [X] │
├────────────────────────────────────────────┤
│                                            │
│ Email Address                              │
│ [input field]                              │
│ Press Enter to add emails                  │
│                                            │
│ Added Emails (0):                          │
│ (list appears as you add them)             │
│ • john@email.com                       [✕] │
│ • jane@email.com                       [✕] │
│                                            │
│      [Cancel]        [Invite]              │
│     (gray button)    (purple button)       │
│                                            │
└────────────────────────────────────────────┘

How to Use:
1. Type: john@email.com
2. Press ENTER
3. Type: jane@email.com
4. Press ENTER
5. Click [Invite]
6. ✅ Members invited!
```

---

## 4️⃣ ADD MATERIALS MODAL

**Opens When You Click:** [Add Materials] button

**Modal Shows:**
```
┌────────────────────────────────────────────┐
│ Add Materials to Group                 [X] │
├────────────────────────────────────────────┤
│                                            │
│ Set Name *                                 │
│ [Chapter 3 Notes                    ]      │
│                                            │
│ Description (optional)                     │
│ [Important vocabulary              ]       │
│                                            │
│ Material Type:                             │
│ [Flashcards] [Quizzes]                     │
│ (click to select one)                      │
│                                            │
│ Flashcard/Quiz IDs:                        │
│ [Paste ID here + press Enter        ]      │
│                                            │
│ Added IDs (0):                             │
│ • fc_ABC123                            [✕] │
│ • fc_XYZ789                            [✕] │
│                                            │
│      [Cancel]   [Add Materials]            │
│                 (purple button)            │
│                                            │
└────────────────────────────────────────────┘

How to Use:
1. Type Set Name
2. Optional: Add Description
3. Select Type: Flashcards OR Quizzes
4. Paste IDs and press ENTER (repeat for each)
5. Click [Add Materials]
6. ✅ Materials added to group!
```

---

## 5️⃣ LECTURE PAGE - SHARE BUTTON

**How to Get There:**
```
Click: Sidebar → Lectures → Click any lecture
URL: http://localhost:5173/lectures/{lectureId}
```

**What You See:**
```
┌─────────────────────────────────────────────────────┐
│ ← Lecture Title              [Share] Button         │
│    Created May 2026          (PURPLE, top-right)    │  ← BUTTON #4
│                              ⬆ CLICK HERE          │
├─────────────────────────────────────────────────────┤
│                                                     │
│ [Summary Section]                                   │
│ [Flashcards Section]                                │
│ [Quizzes Section]                                   │
│ [Notes Section]                                     │
│                                                     │
└─────────────────────────────────────────────────────┘

Buttons Here:
- 🟣 [Share] → Opens share modal
```

---

## 6️⃣ FLASHCARD REVIEW PAGE - SHARE BUTTON

**How to Get There:**
```
Click: Sidebar → Lectures → Click lecture → [Review]
OR:
Click: Sidebar → Study Groups → Group → Click flashcards
URL: http://localhost:5173/lectures/{lectureId}/review
```

**What You See:**
```
┌─────────────────────────────────────────────────────┐
│ ← [Share] Button  Lecture Flashcards  Card 1 of 50 │
│    (PURPLE, top-right)                              │  ← BUTTON #5
│                                                     │
│              ┌──────────────────────┐               │
│              │   FLASHCARD           │               │
│              │                       │               │
│              │   Front Side          │               │
│              │   (question)          │               │
│              │                       │               │
│              │  [Space to flip]      │               │
│              └──────────────────────┘               │
│                                                     │
│ [Easy] [Hard] [Again] Buttons at bottom             │
│                                                     │
└─────────────────────────────────────────────────────┘

Buttons Here:
- 🟣 [Share] → Opens share modal
- 🟢 [Easy/Hard/Again] → Rate flashcard
```

---

## 7️⃣ QUIZ RESULTS PAGE - SHARE BUTTON

**How to Get There:**
```
Complete a quiz → View results
URL: http://localhost:5173/quiz/results/{quizId}
```

**What You See:**
```
┌─────────────────────────────────────────────────────┐
│ ← [Share] Button        Quiz Results               │
│    (PURPLE, top-right)                              │  ← BUTTON #6
│                                                     │
│ ┌───────────────────────────────────────────────┐   │
│ │ Performance: 85%  [Excellent Trophy Icon]     │   │
│ │ 17 out of 20 questions correct                │   │
│ └───────────────────────────────────────────────┘   │
│                                                     │
│ [Review Answers] [Retake Quiz]                      │
│                                                     │
│ Question Breakdown:                                 │
│ ... (detailed results)                              │
│                                                     │
└─────────────────────────────────────────────────────┘

Buttons Here:
- 🟣 [Share] → Opens share modal
- ⚫ [Review/Retake] → Other actions
```

---

## 8️⃣ SHARE MODAL

**Opens When You Click:** Any [Share] button

**Modal Shows - Tab 1: Public Link**
```
┌────────────────────────────────────────────┐
│ Share "Flashcard Set"                  [X] │
├────────────────────────────────────────────┤
│                                            │
│ [Public Link] [Share with Users]           │  ← TWO TABS
│                                            │
│ PUBLIC LINK TAB (showing):                 │
│                                            │
│ Make Public: [OFF] ← Toggle Switch         │  ← BUTTON #7
│                                            │
│ (When ON, shows:)                          │
│ 📋 Link: https://app.com/shared/...        │
│ [Copy] Button (PURPLE)                     │  ← BUTTON #8
│                                            │
│ Anyone with this link can view             │
│ (no login required)                        │
│                                            │
│           [Close/Done]                     │
│                                            │
└────────────────────────────────────────────┘
```

**Modal Shows - Tab 2: Share with Users**
```
┌────────────────────────────────────────────┐
│ Share "Flashcard Set"                  [X] │
├────────────────────────────────────────────┤
│                                            │
│ [Public Link] [Share with Users]           │  ← CLICK THIS TAB
│                                            │
│ SHARE WITH USERS TAB (showing):            │
│                                            │
│ Search Users:                              │
│ [john@email.com             ]              │  ← BUTTON #9: TYPE HERE
│                                            │
│ Selected Users (not added yet)             │
│ (empty)                                    │
│                                            │
│ [Add User] Button (gray)                   │  ← BUTTON #10
│                                            │
│ OR (if users already shared):              │
│ Shared with: (2 users)                     │
│ • jane@email.com                       [✕] │
│ • bob@email.com                        [✕] │
│                                            │
│           [Close/Done]                     │
│                                            │
└────────────────────────────────────────────┘
```

---

## 9️⃣ SHARED WITH ME PAGE

**How to Get There:**
```
Click: Sidebar → Shared with Me
URL: http://localhost:5173/shared-with-me
```

**What You See:**
```
┌─────────────────────────────────────────────────────┐
│ Shared with Me                                      │
│ View and copy content shared by classmates          │
│                                                     │
│ [Flashcard Sets (2)] [Quiz Sets (1)]                │  ← TWO TABS
│                                                     │
│ FLASHCARD SETS TAB (showing):                       │
│                                                     │
│ ┌───────────────────────────────────────────────┐   │
│ │ Chapter 3 Vocabulary                          │   │
│ │ Shared by: Professor Smith                    │   │
│ │ 50 flashcards                                 │   │
│ │                                               │   │
│ │         [View]  [Copy to Library]             │   │  ← BUTTONS #11 & #12
│ │        (gray)    (purple)                     │   │
│ └───────────────────────────────────────────────┘   │
│                                                     │
│ ┌───────────────────────────────────────────────┐   │
│ │ Biology Chapter 1                             │   │
│ │ Shared by: Study Group                        │   │
│ │ 30 flashcards                                 │   │
│ │                                               │   │
│ │         [View]  [Copy to Library]             │   │
│ └───────────────────────────────────────────────┘   │
│                                                     │
│ QUIZ SETS TAB (similar structure):                  │
│ ... (shows shared quizzes)                          │
│                                                     │
└─────────────────────────────────────────────────────┘

Buttons Here:
- ⚫ [View] → Preview the content
- 🟣 [Copy to Library] → Own a copy
```

---

## 📊 BUTTON LOCATIONS SUMMARY

| # | Button | Location | Color | Action |
|---|--------|----------|-------|--------|
| 1 | [+ New Group] | Study Groups page, top-right | 🟣 Purple | Create group |
| 2 | [Invite Member] | Group detail, Members section | 🟣 Purple | Open invite modal |
| 3 | [Add Materials] | Group detail, Materials section | 🔵 Blue | Open add materials modal |
| 4 | [Share] | Lecture page, top-right header | 🟣 Purple | Open share modal |
| 5 | [Share] | Flashcard review, top-right header | 🟣 Purple | Open share modal |
| 6 | [Share] | Quiz results, top-right header | 🟣 Purple | Open share modal |
| 7 | [OFF/ON] | Share modal, Public Link tab | ⚪ Toggle | Enable public sharing |
| 8 | [Copy] | Share modal, Public Link tab | 🟣 Purple | Copy link to clipboard |
| 9 | Search box | Share modal, Users tab | ⚫ Input | Search for user email |
| 10 | [Add User] | Share modal, Users tab | ⚫ Gray | Add user to share list |
| 11 | [View] | Shared with Me page | ⚫ Gray | Preview shared content |
| 12 | [Copy to Library] | Shared with Me page | 🟣 Purple | Copy to own library |
| 13 | [Remove] | Group members/materials | 🔴 Red | Delete member/material |
| 14 | [Delete] | Group card, Study Groups page | 🔴 Red | Delete group |

---

## 🎯 KEY POINTS TO REMEMBER

```
✅ ALL BUTTONS ARE CLEARLY VISIBLE
✅ BUTTONS ARE COLORED (Purple = Main action, Blue = Secondary, Red = Delete, Gray = View)
✅ BUTTONS HAVE TEXT LABELS
✅ BUTTONS ARE AT THE TOP-RIGHT OF SECTIONS
✅ MODALS ARE SIMPLE AND CLEAR

🔴 OWNER ONLY FEATURES:
   - Invite Member
   - Add Materials
   - Remove Members
   - Remove Materials
   - Delete Group

🟢 ALL MEMBERS CAN:
   - View group
   - View members
   - View materials
   - Study materials
   - Share content (from own pages)

🔵 NON-MEMBERS CAN:
   - Receive shared content (public or targeted)
   - Copy shared content to library
   - See in "Shared with Me" page
```

---

**Go to http://localhost:5173 now and you'll see all these buttons!** 🎯
