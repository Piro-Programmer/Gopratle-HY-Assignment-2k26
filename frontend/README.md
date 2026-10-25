# GoPratle Frontend

Next.js 15 (App Router, TypeScript) + Tailwind CSS 4 + React Hook Form + Zod.
A 4-step wizard for posting an event requirement for a planner, performer or crew.

## Run locally

```bash
cd frontend
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:5000
npm run dev                  # http://localhost:3000
```

Start the backend first (`cd backend && npm run dev`).

## Pages
- `/`: the requirement wizard
- `/requirements?category=crew`: posted requirements, filterable by category

## How it works
- **Step 1** (`components/steps/BasicsStep.tsx`): event name, type, single day or date range, location, optional venue, and category.
- **Steps 2–3** (`components/steps/CategoryStep.tsx`): fields are rendered from `lib/categoryConfig.ts`, keyed by the chosen category, through `components/FieldRenderer.tsx`.
- **Step 4** (`components/steps/ReviewStep.tsx`): summary with "Edit" links, then `POST /api/requirements`.
- **State**: one React Hook Form instance holds all steps. Each category's answers live under its own key
  (`planner`, `performer`, `crew`), so switching category never mixes fields and only the chosen one is submitted.
- **Validation** (`lib/schema.ts`): one Zod schema per step, checked on "Continue" and again on submit.
  Server-side field errors (e.g. `details.budget.max`) are mapped back onto the right field and step.
- **UX details**: double-submit guard, network error banner, and a "waking up server" note for free-tier cold starts.
