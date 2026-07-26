/**
 * Seeds the Question and Article collections with sample content so the app
 * is browsable immediately after setup. Safe to re-run: every document is
 * upserted by its unique `slug`, so running `npm run seed` again after
 * editing this file updates existing rows instead of duplicating them.
 *
 * Does NOT touch User, UserQuestionState, or DailyAssignment — those are
 * per-user runtime data created naturally as people sign in and practice.
 *
 * Usage: npm run seed   (reads MONGODB_URI from .env.local or .env)
 */
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

import mongoose from "mongoose";
import { Question } from "../src/models/Question";
import { Article } from "../src/models/Article";

type SeedQuestion = {
  slug: string;
  title: string;
  topic: string;
  tags: string[];
  difficulty: "EASY" | "MEDIUM" | "HARD";
  estimateMinutes: number;
  description: string;
};

const questions: SeedQuestion[] = [
  // --- JavaScript ---
  {
    slug: "implement-promise-all",
    title: "Implement Promise.all()",
    topic: "JavaScript",
    tags: ["concurrency", "async"],
    difficulty: "MEDIUM",
    estimateMinutes: 25,
    description:
      "Write a function promiseAll(promises) that behaves like the built-in Promise.all: it resolves with an array of results in input order once every promise settles, and rejects immediately with the first rejection reason it sees. Handle a mix of promises and plain values in the input array.",
  },
  {
    slug: "debounce-and-throttle",
    title: "Debounce & Throttle",
    topic: "JavaScript",
    tags: ["closures", "timers"],
    difficulty: "MEDIUM",
    estimateMinutes: 15,
    description:
      "Implement both debounce(fn, wait) and throttle(fn, limit) from scratch using closures and timers, with no external libraries. Explain the difference in behavior and give one real UI scenario where each is the right choice.",
  },
  {
    slug: "deep-clone-an-object",
    title: "Deep Clone an Object",
    topic: "JavaScript",
    tags: ["recursion", "objects"],
    difficulty: "MEDIUM",
    estimateMinutes: 20,
    description:
      "Write deepClone(value) that recursively clones nested objects and arrays without sharing references with the original. Handle circular references without infinite-looping, and note where structuredClone or JSON-based approaches fall short.",
  },
  {
    slug: "implement-array-flat",
    title: "Implement Array.prototype.flat()",
    topic: "JavaScript",
    tags: ["recursion", "arrays"],
    difficulty: "EASY",
    estimateMinutes: 15,
    description:
      "Implement a flatten(arr, depth = 1) function that mimics Array.prototype.flat, flattening nested arrays up to the given depth. Support Infinity as a depth value to fully flatten arbitrarily nested input.",
  },
  {
    slug: "currying-functions",
    title: "Currying Functions",
    topic: "JavaScript",
    tags: ["closures", "higher-order-functions"],
    difficulty: "MEDIUM",
    estimateMinutes: 20,
    description:
      "Write a curry(fn) helper that transforms any function into its curried form, supporting both curried(a)(b)(c) and curried(a, b)(c) call styles, invoking the original function once enough arguments have been supplied.",
  },
  {
    slug: "build-an-event-emitter",
    title: "Build an Event Emitter",
    topic: "JavaScript",
    tags: ["pub-sub", "closures"],
    difficulty: "MEDIUM",
    estimateMinutes: 25,
    description:
      "Implement a small EventEmitter class with on(event, handler), off(event, handler), and emit(event, ...args) methods. Support multiple handlers per event and make sure off() only removes the specific handler passed in.",
  },
  {
    slug: "memoization-utility",
    title: "Memoization Utility",
    topic: "JavaScript",
    tags: ["closures", "caching"],
    difficulty: "EASY",
    estimateMinutes: 15,
    description:
      "Write memoize(fn) that caches results by argument signature so repeated calls with the same arguments skip recomputation. Discuss how you'd key the cache for functions that take objects or multiple arguments.",
  },
  {
    slug: "polyfill-array-reduce",
    title: "Polyfill Array.prototype.reduce",
    topic: "JavaScript",
    tags: ["prototypes", "arrays"],
    difficulty: "HARD",
    estimateMinutes: 30,
    description:
      "Implement Array.prototype.myReduce, matching the native reduce's behavior including the optional initialValue argument, correct handling of empty arrays, and the same TypeError native reduce throws when no initial value is given for an empty array.",
  },
  {
    slug: "event-loop-task-ordering",
    title: "Event Loop Task Ordering",
    topic: "JavaScript",
    tags: ["event-loop", "microtasks"],
    difficulty: "HARD",
    estimateMinutes: 25,
    description:
      "Given a snippet mixing setTimeout, Promise.then, and synchronous code, predict the exact console.log output order. Explain the distinction between the microtask queue and the macrotask (timer) queue and why it produces that order.",
  },
  {
    slug: "closures-and-hoisting-quiz",
    title: "Closures & Hoisting Quiz",
    topic: "JavaScript",
    tags: ["closures", "hoisting"],
    difficulty: "MEDIUM",
    estimateMinutes: 15,
    description:
      "Walk through several short snippets involving var vs let inside loops, function declarations vs expressions, and the temporal dead zone. For each, predict the output and explain the hoisting/closure mechanics that produce it.",
  },

  // --- React ---
  {
    slug: "virtual-dom-implementation",
    title: "Virtual DOM Implementation",
    topic: "React",
    tags: ["recursion", "rendering"],
    difficulty: "HARD",
    estimateMinutes: 60,
    description:
      "Build a minimal virtual DOM: a createElement function producing plain JS objects, a render function that turns them into real DOM nodes, and a diff function that patches only the nodes that changed between two virtual trees.",
  },
  {
    slug: "build-a-usedebounce-hook",
    title: "Build a useDebounce Hook",
    topic: "React",
    tags: ["hooks", "timers"],
    difficulty: "MEDIUM",
    estimateMinutes: 20,
    description:
      "Write a useDebounce(value, delay) hook that returns a debounced version of a fast-changing value, useful for search-as-you-type inputs. Make sure timers are cleaned up correctly on unmount and on rapid re-renders.",
  },
  {
    slug: "controlled-vs-uncontrolled-inputs",
    title: "Controlled vs Uncontrolled Inputs",
    topic: "React",
    tags: ["forms", "state"],
    difficulty: "EASY",
    estimateMinutes: 15,
    description:
      "Build the same text input twice: once as a controlled component driven by useState, once as an uncontrolled component using a ref. Explain the tradeoffs and when you'd reach for each in a real form.",
  },
  {
    slug: "implement-usestate-from-scratch",
    title: "Implement useState From Scratch",
    topic: "React",
    tags: ["hooks", "closures"],
    difficulty: "HARD",
    estimateMinutes: 35,
    description:
      "Implement a simplified useState hook outside of React, backed by a module-level array of hook slots and an index cursor, that supports multiple useState calls per component and triggers a re-render on update.",
  },
  {
    slug: "infinite-scroll-list",
    title: "Infinite Scroll List",
    topic: "React",
    tags: ["performance", "hooks"],
    difficulty: "MEDIUM",
    estimateMinutes: 30,
    description:
      "Build a list component that loads the next page of items when the user scrolls near the bottom, using an IntersectionObserver rather than a scroll event listener. Avoid duplicate fetches when the observer fires multiple times in a row.",
  },
  {
    slug: "context-api-theme-switcher",
    title: "Context API Theme Switcher",
    topic: "React",
    tags: ["context", "state"],
    difficulty: "EASY",
    estimateMinutes: 20,
    description:
      "Build a ThemeContext with a provider exposing the current theme and a toggle function, consumed by nested components several levels deep without prop drilling. Persist the selected theme so it survives a refresh.",
  },
  {
    slug: "optimistic-ui-updates",
    title: "Optimistic UI Updates",
    topic: "React",
    tags: ["state", "ux"],
    difficulty: "MEDIUM",
    estimateMinutes: 25,
    description:
      "Implement a like button that updates its count immediately on click (optimistically), then rolls the UI back and shows an error state if the underlying request fails. Cover the double-click / race-condition edge case.",
  },

  // --- Data Structures ---
  {
    slug: "lru-cache-design",
    title: "LRU Cache Design",
    topic: "Data Structures",
    tags: ["doubly-linked-list", "map"],
    difficulty: "HARD",
    estimateMinutes: 45,
    description:
      "Design and implement an LRU (Least Recently Used) cache with get(key) and put(key, value) operations, both running in O(1) time. Use a hash map combined with a doubly linked list to track recency without scanning the whole cache.",
  },
  {
    slug: "two-sum",
    title: "Two Sum",
    topic: "Data Structures",
    tags: ["arrays", "hash-map"],
    difficulty: "EASY",
    estimateMinutes: 10,
    description:
      "Given an array of integers and a target value, return the indices of the two numbers that add up to the target. Aim for a single-pass O(n) solution using a hash map instead of the brute-force O(n^2) nested loop.",
  },
  {
    slug: "trie-implementation",
    title: "Trie Implementation",
    topic: "Data Structures",
    tags: ["prefix-tree", "strings"],
    difficulty: "HARD",
    estimateMinutes: 35,
    description:
      "Implement a Trie (prefix tree) supporting insert(word), search(word), and startsWith(prefix). Discuss the time complexity of each operation relative to word length and how a Trie beats a plain hash set for prefix queries.",
  },
  {
    slug: "binary-search-tree-traversal",
    title: "Binary Search Tree Traversal",
    topic: "Data Structures",
    tags: ["trees", "recursion"],
    difficulty: "MEDIUM",
    estimateMinutes: 20,
    description:
      "Implement in-order, pre-order, and post-order traversals of a binary search tree, both recursively and iteratively using an explicit stack. Explain which traversal yields sorted output for a BST and why.",
  },
  {
    slug: "min-stack",
    title: "Min Stack",
    topic: "Data Structures",
    tags: ["stacks", "design"],
    difficulty: "MEDIUM",
    estimateMinutes: 20,
    description:
      "Design a stack that supports push, pop, top, and retrieving the minimum element, all in O(1) time. A naive scan-for-minimum approach is O(n) — find a way to track the running minimum alongside each pushed value.",
  },
  {
    slug: "detect-cycle-in-linked-list",
    title: "Detect Cycle in Linked List",
    topic: "Data Structures",
    tags: ["linked-list", "two-pointers"],
    difficulty: "MEDIUM",
    estimateMinutes: 15,
    description:
      "Given the head of a singly linked list, determine whether it contains a cycle using O(1) extra space. Implement Floyd's tortoise-and-hare two-pointer technique and explain why the pointers are guaranteed to meet.",
  },
  {
    slug: "queue-with-two-stacks",
    title: "Implement a Queue with Two Stacks",
    topic: "Data Structures",
    tags: ["stacks", "queues"],
    difficulty: "EASY",
    estimateMinutes: 15,
    description:
      "Implement a FIFO queue using only two LIFO stacks as the underlying storage. Support enqueue and dequeue, and analyze the amortized time complexity across a sequence of operations.",
  },
  {
    slug: "union-find-disjoint-set",
    title: "Union-Find (Disjoint Set)",
    topic: "Data Structures",
    tags: ["graphs", "union-find"],
    difficulty: "HARD",
    estimateMinutes: 35,
    description:
      "Implement a Union-Find data structure with union(a, b) and find(a) operations, using both path compression and union by rank/size. Use it to detect whether adding an edge to a graph would create a cycle.",
  },

  // --- System Design ---
  {
    slug: "design-a-rate-limiter",
    title: "Design a Rate Limiter",
    topic: "System Design",
    tags: ["rate-limiting", "scalability"],
    difficulty: "HARD",
    estimateMinutes: 45,
    description:
      "Design a rate limiter that caps each client to N requests per time window across a distributed set of API servers. Compare token bucket, sliding window log, and sliding window counter approaches, and where you'd store the counters.",
  },
  {
    slug: "design-a-url-shortener",
    title: "Design a URL Shortener",
    topic: "System Design",
    tags: ["hashing", "databases"],
    difficulty: "MEDIUM",
    estimateMinutes: 35,
    description:
      "Design a service like bit.ly: generating short codes for long URLs, redirecting on lookup, and handling collisions. Cover the read/write ratio, caching strategy, and how you'd shard the mapping table at scale.",
  },
  {
    slug: "design-a-typeahead-search",
    title: "Design a Typeahead Search",
    topic: "System Design",
    tags: ["debouncing", "caching"],
    difficulty: "MEDIUM",
    estimateMinutes: 30,
    description:
      "Design the search-as-you-type suggestions feature for a search bar: client-side debouncing, request cancellation for stale queries, and a backend index (e.g. a trie or prefix-based store) that returns ranked suggestions quickly.",
  },
  {
    slug: "design-a-notification-system",
    title: "Design a Notification System",
    topic: "System Design",
    tags: ["queues", "scalability"],
    difficulty: "HARD",
    estimateMinutes: 40,
    description:
      "Design a system that fans a single event out to push, email, and in-app notifications for millions of users. Cover the message queue between producers and channel workers, retry/backoff for failed deliveries, and de-duplication.",
  },
  {
    slug: "design-a-news-feed",
    title: "Design a News Feed",
    topic: "System Design",
    tags: ["pagination", "caching"],
    difficulty: "HARD",
    estimateMinutes: 45,
    description:
      "Design a social feed showing posts from people a user follows, ranked and paginated. Compare fan-out-on-write versus fan-out-on-read, and discuss how you'd handle a celebrity account with millions of followers.",
  },
  {
    slug: "design-a-chat-application",
    title: "Design a Chat Application",
    topic: "System Design",
    tags: ["websockets", "scalability"],
    difficulty: "HARD",
    estimateMinutes: 40,
    description:
      "Design the backend for a real-time 1:1 and group chat app: connection management over WebSockets, message ordering and delivery guarantees, offline message storage, and read-receipt tracking.",
  },

  // --- CSS Architecture ---
  {
    slug: "css-grid-layout-challenge",
    title: "CSS Grid Layout Challenge",
    topic: "CSS Architecture",
    tags: ["layouts", "responsiveness"],
    difficulty: "EASY",
    estimateMinutes: 20,
    description:
      "Recreate a responsive card-grid layout using CSS Grid: a fixed sidebar, a fluid main content area with auto-fitting cards, and a footer, all with no fixed pixel widths on the content columns. Use grid-template-areas for the overall page shape.",
  },
  {
    slug: "flexbox-holy-grail-layout",
    title: "Flexbox Holy Grail Layout",
    topic: "CSS Architecture",
    tags: ["flexbox", "layouts"],
    difficulty: "MEDIUM",
    estimateMinutes: 20,
    description:
      "Build the classic 'holy grail' layout — header, footer, and three columns (nav, main, aside) — using only Flexbox, with the main content column appearing first in source order for accessibility despite its visual position.",
  },
  {
    slug: "css-specificity-puzzle",
    title: "CSS Specificity Puzzle",
    topic: "CSS Architecture",
    tags: ["specificity", "cascade"],
    difficulty: "EASY",
    estimateMinutes: 10,
    description:
      "Given a set of conflicting CSS rules using ids, classes, attribute selectors, and !important, determine which rule wins for a given element and explain the specificity calculation that gets you there.",
  },
  {
    slug: "bem-naming-convention",
    title: "BEM Naming Convention",
    topic: "CSS Architecture",
    tags: ["bem", "naming"],
    difficulty: "EASY",
    estimateMinutes: 10,
    description:
      "Refactor a small component's loosely-named CSS classes into BEM (Block__Element--Modifier) naming. Explain what problem BEM is solving and a scenario where it breaks down on a large codebase.",
  },
  {
    slug: "css-custom-properties-theming",
    title: "CSS Custom Properties Theming",
    topic: "CSS Architecture",
    tags: ["custom-properties", "theming"],
    difficulty: "MEDIUM",
    estimateMinutes: 20,
    description:
      "Build a light/dark theme toggle using CSS custom properties (variables) defined at the :root level and overridden on a [data-theme] attribute, without any CSS-in-JS or duplicated stylesheets.",
  },
  {
    slug: "responsive-typography-scale",
    title: "Responsive Typography Scale",
    topic: "CSS Architecture",
    tags: ["typography", "responsiveness"],
    difficulty: "EASY",
    estimateMinutes: 15,
    description:
      "Build a fluid type scale using clamp() so heading sizes scale smoothly between a mobile minimum and a desktop maximum without discrete media-query breakpoints. Apply it across at least three heading levels.",
  },
];

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

  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri);

  console.log(`Upserting ${questions.length} questions...`);
  for (const q of questions) {
    await Question.findOneAndUpdate(
      { slug: q.slug },
      { $set: { ...q, isActive: true } },
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
