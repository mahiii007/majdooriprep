# MajdooriPrep

A frontend/full-stack interview prep platform: question bank, daily practice sets, streak tracking, and a progress dashboard. Built with Next.js (App Router), MongoDB + Mongoose, and NextAuth (Google + GitHub).

See **DESIGN.md** for the architecture decisions, data model, and the reasoning behind the streak/daily-assignment/progress logic — read that first if you're extending the app.

## Prerequisites

- Node.js 18.18+ (Node 20 LTS recommended)
- A MongoDB database — either a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster or a local `mongod`
- A Google OAuth app and a GitHub OAuth app (both free, see below)

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment variables

```bash
cp .env.example .env.local
```

Then fill in `.env.local`:

| Variable | Where to get it |
|---|---|
| `MONGODB_URI` | Atlas connection string (Database → Connect → Drivers), or `mongodb://localhost:27017/majdooriprep` for local Mongo |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` for local dev |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials). Create an OAuth Client ID (Web application). Authorized redirect URI: `http://localhost:3000/api/auth/callback/google` |
| `GITHUB_ID` / `GITHUB_SECRET` | [GitHub → Settings → Developer settings → OAuth Apps](https://github.com/settings/developers). Authorization callback URL: `http://localhost:3000/api/auth/callback/github` |
| `DAILY_QUESTION_COUNT` | Defaults to `5` — the "Daily N" set size. Change any time; takes effect on the next daily assignment generated (existing pinned assignments for already-issued days don't change). |
| `APP_TIMEZONE` | Defaults to `UTC`. IANA timezone (e.g. `America/New_York`) used to compute calendar-day boundaries for streaks and daily sets. |

## 3. Seed the question bank and articles

```bash
npm run seed
```

This upserts ~37 sample questions (JavaScript, React, Data Structures, System Design, CSS Architecture) and 6 articles by `slug`, so it's safe to re-run after editing `scripts/seed.ts`. It does not touch user data.

## 4. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`, sign in with Google or GitHub, and you'll land on the dashboard.

## 5. Build for production

```bash
npm run build
npm run start
```

## Project structure

```
src/
  app/
    (auth)/signin/          Sign-in page
    (app)/                  Authenticated app shell (Sidebar + Topbar)
      dashboard/            Overview: today's daily set + quick stats + weak areas
      questions/            Question Bank (search, filter, pagination)
      questions/[slug]/     Question detail + status/bookmark actions
      daily/                Today's pinned Daily N set
      articles/             Article list + detail
      progress/             Stats, weekly chart, topic mastery, weak areas
      bookmarks/            User's bookmarked questions
    api/                    REST endpoints (questions, daily, progress, articles, auth)
  components/                UI components (Sidebar, Topbar, badges, charts, ...)
  lib/                       DB connection, auth config, streak/daily-assignment/
                              progress logic, server actions, date helpers
  models/                    Mongoose schemas (User, Question, UserQuestionState,
                              DailyAssignment, Article)
  types/                     Shared TypeScript types + NextAuth type augmentation
scripts/seed.ts               Seed script (question bank + articles)
```

## Deployment notes

- Any Next.js host works (Vercel is the path of least resistance). Set the same environment variables there, and update `NEXTAUTH_URL` plus both OAuth apps' redirect URIs to your production domain.
- MongoDB Atlas's free tier is enough to run this for a small number of users. Make sure the deployment environment's outbound IPs are allow-listed in Atlas Network Access (or use "Allow access from anywhere" for a quick start, then tighten it).
- `NEXTAUTH_SECRET` must be a real secret in production — don't ship the placeholder from `.env.example`.
