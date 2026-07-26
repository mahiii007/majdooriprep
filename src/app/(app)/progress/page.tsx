import { connectDB } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { getProgressSummary } from "@/lib/progress";
import { ProgressSummaryCards, StreakCard } from "@/components/ProgressSummaryCards";
import { WeeklyBarChart } from "@/components/WeeklyBarChart";
import { WeakAreasPanel } from "@/components/WeakAreasPanel";
import { TopicMasteryBars } from "@/components/TopicMasteryBars";

export default async function ProgressPage() {
  const userId = await requireUserId();
  await connectDB();
  const summary = await getProgressSummary(userId);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="font-sans text-3xl font-bold text-white">Your Progress</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Consistent labor is the path to technical mastery.
        </p>
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
          <h3 className="mb-5 font-sans text-base font-semibold text-white">
            Questions Solved per Week
          </h3>
          <WeeklyBarChart data={summary.weeklyCounts} />
        </div>

        <WeakAreasPanel weakAreas={summary.weakAreas} />
      </div>

      <div className="mt-6">
        <TopicMasteryBars topics={summary.topicMastery} />
      </div>
    </div>
  );
}
