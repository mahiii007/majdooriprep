import type { CodeSnippetDTO } from "@/types";

function normalizeCode(code: string): string {
  return code.replace(/\r\n/g, "\n").trimEnd();
}

function formatLanguage(language: string): string {
  const normalized = language.trim().toLowerCase();
  const labels: Record<string, string> = {
    js: "JavaScript",
    javascript: "JavaScript",
    ts: "TypeScript",
    typescript: "TypeScript",
    jsx: "JSX",
    tsx: "TSX",
    css: "CSS",
    html: "HTML",
    json: "JSON",
    bash: "Bash",
    shell: "Shell",
  };
  return labels[normalized] ?? language.toUpperCase();
}

export function CodeSnippetsPanel({ snippets }: { snippets: CodeSnippetDTO[] }) {
  if (snippets.length === 0) {
    return <p className="text-sm text-neutral-500">No code snippets available.</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      {snippets.map((snippet, index) => (
        <div key={`${snippet.language}-${index}`} className="overflow-hidden rounded-lg border border-base-700">
          <div className="flex items-center justify-between border-b border-base-700 bg-base-800 px-3 py-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
              {formatLanguage(snippet.language)}
            </span>
            {snippets.length > 1 && (
              <span className="font-mono text-[10px] text-neutral-600">
                Snippet {index + 1} of {snippets.length}
              </span>
            )}
          </div>
          <pre className="overflow-x-auto bg-base-950 p-4">
            <code className="block font-mono text-[13px] leading-6 text-neutral-200 whitespace-pre">
              {normalizeCode(snippet.code)}
            </code>
          </pre>
        </div>
      ))}
    </div>
  );
}
