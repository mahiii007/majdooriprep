import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import type { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

// No NextAuth adapter is used on purpose. Adapters (e.g.
// @auth/mongodb-adapter) write Users/Accounts/Sessions into raw MongoDB
// driver collections that live outside Mongoose's schema layer, which would
// give us two disconnected notions of "User" — one NextAuth owns, one our
// Question/Progress code owns. Instead we run JWT sessions (no DB read per
// request) and upsert our own Mongoose User document ourselves in the
// signIn/jwt callbacks below, linking by provider id or by email.
export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!account || !user.email) return false;

      await connectDB();
      const providerKey = account.provider === "google" ? "googleId" : "githubId";
      const providerId = account.providerAccountId;

      // Link by existing provider id first (returning user), otherwise by
      // email (first sign-in, or adding a second OAuth provider to an
      // account that already exists), otherwise create fresh.
      await User.findOneAndUpdate(
        { $or: [{ [providerKey]: providerId }, { email: user.email.toLowerCase() }] },
        {
          $set: {
            name: user.name ?? "MajdooriPrep User",
            email: user.email.toLowerCase(),
            image: user.image ?? undefined,
            [providerKey]: providerId,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return true;
    },
    async jwt({ token, user }) {
      // Only re-resolve on sign-in (when `user` is present); subsequent
      // calls reuse the cached uid/role already in the token, keeping JWT
      // sessions DB-free on every request as intended.
      if (user?.email) {
        await connectDB();
        const dbUser = await User.findOne(
          { email: user.email.toLowerCase() },
          { _id: 1, role: 1 }
        ).lean<{ _id: Types.ObjectId; role: "user" | "admin" } | null>();
        if (dbUser) {
          token.uid = dbUser._id.toString();
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.uid) {
        session.user.id = token.uid;
        session.user.role = token.role ?? "user";
      }
      return session;
    },
  },
};
