// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string | null;
  status: number;
}

// Flashcard Types
export interface Flashcard {
  id: string;
  lectureId: string;
  userId: string;
  front: string;
  back: string;
  nextReview: string;
  reviewCount: number;
  interval: number;
  ease: number;
  lastReviewDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Quiz Types
export interface QuizQuestion {
  id: string;
  quizId: string;
  userId: string;
  question: string;
  options: string[];
  correct: string;
  userAnswer?: string;
  isCorrect: boolean;
  topic?: string;
  createdAt: string;
}

export interface Quiz {
  id: string;
  lectureId: string;
  userId: string;
  score: number;
  total: number;
  takenAt: string;
  createdAt: string;
  questions: QuizQuestion[];
}

// Lecture Types
export interface Lecture {
  id: string;
  courseId: string;
  userId: string;
  title: string;
  fileUrl: string;
  rawText: string;
  summary?: string | null;
  createdAt: string;
  updatedAt: string;
  flashcards?: Flashcard[];
}

// Course Types
export interface Course {
  id: string;
  userId: string;
  title: string;
  description?: string;
  examDate?: string;
  createdAt: string;
  updatedAt: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Analytics Types
export interface Analytics {
  quizzesTaken: number;
  avgScore: number;
  flashcardsDue: number;
  lecturesCompleted: number;
  flashcardStats: {
    totalFlashcards: number;
    dueToday: number;
    dueThisWeek: number;
    dueThisMonth: number;
  };
}

// Study Plan Types
export interface StudyPlan {
  plan: string;
  dailyGoals: string[];
}

// Weak Areas Types
export interface WeakArea {
  topic: string;
  correct: number;
  total: number;
  percentage: number;
}
