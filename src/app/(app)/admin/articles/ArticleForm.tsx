"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertArticle } from "@/lib/admin-actions";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface ArticleFormProps {
  initialData?: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    tags: string[];
    status: "draft" | "published";
  };
}

export function ArticleForm({ initialData }: ArticleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [status, setStatus] = useState<"draft" | "published">(
    initialData?.status || "published"
  );
  const [tagsInput, setTagsInput] = useState(
    initialData?.tags.join(", ") || ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    startTransition(async () => {
      try {
        await upsertArticle({
          id: initialData?.id,
          title,
          slug: slug.trim() || undefined,
          excerpt,
          content,
          tags,
          status,
        });
        router.push("/admin/articles");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong saving the article");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-base-800">
        <Link
          href="/admin/articles"
          className="flex items-center gap-1.5 text-neutral-400 hover:text-white font-mono text-xs uppercase"
        >
          <ArrowLeft size={13} />
          Back to list
        </Link>
        <h2 className="font-sans text-lg font-bold text-white">
          {initialData ? `Edit Article: ${initialData.title}` : "Create New Article"}
        </h2>
      </div>

      {error && (
        <div className="p-4 rounded-md border border-warn/30 bg-warn-muted text-warn text-sm font-mono">
          {error}
        </div>
      )}

      <div className="panel p-6 space-y-5">
        {/* Title */}
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
            Article Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Mastering variables hoisting in JavaScript"
            className="focus-ring w-full rounded-md border border-base-700 bg-base-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 font-sans"
          />
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
            Custom Slug (Optional)
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. mastering-hoisting-js (auto-generated if empty)"
            className="focus-ring w-full rounded-md border border-base-700 bg-base-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 font-mono"
          />
        </div>

        {/* Excerpt */}
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
            Short Excerpt / Summary
          </label>
          <input
            type="text"
            required
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Provide a quick 1-2 sentence overview of the article..."
            className="focus-ring w-full rounded-md border border-base-700 bg-base-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 font-sans"
          />
        </div>

        {/* Tags & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
              Tags (Comma Separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. JavaScript, closures, concepts"
              className="focus-ring w-full rounded-md border border-base-700 bg-base-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 font-mono"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
              Publishing Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="focus-ring w-full rounded-md border border-base-700 bg-base-900 px-4 py-2.5 text-sm text-white font-mono"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
            Article Content (Paragraphs split by empty lines)
          </label>
          <textarea
            required
            rows={12}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your article content here. Double-press Enter to create new paragraphs..."
            className="focus-ring w-full rounded-md border border-base-700 bg-base-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 font-sans"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pb-8">
        <Link href="/admin/articles" className="btn-outline">
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="btn-accent min-w-[120px]"
        >
          {isPending ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={15} />
              Save Article
            </>
          )}
        </button>
      </div>
    </form>
  );
}
