import { DailyAssignment } from "@/models/DailyAssignment";
import { previousDayKey, todayKey } from "@/lib/date";
import { Types } from "mongoose";

export interface StreakResult {
  currentStreak: number;
  highestStreak: number;
}

/**
 * Streak is derived entirely from DailyAssignment.allCompleted records, never
 * from UI state or a separately-incremented counter. This keeps it
 * recomputable/auditable: if a bug corrupts a counter, replaying the
 * DailyAssignment history reproduces the correct streak.
 *
 * Rules:
 * - A day counts toward the streak only if a DailyAssignment existed for
 *   that day AND every question in it was marked "done".
 * - "Current streak" walks backward from today. If today isn't complete yet,
 *   that's not a break — the walk just starts from yesterday instead, so a
 *   user mid-way through today's set doesn't see their streak zeroed before
 *   the day is even over.
 * - If yesterday is also missing/incomplete, the streak is 0 (a real gap).
 * - "Highest streak" scans the full history for the longest run of
 *   consecutive completed calendar days, independent of where "today" is.
 */
export async function computeStreak(userId: Types.ObjectId | string): Promise<StreakResult> {
  const completedDocs = await DailyAssignment.find(
    { userId, allCompleted: true },
    { date: 1, _id: 0 }
  )
    .sort({ date: 1 })
    .lean();

  const completedDates = completedDocs.map((d) => d.date);
  if (completedDates.length === 0) {
    return { currentStreak: 0, highestStreak: 0 };
  }

  const completedSet = new Set(completedDates);

  // --- current streak ---
  let cursor = todayKey();
  if (!completedSet.has(cursor)) {
    cursor = previousDayKey(cursor);
  }
  let currentStreak = 0;
  while (completedSet.has(cursor)) {
    currentStreak += 1;
    cursor = previousDayKey(cursor);
  }

  // --- highest streak: longest run of consecutive days in sorted history ---
  let highestStreak = 1;
  let run = 1;
  for (let i = 1; i < completedDates.length; i++) {
    const prevKey = previousDayKey(completedDates[i]);
    if (prevKey === completedDates[i - 1]) {
      run += 1;
    } else {
      run = 1;
    }
    highestStreak = Math.max(highestStreak, run);
  }
  highestStreak = Math.max(highestStreak, currentStreak);

  return { currentStreak, highestStreak };
}
