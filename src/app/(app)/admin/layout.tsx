import { requireAdmin } from "@/lib/session";
import Link from "next/link";
import { LayoutDashboard, FileQuestion, BookOpen, UploadCloud } from "lucide-react";

export default async function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce server-side check. Non-admins get redirected.
  await requireAdmin();

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-base-700 pb-5">
        <div>
          <h1 className="font-sans text-3xl font-bold text-white tracking-tight">Admin Control Panel</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Publish, edit, and bulk-load interview challenges and technical reference articles.
          </p>
        </div>
      </div>

      {/* Admin Sub-navigation Tab Bar */}
      <div className="mb-8 border-b border-base-800">
        <div className="flex gap-2 font-mono text-[13px]">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-4 py-2 text-neutral-400 hover:text-white hover:border-b-2 hover:border-accent transition-colors"
          >
            <LayoutDashboard size={15} />
            Overview
          </Link>
          <Link
            href="/admin/questions"
            className="flex items-center gap-2 px-4 py-2 text-neutral-400 hover:text-white hover:border-b-2 hover:border-accent transition-colors"
          >
            <FileQuestion size={15} />
            Manage Questions
          </Link>
          <Link
            href="/admin/articles"
            className="flex items-center gap-2 px-4 py-2 text-neutral-400 hover:text-white hover:border-b-2 hover:border-accent transition-colors"
          >
            <BookOpen size={15} />
            Manage Articles
          </Link>
          <Link
            href="/admin/bulk-upload"
            className="flex items-center gap-2 px-4 py-2 text-neutral-400 hover:text-white hover:border-b-2 hover:border-accent transition-colors"
          >
            <UploadCloud size={15} />
            Bulk Upload
          </Link>
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
}
