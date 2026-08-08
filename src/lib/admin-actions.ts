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

const questionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  topic: z.string().min(1, "Topic is required"),
  tags: z.array(z.string()).default([]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  estimateMinutes: z.number().min(1, "Estimate must be at least 1 minute"),
  description: z.string().min(1, "Description is required"),
  isActive: z.boolean().default(true),
});

const articleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  excerpt: z.string().min(1, "Excerpt is required"),
  content: z.string().min(1, "Content is required"),
  tags: z.array(z.string()).default([]),
  status: z.enum(["draft", "published"]).default("published"),
});

export async function upsertQuestion(rawData: z.infer<typeof questionSchema>) {
  await verifyAdmin();
  const data = questionSchema.parse(rawData);

  const finalSlug = data.slug && data.slug.trim() ? slugify(data.slug) : slugify(data.title);

  const doc = {
    title: data.title,
    slug: finalSlug,
    topic: data.topic,
    tags: data.tags.map(t => t.trim().toLowerCase()).filter(Boolean),
    difficulty: data.difficulty,
    estimateMinutes: data.estimateMinutes,
    description: data.description,
    isActive: data.isActive,
  };

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

export async function upsertArticle(rawData: z.infer<typeof articleSchema>) {
  await verifyAdmin();
  const data = articleSchema.parse(rawData);

  const finalSlug = data.slug && data.slug.trim() ? slugify(data.slug) : slugify(data.title);

  const publishedAt = data.status === "published" ? new Date() : null;

  const updateFields: any = {
    title: data.title,
    slug: finalSlug,
    excerpt: data.excerpt,
    content: data.content,
    tags: data.tags.map(t => t.trim()).filter(Boolean),
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

export async function bulkUpsertQuestions(questionsList: Array<z.infer<typeof questionSchema>>) {
  await verifyAdmin();
  
  const parsedList = z.array(questionSchema).parse(questionsList);
  
  for (const rawQ of parsedList) {
    const finalSlug = rawQ.slug && rawQ.slug.trim() ? slugify(rawQ.slug) : slugify(rawQ.title);
    const doc = {
      title: rawQ.title,
      slug: finalSlug,
      topic: rawQ.topic,
      tags: rawQ.tags.map(t => t.trim().toLowerCase()).filter(Boolean),
      difficulty: rawQ.difficulty,
      estimateMinutes: rawQ.estimateMinutes,
      description: rawQ.description,
      isActive: rawQ.isActive ?? true,
    };
    
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

export async function bulkUpsertArticles(articlesList: Array<z.infer<typeof articleSchema>>) {
  await verifyAdmin();
  
  const parsedList = z.array(articleSchema).parse(articlesList);
  
  for (const rawA of parsedList) {
    const finalSlug = rawA.slug && rawA.slug.trim() ? slugify(rawA.slug) : slugify(rawA.title);
    
    const doc = {
      title: rawA.title,
      slug: finalSlug,
      excerpt: rawA.excerpt,
      content: rawA.content,
      tags: rawA.tags.map(t => t.trim()).filter(Boolean),
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
