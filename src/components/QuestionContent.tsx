"use client";

import { useState } from "react";
import clsx from "clsx";
import { MarkdownContent } from "@/components/MarkdownContent";
import { CodeSnippetsPanel } from "@/components/CodeSnippetsPanel";
import type { CodeSnippetDTO } from "@/types";

type Tab = "problem" | "solution" | "code";

export function QuestionContent({
  questionBody,
  solutionBody,
  description,
  codeSnippets,
}: {
  questionBody: string;
  solutionBody: string;
  description: string;
  codeSnippets: CodeSnippetDTO[];
}) {
  const hasSolution = solutionBody.trim().length > 0;
  const hasCode = codeSnippets.length > 0;
  const [activeTab, setActiveTab] = useState<Tab>("problem");

  const problemContent = questionBody.trim() || description;

  const tabs: { id: Tab; label: string; disabled?: boolean }[] = [
    { id: "problem", label: "Problem" },
    { id: "solution", label: "Approach & Solution", disabled: !hasSolution },
    { id: "code", label: "Code", disabled: !hasCode },
  ];

  return (
    <div>
      <div className="mb-6 flex gap-1 rounded-lg border border-base-700 bg-base-800 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            disabled={tab.disabled}
            className={clsx(
              "focus-ring flex-1 rounded-md px-4 py-2 font-mono text-[12px] uppercase tracking-wide transition-colors",
              activeTab === tab.id
                ? "bg-accent text-base-950 font-semibold"
                : "text-neutral-400 hover:text-neutral-200",
              tab.disabled && "cursor-not-allowed opacity-40"
            )}
          >
            {tab.label}
            {tab.id === "code" && hasCode && (
              <span className="ml-1.5 text-[10px] opacity-70">({codeSnippets.length})</span>
            )}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-base-700 bg-base-900/40 p-6">
        {activeTab === "problem" && <MarkdownContent content={problemContent} />}
        {activeTab === "solution" &&
          (hasSolution ? (
            <MarkdownContent content={solutionBody} />
          ) : (
            <p className="text-sm text-neutral-500">
              No separate solution write-up for this question yet.
            </p>
          ))}
        {activeTab === "code" && <CodeSnippetsPanel snippets={codeSnippets} />}
      </div>
    </div>
  );
}
