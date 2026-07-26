import { CheckCircle2, Clock } from "lucide-react";
import { connectDB } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { getDailySet } from "@/lib/daily";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { QuestionActions } from "@/components/QuestionActions";
import clsx from "clsx";

export default async function DailyPage() {
  const userId = await requireUserId();
  await connectDB();
  const daily = await getDailySet(userId);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="font-sans text-3xl font-bold text-white">Daily {daily.totalCount}</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Today&apos;s set, pinned for {daily.date}. Complete all {daily.totalCount} to extend your
          streak.
        </p>
      </div>

      <div className="panel mb-6 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2 font-mono text-sm">
          <CheckCircle2 size={16} className={daily.allCompleted ? "text-ok" : "text-neutral-500"} />
          <span className={daily.allCompleted ? "text-ok" : "text-neutral-300"}>
            {daily.completedCount} / {daily.totalCount} complete
          </span>
        </div>
        {daily.allCompleted && (
          <span className="font-mono text-[12px] uppercase tracking-wide text-ok">
            Streak extended for today
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {daily.questions.map((q, idx) => (
          <div
            key={q.id}
            className={clsx(
              "panel p-5 transition-colors",
              q.status === "done" && "border-ok/30 bg-ok-muted/20"
            )}
          >
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <div className="mb-1 font-mono text-[11px] uppercase tracking-wide text-neutral-500">
                  Question {idx + 1} of {daily.totalCount}
                </div>
                <h2 className="font-sans text-lg font-semibold text-white">{q.title}</h2>
                <div className="mt-2 flex items-center gap-2">
                  <DifficultyBadge difficulty={q.difficulty} />
                  <span className="rounded border border-base-600 bg-base-800 px-2 py-0.5 text-xs text-neutral-300">
                    {q.topic}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[11px] text-neutral-500">
                    <Clock size={12} />
                    {q.estimateMinutes} mins
                  </span>
                </div>
              </div>
            </div>
            <p className="mb-4 line-clamp-2 text-sm text-neutral-400">{q.description}</p>
            <QuestionActions
              questionId={q.id}
              status={q.status}
              bookmarked={q.bookmarked}
              compact
            />
          </div>
        ))}
      </div>
    </div>
  );
}
