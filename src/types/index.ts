// Central type definitions shared between server and client code.
// Kept independent of Mongoose (which is server-only) so client components
// can import these without pulling in DB drivers.

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

// Status lifecycle for a single user's relationship to a single question.
//
// - not_started: default state, no UserQuestionState document is even created
//   until the user interacts with the question (keeps the collection small).
// - in_progress: user opened/started the question but hasn't resolved it.
// - done: user completed the question. This is what counts toward streaks,
//   "Total Solved", and topic mastery.
// - revision: user solved it before but flagged it for spaced review. Counts
//   toward "attempted" but not toward a fresh "done" for streak purposes
//   unless it is later re-marked done.
// - skipped: user explicitly skipped it (e.g. swapped out of a daily set).
export type QuestionStatus =
  | "not_started"
  | "in_progress"
  | "done"
  | "revision"
  | "skipped";

export interface QuestionDTO {
  id: string;
  slug: string;
  title: string;
  topic: string;
  tags: string[];
  difficulty: Difficulty;
  estimateMinutes: number;
  description: string;
  status: QuestionStatus;
  bookmarked: boolean;
}

export interface DailySetDTO {
  date: string; // YYYY-MM-DD in APP_TIMEZONE
  questions: QuestionDTO[];
  completedCount: number;
  totalCount: number;
  allCompleted: boolean;
}

export interface ProgressSummaryDTO {
  totalSolved: number;
  totalQuestions: number;
  accuracyPct: number; // done / (done + revision) among attempted questions
  currentRank: string;
  currentStreak: number;
  highestStreak: number;
  weeklyCounts: { label: string; count: number }[];
  topicMastery: { topic: string; total: number; done: number; pct: number }[];
  weakAreas: {
    tag: string;
    priority: "HIGH PRIORITY" | "TOPIC SKILL GAP" | "CONCEPT CHECK";
    pct: number;
  }[];
}

export interface ArticleDTO {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  publishedAt: string;
}
