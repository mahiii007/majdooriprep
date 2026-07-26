import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import { listQuestions } from "@/lib/questions";
import type { Difficulty } from "@/models/Question";
import type { QuestionStatus } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const sp = req.nextUrl.searchParams;
  const result = await listQuestions({
    userId,
    topic: sp.get("topic") ?? undefined,
    difficulty: (sp.get("difficulty") as Difficulty | null) ?? undefined,
    status: (sp.get("status") as QuestionStatus | "attempted" | null) ?? undefined,
    search: sp.get("q") ?? undefined,
    page: sp.get("page") ? Number(sp.get("page")) : undefined,
    pageSize: sp.get("pageSize") ? Number(sp.get("pageSize")) : undefined,
  });

  return NextResponse.json(result);
}
