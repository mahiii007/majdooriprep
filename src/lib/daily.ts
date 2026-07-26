import { Types } from "mongoose";
import { getOrCreateDailyAssignment } from "@/lib/dailyAssignment";
import { Question, IQuestion } from "@/models/Question";
import { UserQuestionState, IUserQuestionState } from "@/models/UserQuestionState";
import { toQuestionDTO } from "@/lib/questions";
import type { DailySetDTO } from "@/types";

export async function getDailySet(userId: Types.ObjectId): Promise<DailySetDTO> {
  const assignment = await getOrCreateDailyAssignment(userId);

  const questions = await Question.find({ _id: { $in: assignment.questionIds } }).lean<
    IQuestion[]
  >();
  const states = await UserQuestionState.find({
    userId,
    questionId: { $in: assignment.questionIds },
  }).lean<IUserQuestionState[]>();
  const stateByQuestionId = new Map(states.map((s) => [String(s.questionId), s]));

  // Preserve the assignment's original order rather than Mongo's natural
  // find() order, so the set doesn't visually reshuffle between visits.
  const orderedQuestions = assignment.questionIds
    .map((id) => questions.find((q) => String(q._id) === String(id)))
    .filter((q): q is IQuestion => Boolean(q));

  return {
    date: assignment.date,
    questions: orderedQuestions.map((q) => toQuestionDTO(q, stateByQuestionId.get(String(q._id)))),
    completedCount: orderedQuestions.filter(
      (q) => stateByQuestionId.get(String(q._id))?.status === "done"
    ).length,
    totalCount: orderedQuestions.length,
    allCompleted: assignment.allCompleted,
  };
}
