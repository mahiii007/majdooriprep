"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { Search, Flame, Moon, LogOut } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export function Topbar({
  userName,
  userImage,
  currentStreak,
  rank,
}: {
  userName: string;
  userImage?: string | null;
  currentStreak: number;
  rank: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.push(`/questions${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <header className="flex h-[73px] items-center gap-6 border-b border-base-700 bg-base-900 px-8">
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="focus-within:border-accent/60 flex items-center gap-2 rounded-md border border-base-700 bg-base-850 px-3 py-2 transition-colors">
          <Search size={16} className="text-neutral-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Problems (e.g. 'LRU Cache')"
            className="w-full bg-transparent text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none"
          />
        </div>
      </form>

      <div className="ml-auto flex items-center gap-5">
        <div
          className="flex items-center gap-1.5 text-accent"
          title={`${currentStreak} day current streak`}
        >
          <Flame size={19} />
          <span className="font-mono text-sm font-semibold">{currentStreak}</span>
        </div>

        <Moon size={18} className="text-neutral-500" aria-hidden="true" />

        <div className="h-6 w-px bg-base-700" />

        <div className="flex items-center gap-3">
          <div className="text-right leading-tight">
            <div className="text-sm font-medium text-neutral-100">{userName}</div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-accent">
              {rank}
            </div>
          </div>
          {userImage ? (
            <Image
              src={userImage}
              alt={userName}
              width={36}
              height={36}
              className="rounded-md border border-base-600 object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-base-600 bg-base-800 font-mono text-sm text-neutral-400">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/signin" })}
            className="focus-ring rounded-md p-1.5 text-neutral-500 transition-colors hover:text-warn"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
