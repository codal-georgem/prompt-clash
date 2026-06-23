create extension if not exists "pgcrypto";

create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  difficulty text not null check (difficulty in ('Beginner', 'Intermediate', 'Advanced')),
  created_at timestamp with time zone not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.scenarios(id) on delete cascade,
  employee_name text not null,
  prompt_text text not null,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.prompt_analysis (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique references public.submissions(id) on delete cascade,
  score integer not null check (score >= 0 and score <= 100),
  category text not null check (category in ('Beginner', 'Intermediate', 'Advanced')),
  strengths jsonb not null default '[]'::jsonb,
  weaknesses jsonb not null default '[]'::jsonb,
  improved_prompt text not null,
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_submissions_scenario_id on public.submissions(scenario_id);
create index if not exists idx_prompt_analysis_score on public.prompt_analysis(score desc);
create index if not exists idx_prompt_analysis_category on public.prompt_analysis(category);
