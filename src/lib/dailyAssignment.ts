import { Types } from "mongoose";
import { DailyAssignment, IDailyAssignment } from "@/models/DailyAssignment";
import { Question, IQuestion } from "@/models/Question";
import { UserQuestionState } from "@/models/UserQuestionState";
import { todayKey } from "@/lib/date";

/** How many days back a question is excluded from re-selection, when the
 * active pool is large enough to honor that. Keeps the daily set varied
 * instead of repeating the same problems every few days. */
const VARIETY_WINDOW_DAYS = 14;

/** Read once per call so an env change (or test override) takes effect
 * without a redeploy of code, only a config/env change — per the
 * requirement that the daily count is "configurable". */
export function getDailyQuestionCount(): number {
  const n = Number(process.env.DAILY_QUESTION_COUNT);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 5;
}

// --- deterministic seeded RNG -------------------------------------------
// Selection is seeded from (userId, date) so that, independent of the
// DailyAssignment persistence layer, re-running the algorithm for the same
// user+day always proposes the same candidate order. Persistence (the
// unique index + upsert below) is what actually pins the set across
// requests; the seed is a defense-in-depth second layer against
// re-randomization.
function hashSeed(input: string): number {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Pick `count` questions from `pool`, spreading picks across topics with a
 * round-robin instead of pure random so a 5-question set doesn't land on
 * "5x JavaScript" by chance. */
function pickBalanced(pool: IQuestion[], count: number, rng: () => number): Types.ObjectId[] {
  const byTopic = new Map<string, IQuestion[]>();
  for (const q of pool) {
    const list = byTopic.get(q.topic) ?? [];
    list.push(q);
    byTopic.set(q.topic, list);
  }
  const topicQueues = Array.from(byTopic.values()).map((list) => seededShuffle(list, rng));
  const topicOrder = seededShuffle([...topicQueues.keys()], rng);

  const picked: Types.ObjectId[] = [];
  let guard = 0;
  while (picked.length < count && guard < 10_000) {
    guard += 1;
    let madeProgress = false;
    for (const topicIdx of topicOrder) {
      if (picked.length >= count) break;
      const queue = topicQueues[topicIdx];
      const next = queue.shift();
      if (next) {
        picked.push(next._id as Types.ObjectId);
        madeProgress = true;
      }
    }
    if (!madeProgress) break; // pool exhausted
  }
  return picked;
}

async function selectQuestionIds(
  userId: Types.ObjectId,
  count: number
): Promise<Types.ObjectId[]> {
  const allActive = await Question.find({ isActive: true }).lean<IQuestion[]>();
  if (allActive.length === 0) return [];

  const doneQuestionIds = new Set(
    (
      await UserQuestionState.find({ userId, status: "done" }, { questionId: 1 }).lean()
    ).map((s) => String(s.questionId))
  );

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - VARIETY_WINDOW_DAYS);
  const recentAssignments = await DailyAssignment.find(
    { userId, createdAt: { $gte: cutoff } },
    { questionIds: 1 }
  ).lean();
  const recentlySeenIds = new Set(
    recentAssignments.flatMap((a) => a.questionIds.map((id) => String(id)))
  );

  // Preference order, each a progressively looser pool so a small question
  // bank never fails to fill the daily set:
  //   1) never done AND not seen recently (freshest, most useful)
  //   2) never done (repeats OK, but still something the user hasn't solved)
  //   3) anything active (last resort, e.g. bank smaller than daily count)
  const tier1 = allActive.filter(
    (q) => !doneQuestionIds.has(String(q._id)) && !recentlySeenIds.has(String(q._id))
  );
  const tier2 = allActive.filter((q) => !doneQuestionIds.has(String(q._id)));

  const rng = mulberry32(hashSeed(`${userId.toString()}:${todayKey()}`));

  const picked: Types.ObjectId[] = [];
  const usedIds = new Set<string>();

  for (const pool of [tier1, tier2, allActive]) {
    if (picked.length >= count) break;
    const remaining = pool.filter((q) => !usedIds.has(String(q._id)));
    const need = count - picked.length;
    const chosen = pickBalanced(remaining, need, rng);
    for (const id of chosen) {
      usedIds.add(String(id));
      picked.push(id);
    }
  }

  return picked.slice(0, count);
}

/**
 * Returns today's DailyAssignment for a user, creating it on first access.
 * Concurrency-safe: two simultaneous requests (e.g. two open tabs) both
 * compute a candidate set, but only one insert wins because of the unique
 * (userId, date) index — the loser's upsert resolves to the winner's
 * document instead of throwing or creating a duplicate.
 */
export async function getOrCreateDailyAssignment(
  userId: Types.ObjectId
): Promise<IDailyAssignment> {
  const date = todayKey();

  const existing = await DailyAssignment.findOne({ userId, date });
  if (existing) return existing;

  const count = getDailyQuestionCount();
  const questionIds = await selectQuestionIds(userId, count);

  try {
    const doc = await DailyAssignment.findOneAndUpdate(
      { userId, date },
      { $setOnInsert: { userId, date, questionIds, allCompleted: false, allCompletedAt: null } },
      { upsert: true, new: true }
    );
    return doc!;
  } catch (err: unknown) {
    // Duplicate key race: another request won the upsert first. Read its result.
    const isDupKey =
      typeof err === "object" && err !== null && "code" in err && (err as { code?: number }).code === 11000;
    if (isDupKey) {
      const winner = await DailyAssignment.findOne({ userId, date });
      if (winner) return winner;
    }
    throw err;
  }
}

/**
 * Recomputes whether a given day's assignment is fully completed and
 * persists the denormalized flag. Idempotent — safe to call after every
 * status change even if it ends up writing the same value.
 */
export async function recomputeAssignmentCompletion(
  userId: Types.ObjectId,
  date: string
): Promise<void> {
  const assignment = await DailyAssignment.findOne({ userId, date });
  if (!assignment || assignment.questionIds.length === 0) return;

  const doneCount = await UserQuestionState.countDocuments({
    userId,
    questionId: { $in: assignment.questionIds },
    status: "done",
  });

  const allCompleted = doneCount === assignment.questionIds.length;
  if (allCompleted === assignment.allCompleted) return; // no-op, avoid extra write

  assignment.allCompleted = allCompleted;
  assignment.allCompletedAt = allCompleted ? new Date() : null;
  await assignment.save();
}
