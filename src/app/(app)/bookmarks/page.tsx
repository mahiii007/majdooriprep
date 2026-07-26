import { Bookmark } from "lucide-react";
import { connectDB } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { listBookmarkedQuestions } from "@/lib/questions";
import { QuestionRow } from "@/components/QuestionRow";

export default async function BookmarksPage() {
  const userId = await requireUserId();
  await connectDB();
  const questions = await listBookmarkedQuestions(userId);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="font-sans text-3xl font-bold text-white">Bookmarks</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Questions you&apos;ve saved for later. {questions.length} bookmarked.
        </p>
      </div>

      {questions.length === 0 ? (
        <div className="panel flex flex-col items-center gap-3 px-6 py-20 text-center">
          <Bookmark size={28} className="text-neutral-600" />
          <p className="text-sm text-neutral-500">
            No bookmarks yet. Tap the bookmark icon on any question to save it here.
          </p>
        </div>
      ) : (
        <div className="panel overflow-hidden">
          <div className="grid grid-cols-[40px_1fr_160px_110px_90px_40px] gap-4 border-b border-base-700 px-5 py-3 label-mono">
            <span>Status</span>
            <span>Title</span>
            <span>Category</span>
            <span>Difficulty</span>
            <span>Estimate</span>
            <span>Action</span>
          </div>
          {questions.map((q) => (
            <QuestionRow key={q.id} question={q} />
          ))}
        </div>
      )}
    </div>
  );
}
