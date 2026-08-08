"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  CalendarCheck,
  ListChecks,
  FileText,
  BarChart3,
  Bookmark,
  Terminal,
  Shield,
} from "lucide-react";
import clsx from "clsx";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/daily", label: "Daily 5", icon: CalendarCheck },
  { href: "/questions", label: "Question Bank", icon: ListChecks },
  { href: "/articles", label: "Articles", icon: FileText },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
];

export function Sidebar({ isAdmin }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  const items = isAdmin
    ? [...NAV_ITEMS, { href: "/admin", label: "Admin Panel", icon: Shield }]
    : NAV_ITEMS;

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-r border-base-700 bg-base-950 px-5 py-6">
      <div className="mb-10 flex items-center gap-2 px-1">
        <Terminal size={20} className="text-accent" />
        <div>
          <div className="font-sans text-lg font-bold leading-tight text-white">
            Majdoori<span className="text-accent">Prep</span>
          </div>
          <div className="label-mono !text-[10px]">Deep Work Mode</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname?.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "focus-ring flex items-center gap-3 rounded-md px-3 py-2.5 font-mono text-[13px] transition-colors",
                active
                  ? "border-l-2 border-accent bg-base-800 text-accent"
                  : "border-l-2 border-transparent text-neutral-400 hover:bg-base-850 hover:text-neutral-200"
              )}
            >
              <Icon size={17} strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <Link href="/daily" className="btn-accent w-full">
        Start Practicing
      </Link>
    </aside>
  );
}
