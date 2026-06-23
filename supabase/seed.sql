delete from public.scenarios
where title in (
  'Create a professional client email',
  'Generate user stories from requirements',
  'Create test cases for a feature',
  'Summarize a meeting transcript',
  'Analyze a bug report'
);

insert into public.scenarios (title, description, difficulty)
select seed.title, seed.description, seed.difficulty
from (
  values
    ('QA | Build a regression strategy for checkout bugfix', 'Create a regression prompt that asks for happy path, edge cases, browser coverage, payment failure handling, and risk-based prioritization for a checkout bugfix release.', 'Beginner'),
    ('QA | Design an API test plan for profile update endpoint', 'Generate API test scenarios for success paths, invalid payloads, auth/permission checks, rate limiting, and response contract validation for a profile update endpoint.', 'Intermediate'),
    ('PM | Convert product brief into sprint-ready user stories', 'Transform a feature brief into user stories with acceptance criteria, dependencies, assumptions, and release scope notes suitable for sprint planning.', 'Intermediate'),
    ('PM | Draft stakeholder update from roadmap changes', 'Create a prompt that generates a concise stakeholder update including changed milestones, customer impact, mitigation plan, and communication tone guidance.', 'Beginner'),
    ('Developer | Refactor legacy authentication module', 'Write a prompt requesting a safe refactor plan for legacy auth code, including architecture proposal, migration steps, backward compatibility, and test strategy.', 'Advanced'),
    ('Developer | Create incident postmortem from logs', 'Generate a postmortem prompt that asks for timeline, root cause hypotheses, blast radius, prevention actions, and measurable follow-ups based on incident data.', 'Advanced'),
    ('Common | Summarize meeting transcript with ownership', 'Design a prompt to summarize a meeting into decisions, owners, due dates, unresolved questions, and next-step checklist in a structured format.', 'Beginner'),
    ('Common | Write a professional client follow-up email', 'Generate a prompt for drafting client follow-up emails with context recap, clear asks, deadlines, and professional tone adapted to recipient seniority.', 'Beginner'),
    ('Data Analyst | Analyze churn spike and propose experiments', 'Create a prompt that asks for churn analysis by segment, likely drivers, confidence level, and prioritized experiments with expected impact and metrics.', 'Intermediate'),
    ('Support | Triage bug report and customer response', 'Build a prompt that classifies bug severity, asks clarifying questions, drafts a customer-safe response, and proposes escalation criteria.', 'Advanced')
) as seed(title, description, difficulty)
where not exists (
  select 1
  from public.scenarios s
  where s.title = seed.title
);
