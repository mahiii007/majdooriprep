import { Schema, model, models, Document, Model } from "mongoose";

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export interface ICodeSnippet {
  language: string;
  code: string;
}

export interface IQuestion extends Document {
  title: string;
  slug: string;
  /** Human-readable category label (e.g. "Problem Solving") — used for progress/mastery. */
  topic: string;
  /** Category slug from categories.json (e.g. "problem-solving"). */
  category: string;
  /** Sub-category slug (e.g. "array(s)", "custom-hooks"). */
  subCategory: string;
  tags: string[];
  difficulty: Difficulty;
  /** Short excerpt shown in listings. */
  description: string;
  /** Full problem statement in markdown. */
  questionBody: string;
  /** Approach, solution code, and analysis in markdown. */
  solutionBody: string;
  codeSnippets: ICodeSnippet[];
  sourcePath?: string;
  estimateMinutes?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CodeSnippetSchema = new Schema<ICodeSnippet>(
  {
    language: { type: String, default: "javascript" },
    code: { type: String, required: true },
  },
  { _id: false }
);

const QuestionSchema = new Schema<IQuestion>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    topic: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    subCategory: { type: String, required: true, index: true },
    tags: { type: [String], default: [], index: true },
    difficulty: { type: String, enum: ["EASY", "MEDIUM", "HARD"], required: true, index: true },
    description: { type: String, required: true },
    questionBody: { type: String, default: "" },
    solutionBody: { type: String, default: "" },
    codeSnippets: { type: [CodeSnippetSchema], default: [] },
    sourcePath: { type: String },
    estimateMinutes: { type: Number, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

QuestionSchema.index({ title: "text", tags: "text", description: "text" });
QuestionSchema.index({ category: 1, subCategory: 1, difficulty: 1, isActive: 1 });

export const Question: Model<IQuestion> =
  models.Question || model<IQuestion>("Question", QuestionSchema);
