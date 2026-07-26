import { connectDB } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { listQuestions, listTopics } from "@/lib/questions";
import { QuestionBankFilters } from "@/components/QuestionBankFilters";
import { QuestionRow } from "@/components/QuestionRow";
import { Pagination } from "@/components/Pagination";
import type { Difficulty } from "@/models/Question";
import type { QuestionStatus } from "@/types";

export default async function QuestionBankPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const userId = await requireUserId();
  await connectDB();

  const page = searchParams.page ? Number(searchParams.page) : 1;
  const [topics, result] = await Promise.all([
    listTopics(),
    listQuestions({
      userId,
      topic: searchParams.topic,
      difficulty: searchParams.difficulty as Difficulty | undefined,
      status: searchParams.status as QuestionStatus | undefined,
      search: searchParams.q,
      page,
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-sans text-3xl font-bold text-white">Question Bank</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Refine your craft through deliberate practice. {result.total} technical challenges
            curated for high-growth software engineers.
          </p>
        </div>
      </div>

      <div className="mb-6">
        <QuestionBankFilters topics={topics} />
      </div>

      <div className="panel overflow-hidden">
        <div className="grid grid-cols-[40px_1fr_160px_110px_90px_40px] gap-4 border-b border-base-700 px-5 py-3 label-mono">
          <span>Status</span>
          <span>Title</span>
          <span>Category</span>
          <span>Difficulty</span>
          <span>Estimate</span>
          <span>Action</span>
        </div>

        {result.items.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-neutral-500">
            No questions match these filters. Try widening your search.
          </div>
        ) : (
          result.items.map((q) => <QuestionRow key={q.id} question={q} />)
        )}

        <Pagination
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
          basePath="/questions"
          searchParams={searchParams}
        />
      </div>
    </div>
  );
}
