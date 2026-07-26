import type { ProgressSummaryDTO } from "@/types";

export function TopicMasteryBars({ topics }: { topics: ProgressSummaryDTO["topicMastery"] }) {
  return (
    <div className="panel p-6">
      <h3 className="mb-5 font-sans text-base font-semibold text-white">Topic Mastery</h3>
      <div className="flex flex-col gap-4">
        {topics.map((t) => (
          <div key={t.topic}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-neutral-300">{t.topic}</span>
              <span className="font-mono text-[12px] text-neutral-500">
                {t.done}/{t.total} · {t.pct}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-base-700">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${t.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
