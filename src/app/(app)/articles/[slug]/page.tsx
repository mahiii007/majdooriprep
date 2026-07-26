import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { connectDB } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { getArticleBySlug } from "@/lib/articles";

export default async function ArticleDetailPage({ params }: { params: { slug: string } }) {
  await requireUserId();
  await connectDB();
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/articles"
        className="mb-6 inline-flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-wide text-neutral-500 transition-colors hover:text-accent"
      >
        <ArrowLeft size={14} />
        Back to Articles
      </Link>

      <div className="panel p-8">
        <div className="mb-4 flex flex-wrap gap-1.5">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-base-800 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-accent"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="mb-6 font-sans text-3xl font-bold text-white">{article.title}</h1>
        <div className="flex flex-col gap-4 text-sm leading-relaxed text-neutral-300">
          {article.content.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
