import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StatusIcon } from "@/components/StatusIcon";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import type { QuestionDTO } from "@/types";

export function QuestionRow({ question }: { question: QuestionDTO }) {
  return (
    <Link
      href={`/questions/${question.slug}`}
      className="grid grid-cols-[40px_1fr_180px_140px_110px_40px] items-center gap-4 border-b border-base-750 px-5 py-4 transition-colors last:border-b-0 hover:bg-base-800/60"
    >
      <StatusIcon status={question.status} />
      <div>
        <div className="font-medium text-neutral-100">{question.title}</div>
        <div className="mt-0.5 line-clamp-1 text-xs text-neutral-500">{question.description}</div>
      </div>
      <div>
        <span className="rounded border border-accent/30 bg-accent-muted px-2 py-0.5 text-xs text-accent">
          {question.categoryLabel}
        </span>
      </div>
      <div>
        <span className="rounded border border-base-600 bg-base-800 px-2 py-0.5 text-xs text-neutral-300">
          {question.subCategoryLabel}
        </span>
      </div>
      <DifficultyBadge difficulty={question.difficulty} />
      <ArrowRight size={16} className="text-neutral-500" />
    </Link>
  );
}
