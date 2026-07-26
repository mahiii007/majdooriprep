import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { connectDB } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { getQuestionBySlug } from "@/lib/questions";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { QuestionActions } from "@/components/QuestionActions";

export default async function QuestionDetailPage({ params }: { params: { slug: string } }) {
  const userId = await requireUserId();
  await connectDB();

  const question = await getQuestionBySlug(userId, params.slug);
  if (!question) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/questions"
        className="mb-6 inline-flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-wide text-neutral-500 transition-colors hover:text-accent"
      >
        <ArrowLeft size={14} />
        Back to Question Bank
      </Link>

      <div className="panel p-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <DifficultyBadge difficulty={question.difficulty} />
          <span className="rounded border border-base-600 bg-base-800 px-2 py-0.5 text-xs text-neutral-300">
            {question.topic}
          </span>
          <span className="flex items-center gap-1 font-mono text-[11px] text-neutral-500">
            <Clock size={12} />
            {question.estimateMinutes} mins
          </span>
        </div>

        <h1 className="mb-2 font-sans text-2xl font-bold text-white">{question.title}</h1>

        <div className="mb-6 flex flex-wrap gap-1.5">
          {question.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-base-800 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-neutral-500"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="prose-invert mb-8 whitespace-pre-line text-sm leading-relaxed text-neutral-300">
          {question.description}
        </div>

        <div className="border-t border-base-700 pt-6">
          <QuestionActions
            questionId={question.id}
            status={question.status}
            bookmarked={question.bookmarked}
          />
        </div>
      </div>
    </div>
  );
}
