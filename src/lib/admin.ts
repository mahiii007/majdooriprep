import { connectDB } from "@/lib/db";
import { Question, IQuestion } from "@/models/Question";
import { Article, IArticle } from "@/models/Article";
import type { Difficulty } from "@/models/Question";

export interface AdminStats {
  totalQuestions: number;
  activeQuestions: number;
  inactiveQuestions: number;
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
}

export interface AdminQuestionListParams {
  search?: string;
  topic?: string;
  difficulty?: Difficulty;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  await connectDB();
  const [
    totalQuestions,
    activeQuestions,
    totalArticles,
    publishedArticles,
  ] = await Promise.all([
    Question.countDocuments({}),
    Question.countDocuments({ isActive: true }),
    Article.countDocuments({}),
    Article.countDocuments({ status: "published" }),
  ]);

  return {
    totalQuestions,
    activeQuestions,
    inactiveQuestions: totalQuestions - activeQuestions,
    totalArticles,
    publishedArticles,
    draftArticles: totalArticles - publishedArticles,
  };
}

export async function adminListTopics(): Promise<string[]> {
  await connectDB();
  const topics = await Question.distinct("topic");
  return topics.sort();
}

export async function adminListQuestions(params: AdminQuestionListParams) {
  await connectDB();
  const { search, topic, difficulty, isActive } = params;
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));

  const filter: any = {};
  if (topic && topic !== "All Topics") {
    filter.topic = topic;
  }
  if (difficulty) {
    filter.difficulty = difficulty;
  }
  if (isActive !== undefined) {
    filter.isActive = isActive;
  }
  if (search && search.trim()) {
    filter.$text = { $search: search.trim() };
  }

  const [total, items] = await Promise.all([
    Question.countDocuments(filter),
    Question.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean<IQuestion[]>(),
  ]);

  return {
    items: items.map((q) => ({
      id: String(q._id),
      slug: q.slug,
      title: q.title,
      topic: q.topic,
      tags: q.tags,
      difficulty: q.difficulty,
      estimateMinutes: q.estimateMinutes,
      isActive: q.isActive,
      createdAt: q.createdAt.toISOString(),
    })),
    total,
    page,
    pageSize,
  };
}

export async function adminListArticles(params: {
  status?: "draft" | "published";
  page?: number;
  pageSize?: number;
}) {
  await connectDB();
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));

  const filter: any = {};
  if (params.status) {
    filter.status = params.status;
  }

  const [total, items] = await Promise.all([
    Article.countDocuments(filter),
    Article.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean<IArticle[]>(),
  ]);

  return {
    items: items.map((a) => ({
      id: String(a._id),
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      content: a.content,
      tags: a.tags,
      status: a.status,
      publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
      createdAt: a.createdAt.toISOString(),
    })),
    total,
    page,
    pageSize,
  };
}

export async function adminGetQuestionBySlug(slug: string) {
  await connectDB();
  const q = await Question.findOne({ slug }).lean<IQuestion | null>();
  if (!q) return null;
  return {
    id: String(q._id),
    slug: q.slug,
    title: q.title,
    topic: q.topic,
    tags: q.tags,
    difficulty: q.difficulty,
    estimateMinutes: q.estimateMinutes,
    description: q.description,
    isActive: q.isActive,
  };
}

export async function adminGetArticleBySlug(slug: string) {
  await connectDB();
  const a = await Article.findOne({ slug }).lean<IArticle | null>();
  if (!a) return null;
  return {
    id: String(a._id),
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    content: a.content,
    tags: a.tags,
    status: a.status,
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
  };
}
