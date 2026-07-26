import { Types } from "mongoose";
import { Question, IQuestion } from "@/models/Question";
import { UserQuestionState } from "@/models/UserQuestionState";
import { computeStreak } from "@/lib/streak";
import { APP_TIMEZONE } from "@/lib/date";
import { toZonedTime } from "date-fns-tz";
import { startOfWeek, subWeeks } from "date-fns";
import type { ProgressSummaryDTO } from "@/types";

// --- rank ladder ----------------------------------------------------------
// The source spec's mock shows a "Current Rank" stat (e.g. "Senior") but the
// requirements never define how rank is derived — there's no separate
// leveling system in scope. Assumption: rank is a simple function of total
// questions solved, good enough for the dashboard stat card without
// introducing a whole leveling/XP subsystem.
const RANK_LADDER: { min: number; label: string }[] = [
  { min: 0, label: "Rookie" },
  { min: 20, label: "Mid-Level" },
  { min: 80, label: "Senior" },
  { min: 200, label: "Staff" },
  { min: 400, label: "Principal" },
];

function rankForSolvedCount(count: number): string {
  let label = RANK_LADDER[0].label;
  for (const rung of RANK_LADDER) {
    if (count >= rung.min) label = rung.label;
  }
  return label;
}

export async function getProgressSummary(userId: Types.ObjectId): Promise<ProgressSummaryDTO> {
  const [totalSolved, totalRevision, totalQuestions, activeQuestions, streaks] =
    await Promise.all([
      UserQuestionState.countDocuments({ userId, status: "done" }),
      UserQuestionState.countDocuments({ userId, status: "revision" }),
      Question.countDocuments({ isActive: true }),
      Question.find({ isActive: true }, { topic: 1, tags: 1 }).lean<
        Pick<IQuestion, "topic" | "tags" | "_id">[]
      >(),
      computeStreak(userId),
    ]);

  const attempted = totalSolved + totalRevision;
  // Accuracy assumption: there's no code-execution/judge in scope, so we
  // can't measure "correct on first try". Instead we use it as a rough
  // mastery-rate proxy: of everything the user has engaged with deeply
  // enough to mark done or flag for revision, what fraction is fully done.
  const accuracyPct = attempted === 0 ? 0 : Math.round((totalSolved / attempted) * 1000) / 10;

  const doneStates = await UserQuestionState.find(
    { userId, status: "done" },
    { questionId: 1, firstDoneAt: 1 }
  ).lean();
  const doneQuestionIds = new Set(doneStates.map((s) => String(s.questionId)));

  // --- topic mastery ---
  const topicTotals = new Map<string, number>();
  const topicDone = new Map<string, number>();
  for (const q of activeQuestions) {
    topicTotals.set(q.topic, (topicTotals.get(q.topic) ?? 0) + 1);
    if (doneQuestionIds.has(String(q._id))) {
      topicDone.set(q.topic, (topicDone.get(q.topic) ?? 0) + 1);
    }
  }
  const topicMastery = Array.from(topicTotals.entries())
    .map(([topic, total]) => {
      const done = topicDone.get(topic) ?? 0;
      return { topic, total, done, pct: Math.round((done / total) * 100) };
    })
    .sort((a, b) => b.total - a.total);

  // --- weak areas (tag-level, see DESIGN.md "Weak areas heuristic") ---
  const tagTotals = new Map<string, number>();
  const tagDone = new Map<string, number>();
  for (const q of activeQuestions) {
    for (const tag of q.tags) {
      tagTotals.set(tag, (tagTotals.get(tag) ?? 0) + 1);
      if (doneQuestionIds.has(String(q._id))) {
        tagDone.set(tag, (tagDone.get(tag) ?? 0) + 1);
      }
    }
  }
  const weakAreas = Array.from(tagTotals.entries())
    .map(([tag, total]) => {
      const done = tagDone.get(tag) ?? 0;
      return { tag, pct: Math.round((done / total) * 100) };
    })
    .filter((t) => t.pct < 100)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 3)
    .map((t) => ({
      tag: t.tag,
      pct: t.pct,
      priority: (t.pct < 25 ? "HIGH PRIORITY" : t.pct < 60 ? "TOPIC SKILL GAP" : "CONCEPT CHECK") as
        | "HIGH PRIORITY"
        | "TOPIC SKILL GAP"
        | "CONCEPT CHECK",
    }));

  // --- weekly counts (last 7 calendar weeks, Mon-start, in APP_TIMEZONE) ---
  const nowZoned = toZonedTime(new Date(), APP_TIMEZONE);
  const currentWeekStart = startOfWeek(nowZoned, { weekStartsOn: 1 });
  const weekStarts = Array.from({ length: 7 }, (_, i) => subWeeks(currentWeekStart, 6 - i));

  const weeklyCounts = weekStarts.map((weekStart, idx) => {
    const weekEnd = subWeeks(weekStart, -1); // start of the following week (exclusive bound)
    const count = doneStates.filter((s) => {
      if (!s.firstDoneAt) return false;
      const zoned = toZonedTime(s.firstDoneAt, APP_TIMEZONE);
      return zoned >= weekStart && zoned < weekEnd;
    }).length;
    return { label: `WK ${idx + 1}`, count };
  });

  return {
    totalSolved,
    totalQuestions,
    accuracyPct,
    currentRank: rankForSolvedCount(totalSolved),
    currentStreak: streaks.currentStreak,
    highestStreak: streaks.highestStreak,
    weeklyCounts,
    topicMastery,
    weakAreas,
  };
}

/** Lightweight stats for the top bar (streak flame + rank badge), so every
 * page in the app shell doesn't pay for the full topic-mastery/weak-areas
 * aggregation just to render the header. */
export async function getHeaderStats(userId: Types.ObjectId) {
  const [totalSolved, { currentStreak }] = await Promise.all([
    UserQuestionState.countDocuments({ userId, status: "done" }),
    computeStreak(userId),
  ]);
  return { totalSolved, currentStreak, rank: rankForSolvedCount(totalSolved) };
}
