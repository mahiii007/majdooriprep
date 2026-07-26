import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { connectDB } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { getDailySet } from "@/lib/daily";
import { getProgressSummary } from "@/lib/progress";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProgressSummaryCards, StreakCard } from "@/components/ProgressSummaryCards";
import { WeakAreasPanel } from "@/components/WeakAreasPanel";
import { StatusIcon } from "@/components/StatusIcon";
import { formatInTimeZone, APP_TIMEZONE } from "@/lib/date";

export default async function DashboardPage() {
  const userId = await requireUserId();
  await connectDB();

  const [session, daily, summary] = await Promise.all([
    getServerSession(authOptions),
    getDailySet(userId),
    getProgressSummary(userId),
  ]);

  const firstName = (session?.user?.name ?? "Engineer").split(" ")[0];
  const todayLabel = formatInTimeZone(new Date(), APP_TIMEZONE, "EEEE, MMMM d");

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="font-sans text-3xl font-bold text-white">Welcome back, {firstName}</h1>
        <p className="mt-1 text-sm text-neutral-400">{todayLabel} · Deep Work Mode</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="sm:col-span-3">
          <ProgressSummaryCards
            totalSolved={summary.totalSolved}
            totalQuestions={summary.totalQuestions}
            currentRank={summary.currentRank}
            accuracyPct={summary.accuracyPct}
          />
        </div>
        <StreakCard currentStreak={summary.currentStreak} highestStreak={summary.highestStreak} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="panel p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-sans text-base font-semibold text-white">
                Today&apos;s Daily {daily.totalCount}
              </h3>
              <p className="mt-0.5 text-xs text-neutral-500">
                {daily.completedCount} of {daily.totalCount} complete
              </p>
            </div>
            <Link
              href="/daily"
              className="flex items-center gap-1 font-mono text-[12px] uppercase tracking-wide text-accent transition-colors hover:text-accent-light"
            >
              Go to set
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-base-700">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${(daily.completedCount / Math.max(1, daily.totalCount)) * 100}%` }}
            />
          </div>

          <div className="flex flex-col gap-1">
            {daily.questions.map((q) => (
              <Link
                key={q.id}
                href={`/questions/${q.slug}`}
                className="flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-base-800"
              >
                <StatusIcon status={q.status} />
                <span className="text-sm text-neutral-200">{q.title}</span>
                <span className="ml-auto rounded border border-base-600 bg-base-800 px-2 py-0.5 text-[11px] text-neutral-400">
                  {q.topic}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <WeakAreasPanel weakAreas={summary.weakAreas} />
      </div>
    </div>
  );
}
