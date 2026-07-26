import { Schema, model, models, Document, Model, Types } from "mongoose";

export interface IDailyAssignment extends Document {
  userId: Types.ObjectId;
  date: string; // "YYYY-MM-DD" computed in APP_TIMEZONE — see lib/date.ts
  questionIds: Types.ObjectId[];
  allCompleted: boolean;
  allCompletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const DailyAssignmentSchema = new Schema<IDailyAssignment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // Stored as a plain calendar-day string rather than a Date so that
    // equality/uniqueness checks never depend on time-of-day or the server's
    // local TZ offset — see DESIGN.md "Timezone strategy".
    date: { type: String, required: true },
    questionIds: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    // Denormalized so streak computation is a single indexed scan over
    // DailyAssignment instead of joining against UserQuestionState for every
    // day in a user's history.
    allCompleted: { type: Boolean, default: false },
    allCompletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// One assignment per user per day. This is what makes the daily set
// "pinned": the first read-or-create wins, every subsequent read for that
// (user, date) returns the exact same question list.
DailyAssignmentSchema.index({ userId: 1, date: 1 }, { unique: true });
// Streak walk reads a user's assignments ordered by date descending.
DailyAssignmentSchema.index({ userId: 1, date: -1 });

export const DailyAssignment: Model<IDailyAssignment> =
  models.DailyAssignment ||
  model<IDailyAssignment>("DailyAssignment", DailyAssignmentSchema);
