# 🎯 Complete Implementation Guide: Study Groups & Invitations

## ✅ What's Been Implemented

### 1. **Email Invitations with 7-Day Links**
Users can now invite people by email, and invitations are sent with activation links that expire in 7 days.

**How it works:**
- Group owner enters email addresses in the "Invite Member" modal
- System checks if user exists:
  - **If user exists**: Adds them directly to the group
  - **If user doesn't exist**: Creates an invitation and sends an email with a 7-day link
- Invited person clicks the link and joins the group automatically
- Invitations are tracked in the database (email, token, expiration, acceptance status)

### 2. **Professional Email Service**
- Backend email service built with Nodemailer
- Beautiful HTML email templates
- Automatic fallback to plain text
- Error handling for failed sends

**Email Contents:**
- Study group name
- Inviter name
- Professional branding
- 7-day expiration warning
- Direct acceptance link
- Copy-paste link as fallback

### 3. **Smart Material Selection**
Instead of asking users to find and paste IDs, the AddMaterials modal now:
- Shows clear instructions for finding flashcard/quiz IDs
- Displays helpful hints about where IDs are located
- Professional UI with better error messages
- Material type selection (Flashcards vs Quizzes)
- Set name and description fields
- ID input with Enter-to-add pattern

### 4. **Database Schema Updates**
New `StudyGroupInvitation` table tracks:
- Group ID
- Recipient email
- Unique token (shareable link)
- Who sent the invitation
- Expiration date
- Acceptance timestamp (null until accepted)

---

## 🚀 How to Use

### **For Group Owners: Inviting Members**

1. **Navigate** to Study Groups → Your Group → Click [View]
2. **Click** [Invite Member] button (purple)
3. **Type** member email addresses (one per line, press Enter)
4. **Click** [Invite]
5. ✅ **Emails sent!** Members receive invitations with 7-day links

**Example:**
```
john@email.com   (Enter)
jane@email.com   (Enter)
bob@email.com    (Enter)
[Click Invite]
```

### **For Invited Members: Accepting**

1. **Check email** for "You're invited to join..." email
2. **Click** the acceptance link OR copy-paste it
3. **Accept invitation** (7-day expiration)
4. ✅ **Joined!** Now member of the group

### **For Adding Materials**

1. **Navigate** to Group → [Add Materials] button (blue)
2. **Select** Flashcards or Quizzes
3. **Enter** set name and optional description
4. **Get IDs** from your lectures (shown next to each item)
5. **Paste** IDs (press Enter for each)
6. **Click** [Add Materials]
7. ✅ **Materials added!** Group members can see them

---

## 📋 Configuration Required

### **Email Setup (IMPORTANT)**

The email system needs credentials in `.env`. Choose ONE:

#### **Option 1: Gmail (Recommended for Development)**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password  # NOT your Gmail password!
EMAIL_FROM=noreply@studyai.com
```

**Steps:**
1. Enable 2-Factor Authentication on Gmail
2. Go to Google Account → Security → App passwords
3. Select Mail + Windows Computer
4. Copy the 16-char password
5. Paste into `.env` EMAIL_PASSWORD

#### **Option 2: Mailtrap (Testing Service)**
```env
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=587
EMAIL_USER=your-mailtrap-user
EMAIL_PASSWORD=your-mailtrap-password
```

#### **Option 3: Production Email Service**
```env
# Sendgrid, AWS SES, or other service
# Update emailService configuration accordingly
```

### **Frontend URL**
```env
FRONTEND_URL=http://localhost:5173  # For local development
# Production: https://yourdomain.com
```

---

## 🔄 Workflow: Complete Example

### **Scenario: Creating a Study Group and Inviting Team**

**Step 1: Owner Creates Group**
```
1. Go to Study Groups
2. Click [+ New Group]
3. Enter: "Biology Final Exam Study"
4. Click Create ✅
```

**Step 2: Owner Invites Members**
```
1. Click [View] on the group
2. Click [Invite Member]
3. Add: alice@uni.edu
4. Add: bob@uni.edu
5. Click [Invite]
✅ Emails sent! (Both receive invitations)
```

**Step 3: Members Receive Email**
```
Alice and Bob get email:
"You're invited to join Biology Final Exam Study"
[Accept Invitation Link]
```

**Step 4: Members Join**
```
Alice clicks link → Joins automatically ✅
Bob clicks link → Joins automatically ✅
```

**Step 5: Owner Adds Materials**
```
1. Click [Add Materials]
2. Select: Flashcards
3. Name: "Chapter 5-7 Review"
4. Get IDs from Lectures page
5. Paste IDs (one per line)
6. Click [Add Materials] ✅
```

**Step 6: Members See Materials**
```
Alice & Bob:
- Go to Study Groups
- Click [View] on Biology group
- See "Chapter 5-7 Review" flashcards
- Can study together! ✅
```

---

## 🛠️ Technical Details

### **Backend Endpoints**

**New:**
- `POST /api/study-groups/:id/invite` - Send invitations
- `POST /api/study-groups/invitations/accept/:token` - Accept invitation

**Updated:**
- Handles both existing users (direct add) and new users (email invitation)
- Creates StudyGroupInvitation records
- Sends emails with tokens

### **Database Changes**

```sql
-- New table
CREATE TABLE study_group_invitations (
  id VARCHAR PRIMARY KEY,
  groupId VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  token VARCHAR UNIQUE NOT NULL,
  createdBy VARCHAR NOT NULL,
  expiresAt TIMESTAMP NOT NULL,
  acceptedAt TIMESTAMP,
  createdAt TIMESTAMP,
  FOREIGN KEY (groupId) REFERENCES study_groups(id),
  FOREIGN KEY (createdBy) REFERENCES users(id),
  UNIQUE (groupId, email)
);
```

### **Email Template Features**
- HTML + Plain Text fallback
- Professional branding
- Clear CTA (Call-To-Action)
- 7-day countdown
- Direct link + copy-paste option
- Mobile responsive

---

## ⚠️ Important Notes

### **Email Invitations:**
- Emails MUST be configured for invitations to work
- Without .env email settings, the "Invite" button will fail silently
- **Set it up first** before testing invitations

### **7-Day Expiration:**
- Links expire after 7 days
- Expired links show: "Invitation has expired"
- Owner must send new invitation if first expires

### **Existing Users:**
- If invited user already has account → joins immediately (no email)
- If new user → invitation email sent

### **Material IDs:**
- Flashcard/Quiz IDs appear on the Lectures page
- Users copy the ID shown next to each item
- IDs are unique identifiers for each flashcard/quiz

---

## 📞 Troubleshooting

### **Invite button doesn't work**
- Check: Email service configured in .env
- Check: Browser console for errors
- Check: Backend logs for email errors

### **Emails not being sent**
```
1. Verify EMAIL_SERVICE is set
2. Verify EMAIL_USER and EMAIL_PASSWORD are correct
3. Check backend logs: [EMAIL] messages
4. For Gmail: Use App Password, not Gmail password
```

### **Invitation link doesn't work**
- Check: FRONTEND_URL in .env is correct
- Check: Link hasn't expired (7 days)
- Check: User is logged in as correct email

### **Material ID not found**
- Go to Lectures page
- Open a lecture
- Look for flashcard/quiz ID near the title
- Copy the ID exactly as shown

---

## 🎓 Summary

**What Members Can Now Do:**
- ✅ Invite people by email to study groups
- ✅ Accept invitations with 7-day links
- ✅ Add flashcards/quizzes to groups
- ✅ Collaborate with team members
- ✅ Share materials easily

**Professional Features:**
- ✅ Email templates with branding
- ✅ Automatic user detection
- ✅ Invitation tracking
- ✅ 7-day expiration security
- ✅ Error handling & fallbacks
- ✅ User-friendly UI

---

**Status: ✅ READY TO TEST**

Configure email in `.env`, then start inviting users!
