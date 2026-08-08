"use client";

import { useTransition } from "react";
import { toggleQuestionActive } from "@/lib/admin-actions";
import { ToggleLeft, ToggleRight } from "lucide-react";

export function ActiveToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await toggleQuestionActive(id, !isActive);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to toggle status");
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`focus-ring inline-flex items-center gap-1 rounded px-2 py-1 font-mono text-[11px] uppercase transition-opacity ${
        isPending ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"
      } ${isActive ? "text-ok" : "text-neutral-500"}`}
      title={isActive ? "Deactivate Question" : "Activate Question"}
    >
      {isActive ? (
        <>
          <ToggleRight size={18} className="text-ok" />
          <span>Active</span>
        </>
      ) : (
        <>
          <ToggleLeft size={18} className="text-neutral-600" />
          <span>Inactive</span>
        </>
      )}
    </button>
  );
}
