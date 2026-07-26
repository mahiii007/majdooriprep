import { Schema, model, models, Document, Model } from "mongoose";

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export interface IQuestion extends Document {
  title: string;
  slug: string;
  topic: string;
  tags: string[];
  difficulty: Difficulty;
  estimateMinutes: number;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    // Top-level category shown as a filter pill in the Question Bank
    // ("JavaScript", "React", "Data Structures", "System Design", "CSS Architecture", ...).
    topic: { type: String, required: true, index: true },
    // Finer-grained labels (e.g. "closures", "timers") used for the Weak
    // Areas / Topic Mastery breakdown on the Progress page.
    tags: { type: [String], default: [], index: true },
    difficulty: { type: String, enum: ["EASY", "MEDIUM", "HARD"], required: true, index: true },
    estimateMinutes: { type: Number, required: true, min: 1 },
    description: { type: String, required: true },
    // Soft-delete flag. Retired questions stay in history (existing
    // UserQuestionState rows) but are excluded from search, question bank
    // listing, and future daily assignments.
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// Text index for the search bar ("Search Problems (e.g. 'LRU Cache')").
QuestionSchema.index({ title: "text", tags: "text" });
// Compound index for the Question Bank's topic + difficulty filter combo.
QuestionSchema.index({ topic: 1, difficulty: 1, isActive: 1 });

export const Question: Model<IQuestion> =
  models.Question || model<IQuestion>("Question", QuestionSchema);
