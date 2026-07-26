import { Schema, model, models, Document, Model } from "mongoose";

export interface IArticle extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  status: "draft" | "published";
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ["draft", "published"], default: "published", index: true },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Article: Model<IArticle> =
  models.Article || model<IArticle>("Article", ArticleSchema);
