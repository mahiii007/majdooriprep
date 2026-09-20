"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { Shuffle } from "lucide-react";
import { useTransition } from "react";
import type { CategoryDefinition } from "@/lib/categories";
import { formatSubCategoryLabel } from "@/lib/categories";

export function QuestionBankFilters({ categories }: { categories: CategoryDefinition[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activeCategory = searchParams.get("category") ?? "all";
  const activeSubCategory = searchParams.get("subCategory") ?? "all";
  const activeDifficulty = searchParams.get("difficulty") ?? "";
  const activeStatus = searchParams.get("status") ?? "";

  const selectedCategory = categories.find((c) => c.name === activeCategory);
  const subCategories = selectedCategory
    ? Object.keys(selectedCategory.subCategories).sort()
    : [];

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function selectCategory(category: string) {
    updateParams({
      category: category === "all" ? null : category,
      subCategory: null,
    });
  }

  function selectSubCategory(subCategory: string) {
    updateParams({ subCategory: subCategory === "all" ? null : subCategory });
  }

  async function pickRandom() {
    const res = await fetch("/api/questions/random");
    if (!res.ok) return;
    const { slug } = await res.json();
    if (slug) router.push(`/questions/${slug}`);
  }

  return (
    <div className={clsx("flex flex-col gap-4", isPending && "opacity-70")}>
      <div>
        <p className="mb-2 label-mono">Category</p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => selectCategory("all")}
            className={clsx(
              "focus-ring rounded-full border px-4 py-1.5 font-mono text-[12px] transition-colors",
              activeCategory === "all"
                ? "border-accent bg-accent text-base-950 font-semibold"
                : "border-base-600 bg-base-800 text-neutral-300 hover:border-accent/50 hover:text-accent"
            )}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => selectCategory(category.name)}
              className={clsx(
                "focus-ring rounded-full border px-4 py-1.5 font-mono text-[12px] transition-colors",
                activeCategory === category.name
                  ? "border-accent bg-accent text-base-950 font-semibold"
                  : "border-base-600 bg-base-800 text-neutral-300 hover:border-accent/50 hover:text-accent"
              )}
            >
              {category.label}
              <span className="ml-1.5 text-[10px] opacity-70">({category.total})</span>
            </button>
          ))}
        </div>
      </div>

      {subCategories.length > 0 && (
        <div>
          <p className="mb-2 label-mono">Sub-category</p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => selectSubCategory("all")}
              className={clsx(
                "focus-ring rounded-full border px-3 py-1 font-mono text-[11px] transition-colors",
                activeSubCategory === "all"
                  ? "border-accent/70 bg-accent-muted text-accent"
                  : "border-base-600 bg-base-850 text-neutral-400 hover:border-accent/40 hover:text-accent"
              )}
            >
              All
            </button>
            {subCategories.map((sub) => (
              <button
                key={sub}
                onClick={() => selectSubCategory(sub)}
                className={clsx(
                  "focus-ring rounded-full border px-3 py-1 font-mono text-[11px] transition-colors",
                  activeSubCategory === sub
                    ? "border-accent/70 bg-accent-muted text-accent"
                    : "border-base-600 bg-base-850 text-neutral-400 hover:border-accent/40 hover:text-accent"
                )}
              >
                {formatSubCategoryLabel(sub)}
                <span className="ml-1 opacity-60">
                  ({selectedCategory?.subCategories[sub] ?? 0})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={activeDifficulty}
          onChange={(e) => updateParams({ difficulty: e.target.value || null })}
          className="focus-ring rounded-md border border-base-600 bg-base-800 px-3 py-2 font-mono text-[12px] uppercase tracking-wide text-neutral-300"
        >
          <option value="">Difficulty: All</option>
          <option value="EASY">Difficulty: Easy</option>
          <option value="MEDIUM">Difficulty: Medium</option>
          <option value="HARD">Difficulty: Hard</option>
        </select>

        <select
          value={activeStatus}
          onChange={(e) => updateParams({ status: e.target.value || null })}
          className="focus-ring rounded-md border border-base-600 bg-base-800 px-3 py-2 font-mono text-[12px] uppercase tracking-wide text-neutral-300"
        >
          <option value="">Status: All</option>
          <option value="done">Status: Done</option>
          <option value="revision">Status: Revision</option>
          <option value="not_started">Status: Not started</option>
        </select>

        <button onClick={pickRandom} className="btn-outline ml-auto">
          <Shuffle size={14} />
          Pick Random
        </button>
      </div>
    </div>
  );
}
