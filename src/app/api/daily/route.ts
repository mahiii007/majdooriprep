import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import { getDailySet } from "@/lib/daily";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const dto = await getDailySet(userId);
  return NextResponse.json(dto);
}
