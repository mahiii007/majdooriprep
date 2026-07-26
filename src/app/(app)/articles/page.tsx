import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { connectDB } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { listArticles } from "@/lib/articles";

export default async function ArticlesPage() {
  await requireUserId();
  await connectDB();
  const articles = await listArticles();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-sans text-3xl font-bold text-white">Articles</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Deep dives and reference reading to back up your practice.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {articles.map((a) => (
          <Link key={a.id} href={`/articles/${a.slug}`} className="panel block p-6 transition-colors hover:border-accent/40">
            <div className="mb-2 flex items-center gap-2 text-accent">
              <FileText size={15} />
              <span className="label-mono !text-accent">{a.tags[0] ?? "Article"}</span>
            </div>
            <h2 className="mb-1.5 font-sans text-lg font-semibold text-white">{a.title}</h2>
            <p className="mb-3 text-sm text-neutral-400">{a.excerpt}</p>
            <span className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wide text-neutral-500">
              Read article
              <ArrowRight size={13} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
