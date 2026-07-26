import { Schema, model, models, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  googleId?: string;
  githubId?: string;
  role: "user" | "admin";
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    image: { type: String },
    // We don't use the NextAuth MongoDB adapter (which writes to raw driver
    // collections outside Mongoose). Instead the JWT/signIn callback upserts
    // this document directly and links whichever OAuth provider signed in.
    googleId: { type: String, unique: true, sparse: true },
    githubId: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    // Reserved for a future per-user timezone override. MVP uses a single
    // APP_TIMEZONE for all users (see DESIGN.md "Timezone strategy").
    timezone: { type: String, default: "UTC" },
  },
  { timestamps: true }
);

export const User: Model<IUser> = models.User || model<IUser>("User", UserSchema);
