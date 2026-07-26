import { CheckCircle2, Circle, RotateCcw } from "lucide-react";
import type { QuestionStatus } from "@/types";

export function StatusIcon({ status }: { status: QuestionStatus }) {
  if (status === "done") {
    return <CheckCircle2 size={20} className="text-ok" />;
  }
  if (status === "in_progress") {
    return (
      <span className="flex h-5 w-5 items-center justify-center">
        <span className="h-2.5 w-2.5 rounded-full bg-accent" />
      </span>
    );
  }
  if (status === "revision") {
    return <RotateCcw size={17} className="text-accent" />;
  }
  return <Circle size={20} className="text-neutral-600" />;
}
