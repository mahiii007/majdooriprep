import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import { Article } from "@/models/Article";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const articles = await Article.find({ status: "published" })
    .sort({ publishedAt: -1 })
    .lean();

  return NextResponse.json(
    articles.map((a) => ({
      id: String(a._id),
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      tags: a.tags,
      publishedAt: a.publishedAt,
    }))
  );
}
