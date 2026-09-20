"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import { User } from "@/models/User";
import { Question } from "@/models/Question";
import { Article } from "@/models/Article";
import { z } from "zod";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

async function verifyAdmin() {
  const userId = await getSessionUserId();
  if (!userId) {
    throw new Error("Unauthorized: Not logged in");
  }
  await connectDB();
  const user = await User.findById(userId, { role: 1 }).lean();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: Admin privilege required");
  }
}

import { getCategoryLabel } from "@/lib/categories";

function deriveTopic(category?: string, topic?: string): string {
  if (topic && topic.trim()) return topic.trim();
  if (category && category.trim()) {
    const label = getCategoryLabel(category.trim());
    if (label && label !== category.trim()) return label;
    return category
      .trim()
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return "General";
}

function deriveCategory(category?: string, topic?: string): string {
  if (category && category.trim()) return slugify(category.trim());
  if (topic && topic.trim()) return slugify(topic.trim());
  return "general";
}

const codeSnippetSchema = z.object({
  language: z.string().default("javascript"),
  code: z.string(),
});

const questionSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    slug: z.string().optional(),
    topic: z.string().optional(),
    category: z.string().optional(),
    subCategory: z.string().optional(),
    tags: z.array(z.string()).default([]),
    difficulty: z.preprocess((val) => {
      if (typeof val === "string") {
        const u = val.trim().toUpperCase();
        if (u === "EASY" || u === "MEDIUM" || u === "HARD") return u;
      }
      return val;
    }, z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM")),
    estimateMinutes: z.preprocess(
      (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
      z.number().min(0).optional()
    ),
    description: z.string().optional(),
    questionBody: z.string().optional(),
    solutionBody: z.string().optional(),
    codeSnippets: z.array(codeSnippetSchema).optional().default([]),
    sourcePath: z.string().optional(),
    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => Boolean((data.category && data.category.trim()) || (data.topic && data.topic.trim())),
    {
      message: "Either 'category' or 'topic' is required",
      path: ["category"],
    }
  )
  .refine(
    (data) => Boolean((data.description && data.description.trim()) || (data.questionBody && data.questionBody.trim())),
    {
      message: "Either 'description' or 'questionBody' is required",
      path: ["description"],
    }
  );

const articleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  excerpt: z.string().min(1, "Excerpt is required"),
  content: z.string().min(1, "Content is required"),
  tags: z.array(z.string()).default([]),
  status: z.enum(["draft", "published"]).default("published"),
});

export type QuestionInput = z.input<typeof questionSchema>;
export type ArticleInput = z.input<typeof articleSchema>;

function buildQuestionDoc(data: z.infer<typeof questionSchema>) {
  const finalSlug = data.slug && data.slug.trim() ? slugify(data.slug) : slugify(data.title);
  const category = deriveCategory(data.category, data.topic);
  const topic = deriveTopic(data.category, data.topic);
  const subCategory = data.subCategory && data.subCategory.trim() ? data.subCategory.trim() : "miscellaneous";
  const description =
    data.description && data.description.trim()
      ? data.description.trim()
      : data.questionBody
      ? data.questionBody.slice(0, 300).trim()
      : data.title;
  const questionBody = data.questionBody ?? data.description ?? "";
  const solutionBody = data.solutionBody ?? "";
  const codeSnippets = Array.isArray(data.codeSnippets) ? data.codeSnippets : [];

  const doc: Record<string, any> = {
    title: data.title.trim(),
    slug: finalSlug,
    topic,
    category,
    subCategory,
    tags: data.tags.map((t) => t.trim().toLowerCase()).filter(Boolean),
    difficulty: data.difficulty,
    description,
    questionBody,
    solutionBody,
    codeSnippets,
    isActive: data.isActive,
  };

  if (data.sourcePath) {
    doc.sourcePath = data.sourcePath;
  }
  if (data.estimateMinutes != null && !isNaN(data.estimateMinutes)) {
    doc.estimateMinutes = data.estimateMinutes;
  }

  return { finalSlug, doc };
}

export async function upsertQuestion(rawData: QuestionInput) {
  await verifyAdmin();
  const data = questionSchema.parse(rawData);
  const { finalSlug, doc } = buildQuestionDoc(data);

  if (data.id) {
    await Question.findByIdAndUpdate(data.id, { $set: doc });
  } else {
    // Check slug collision
    const existing = await Question.findOne({ slug: finalSlug });
    if (existing) {
      throw new Error(`A question with slug "${finalSlug}" already exists.`);
    }
    await Question.create(doc);
  }

  revalidatePath("/dashboard");
  revalidatePath("/questions");
  revalidatePath(`/questions/${finalSlug}`);
  revalidatePath("/admin/questions");
}

export async function toggleQuestionActive(id: string, isActive: boolean) {
  await verifyAdmin();
  const q = await Question.findByIdAndUpdate(id, { $set: { isActive } }, { new: true });
  if (q) {
    revalidatePath("/dashboard");
    revalidatePath("/questions");
    revalidatePath(`/questions/${q.slug}`);
    revalidatePath("/admin/questions");
  }
}

export async function upsertArticle(rawData: ArticleInput) {
  await verifyAdmin();
  const data = articleSchema.parse(rawData);

  const finalSlug = data.slug && data.slug.trim() ? slugify(data.slug) : slugify(data.title);

  const publishedAt = data.status === "published" ? new Date() : null;

  const updateFields: any = {
    title: data.title,
    slug: finalSlug,
    excerpt: data.excerpt,
    content: data.content,
    tags: data.tags.map((t: string) => t.trim()).filter(Boolean),
    status: data.status,
  };

  if (data.id) {
    const existing = await Article.findById(data.id);
    if (!existing) throw new Error("Article not found");
    
    // Only update publishedAt if it is changing from draft to published, or is published and not yet set
    if (data.status === "published" && !existing.publishedAt) {
      updateFields.publishedAt = publishedAt;
    } else if (data.status === "draft") {
      updateFields.publishedAt = null;
    }
    
    await Article.findByIdAndUpdate(data.id, { $set: updateFields });
  } else {
    // Check slug collision
    const existing = await Article.findOne({ slug: finalSlug });
    if (existing) {
      throw new Error(`An article with slug "${finalSlug}" already exists.`);
    }
    await Article.create({
      ...updateFields,
      publishedAt,
    });
  }

  revalidatePath("/articles");
  revalidatePath(`/articles/${finalSlug}`);
  revalidatePath("/admin/articles");
}

export async function bulkUpsertQuestions(questionsList: Array<QuestionInput>) {
  await verifyAdmin();
  
  const parsedList = z.array(questionSchema).parse(questionsList);
  
  for (const rawQ of parsedList) {
    const { finalSlug, doc } = buildQuestionDoc(rawQ);
    
    // Upsert by slug (updates existing questions, creates new ones)
    await Question.findOneAndUpdate(
      { slug: finalSlug },
      { $set: doc },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/questions");
  revalidatePath("/admin/questions");
}

export async function bulkUpsertArticles(articlesList: Array<ArticleInput>) {
  await verifyAdmin();
  
  const parsedList = z.array(articleSchema).parse(articlesList);
  
  for (const rawA of parsedList) {
    const finalSlug = rawA.slug && rawA.slug.trim() ? slugify(rawA.slug) : slugify(rawA.title);
    
    const doc = {
      title: rawA.title,
      slug: finalSlug,
      excerpt: rawA.excerpt,
      content: rawA.content,
      tags: rawA.tags.map((t: string) => t.trim()).filter(Boolean),
      status: rawA.status ?? "published",
      publishedAt: rawA.status === "published" ? new Date() : null,
    };

    // Upsert by slug
    await Article.findOneAndUpdate(
      { slug: finalSlug },
      { $set: doc },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  revalidatePath("/articles");
  revalidatePath("/admin/articles");
}
