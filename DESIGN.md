# DESIGN.md — MajdooriPrep

Engineering notes on the decisions behind this build, including where the implementation resolves ambiguity in the original brief. Read this before modifying streak, daily-assignment, or progress logic — those three are the parts where a wrong assumption is expensive to unwind later.

## 1. Requirements & assumptions

Core requirements, restated: OAuth-only auth (Google + GitHub), a searchable/filterable question bank, a daily set of N questions that's stable once issued, per-user progress tracking (done/revision/etc.), and streaks derived from that progress — not from UI state.

Ambiguities resolved, with the decision and why:

- **What counts as "daily completion"?** All N questions in the day's set marked `done`. Partial completion doesn't extend the streak — it's binary per day, computed and stored as `DailyAssignment.allCompleted`. Rationale: a partial-credit streak is much harder to reason about and to display ("3.5 day streak"?), and the mock's single flame+number implies a binary day-level signal.
- **What does "Accuracy" mean, given there's no code-execution/judge in scope?** There's no way to measure "correct on first try" without running code. Accuracy is defined as `done / (done + revision)` among questions the user has engaged with — a mastery-rate proxy, not a correctness measure. This is a real assumption, not a requirement; if a judge/execution engine is added later, redefine this against pass/fail attempts instead.
- **What determines "Current Rank" (e.g. "Senior")?** Not specified anywhere in the brief. Implemented as a simple threshold ladder on total questions solved (`lib/progress.ts: RANK_LADDER`). This is a placeholder good enough for a dashboard stat card — treat it as a stub, not a leveling system, until product requirements say otherwise.
- **"Weak Areas" in the mock names specific concepts** ("Deep dive into Event Loop", "Review CSS Grid Layouts") rather than top-level topics. Question `tags` (finer-grained than `topic`) back this: weak areas are the three tags with the lowest done-ratio among active questions carrying that tag, labeled `HIGH PRIORITY` / `TOPIC SKILL GAP` / `CONCEPT CHECK` by threshold. This is a heuristic, not a mastery model — it has no notion of recency or attempt count, just ratio.

Status values implemented: `not_started` (default, no row exists until first interaction — keeps the collection small), `in_progress`, `done`, `revision`, `skipped`. `done` and `revision` are the two the brief calls out explicitly; the other three exist because a status-only state machine with just two values can't represent "started but not finished" or "user bailed on this one."

## 2. Timezone strategy

All streak and daily-assignment logic computes "what calendar day is it" through a single function (`lib/date.ts: todayKey()`), which resolves to a `YYYY-MM-DD` string in `APP_TIMEZONE` (env var, defaults to UTC) — never through `new Date()` local time directly.

This is a deliberate MVP simplification: **one shared timezone for all users**, not a per-user timezone derived from their browser/profile. The `User.timezone` field exists and defaults to `"UTC"` as a placeholder for that future work, but nothing reads it yet. The tradeoff: a user physically in a very different timezone than `APP_TIMEZONE` will see their "day" roll over at a time that doesn't match their local midnight. Fixing that properly means passing a per-user timezone into `todayKey()`/`getOrCreateDailyAssignment()` and is a contained change (one parameter threading through `lib/date.ts`, `lib/streak.ts`, `lib/dailyAssignment.ts`) — not a rearchitecture.

`DailyAssignment.date` is stored as that `YYYY-MM-DD` string, not a `Date`. Storing it as a string sidesteps an entire category of bugs where two `Date` objects representing "the same calendar day" compare unequal because of stored UTC offsets — the unique `(userId, date)` index only works correctly because equality is string equality.

## 3. Streak algorithm

Implemented in `lib/streak.ts`, derived entirely from `DailyAssignment.allCompleted` records — never from a separately incremented counter, so it's always re-derivable/auditable.

- **Current streak**: walk backward day-by-day from today. If today isn't complete yet, that's not treated as a break — the walk starts from yesterday instead, so a user midway through today's set doesn't see the streak zero out before the day is even over. If yesterday is also incomplete, the streak is 0.
- **Highest streak**: scan the full sorted history for the longest run of consecutive completed calendar days, independent of "today."

### Worked example

Daily set size = 5. Timezone = UTC.

| Date | Questions done | `allCompleted` |
|---|---|---|
| 2026-07-20 | 5/5 | true |
| 2026-07-21 | 5/5 | true |
| 2026-07-22 | *(missed entirely)* | — |
| 2026-07-23 | 5/5 | true |
| 2026-07-24 | 3/5 | false |

Evaluated as of 2026-07-24 (today): current streak walk starts at 2026-07-24, finds `allCompleted: false`, so it steps back to 2026-07-23 instead — that day is complete, count = 1; 2026-07-22 has no record, walk stops. **Current streak = 1.** Highest streak, scanning the whole history: 07-20→07-21 is a 2-day run, 07-23 alone is a 1-day run. **Highest streak = 2.**

## 4. Daily assignment algorithm

Implemented in `lib/dailyAssignment.ts`. Configurable via `DAILY_QUESTION_COUNT` (env var, default 5) — no redeploy needed, just an env change, per the "configurable" requirement.

**Decision: unique-per-user, not one global set for all users.** A shared global daily set is simpler but weaker for engagement (everyone sees identical questions, and a user who joins mid-week can't get a fresh personalized start) — and it's not meaningfully harder to implement once assignments are already keyed by `(userId, date)`.

**Pinning / no re-randomization on refresh**: `getOrCreateDailyAssignment()` first checks for an existing `(userId, date)` document; only if none exists does it generate and persist one. Two concurrent requests (e.g. two open tabs on day one) both compute a candidate set, but the unique `(userId, date)` index means only one `upsert` wins — the loser's insert fails with a duplicate-key error, which is caught and turned into a read of the winner's document instead of an error surfaced to the user. This is also the "prevent double-updates" edge case called out in the requirements: it's structural (an index), not a runtime check that can be bypassed by a race.

**Selection**: seeded from `hash(userId + date)` via a small deterministic PRNG (`mulberry32`), so re-running the algorithm for the same user+day is reproducible independent of persistence — a defense-in-depth layer under the index-based pinning above, not a replacement for it. Candidates are drawn from a tiered pool — prefer questions never marked `done` **and** not assigned to this user in the last 14 days, falling back to "never done" (repeats OK), falling back to the full active bank — and distributed round-robin across topics so a 5-question set doesn't land on five questions from the same topic by chance.

## 5. Data model

Five Mongoose collections. Indexes noted are the ones actually queried against, not a defensive "index everything" list.

- **User** — `email` (unique), `googleId`/`githubId` (unique, sparse — a user may have linked only one provider). No NextAuth adapter is used; adapters write into raw-driver collections outside Mongoose's schema, which would create two disconnected notions of "user." Instead, the `signIn`/`jwt` callbacks in `lib/auth.ts` upsert this document directly.
- **Question** — global bank. `slug` unique. `topic` + `difficulty` + `isActive` compound index for the question bank's filter combination. Text index on `title` + `tags` for search. `tags` is separate from `topic`: `topic` is the coarse filter pill ("React"), `tags` are the fine-grained concepts ("hooks", "closures") that back the weak-areas heuristic.
- **UserQuestionState** — one row per `(userId, questionId)`, unique compound index. This is both the progress record and the double-submit guard: marking "done" twice is an idempotent upsert on this key, not a duplicate insert. `firstDoneAt` is set once, on the transition into `done` — re-marking an already-done question doesn't shift the date it counts toward.
- **DailyAssignment** — one row per `(userId, date)`, unique compound index (the pinning mechanism described above). `allCompleted`/`allCompletedAt` are denormalized so streak computation is a single indexed scan instead of a join against `UserQuestionState` for every historical day.
- **Article** — straightforward content model; `status: draft | published` gates visibility.

### Example: UserQuestionState document

```json
{
  "_id": "66a1f2c9e4b0a1234567890a",
  "userId": "66a1f0a1e4b0a1234567890b",
  "questionId": "66a1f0a1e4b0a1234567890c",
  "status": "done",
  "bookmarked": false,
  "attemptsCount": 2,
  "firstDoneAt": "2026-07-23T14:02:11.000Z",
  "lastStatusChangeAt": "2026-07-23T14:02:11.000Z",
  "createdAt": "2026-07-22T09:15:00.000Z",
  "updatedAt": "2026-07-23T14:02:11.000Z"
}
```

### Example: DailyAssignment document

```json
{
  "_id": "66a1f3d0e4b0a1234567890d",
  "userId": "66a1f0a1e4b0a1234567890b",
  "date": "2026-07-23",
  "questionIds": ["66a1f0a1...c", "66a1f0a1...d", "66a1f0a1...e", "66a1f0a1...f", "66a1f0a1...10"],
  "allCompleted": true,
  "allCompletedAt": "2026-07-23T18:40:02.000Z"
}
```

## 6. Pages/routes and their data source

Server Components fetch through the `lib/*` functions directly (no self-HTTP round trip); the API routes under `app/api/*` exist for external/future clients (mobile app, etc.) and expose the same `lib/*` functions over REST. Mutations (`markQuestionStatus`, `toggleBookmark`) are Next.js Server Actions, not API routes — called directly from Client Components via `useTransition`, with `revalidatePath` on the affected pages.

| Route | Source |
|---|---|
| `/dashboard` | `getDailySet`, `getProgressSummary` |
| `/questions` | `listQuestions`, `listTopics` |
| `/questions/[slug]` | `getQuestionBySlug` |
| `/daily` | `getDailySet` (creates today's assignment on first visit) |
| `/articles`, `/articles/[slug]` | `listArticles`, `getArticleBySlug` |
| `/progress` | `getProgressSummary` |
| `/bookmarks` | `listBookmarkedQuestions` |

## 7. Known gaps / next steps

- Per-user timezone (see §2) — field exists, not yet wired through.
- No code-execution/judge, so "Accuracy" is a mastery-ratio proxy, not correctness (see §1).
- Rank ladder is a placeholder threshold system, not a designed leveling model (see §1).
- Article `content` is stored/rendered as plain paragraphs (split on blank lines), not Markdown/MDX — swap in an MDX renderer if richer formatting (code blocks, images) is needed.
- No admin UI for managing questions/articles — `scripts/seed.ts` and direct DB writes are the only way in today.
