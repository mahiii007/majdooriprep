"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import { UserQuestionState } from "@/models/UserQuestionState";
import { recomputeAssignmentCompletion } from "@/lib/dailyAssignment";
import { todayKey } from "@/lib/date";
import type { QuestionStatus } from "@/types";

/**
 * Marks a question with a new status for the current user.
 *
 * Idempotency / double-submit safety: this is a single upsert keyed on the
 * unique (userId, questionId) index, not an insert — clicking "Mark done"
 * twice in a row (double click, retried request after a flaky network)
 * converges on the same document instead of creating duplicates or
 * incrementing counters twice. `firstDoneAt` is set with $setOnInsert-style
 * logic (only written the first time status becomes "done"), so re-marking
 * an already-done question doesn't shift its streak-contributing date.
 */
export async function markQuestionStatus(questionId: string, status: QuestionStatus) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");

  await connectDB();

  const existing = await UserQuestionState.findOne({ userId, questionId });
  const now = new Date();
  const isFirstDone = status === "done" && !existing?.firstDoneAt;

  const setFields: Record<string, unknown> = { status, lastStatusChangeAt: now };
  if (isFirstDone) setFields.firstDoneAt = now;

  await UserQuestionState.findOneAndUpdate(
    { userId, questionId },
    { $set: setFields, $inc: { attemptsCount: 1 } },
    { upsert: true, new: true }
  );

  // Only today's assignment can possibly flip from incomplete to complete
  // as a result of this change, so we only ever recompute one day — not the
  // user's whole history — keeping this cheap on every status change.
  await recomputeAssignmentCompletion(userId, todayKey());

  revalidatePath("/dashboard");
  revalidatePath("/daily");
  revalidatePath("/questions");
  revalidatePath("/progress");
}

export async function toggleBookmark(questionId: string, bookmarked: boolean) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");

  await connectDB();

  await UserQuestionState.findOneAndUpdate(
    { userId, questionId },
    { $set: { bookmarked } },
    { upsert: true, new: true }
  );

  revalidatePath("/questions");
  revalidatePath("/bookmarks");
  revalidatePath("/daily");
}
