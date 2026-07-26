import Link from "next/link";
import { AlertTriangle, PlayCircle } from "lucide-react";
import clsx from "clsx";
import type { ProgressSummaryDTO } from "@/types";

const PRIORITY_STYLE: Record<string, string> = {
  "HIGH PRIORITY": "text-warn",
  "TOPIC SKILL GAP": "text-accent",
  "CONCEPT CHECK": "text-neutral-400",
};

export function WeakAreasPanel({ weakAreas }: { weakAreas: ProgressSummaryDTO["weakAreas"] }) {
  return (
    <div className="panel p-6">
      <div className="mb-5 flex items-center gap-2">
        <AlertTriangle size={17} className="text-warn" />
        <h3 className="font-sans text-base font-semibold text-white">Weak Areas</h3>
      </div>

      {weakAreas.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Not enough attempts yet to surface weak areas — work through a few more questions.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {weakAreas.map((area) => (
            <div
              key={area.tag}
              className="rounded-md border-l-2 border-warn/50 bg-base-800 px-4 py-3"
            >
              <div className={clsx("label-mono mb-1", PRIORITY_STYLE[area.priority])}>
                {area.priority}
              </div>
              <div className="mb-2 text-sm text-neutral-100">
                Review <span className="capitalize">{area.tag}</span>
              </div>
              <Link
                href={`/questions?q=${encodeURIComponent(area.tag)}`}
                className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-neutral-400 transition-colors hover:text-accent"
              >
                <PlayCircle size={13} />
                Start Drill
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
