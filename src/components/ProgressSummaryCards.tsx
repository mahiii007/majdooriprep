import { CheckCircle2, Award, Target, Flame } from "lucide-react";
import type { ReactNode } from "react";

function StatCard({
  label,
  value,
  suffix,
  icon,
  iconBg,
}: {
  label: string;
  value: string;
  suffix?: string;
  icon: ReactNode;
  iconBg: string;
}) {
  return (
    <div className="panel flex items-center justify-between p-6">
      <div>
        <div className="label-mono mb-2">{label}</div>
        <div className="font-sans text-3xl font-bold text-white">
          {value}
          {suffix && <span className="text-lg font-medium text-neutral-500">{suffix}</span>}
        </div>
      </div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-md ${iconBg}`}>
        {icon}
      </div>
    </div>
  );
}

export function ProgressSummaryCards({
  totalSolved,
  totalQuestions,
  currentRank,
  accuracyPct,
}: {
  totalSolved: number;
  totalQuestions: number;
  currentRank: string;
  accuracyPct: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      <StatCard
        label="Total Solved"
        value={String(totalSolved)}
        suffix={`/${totalQuestions}`}
        icon={<CheckCircle2 size={22} className="text-accent" />}
        iconBg="bg-accent-muted"
      />
      <StatCard
        label="Current Rank"
        value={currentRank}
        icon={<Award size={22} className="text-ok" />}
        iconBg="bg-ok-muted"
      />
      <StatCard
        label="Accuracy"
        value={`${accuracyPct}%`}
        icon={<Target size={22} className="text-warn" />}
        iconBg="bg-warn-muted"
      />
    </div>
  );
}

export function StreakCard({
  currentStreak,
  highestStreak,
}: {
  currentStreak: number;
  highestStreak: number;
}) {
  return (
    <div className="panel flex items-center justify-between p-6">
      <div>
        <div className="label-mono mb-2">Current Streak</div>
        <div className="font-sans text-3xl font-bold text-white">{currentStreak} days</div>
        <div className="mt-1 font-mono text-[11px] text-neutral-500">
          Highest: {highestStreak} days
        </div>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-accent-muted">
        <Flame size={22} className="text-accent" />
      </div>
    </div>
  );
}
