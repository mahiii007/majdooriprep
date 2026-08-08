import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { getHeaderStats } from "@/lib/progress";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { Types } from "mongoose";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/signin");
  }

  await connectDB();
  const { currentStreak, rank } = await getHeaderStats(new Types.ObjectId(session.user.id));
  const isAdmin = session.user.role === "admin";

  return (
    <div className="flex min-h-screen bg-base-900">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Suspense fallback={<div className="h-[73px] border-b border-base-700 bg-base-900" />}>
          <Topbar
            userName={session.user.name ?? "Engineer"}
            userImage={session.user.image}
            currentStreak={currentStreak}
            rank={rank}
          />
        </Suspense>
        <main className="flex-1 overflow-y-auto px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
