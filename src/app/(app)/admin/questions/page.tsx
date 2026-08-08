import { adminListQuestions, adminListTopics } from "@/lib/admin";
import { AdminQuestionFilters } from "./AdminQuestionFilters";
import { ActiveToggle } from "./ActiveToggle";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { Pagination } from "@/components/Pagination";
import { Plus, Edit3 } from "lucide-react";
import Link from "next/link";
import type { Difficulty } from "@/models/Question";

export default async function AdminQuestionsListPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const page = searchParams.page ? Number(searchParams.page) : 1;
  const topic = searchParams.topic;
  const difficulty = searchParams.difficulty as Difficulty | undefined;
  const search = searchParams.q;
  const isActive = searchParams.isActive === "true" ? true : searchParams.isActive === "false" ? false : undefined;

  const [topics, result] = await Promise.all([
    adminListTopics(),
    adminListQuestions({
      search,
      topic,
      difficulty,
      isActive,
      page,
      pageSize: 20,
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header section with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-sans text-xl font-bold text-white">Questions Library</h2>
          <p className="text-sm text-neutral-400">Total {result.total} challenges found.</p>
        </div>
        <Link href="/admin/questions/new" className="btn-accent">
          <Plus size={15} />
          Create Question
        </Link>
      </div>

      {/* Filter Section */}
      <div className="panel p-4">
        <AdminQuestionFilters topics={topics} />
      </div>

      {/* Questions Table */}
      <div className="panel overflow-hidden">
        <div className="grid grid-cols-[1fr_150px_110px_90px_120px_80px] gap-4 border-b border-base-700 px-5 py-3 label-mono">
          <span>Title</span>
          <span>Category</span>
          <span>Difficulty</span>
          <span>Estimate</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        {result.items.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-neutral-500 font-mono">
            No questions found matching criteria.
          </div>
        ) : (
          result.items.map((q) => (
            <div
              key={q.id}
              className="grid grid-cols-[1fr_150px_110px_90px_120px_80px] gap-4 border-b border-base-800 hover:bg-base-850 px-5 py-3.5 items-center transition-colors text-sm"
            >
              <div className="font-sans font-semibold text-white">
                <Link href={`/admin/questions/${q.slug}`} className="hover:text-accent transition-colors">
                  {q.title}
                </Link>
                <div className="font-mono text-[11px] text-neutral-500 font-normal mt-0.5">/{q.slug}</div>
              </div>
              <span className="font-mono text-[12px] text-neutral-400">{q.topic}</span>
              <div>
                <DifficultyBadge difficulty={q.difficulty as Difficulty} />
              </div>
              <span className="font-mono text-[12px] text-neutral-400">{q.estimateMinutes}m</span>
              <div>
                <ActiveToggle id={q.id} isActive={q.isActive} />
              </div>
              <div className="text-right">
                <Link
                  href={`/admin/questions/${q.slug}`}
                  className="btn-outline !py-1 !px-2.5 !text-[11px] !gap-1 inline-flex"
                >
                  <Edit3 size={11} />
                  Edit
                </Link>
              </div>
            </div>
          ))
        )}

        <Pagination
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
          basePath="/admin/questions"
          searchParams={searchParams}
        />
      </div>
    </div>
  );
}
