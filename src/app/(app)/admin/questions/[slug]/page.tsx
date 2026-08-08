import { adminGetQuestionBySlug } from "@/lib/admin";
import { QuestionForm } from "../QuestionForm";
import { notFound } from "next/navigation";

export default async function AdminEditQuestionPage({
  params,
}: {
  params: { slug: string };
}) {
  const question = await adminGetQuestionBySlug(params.slug);
  if (!question) {
    notFound();
  }

  // Cast difficulty explicitly to EASY/MEDIUM/HARD
  const formInitialData = {
    ...question,
    difficulty: question.difficulty as "EASY" | "MEDIUM" | "HARD",
  };

  return <QuestionForm initialData={formInitialData} />;
}
