import { Types, FilterQuery } from "mongoose";
import { Question, IQuestion, Difficulty } from "@/models/Question";
import { UserQuestionState, IUserQuestionState } from "@/models/UserQuestionState";
import type { QuestionDTO, QuestionStatus } from "@/types";

export function toQuestionDTO(
  q: Pick<IQuestion, "_id" | "slug" | "title" | "topic" | "tags" | "difficulty" | "estimateMinutes" | "description">,
  state?: Pick<IUserQuestionState, "status" | "bookmarked"> | null
): QuestionDTO {
  return {
    id: String(q._id),
    slug: q.slug,
    title: q.title,
    topic: q.topic,
    tags: q.tags,
    difficulty: q.difficulty,
    estimateMinutes: q.estimateMinutes,
    description: q.description,
    status: (state?.status as QuestionStatus) ?? "not_started",
    bookmarked: state?.bookmarked ?? false,
  };
}

export interface ListQuestionsParams {
  userId: Types.ObjectId;
  topic?: string;
  difficulty?: Difficulty;
  status?: QuestionStatus | "attempted";
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ListQuestionsResult {
  items: QuestionDTO[];
  total: number;
  page: number;
  pageSize: number;
}

/** Distinct topics for the filter pills — computed from the live question
 * bank rather than hardcoded so a newly-seeded topic shows up automatically. */
export async function listTopics(): Promise<string[]> {
  const topics = await Question.distinct("topic", { isActive: true });
  return topics.sort();
}

export async function listQuestions(params: ListQuestionsParams): Promise<ListQuestionsResult> {
  const { userId, topic, difficulty, status, search } = params;
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 20));

  const filter: FilterQuery<IQuestion> = { isActive: true };
  if (topic && topic !== "All Topics") filter.topic = topic;
  if (difficulty) filter.difficulty = difficulty;
  if (search && search.trim()) {
    filter.$text = { $search: search.trim() };
  }

  // Status filters need the per-user state, so when one is active we first
  // resolve the matching questionIds from UserQuestionState, then intersect.
  if (status) {
    const statusFilter =
      status === "attempted" ? { $in: ["done", "revision", "in_progress"] } : status;
    const stateMatches = await UserQuestionState.find(
      { userId, status: statusFilter },
      { questionId: 1 }
    ).lean();
    filter._id = { $in: stateMatches.map((s) => s.questionId) };
  }

  const [total, questions] = await Promise.all([
    Question.countDocuments(filter),
    Question.find(filter)
      .sort({ createdAt: 1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean<IQuestion[]>(),
  ]);

  const states = await UserQuestionState.find(
    { userId, questionId: { $in: questions.map((q) => q._id) } }
  ).lean<IUserQuestionState[]>();
  const stateByQuestionId = new Map(states.map((s) => [String(s.questionId), s]));

  const items = questions.map((q) => toQuestionDTO(q, stateByQuestionId.get(String(q._id))));

  return { items, total, page, pageSize };
}

export async function getQuestionBySlug(
  userId: Types.ObjectId,
  slug: string
): Promise<QuestionDTO | null> {
  const question = await Question.findOne({ slug, isActive: true }).lean<IQuestion | null>();
  if (!question) return null;
  const state = await UserQuestionState.findOne({ userId, questionId: question._id }).lean<
    IUserQuestionState | null
  >();
  return toQuestionDTO(question, state);
}

export async function listBookmarkedQuestions(userId: Types.ObjectId): Promise<QuestionDTO[]> {
  const states = await UserQuestionState.find({ userId, bookmarked: true })
    .sort({ updatedAt: -1 })
    .lean<IUserQuestionState[]>();
  if (states.length === 0) return [];

  const questions = await Question.find({
    _id: { $in: states.map((s) => s.questionId) },
    isActive: true,
  }).lean<IQuestion[]>();
  const questionById = new Map(questions.map((q) => [String(q._id), q]));

  // Preserve most-recently-bookmarked-first order from the state query above.
  return states
    .map((s) => {
      const q = questionById.get(String(s.questionId));
      return q ? toQuestionDTO(q, s) : null;
    })
    .filter((q): q is QuestionDTO => q !== null);
}

/** Powers the "Pick Random" button — biased toward questions the user
 * hasn't solved yet, falling back to the full active pool if everything's
 * already done. */
export async function pickRandomQuestionSlug(userId: Types.ObjectId): Promise<string | null> {
  const doneIds = (
    await UserQuestionState.find({ userId, status: "done" }, { questionId: 1 }).lean()
  ).map((s) => s.questionId);

  const preferred = await Question.aggregate<{ slug: string }>([
    { $match: { isActive: true, _id: { $nin: doneIds } } },
    { $sample: { size: 1 } },
    { $project: { slug: 1, _id: 0 } },
  ]);
  if (preferred[0]) return preferred[0].slug;

  const fallback = await Question.aggregate<{ slug: string }>([
    { $match: { isActive: true } },
    { $sample: { size: 1 } },
    { $project: { slug: 1, _id: 0 } },
  ]);
  return fallback[0]?.slug ?? null;
}
