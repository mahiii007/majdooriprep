import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import { pickRandomQuestionSlug } from "@/lib/questions";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const slug = await pickRandomQuestionSlug(userId);
  if (!slug) {
    return NextResponse.json({ error: "No questions available" }, { status: 404 });
  }
  return NextResponse.json({ slug });
}
