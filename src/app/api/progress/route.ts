import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import { getProgressSummary } from "@/lib/progress";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const summary = await getProgressSummary(userId);
  return NextResponse.json(summary);
}
