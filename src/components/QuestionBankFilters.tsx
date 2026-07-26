"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { Shuffle } from "lucide-react";
import { useTransition } from "react";

export function QuestionBankFilters({ topics }: { topics: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activeTopic = searchParams.get("topic") ?? "All Topics";
  const activeDifficulty = searchParams.get("difficulty") ?? "";
  const activeStatus = searchParams.get("status") ?? "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "All Topics") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  async function pickRandom() {
    const res = await fetch("/api/questions/random");
    if (!res.ok) return;
    const { slug } = await res.json();
    if (slug) router.push(`/questions/${slug}`);
  }

  return (
    <div className={clsx("flex flex-col gap-4", isPending && "opacity-70")}>
      <div className="flex flex-wrap items-center gap-2">
        {["All Topics", ...topics].map((topic) => (
          <button
            key={topic}
            onClick={() => updateParam("topic", topic)}
            className={clsx(
              "focus-ring rounded-full border px-4 py-1.5 font-mono text-[12px] transition-colors",
              activeTopic === topic
                ? "border-accent bg-accent text-base-950 font-semibold"
                : "border-base-600 bg-base-800 text-neutral-300 hover:border-accent/50 hover:text-accent"
            )}
          >
            {topic}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={activeDifficulty}
          onChange={(e) => updateParam("difficulty", e.target.value)}
          className="focus-ring rounded-md border border-base-600 bg-base-800 px-3 py-2 font-mono text-[12px] uppercase tracking-wide text-neutral-300"
        >
          <option value="">Difficulty: All</option>
          <option value="EASY">Difficulty: Easy</option>
          <option value="MEDIUM">Difficulty: Medium</option>
          <option value="HARD">Difficulty: Hard</option>
        </select>

        <select
          value={activeStatus}
          onChange={(e) => updateParam("status", e.target.value)}
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
