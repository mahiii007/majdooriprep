import { Schema, model, models, Document, Model, Types } from "mongoose";
import type { QuestionStatus } from "@/types";

export interface IUserQuestionState extends Document {
  userId: Types.ObjectId;
  questionId: Types.ObjectId;
  status: QuestionStatus;
  bookmarked: boolean;
  attemptsCount: number;
  firstDoneAt: Date | null;
  lastStatusChangeAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserQuestionStateSchema = new Schema<IUserQuestionState>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "done", "revision", "skipped"],
      default: "not_started",
    },
    bookmarked: { type: Boolean, default: false },
    attemptsCount: { type: Number, default: 0 },
    firstDoneAt: { type: Date, default: null },
    lastStatusChangeAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// One state document per (user, question) pair. This is also the write path
// that guards against double-submission: marking a question "done" twice is
// an idempotent upsert on this unique key, not an insert of a duplicate row.
UserQuestionStateSchema.index({ userId: 1, questionId: 1 }, { unique: true });
// Progress aggregation ("Total Solved", topic mastery) filters by user+status.
UserQuestionStateSchema.index({ userId: 1, status: 1 });
// Weekly "solved per week" chart buckets by completion date.
UserQuestionStateSchema.index({ userId: 1, firstDoneAt: 1 });

export const UserQuestionState: Model<IUserQuestionState> =
  models.UserQuestionState ||
  model<IUserQuestionState>("UserQuestionState", UserQuestionStateSchema);
