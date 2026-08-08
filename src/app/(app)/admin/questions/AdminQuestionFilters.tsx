"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useTransition, useState, useEffect } from "react";

export function AdminQuestionFilters({ topics }: { topics: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchVal, setSearchVal] = useState(searchParams?.get("q") || "");
  const [, startTransition] = useTransition();

  // Sync state with URL search param
  useEffect(() => {
    setSearchVal(searchParams?.get("q") || "");
  }, [searchParams]);

  function updateQuery(name: string, value: string) {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (value && value !== "All") {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    // Reset to page 1 on filter change
    params.delete("page");

    startTransition(() => {
      router.push(`/admin/questions?${params.toString()}`);
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateQuery("q", searchVal);
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
        <input
          type="text"
          placeholder="Search admin questions (e.g. 'Promise')..."
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          className="focus-ring w-full rounded-md border border-base-700 bg-base-850 py-2.5 pl-10 pr-4 font-mono text-[13px] text-white placeholder-neutral-500"
        />
        <Search size={15} className="absolute left-3.5 top-3 text-neutral-500" />
      </form>

      {/* Filters Selects */}
      <div className="flex flex-wrap gap-3 font-mono text-xs">
        {/* Topic Select */}
        <select
          value={searchParams?.get("topic") || "All"}
          onChange={(e) => updateQuery("topic", e.target.value)}
          className="focus-ring rounded-md border border-base-700 bg-base-850 px-3 py-2 text-neutral-300"
        >
          <option value="All">All Topics</option>
          {topics.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Difficulty Select */}
        <select
          value={searchParams?.get("difficulty") || "All"}
          onChange={(e) => updateQuery("difficulty", e.target.value)}
          className="focus-ring rounded-md border border-base-700 bg-base-850 px-3 py-2 text-neutral-300"
        >
          <option value="All">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>

        {/* Status Select */}
        <select
          value={searchParams?.get("isActive") || "All"}
          onChange={(e) => updateQuery("isActive", e.target.value)}
          className="focus-ring rounded-md border border-base-700 bg-base-850 px-3 py-2 text-neutral-300"
        >
          <option value="All">All Statuses</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
        </select>
      </div>
    </div>
  );
}
