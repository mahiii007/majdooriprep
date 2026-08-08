import { getAdminStats } from "@/lib/admin";
import Link from "next/link";
import { PlusCircle, Upload, ArrowRight, ShieldCheck, Database, FileText } from "lucide-react";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="panel p-6 bg-gradient-to-r from-base-850 to-base-800 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-accent">
            <ShieldCheck size={20} />
            <span className="label-mono !text-accent">Access Level: Administrator</span>
          </div>
          <h2 className="font-sans text-xl font-bold text-white">System Status & Content Control</h2>
          <p className="text-sm text-neutral-400">
            Publish questions for practice routines or seed reference materials.
          </p>
        </div>
        <div className="hidden md:block">
          <Database size={48} className="text-neutral-700" />
        </div>
      </div>

      {/* Stats Summary Widgets */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Questions Stats */}
        <div className="panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs uppercase tracking-wider text-neutral-400 font-semibold">
              Question Library
            </h3>
            <span className="flex h-2 w-2 rounded-full bg-ok" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-sans text-4xl font-extrabold text-white">{stats.totalQuestions}</span>
            <span className="text-xs text-neutral-500">total questions</span>
          </div>
          <div className="border-t border-base-750 pt-3 flex justify-between font-mono text-[11px] text-neutral-400">
            <span>Active: <span className="text-ok font-semibold">{stats.activeQuestions}</span></span>
            <span>Inactive: <span className="text-warn font-semibold">{stats.inactiveQuestions}</span></span>
          </div>
        </div>

        {/* Articles Stats */}
        <div className="panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs uppercase tracking-wider text-neutral-400 font-semibold">
              Articles Library
            </h3>
            <span className="flex h-2 w-2 rounded-full bg-accent" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-sans text-4xl font-extrabold text-white">{stats.totalArticles}</span>
            <span className="text-xs text-neutral-500">total articles</span>
          </div>
          <div className="border-t border-base-750 pt-3 flex justify-between font-mono text-[11px] text-neutral-400">
            <span>Published: <span className="text-accent font-semibold">{stats.publishedArticles}</span></span>
            <span>Drafts: <span className="text-neutral-500 font-semibold">{stats.draftArticles}</span></span>
          </div>
        </div>

        {/* System Details */}
        <div className="panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs uppercase tracking-wider text-neutral-400 font-semibold">
              System Stack
            </h3>
            <span className="flex h-2 w-2 rounded-full bg-accent-light" />
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between font-mono text-xs">
              <span className="text-neutral-400">Database Engine:</span>
              <span className="text-neutral-200">MongoDB / Mongoose</span>
            </div>
            <div className="flex justify-between font-mono text-xs">
              <span className="text-neutral-400">Auth Engine:</span>
              <span className="text-neutral-200">NextAuth.js (JWT)</span>
            </div>
            <div className="flex justify-between font-mono text-xs">
              <span className="text-neutral-400">Role Authority:</span>
              <span className="text-neutral-200">Role-based Access Control</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Matrix */}
      <div>
        <h3 className="font-sans text-lg font-bold text-white mb-4">Quick Operations</h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Add Question Card */}
          <Link
            href="/admin/questions/new"
            className="panel p-5 block group hover:border-accent/40 transition-colors space-y-3"
          >
            <div className="p-3 bg-base-800 rounded-md w-fit text-accent group-hover:bg-accent/15 transition-colors">
              <PlusCircle size={20} />
            </div>
            <div>
              <h4 className="font-sans font-semibold text-white group-hover:text-accent transition-colors">
                New Question
              </h4>
              <p className="text-xs text-neutral-400 mt-1">
                Draft a technical challenge and publish it into the question pool.
              </p>
            </div>
            <div className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wide text-neutral-500 group-hover:text-accent transition-colors">
              Add single question <ArrowRight size={12} />
            </div>
          </Link>

          {/* Add Article Card */}
          <Link
            href="/admin/articles/new"
            className="panel p-5 block group hover:border-accent/40 transition-colors space-y-3"
          >
            <div className="p-3 bg-base-800 rounded-md w-fit text-accent group-hover:bg-accent/15 transition-colors">
              <FileText size={20} />
            </div>
            <div>
              <h4 className="font-sans font-semibold text-white group-hover:text-accent transition-colors">
                New Article
              </h4>
              <p className="text-xs text-neutral-400 mt-1">
                Write reference guides, concept deep dives, or interview strategies.
              </p>
            </div>
            <div className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wide text-neutral-500 group-hover:text-accent transition-colors">
              Add single article <ArrowRight size={12} />
            </div>
          </Link>

          {/* Bulk Import Card */}
          <Link
            href="/admin/bulk-upload"
            className="panel p-5 block group hover:border-accent/40 transition-colors space-y-3"
          >
            <div className="p-3 bg-base-800 rounded-md w-fit text-accent group-hover:bg-accent/15 transition-colors">
              <Upload size={20} />
            </div>
            <div>
              <h4 className="font-sans font-semibold text-white group-hover:text-accent transition-colors">
                Bulk Loader
              </h4>
              <p className="text-xs text-neutral-400 mt-1">
                Import dozens of records using copy-pasted CSV lists or structured JSON lists.
              </p>
            </div>
            <div className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wide text-neutral-500 group-hover:text-accent transition-colors">
              Launch Bulk Upload <ArrowRight size={12} />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
