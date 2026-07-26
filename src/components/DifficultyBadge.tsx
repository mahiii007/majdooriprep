import clsx from "clsx";
import type { Difficulty } from "@/models/Question";

const STYLES: Record<Difficulty, string> = {
  EASY: "text-ok border-ok/40 bg-ok-muted",
  MEDIUM: "text-accent border-accent/40 bg-accent-muted",
  HARD: "text-warn border-warn/40 bg-warn-muted",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={clsx(
        "rounded border px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide",
        STYLES[difficulty]
      )}
    >
      {difficulty}
    </span>
  );
}
