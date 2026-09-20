import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

function normalizeMarkdown(content: string): string {
  return content.replace(/\r\n/g, "\n").trim();
}

export function MarkdownContent({ content }: { content: string }) {
  const markdown = normalizeMarkdown(content);
  if (!markdown) {
    return <p className="text-sm text-neutral-500">No content available.</p>;
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      // Existing question imports contain HTML image tags. Parse them, then
      // sanitize the result before it is rendered.
      rehypePlugins={[rehypeRaw, rehypeSanitize]}
      components={{
        h1: ({ children }) => (
          <h1 className="mb-4 mt-8 font-sans text-2xl font-bold text-white first:mt-0">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-3 mt-7 border-b border-base-700 pb-2 font-sans text-xl font-semibold text-white first:mt-0">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-2 mt-5 font-sans text-lg font-semibold text-neutral-100 first:mt-0">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="mb-2 mt-4 font-sans text-base font-semibold text-neutral-200 first:mt-0">
            {children}
          </h4>
        ),
        p: ({ children }) => (
          <p className="mb-4 text-sm leading-relaxed text-neutral-300">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="mb-4 list-disc space-y-1.5 pl-5 text-sm text-neutral-300">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-4 list-decimal space-y-1.5 pl-5 text-sm text-neutral-300">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="mb-4 border-l-2 border-accent/50 pl-4 text-sm italic text-neutral-400">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="my-6 border-base-700" />,
        strong: ({ children }) => (
          <strong className="font-semibold text-neutral-100">{children}</strong>
        ),
        em: ({ children }) => <em className="italic text-neutral-200">{children}</em>,
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-accent underline-offset-2 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            {children}
          </a>
        ),
        img: ({ src, alt, title }) => (
          <img
            src={src}
            alt={alt ?? ""}
            title={title}
            loading="lazy"
            className="mb-4 max-h-[36rem] w-auto max-w-full rounded-lg border border-base-700 bg-base-800 object-contain"
          />
        ),
        code: ({ className, children }) => {
          const isBlock = Boolean(className);
          if (isBlock) {
            const language = className?.replace("language-", "") ?? "code";
            return (
              <div className="mb-4 overflow-hidden rounded-lg border border-base-700">
                <div className="border-b border-base-700 bg-base-800 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                  {language}
                </div>
                <pre className="overflow-x-auto bg-base-950 p-4">
                  <code className="font-mono text-[13px] leading-6 text-neutral-200">
                    {children}
                  </code>
                </pre>
              </div>
            );
          }
          return (
            <code className="rounded bg-base-800 px-1.5 py-0.5 font-mono text-[12px] text-accent">
              {children}
            </code>
          );
        },
        pre: ({ children }) => <>{children}</>,
        table: ({ children }) => (
          <div className="mb-4 overflow-x-auto rounded-lg border border-base-700">
            <table className="min-w-full text-left text-sm text-neutral-300">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-base-800 text-neutral-200">{children}</thead>,
        tbody: ({ children }) => <tbody className="divide-y divide-base-700">{children}</tbody>,
        tr: ({ children }) => <tr>{children}</tr>,
        th: ({ children }) => (
          <th className="px-3 py-2 font-mono text-[11px] uppercase tracking-wide">{children}</th>
        ),
        td: ({ children }) => <td className="px-3 py-2">{children}</td>,
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
}
