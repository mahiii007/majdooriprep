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
    topic?: string;
    category?: string;
    subCategory?: string;
    tags: string[];
    difficulty: "EASY" | "MEDIUM" | "HARD";
    estimateMinutes?: number;
    description: string;
    questionBody?: string;
    solutionBody?: string;
    isActive: boolean;
  };
}

export function QuestionForm({ initialData }: QuestionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [category, setCategory] = useState(initialData?.category || "problem-solving");
  const [subCategory, setSubCategory] = useState(initialData?.subCategory || "");
  const [topic, setTopic] = useState(initialData?.topic || "");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">(
    initialData?.difficulty || "EASY"
  );
  const [estimateMinutes, setEstimateMinutes] = useState<number | undefined>(
    initialData?.estimateMinutes
  );
  const [tagsInput, setTagsInput] = useState(
    initialData?.tags.join(", ") || ""
  );
  const [description, setDescription] = useState(initialData?.description || "");
  const [questionBody, setQuestionBody] = useState(initialData?.questionBody || "");
  const [solutionBody, setSolutionBody] = useState(initialData?.solutionBody || "");
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
          category: category.trim() || undefined,
          subCategory: subCategory.trim() || "miscellaneous",
          topic: topic.trim() || undefined,
          tags,
          difficulty,
          estimateMinutes: estimateMinutes ? Number(estimateMinutes) : undefined,
          description: description.trim() || (questionBody ? questionBody.slice(0, 300).trim() : title),
          questionBody,
          solutionBody,
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
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
            placeholder="e.g. Deep Freeze an Object for Immutability"
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
            placeholder="e.g. ps-object-s-deep-freeze (auto-generated if empty)"
            className="focus-ring w-full rounded-md border border-base-700 bg-base-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 font-mono"
          />
        </div>

        {/* Category & SubCategory */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
              Category Slug
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="focus-ring w-full rounded-md border border-base-700 bg-base-900 px-4 py-2.5 text-sm text-white font-mono"
            >
              <option value="problem-solving">problem-solving (Problem Solving)</option>
              <option value="polyfills">polyfills (Polyfills)</option>
              <option value="machine-coding">machine-coding (Machine Coding)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
              SubCategory
            </label>
            <input
              type="text"
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              placeholder="e.g. object(s), array(s), custom-hooks"
              className="focus-ring w-full rounded-md border border-base-700 bg-base-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 font-mono"
            />
          </div>
        </div>

        {/* Difficulty & Estimate */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
              Estimate Minutes (Optional)
            </label>
            <input
              type="number"
              min={1}
              value={estimateMinutes ?? ""}
              onChange={(e) => setEstimateMinutes(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="e.g. 15"
              className="focus-ring w-full rounded-md border border-base-700 bg-base-900 px-4 py-2.5 text-sm text-white font-mono"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
            Concept Tags (Comma Separated)
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g. problem-solving, objects, immutability"
            className="focus-ring w-full rounded-md border border-base-700 bg-base-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 font-mono"
          />
        </div>

        {/* Short Description */}
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
            Short Description / Excerpt
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief excerpt shown in question cards and listings..."
            className="focus-ring w-full rounded-md border border-base-700 bg-base-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 font-sans"
          />
        </div>

        {/* Full Question Body (Markdown) */}
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
            Question Body (Markdown)
          </label>
          <textarea
            rows={8}
            value={questionBody}
            onChange={(e) => setQuestionBody(e.target.value)}
            placeholder="Full problem statement in markdown format..."
            className="focus-ring w-full rounded-md border border-base-700 bg-base-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 font-mono"
          />
        </div>

        {/* Full Solution Body (Markdown) */}
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
            Solution Body (Markdown)
          </label>
          <textarea
            rows={8}
            value={solutionBody}
            onChange={(e) => setSolutionBody(e.target.value)}
            placeholder="Approach, step-by-step reasoning, solution code, and time/space complexity analysis..."
            className="focus-ring w-full rounded-md border border-base-700 bg-base-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 font-mono"
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
