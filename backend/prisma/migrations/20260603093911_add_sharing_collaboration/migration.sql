-- AlterTable
ALTER TABLE "flashcards" ADD COLUMN "sourceLectureTitle" TEXT,
ADD COLUMN "sourceCreatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN "sourceLectureTitle" TEXT,
ADD COLUMN "sourceCreatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "study_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_group_members" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_flashcard_sets" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdBy" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "shareToken" TEXT NOT NULL,
    "groupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shared_flashcard_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_flashcard_set_items" (
    "id" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "flashcardId" TEXT NOT NULL,

    CONSTRAINT "shared_flashcard_set_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_quiz_sets" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdBy" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "shareToken" TEXT NOT NULL,
    "groupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shared_quiz_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_quiz_set_items" (
    "id" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,

    CONSTRAINT "shared_quiz_set_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_with" (
    "id" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shared_with_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_quiz_with" (
    "id" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shared_quiz_with_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "flashcardId" TEXT,
    "quizId" TEXT,
    "sharedFlashcardSetId" TEXT,
    "sharedQuizSetId" TEXT,
    "studyGroupId" TEXT,
    "parentCommentId" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "study_group_members_groupId_userId_key" ON "study_group_members"("groupId", "userId");

-- CreateIndex
CREATE INDEX "study_group_members_groupId_idx" ON "study_group_members"("groupId");

-- CreateIndex
CREATE INDEX "study_group_members_userId_idx" ON "study_group_members"("userId");

-- CreateIndex
CREATE INDEX "study_groups_createdBy_idx" ON "study_groups"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "shared_flashcard_sets_shareToken_key" ON "shared_flashcard_sets"("shareToken");

-- CreateIndex
CREATE INDEX "shared_flashcard_sets_createdBy_idx" ON "shared_flashcard_sets"("createdBy");

-- CreateIndex
CREATE INDEX "shared_flashcard_sets_groupId_idx" ON "shared_flashcard_sets"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "shared_flashcard_set_items_setId_flashcardId_key" ON "shared_flashcard_set_items"("setId", "flashcardId");

-- CreateIndex
CREATE INDEX "shared_flashcard_set_items_setId_idx" ON "shared_flashcard_set_items"("setId");

-- CreateIndex
CREATE INDEX "shared_flashcard_set_items_flashcardId_idx" ON "shared_flashcard_set_items"("flashcardId");

-- CreateIndex
CREATE UNIQUE INDEX "shared_quiz_sets_shareToken_key" ON "shared_quiz_sets"("shareToken");

-- CreateIndex
CREATE INDEX "shared_quiz_sets_createdBy_idx" ON "shared_quiz_sets"("createdBy");

-- CreateIndex
CREATE INDEX "shared_quiz_sets_groupId_idx" ON "shared_quiz_sets"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "shared_quiz_set_items_setId_quizId_key" ON "shared_quiz_set_items"("setId", "quizId");

-- CreateIndex
CREATE INDEX "shared_quiz_set_items_setId_idx" ON "shared_quiz_set_items"("setId");

-- CreateIndex
CREATE INDEX "shared_quiz_set_items_quizId_idx" ON "shared_quiz_set_items"("quizId");

-- CreateIndex
CREATE UNIQUE INDEX "shared_with_setId_userId_key" ON "shared_with"("setId", "userId");

-- CreateIndex
CREATE INDEX "shared_with_setId_idx" ON "shared_with"("setId");

-- CreateIndex
CREATE INDEX "shared_with_userId_idx" ON "shared_with"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "shared_quiz_with_setId_userId_key" ON "shared_quiz_with"("setId", "userId");

-- CreateIndex
CREATE INDEX "shared_quiz_with_setId_idx" ON "shared_quiz_with"("setId");

-- CreateIndex
CREATE INDEX "shared_quiz_with_userId_idx" ON "shared_quiz_with"("userId");

-- CreateIndex
CREATE INDEX "comments_authorId_idx" ON "comments"("authorId");

-- CreateIndex
CREATE INDEX "comments_flashcardId_idx" ON "comments"("flashcardId");

-- CreateIndex
CREATE INDEX "comments_quizId_idx" ON "comments"("quizId");

-- CreateIndex
CREATE INDEX "comments_sharedFlashcardSetId_idx" ON "comments"("sharedFlashcardSetId");

-- CreateIndex
CREATE INDEX "comments_sharedQuizSetId_idx" ON "comments"("sharedQuizSetId");

-- CreateIndex
CREATE INDEX "comments_studyGroupId_idx" ON "comments"("studyGroupId");

-- CreateIndex
CREATE INDEX "comments_parentCommentId_idx" ON "comments"("parentCommentId");

-- AddForeignKey
ALTER TABLE "study_groups" ADD CONSTRAINT "study_groups_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_group_members" ADD CONSTRAINT "study_group_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "study_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_group_members" ADD CONSTRAINT "study_group_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_flashcard_sets" ADD CONSTRAINT "shared_flashcard_sets_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_flashcard_sets" ADD CONSTRAINT "shared_flashcard_sets_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "study_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_flashcard_set_items" ADD CONSTRAINT "shared_flashcard_set_items_setId_fkey" FOREIGN KEY ("setId") REFERENCES "shared_flashcard_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_flashcard_set_items" ADD CONSTRAINT "shared_flashcard_set_items_flashcardId_fkey" FOREIGN KEY ("flashcardId") REFERENCES "flashcards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_quiz_sets" ADD CONSTRAINT "shared_quiz_sets_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_quiz_sets" ADD CONSTRAINT "shared_quiz_sets_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "study_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_quiz_set_items" ADD CONSTRAINT "shared_quiz_set_items_setId_fkey" FOREIGN KEY ("setId") REFERENCES "shared_quiz_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_quiz_set_items" ADD CONSTRAINT "shared_quiz_set_items_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_with" ADD CONSTRAINT "shared_with_setId_fkey" FOREIGN KEY ("setId") REFERENCES "shared_flashcard_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_with" ADD CONSTRAINT "shared_with_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_quiz_with" ADD CONSTRAINT "shared_quiz_with_setId_fkey" FOREIGN KEY ("setId") REFERENCES "shared_quiz_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_quiz_with" ADD CONSTRAINT "shared_quiz_with_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_flashcardId_fkey" FOREIGN KEY ("flashcardId") REFERENCES "flashcards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_sharedFlashcardSetId_fkey" FOREIGN KEY ("sharedFlashcardSetId") REFERENCES "shared_flashcard_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_sharedQuizSetId_fkey" FOREIGN KEY ("sharedQuizSetId") REFERENCES "shared_quiz_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_studyGroupId_fkey" FOREIGN KEY ("studyGroupId") REFERENCES "study_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
