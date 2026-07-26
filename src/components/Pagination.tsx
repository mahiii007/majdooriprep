import Link from "next/link";
import clsx from "clsx";

export function Pagination({
  page,
  pageSize,
  total,
  basePath,
  searchParams,
}: {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  function hrefFor(p: number) {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter(([, v]) => v) as [string, string][]
    );
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 7);

  return (
    <div className="flex items-center justify-between border-t border-base-750 px-5 py-4">
      <span className="font-mono text-[12px] text-neutral-500">
        Showing {Math.min(pageSize, total - (page - 1) * pageSize)} of {total}
      </span>
      <div className="flex items-center gap-1.5">
        {pages.map((p) => (
          <Link
            key={p}
            href={hrefFor(p)}
            className={clsx(
              "focus-ring flex h-8 w-8 items-center justify-center rounded-md border font-mono text-[12px] transition-colors",
              p === page
                ? "border-accent bg-accent text-base-950 font-semibold"
                : "border-base-600 bg-base-800 text-neutral-400 hover:border-accent/50 hover:text-accent"
            )}
          >
            {p}
          </Link>
        ))}
      </div>
    </div>
  );
}
