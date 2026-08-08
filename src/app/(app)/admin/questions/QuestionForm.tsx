"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertQuestion } from "@/lib/admin-actions";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface QuestionFormProps {
  initialData?: {
    id: string;
    slug: string;
    title: string;
    topic: string;
    tags: string[];
    difficulty: "EASY" | "MEDIUM" | "HARD";
    estimateMinutes: number;
    description: string;
    isActive: boolean;
  };
}

export function QuestionForm({ initialData }: QuestionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [topic, setTopic] = useState(initialData?.topic || "");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">(
    initialData?.difficulty || "EASY"
  );
  const [estimateMinutes, setEstimateMinutes] = useState(
    initialData?.estimateMinutes || 15
  );
  const [tagsInput, setTagsInput] = useState(
    initialData?.tags.join(", ") || ""
  );
  const [description, setDescription] = useState(initialData?.description || "");
  const [isActive, setIsActive] = useState(
    initialData ? initialData.isActive : true
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
        await upsertQuestion({
          id: initialData?.id,
          title,
          slug: slug.trim() || undefined,
          topic,
          tags,
          difficulty,
          estimateMinutes: Number(estimateMinutes),
          description,
          isActive,
        });
        router.push("/admin/questions");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong saving the question");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-base-800">
        <Link
          href="/admin/questions"
          className="flex items-center gap-1.5 text-neutral-400 hover:text-white font-mono text-xs uppercase"
        >
          <ArrowLeft size={13} />
          Back to list
        </Link>
        <h2 className="font-sans text-lg font-bold text-white">
          {initialData ? `Edit Question: ${initialData.title}` : "Create New Question"}
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
            Question Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Implement Array.prototype.map"
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
            placeholder="e.g. implement-array-map (auto-generated if empty)"
            className="focus-ring w-full rounded-md border border-base-700 bg-base-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 font-mono"
          />
        </div>

        {/* Topic & Difficulty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
              Category/Topic
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. JavaScript, React, CSS"
              className="focus-ring w-full rounded-md border border-base-700 bg-base-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 font-sans"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="focus-ring w-full rounded-md border border-base-700 bg-base-900 px-4 py-2.5 text-sm text-white font-mono"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </div>

        {/* Estimate Minutes & Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
              Estimate Minutes
            </label>
            <input
              type="number"
              required
              min={1}
              value={estimateMinutes}
              onChange={(e) => setEstimateMinutes(Number(e.target.value))}
              className="focus-ring w-full rounded-md border border-base-700 bg-base-900 px-4 py-2.5 text-sm text-white font-mono"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
              Concept Tags (Comma Separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. arrays, recursion, maps"
              className="focus-ring w-full rounded-md border border-base-700 bg-base-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 font-mono"
            />
          </div>
        </div>

        {/* Description / Content */}
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
            Problem Description
          </label>
          <textarea
            required
            rows={8}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the challenge clearly. Explain requirements, edge cases, and expected behaviors..."
            className="focus-ring w-full rounded-md border border-base-700 bg-base-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 font-sans"
          />
        </div>

        {/* Active Toggle */}
        <div className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="focus-ring h-4 w-4 rounded border-base-700 bg-base-900 text-accent"
          />
          <label htmlFor="isActive" className="text-sm text-neutral-300 font-mono select-none">
            Active (Visible in Question Bank & Daily assignments)
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pb-8">
        <Link href="/admin/questions" className="btn-outline">
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
              Save Question
            </>
          )}
        </button>
      </div>
    </form>
  );
}
