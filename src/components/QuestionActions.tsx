"use client";

import { useTransition } from "react";
import { Bookmark, BookmarkCheck, CheckCircle2, RotateCcw } from "lucide-react";
import clsx from "clsx";
import { markQuestionStatus, toggleBookmark } from "@/lib/actions";
import type { QuestionStatus } from "@/types";

export function QuestionActions({
  questionId,
  status,
  bookmarked,
  compact = false,
}: {
  questionId: string;
  status: QuestionStatus;
  bookmarked: boolean;
  compact?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function setStatus(next: QuestionStatus) {
    startTransition(() => markQuestionStatus(questionId, next));
  }

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={isPending}
        onClick={() => setStatus(status === "done" ? "not_started" : "done")}
        className={clsx(
          "focus-ring flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-[12px] uppercase tracking-wide transition-colors disabled:opacity-50",
          status === "done"
            ? "border-ok/50 bg-ok-muted text-ok"
            : "border-base-600 bg-base-800 text-neutral-300 hover:border-ok/50 hover:text-ok"
        )}
      >
        <CheckCircle2 size={14} />
        {status === "done" ? "Done" : "Mark done"}
      </button>

      {!compact && (
        <button
          disabled={isPending}
          onClick={() => setStatus(status === "revision" ? "not_started" : "revision")}
          className={clsx(
            "focus-ring flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-[12px] uppercase tracking-wide transition-colors disabled:opacity-50",
            status === "revision"
              ? "border-accent/50 bg-accent-muted text-accent"
              : "border-base-600 bg-base-800 text-neutral-300 hover:border-accent/50 hover:text-accent"
          )}
        >
          <RotateCcw size={14} />
          Revision
        </button>
      )}

      <button
        disabled={isPending}
        onClick={() => startTransition(() => toggleBookmark(questionId, !bookmarked))}
        className="focus-ring rounded-md border border-base-600 bg-base-800 p-1.5 text-neutral-400 transition-colors hover:border-accent/50 hover:text-accent disabled:opacity-50"
        title={bookmarked ? "Remove bookmark" : "Add bookmark"}
      >
        {bookmarked ? <BookmarkCheck size={15} className="text-accent" /> : <Bookmark size={15} />}
      </button>
    </div>
  );
}
