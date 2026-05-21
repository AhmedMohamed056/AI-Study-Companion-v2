export interface SchedulingResult {
  nextReview: Date;
  reviewCount: number;
}

const REVIEW_INTERVALS = [
  1, // 1 day
  3, // 3 days
  7, // 7 days
  14, // 14 days
  30, // 30 days
  // After 30 days, repeat every 30 days
];

export function calculateNextReview(reviewCount: number): Date {
  const now = new Date();
  let daysToAdd = 1;

  if (reviewCount < REVIEW_INTERVALS.length) {
    daysToAdd = REVIEW_INTERVALS[reviewCount];
  } else {
    // After reaching the end, repeat 30-day interval
    daysToAdd = 30;
  }

  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + daysToAdd);

  return nextReview;
}

export function getFlashcardsDue(flashcards: any[]): any[] {
  const now = new Date();
  return flashcards.filter((card) => new Date(card.nextReview) <= now);
}

export function calculateSchedulingStats(flashcards: any[]): {
  totalFlashcards: number;
  dueToday: number;
  dueThisWeek: number;
  dueThisMonth: number;
} {
  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return {
    totalFlashcards: flashcards.length,
    dueToday: flashcards.filter((card) => new Date(card.nextReview) <= now).length,
    dueThisWeek: flashcards.filter(
      (card) => new Date(card.nextReview) <= oneWeekFromNow && new Date(card.nextReview) > now
    ).length,
    dueThisMonth: flashcards.filter(
      (card) => new Date(card.nextReview) <= oneMonthFromNow && new Date(card.nextReview) > oneWeekFromNow
    ).length,
  };
}
