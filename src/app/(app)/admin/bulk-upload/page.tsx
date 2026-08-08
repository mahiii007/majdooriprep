"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { bulkUpsertQuestions, bulkUpsertArticles } from "@/lib/admin-actions";
import { UploadCloud, CheckCircle, AlertTriangle, Play, HelpCircle, Loader2 } from "lucide-react";

// Simple CSV parser supporting escaped commas inside quotes
function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (next === '"') {
          field += '"';
          i++; // Skip the double quote escape
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(field.trim());
        field = "";
      } else if (char === "\n" || (char === "\r" && next === "\n")) {
        row.push(field.trim());
        lines.push(row);
        row = [];
        field = "";
        if (char === "\r") i++; // Skip the \n
      } else {
        field += char;
      }
    }
  }

  // Handle final field and row
  if (field || row.length > 0) {
    row.push(field.trim());
    lines.push(row);
  }

  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].map(h => h.toLowerCase().trim());
  const rows = lines.slice(1).filter(r => r.length > 0 && r.some(cell => cell.trim() !== ""));
  return { headers, rows };
}

interface ValidationError {
  index: number;
  itemTitle: string;
  errors: string[];
}

export default function BulkUploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const [type, setType] = useState<"questions" | "articles">("questions");
  const [format, setFormat] = useState<"json" | "csv">("json");
  const [inputString, setInputString] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Parsing & validation states
  const [parsedItems, setParsedItems] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [parseErrorString, setParseErrorString] = useState<string | null>(null);

  // Import results status
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [importMessage, setImportMessage] = useState("");

  const [showExamples, setShowExamples] = useState(false);

  // Perform live parsing & validation on input changes
  useEffect(() => {
    setImportStatus("idle");
    setImportMessage("");
    setParseErrorString(null);
    setValidationErrors([]);
    setParsedItems([]);

    if (!inputString.trim()) {
      return;
    }

    try {
      if (format === "json") {
        let arrayData: any;
        try {
          arrayData = JSON.parse(inputString);
        } catch (e: any) {
          setParseErrorString(`JSON Syntax Error: ${e.message}`);
          return;
        }

        if (!Array.isArray(arrayData)) {
          setParseErrorString("Invalid structure: JSON root must be an array of objects.");
          return;
        }

        const items: any[] = [];
        const errors: ValidationError[] = [];

        arrayData.forEach((item, index) => {
          const itemErrors: string[] = [];
          const name = item.title || `Item #${index + 1}`;

          if (type === "questions") {
            if (!item.title) itemErrors.push("Missing 'title'");
            if (!item.topic) itemErrors.push("Missing 'topic'");
            if (item.difficulty && !["EASY", "MEDIUM", "HARD"].includes(item.difficulty)) {
              itemErrors.push("Difficulty must be EASY, MEDIUM, or HARD");
            } else if (!item.difficulty) {
              itemErrors.push("Missing 'difficulty'");
            }
            if (item.estimateMinutes === undefined || isNaN(Number(item.estimateMinutes))) {
              itemErrors.push("EstimateMinutes must be a number");
            }
            if (!item.description) itemErrors.push("Missing 'description'");
          } else {
            // Articles validation
            if (!item.title) itemErrors.push("Missing 'title'");
            if (!item.excerpt) itemErrors.push("Missing 'excerpt'");
            if (!item.content) itemErrors.push("Missing 'content'");
          }

          if (itemErrors.length > 0) {
            errors.push({ index, itemTitle: name, errors: itemErrors });
          }

          items.push({
            ...item,
            tags: Array.isArray(item.tags)
              ? item.tags
              : item.tags
              ? String(item.tags).split(",").map((t: string) => t.trim())
              : [],
            estimateMinutes: item.estimateMinutes ? Number(item.estimateMinutes) : 15,
            isActive: item.isActive !== false,
            status: item.status || "published",
          });
        });

        setParsedItems(items);
        setValidationErrors(errors);
      } else {
        // CSV Parsing
        const { headers, rows } = parseCSV(inputString);
        if (headers.length === 0) {
          setParseErrorString("CSV Parsing Error: No columns found.");
          return;
        }

        const items: any[] = [];
        const errors: ValidationError[] = [];

        rows.forEach((row, index) => {
          const rowData: Record<string, string> = {};
          headers.forEach((header, colIdx) => {
            rowData[header] = row[colIdx] || "";
          });

          const itemErrors: string[] = [];
          const name = rowData.title || `Row #${index + 2}`;

          if (type === "questions") {
            if (!rowData.title) itemErrors.push("Missing 'title' column");
            if (!rowData.topic) itemErrors.push("Missing 'topic' column");
            const diff = (rowData.difficulty || "").toUpperCase();
            if (diff && !["EASY", "MEDIUM", "HARD"].includes(diff)) {
              itemErrors.push("Difficulty column must be EASY, MEDIUM, or HARD");
            } else if (!diff) {
              itemErrors.push("Missing 'difficulty' column");
            }
            const mins = Number(rowData.estimateminutes || rowData.estimate_minutes);
            if (isNaN(mins) || mins <= 0) {
              itemErrors.push("EstimateMinutes column must be a positive number");
            }
            if (!rowData.description) itemErrors.push("Missing 'description' column");

            items.push({
              title: rowData.title,
              slug: rowData.slug || undefined,
              topic: rowData.topic,
              tags: rowData.tags ? rowData.tags.split(",").map(t => t.trim()) : [],
              difficulty: diff,
              estimateMinutes: isNaN(mins) ? 15 : mins,
              description: rowData.description,
              isActive: rowData.isactive !== "false",
            });
          } else {
            // Articles
            if (!rowData.title) itemErrors.push("Missing 'title' column");
            if (!rowData.excerpt) itemErrors.push("Missing 'excerpt' column");
            if (!rowData.content) itemErrors.push("Missing 'content' column");

            items.push({
              title: rowData.title,
              slug: rowData.slug || undefined,
              excerpt: rowData.excerpt,
              content: rowData.content,
              tags: rowData.tags ? rowData.tags.split(",").map(t => t.trim()) : [],
              status: rowData.status || "published",
            });
          }

          if (itemErrors.length > 0) {
            errors.push({ index, itemTitle: name, errors: itemErrors });
          }
        });

        setParsedItems(items);
        setValidationErrors(errors);
      }
    } catch (e: any) {
      setParseErrorString(`Unexpected parsing error: ${e.message}`);
    }
  }, [inputString, type, format]);

  // Drag-and-drop handles
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      loadFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadFile(file);
    }
  };

  const loadFile = (file: File) => {
    const name = file.name.toLowerCase();
    let detectedFormat: "json" | "csv" = "json";
    if (name.endsWith(".csv")) {
      detectedFormat = "csv";
    } else if (name.endsWith(".json")) {
      detectedFormat = "json";
    } else {
      alert("Unsupported file format. Please upload a .json or .csv file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFormat(detectedFormat);
      setInputString(text);
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = () => {
    if (parsedItems.length === 0 || validationErrors.length > 0 || parseErrorString) {
      return;
    }

    setImportStatus("idle");

    startTransition(async () => {
      try {
        if (type === "questions") {
          await bulkUpsertQuestions(parsedItems);
        } else {
          await bulkUpsertArticles(parsedItems);
        }
        setImportStatus("success");
        setImportMessage(`Successfully imported/updated ${parsedItems.length} items!`);
        setInputString("");
        router.refresh();
      } catch (err: any) {
        setImportStatus("error");
        setImportMessage(err.message || "Failed to commit items to database.");
      }
    });
  };

  // Pre-cooked template strings
  const questionJSONExample = `[
  {
    "title": "Build a useLocalStorage hook",
    "slug": "build-use-local-storage-hook",
    "topic": "React",
    "tags": ["hooks", "state", "storage"],
    "difficulty": "MEDIUM",
    "estimateMinutes": 20,
    "description": "Write a useLocalStorage(key, initialValue) hook that stores its value in window.localStorage and synchronizes values across open browser tabs."
  },
  {
    "title": "Predict Output: Closure variables",
    "topic": "JavaScript",
    "tags": ["closures", "hoisting"],
    "difficulty": "EASY",
    "estimateMinutes": 10,
    "description": "Walk through this closure example and predict what values print. Why does var inside a loop bind to the final index value?"
  }
]`;

  const questionCSVExample = `title,slug,topic,tags,difficulty,estimateMinutes,description
"Build a useLocalStorage hook",build-use-local-storage-hook,React,"hooks,state",MEDIUM,20,"Write a useLocalStorage(key, initialValue) hook that stores its value in window.localStorage..."
"Predict Output: Closure variables",predict-closure-vars,JavaScript,"closures,hoisting",EASY,10,"Walk through this closure example and predict..."`;

  const articleJSONExample = `[
  {
    "title": "A Guide to React Server Components",
    "slug": "guide-react-server-components",
    "excerpt": "Learn how server components work in Next.js and why they improve page load times.",
    "tags": ["React", "Next.js"],
    "content": "React Server Components run only on the server, which means their dependencies do not add to client-side bundle size. In this article, we deep-dive..."
  }
]`;

  const articleCSVExample = `title,slug,excerpt,content,tags,status
"A Guide to React Server Components",guide-react-server-components,"Learn how server components work in Next.js...","React Server Components run only on the server, which means...","React,Next.js",published`;

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div>
          <h2 className="font-sans text-xl font-bold text-white">Bulk Data Creator</h2>
          <p className="text-sm text-neutral-400">Load batch items directly into database models.</p>
        </div>

        <button
          onClick={() => setShowExamples(!showExamples)}
          className="btn-outline !py-1.5 !px-3 !text-xs !gap-1.5 inline-flex"
        >
          <HelpCircle size={14} />
          {showExamples ? "Hide Templates" : "Show Templates"}
        </button>
      </div>

      {/* Examples section */}
      {showExamples && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="panel p-5 space-y-2">
            <h4 className="font-mono text-xs uppercase font-bold text-accent">Questions Template (JSON / CSV)</h4>
            <div className="text-[11px] font-mono p-3 bg-base-900 border border-base-800 rounded text-neutral-400 select-all overflow-x-auto whitespace-pre">
              {format === "json" ? questionJSONExample : questionCSVExample}
            </div>
          </div>
          <div className="panel p-5 space-y-2">
            <h4 className="font-mono text-xs uppercase font-bold text-accent">Articles Template (JSON / CSV)</h4>
            <div className="text-[11px] font-mono p-3 bg-base-900 border border-base-800 rounded text-neutral-400 select-all overflow-x-auto whitespace-pre">
              {format === "json" ? articleJSONExample : articleCSVExample}
            </div>
          </div>
        </div>
      )}

      {/* Inputs Configuration panel */}
      <div className="panel p-6 bg-gradient-to-r from-base-850 to-base-800 grid gap-6 md:grid-cols-2">
        {/* Step 1: Select Type */}
        <div className="space-y-3">
          <span className="label-mono !text-accent">Step 1: Choose Model Type</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-white font-mono cursor-pointer select-none">
              <input
                type="radio"
                name="type"
                checked={type === "questions"}
                onChange={() => setType("questions")}
                className="focus-ring h-4 w-4 bg-base-900 border-base-700 text-accent"
              />
              Questions Library
            </label>
            <label className="flex items-center gap-2 text-sm text-white font-mono cursor-pointer select-none">
              <input
                type="radio"
                name="type"
                checked={type === "articles"}
                onChange={() => setType("articles")}
                className="focus-ring h-4 w-4 bg-base-900 border-base-700 text-accent"
              />
              Articles Library
            </label>
          </div>
        </div>

        {/* Step 2: Select Format */}
        <div className="space-y-3">
          <span className="label-mono !text-accent">Step 2: Choose Data Format</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-white font-mono cursor-pointer select-none">
              <input
                type="radio"
                name="format"
                checked={format === "json"}
                onChange={() => setFormat("json")}
                className="focus-ring h-4 w-4 bg-base-900 border-base-700 text-accent"
              />
              JSON Array
            </label>
            <label className="flex items-center gap-2 text-sm text-white font-mono cursor-pointer select-none">
              <input
                type="radio"
                name="format"
                checked={format === "csv"}
                onChange={() => setFormat("csv")}
                className="focus-ring h-4 w-4 bg-base-900 border-base-700 text-accent"
              />
              CSV Spreadsheet
            </label>
          </div>
        </div>
      </div>

      {/* Upload Box and Drag and Drop */}
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        {/* Left Side: Paste input */}
        <div className="panel p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="label-mono">Raw data input</span>
            {inputString && (
              <button
                onClick={() => setInputString("")}
                className="text-xs text-neutral-500 hover:text-white font-mono"
              >
                Clear input
              </button>
            )}
          </div>
          <textarea
            value={inputString}
            onChange={(e) => setInputString(e.target.value)}
            rows={12}
            placeholder={
              format === "json"
                ? "Paste a JSON array of items here... (e.g. [ { 'title': '...' } ])"
                : "Paste your CSV text here... (first row must be column headers)"
            }
            className="focus-ring w-full rounded-md border border-base-700 bg-base-900 px-4 py-3 text-sm text-white placeholder-neutral-600 font-mono"
          />
        </div>

        {/* Right Side: File Drop Uploader */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`panel p-6 flex flex-col items-center justify-center text-center cursor-pointer border-dashed border-2 transition-colors ${
            isDragging ? "border-accent bg-accent-muted" : "border-base-700 hover:border-accent/40"
          }`}
        >
          <UploadCloud size={40} className="text-neutral-500 mb-3" />
          <span className="font-sans font-bold text-white text-sm">Drag & Drop File</span>
          <span className="text-xs text-neutral-400 mt-1.5 font-mono">Supports .json and .csv</span>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,.csv"
            className="hidden"
          />
          <button className="btn-outline !py-1.5 !px-3 !text-[11px] mt-4 font-mono">
            Browse files
          </button>
        </div>
      </div>

      {/* Validation Banner or Import Messages */}
      {importStatus !== "idle" && (
        <div
          className={`panel p-5 flex items-start gap-3 border ${
            importStatus === "success"
              ? "border-ok/30 bg-ok-muted text-ok"
              : "border-warn/30 bg-warn-muted text-warn"
          }`}
        >
          <CheckCircle size={18} className="mt-0.5" />
          <div>
            <h4 className="font-bold text-sm font-sans">
              {importStatus === "success" ? "Bulk Import Completed" : "Import Database Error"}
            </h4>
            <p className="text-xs font-mono mt-1 text-white">{importMessage}</p>
          </div>
        </div>
      )}

      {/* Parsing details or Errors */}
      {parseErrorString && (
        <div className="panel p-5 border border-warn/30 bg-warn-muted text-warn flex items-start gap-3">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>
            <h4 className="font-bold text-sm font-sans">Parsing Error</h4>
            <p className="text-xs font-mono mt-1 text-white">{parseErrorString}</p>
          </div>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="panel p-5 border border-warn/30 bg-warn-muted text-warn space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="shrink-0" />
            <h4 className="font-bold text-sm font-sans">Validation Schema Errors ({validationErrors.length})</h4>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-2 text-xs font-mono text-white">
            {validationErrors.map((err, idx) => (
              <div key={idx} className="border-b border-base-800 pb-2">
                <span className="font-semibold text-accent">[{err.itemTitle}]:</span>
                <ul className="list-disc pl-5 mt-1 space-y-0.5 text-neutral-300">
                  {err.errors.map((e, eIdx) => (
                    <li key={eIdx}>{e}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Parse Preview Grid (If parsed items exist and are valid) */}
      {parsedItems.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-base-800 pb-2">
            <h3 className="font-sans text-lg font-bold text-white">Live Data Preview ({parsedItems.length} items parsed)</h3>
            <button
              onClick={handleImportSubmit}
              disabled={isPending || validationErrors.length > 0}
              className="btn-accent !gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Play size={14} />
                  Commit to Database
                </>
              )}
            </button>
          </div>

          <div className="panel overflow-hidden">
            {type === "questions" ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-base-800 text-[10px] label-mono uppercase text-neutral-400">
                    <tr>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Slug</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Difficulty</th>
                      <th className="px-4 py-3">Estimate</th>
                      <th className="px-4 py-3">Tags</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base-850 bg-base-900 font-mono text-[11px] text-neutral-300">
                    {parsedItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-base-850">
                        <td className="px-4 py-2.5 font-sans font-semibold text-white">{item.title || <span className="text-warn italic">Missing</span>}</td>
                        <td className="px-4 py-2.5 text-neutral-500">{item.slug || <span className="text-neutral-500 italic">auto-generated</span>}</td>
                        <td className="px-4 py-2.5 text-neutral-400">{item.topic || <span className="text-warn italic">Missing</span>}</td>
                        <td className="px-4 py-2.5 font-bold">
                          {["EASY", "MEDIUM", "HARD"].includes(item.difficulty) ? (
                            <span className={item.difficulty === "EASY" ? "text-ok" : item.difficulty === "MEDIUM" ? "text-accent" : "text-warn"}>
                              {item.difficulty}
                            </span>
                          ) : (
                            <span className="text-warn italic">Invalid ({item.difficulty || "none"})</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">{item.estimateMinutes}m</td>
                        <td className="px-4 py-2.5 text-neutral-500">{item.tags.join(", ") || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-base-800 text-[10px] label-mono uppercase text-neutral-400">
                    <tr>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Slug</th>
                      <th className="px-4 py-3">Excerpt</th>
                      <th className="px-4 py-3">Tags</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base-850 bg-base-900 font-mono text-[11px] text-neutral-300">
                    {parsedItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-base-850">
                        <td className="px-4 py-2.5 font-sans font-semibold text-white">{item.title || <span className="text-warn italic">Missing</span>}</td>
                        <td className="px-4 py-2.5 text-neutral-500">{item.slug || <span className="text-neutral-500 italic">auto-generated</span>}</td>
                        <td className="px-4 py-2.5 text-neutral-400 truncate max-w-xs">{item.excerpt || <span className="text-warn italic">Missing</span>}</td>
                        <td className="px-4 py-2.5 text-neutral-500">{item.tags.join(", ") || "-"}</td>
                        <td className="px-4 py-2.5 uppercase font-bold text-accent">{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
