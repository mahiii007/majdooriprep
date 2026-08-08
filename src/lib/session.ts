import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth";

/** For Server Components / pages: redirects to /signin if unauthenticated. */
export async function requireUserId(): Promise<Types.ObjectId> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/signin");
  }
  return new Types.ObjectId(session.user.id);
}

/** For API routes: returns null instead of redirecting, so the caller can
 * respond with a proper 401 JSON body. */
export async function getSessionUserId(): Promise<Types.ObjectId | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return new Types.ObjectId(session.user.id);
}

/** For Server Components: redirects to /signin if unauthenticated, or to /dashboard if the user is not an admin. */
export async function requireAdmin(): Promise<Types.ObjectId> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/signin");
  }
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }
  return new Types.ObjectId(session.user.id);
}
