# Prompt Clash

Prompt Clash is a production-ready prompt engineering game built with Next.js, Supabase, and Google Gemini. Employees submit prompts for predefined scenarios and receive AI-based scoring and feedback.

## Tech Stack

- Next.js 15+ (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- ShadCN-style reusable UI components
- React Hook Form + Zod validation
- Recharts for analytics charts
- Supabase (PostgreSQL)
- Google Gemini (`gemini-2.0-flash`) via `@google/genai`

## Features

- Home page (`/`)
- Results dashboard (`/results`)
- 5 predefined scenario cards loaded from database
- Prompt submission form with full validation
- AI prompt evaluation using rubric (0-100)
- Category classification:
  - `0-40`: Beginner
  - `41-75`: Intermediate
  - `76-100`: Advanced
- Leaderboard (Top 10 highest scores)
- Best prompt + Needs improvement sections
- AI insights from aggregate weaknesses
- Automatic scenario seeding when scenarios table is empty
- Error handling for Gemini failures, invalid JSON, and database operations

## Project Structure

```text
prompt-clash/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── results/page.tsx
│   │   └── api/evaluate/route.ts
│   ├── components/
│   │   ├── scenario-card.tsx
│   │   ├── submission-form.tsx
│   │   ├── leaderboard.tsx
│   │   ├── charts/
│   │   ├── dashboard/
│   │   ├── results/
│   │   └── ui/
│   ├── lib/
│   │   ├── gemini/client.ts
│   │   ├── supabase/{client.ts,server.ts,queries.ts}
│   │   └── actions/
│   ├── hooks/
│   └── types/
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── .env.local
├── package.json
└── README.md
```

## Environment Variables

Create or update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
```

## Setup

1. Install dependencies:

	```bash
	npm install
	```

2. Run SQL migration in Supabase SQL editor:
	- `supabase/migrations/202606230001_init_prompt_clash.sql`

3. Seed scenarios (optional, auto-seeding also runs in app):
	- `supabase/seed.sql`

4. Start development server:

	```bash
	npm run dev
	```

5. Visit:
	- `http://localhost:3000`
	- `http://localhost:3000/results`

## Production Notes

- Server actions are used for write flow and cache revalidation.
- All critical configuration is environment-driven.
- Gemini output is validated with Zod and parsed defensively.
- If Gemini evaluation fails, submission is still stored and a fallback analysis is recorded.

## Suggested Next Improvement

Move Gemini evaluation to a background queue/worker:

- Store submission immediately
- Queue evaluation job
- Process asynchronously with retries

This improves reliability during high-traffic team events and reduces live-request failure impact.