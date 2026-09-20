/**
 * Seeds the Question and Article collections from src/app/data/*.json.
 * Safe to re-run: every document is upserted by its unique `slug`.
 *
 * Usage: npm run seed   (reads MONGODB_URI from .env.local or .env)
 */
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

import mongoose from "mongoose";
import { Question, Difficulty } from "../src/models/Question";
import { Article } from "../src/models/Article";

type SeedQuestionJson = {
  slug: string;
  title: string;
  description: string;
  questionBody: string;
  solutionBody: string;
  category: string;
  subCategory: string;
  tags: string[];
  difficulty: string;
  sourcePath?: string;
  codeSnippets?: { language: string; code: string }[];
};

type CategoryJson = {
  name: string;
  label: string;
};

function loadJson<T>(relativePath: string): T {
  const filePath = path.resolve(process.cwd(), relativePath);
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

function normalizeDifficulty(value: string): Difficulty {
  const upper = value.trim().toUpperCase();
  if (upper === "EASY" || upper === "MEDIUM" || upper === "HARD") {
    return upper;
  }
  return "MEDIUM";
}

type SeedArticle = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
};

const articles: SeedArticle[] = [
  {
    slug: "mastering-the-event-loop",
    title: "Mastering the Event Loop",
    excerpt:
      "Why the same question about setTimeout and Promises keeps showing up in interviews — and how to reason about it for good.",
    tags: ["JavaScript", "event-loop"],
    content:
      "The event loop is one of those topics every JavaScript engineer has been quizzed on at least once, usually with a snippet mixing setTimeout, Promise.then, and plain synchronous code, and a prompt to predict the console output order.\n\nThe short version: synchronous code always runs first, to completion, before the event loop looks at anything else. Once the call stack is empty, the loop drains the entire microtask queue — Promise callbacks, queueMicrotask — before it processes a single macrotask like a timer callback. Then it runs one macrotask, checks the microtask queue again, and repeats.\n\nThe part that trips people up isn't the definition, it's applying it under pressure. The fastest way to get reliable at these questions is to stop trying to memorize outputs and instead narrate the queues out loud as you read the code: what's on the call stack right now, what's waiting in microtasks, what's waiting in macrotasks. Once that narration is automatic, the 'trick' questions stop feeling like tricks.",
  },
  {
    slug: "practical-guide-to-system-design-interviews",
    title: "A Practical Guide to System Design Interviews",
    excerpt:
      "System design interviews reward a repeatable process more than encyclopedic knowledge. Here's a structure that holds up under time pressure.",
    tags: ["System Design", "interviews"],
    content:
      "Most system design interviews aren't actually testing whether you've memorized how a specific company built a specific system. They're testing whether you can take an ambiguous prompt, narrow it down, and reason about tradeoffs out loud.\n\nA structure that works well under a 45-minute clock: start by clarifying requirements and scale (reads vs writes, data size, latency expectations) before drawing a single box. Sketch a simple high-level design first — even a naive one — and get the interviewer's buy-in on the shape before you add caching layers, queues, or sharding. Then go deep on the one or two components that actually matter for the constraints you were given, rather than spreading equal attention across the whole diagram.\n\nThe biggest tell of a weak answer isn't missing a specific technology — it's not being able to explain why a choice was made. 'We'd use a message queue here because writes need to survive a downstream service being temporarily unavailable' is a much stronger sentence than just naming Kafka.",
  },
  {
    slug: "why-closures-trip-up-senior-engineers",
    title: "Why Closures Trip Up Even Senior Engineers",
    excerpt:
      "Closures feel simple in isolation and then quietly cause the exact bug that's hardest to spot in a code review.",
    tags: ["JavaScript", "closures"],
    content:
      "A closure is just a function that remembers the variables from the scope it was created in, even after that outer scope has technically finished running. Stated like that, it sounds harmless. The trouble starts when a closure captures a variable by reference inside a loop, and every callback ends up sharing the same final value instead of a snapshot from its own iteration — the classic var-in-a-loop bug.\n\nswitching from var to let fixes the classic version of this bug because let creates a new binding per loop iteration, but it doesn't make the underlying mental model automatic. The habit worth building is asking, for any callback defined inside a loop or an async function, exactly which variables it closes over and whether those variables are still going to hold the value you expect by the time the callback actually runs.\n\nThis is also why debounce, throttle, and memoization implementations are such common interview questions: they're not really testing whether you can write a setTimeout call, they're testing whether your mental model of closures survives contact with asynchronous code.",
  },
  {
    slug: "react-rendering-what-triggers-a-rerender",
    title: "React Rendering: What Actually Triggers a Re-render",
    excerpt:
      "Props changing isn't the trigger you think it is. Here's what actually causes a component to re-render, and what doesn't.",
    tags: ["React", "performance"],
    content:
      "A component re-renders when its own state changes, when its parent re-renders (regardless of whether the props it receives actually changed), or when the context it consumes updates. Notice what's missing from that list: 'a prop changed' isn't actually the trigger — a parent re-rendering is the trigger, and that happens whether or not the specific prop values passed down are different.\n\nThis is why wrapping a component in React.memo doesn't always help the way people expect: it stops the re-render only if the props are shallowly equal, which usually means avoiding inline object and array literals as props, since a new object literal is never equal to the previous render's object literal even if the contents are identical.\n\nThe practical takeaway for interviews and for real code: before reaching for memoization, first ask why the parent is re-rendering in the first place. Often the cheapest fix is restructuring state so it lives closer to where it's actually used, not memoizing a component that shouldn't have been re-rendering that often to begin with.",
  },
  {
    slug: "css-grid-vs-flexbox",
    title: "CSS Grid vs Flexbox: Choosing the Right Tool",
    excerpt:
      "They overlap more than people think, but one clear rule of thumb makes the choice obvious almost every time.",
    tags: ["CSS", "layout"],
    content:
      "Flexbox is fundamentally one-dimensional: it lays elements out along a single axis, row or column, and excels at distributing space among items whose sizes may vary — think a nav bar, a button group, or vertically centering a single element. Grid is two-dimensional: it lets you define rows and columns together and place items anywhere in that structure, which makes it the better fit for anything that's genuinely a layout in the page-structure sense, not just a row of things.\n\nThe rule of thumb that resolves most 'which one do I use' hesitation: if you're arranging a group of similar items in a line, reach for Flexbox. If you're defining the overall structure of a page or a component with distinct regions, reach for Grid. In practice the two compose fine together — a Grid for the page shell, Flexbox inside individual grid areas for aligning their contents.\n\nThe mistake to avoid is trying to force one tool to do the other's job out of habit, like recreating a two-dimensional page layout with nested Flexbox containers when a single grid-template-areas declaration would be both shorter and easier to reason about later.",
  },
  {
    slug: "building-your-own-lru-cache",
    title: "Building Your Own LRU Cache, Step by Step",
    excerpt:
      "The hash-map-plus-linked-list combination isn't arbitrary — each piece is solving a specific complexity problem the other can't.",
    tags: ["Data Structures", "caching"],
    content:
      "An LRU cache needs three things to happen in O(1): looking up a value by key, moving that key to 'most recently used' on every access, and evicting the least recently used key when the cache is full. A hash map alone gives you O(1) lookup but no way to track recency order without an O(n) scan. A linked list alone gives you O(1) reordering but no O(1) lookup by key.\n\nThe standard solution uses both together: a hash map from key to a node in a doubly linked list, and the linked list itself maintains recency order, most-recently-used at one end and least-recently-used at the other. On a get, you look the node up in the map in O(1), then unlink it and re-insert it at the most-recently-used end in O(1) because it's a doubly linked list — no traversal required. On a put that exceeds capacity, you evict the node at the least-recently-used end, which is a fixed position, no scanning needed.\n\nOnce you've built one from scratch by hand, a huge number of adjacent interview questions — 'design a cache with a TTL', 'design an LFU cache' — stop looking unfamiliar, because they're the same core idea with one additional piece of bookkeeping layered on top.",
  },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error(
      "MONGODB_URI is not set. Copy .env.example to .env.local, fill in your connection string, and re-run npm run seed."
    );
    process.exit(1);
  }

  const categories = loadJson<CategoryJson[]>("src/app/data/categories.json");
  const categoryLabels = new Map(categories.map((c) => [c.name, c.label]));
  const questions = loadJson<SeedQuestionJson[]>("src/app/data/questions.json");

  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri);

  console.log(`Upserting ${questions.length} questions...`);
  for (const q of questions) {
    const topic = categoryLabels.get(q.category) ?? q.category;
    await Question.findOneAndUpdate(
      { slug: q.slug },
      {
        $set: {
          title: q.title,
          slug: q.slug,
          topic,
          category: q.category,
          subCategory: q.subCategory,
          tags: q.tags,
          difficulty: normalizeDifficulty(q.difficulty),
          description: q.description,
          questionBody: q.questionBody ?? "",
          solutionBody: q.solutionBody ?? "",
          codeSnippets: q.codeSnippets ?? [],
          sourcePath: q.sourcePath,
          isActive: true,
        },
        $unset: { estimateMinutes: "" },
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  console.log(`Upserting ${articles.length} articles...`);
  for (const a of articles) {
    await Article.findOneAndUpdate(
      { slug: a.slug },
      {
        $set: {
          ...a,
          status: "published",
          publishedAt: new Date(),
        },
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  console.log("Seed complete.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
