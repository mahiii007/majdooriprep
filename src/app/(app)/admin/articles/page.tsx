import { adminListArticles } from "@/lib/admin";
import { Pagination } from "@/components/Pagination";
import { Plus, Edit3, Eye, FileText } from "lucide-react";
import Link from "next/link";

export default async function AdminArticlesListPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const page = searchParams.page ? Number(searchParams.page) : 1;
  const status = searchParams.status as "draft" | "published" | undefined;

  const result = await adminListArticles({
    status,
    page,
    pageSize: 20,
  });

  return (
    <div className="space-y-6">
      {/* Header section with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-sans text-xl font-bold text-white">Articles Library</h2>
          <p className="text-sm text-neutral-400">Total {result.total} articles found.</p>
        </div>
        <Link href="/admin/articles/new" className="btn-accent">
          <Plus size={15} />
          Create Article
        </Link>
      </div>

      {/* Filter Section */}
      <div className="panel p-4 flex gap-3 items-center justify-between">
        <div className="flex gap-2 font-mono text-xs">
          <Link
            href="/admin/articles"
            className={`px-3 py-1.5 rounded-md transition-colors ${
              !status
                ? "bg-accent text-base-950 font-semibold"
                : "bg-base-800 text-neutral-400 hover:text-white"
            }`}
          >
            All
          </Link>
          <Link
            href="/admin/articles?status=published"
            className={`px-3 py-1.5 rounded-md transition-colors ${
              status === "published"
                ? "bg-accent text-base-950 font-semibold"
                : "bg-base-800 text-neutral-400 hover:text-white"
            }`}
          >
            Published
          </Link>
          <Link
            href="/admin/articles?status=draft"
            className={`px-3 py-1.5 rounded-md transition-colors ${
              status === "draft"
                ? "bg-accent text-base-950 font-semibold"
                : "bg-base-800 text-neutral-400 hover:text-white"
            }`}
          >
            Drafts
          </Link>
        </div>
      </div>

      {/* Articles Table */}
      <div className="panel overflow-hidden">
        <div className="grid grid-cols-[1fr_120px_150px_130px] gap-4 border-b border-base-700 px-5 py-3 label-mono">
          <span>Title</span>
          <span>Category/Tags</span>
          <span>Publish Date</span>
          <span className="text-right">Actions</span>
        </div>

        {result.items.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-neutral-500 font-mono">
            No articles found.
          </div>
        ) : (
          result.items.map((a) => (
            <div
              key={a.id}
              className="grid grid-cols-[1fr_120px_150px_130px] gap-4 border-b border-base-800 hover:bg-base-850 px-5 py-4 items-center transition-colors text-sm"
            >
              <div className="font-sans font-semibold text-white">
                <Link href={`/admin/articles/${a.slug}`} className="hover:text-accent transition-colors">
                  {a.title}
                </Link>
                <div className="font-mono text-[11px] text-neutral-500 font-normal mt-0.5">/{a.slug}</div>
              </div>
              <span className="font-mono text-[12px] text-neutral-400">
                {a.tags[0] || "General"}
              </span>
              <span className="font-mono text-[12px] text-neutral-400">
                {a.status === "published" && a.publishedAt ? (
                  new Date(a.publishedAt).toLocaleDateString()
                ) : (
                  <span className="text-neutral-500 italic">Draft</span>
                )}
              </span>
              <div className="text-right flex items-center justify-end gap-2">
                {a.status === "published" && (
                  <Link
                    href={`/articles/${a.slug}`}
                    target="_blank"
                    className="btn-outline !py-1 !px-2 !text-[11px] !gap-1 inline-flex"
                    title="View on site"
                  >
                    <Eye size={11} />
                  </Link>
                )}
                <Link
                  href={`/admin/articles/${a.slug}`}
                  className="btn-outline !py-1 !px-2.5 !text-[11px] !gap-1 inline-flex"
                >
                  <Edit3 size={11} />
                  Edit
                </Link>
              </div>
            </div>
          ))
        )}

        <Pagination
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
          basePath="/admin/articles"
          searchParams={searchParams}
        />
      </div>
    </div>
  );
}
