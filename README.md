# GoPratle – Event Requirement Posting Flow

A multi-step flow for posting an event requirement and hiring an **Event Planner**, **Performer** or **Crew**.
Built with **Next.js** (frontend) and **Node.js + Express + MongoDB** (backend).

## Live links

| | URL |
|---|---|
| Frontend (Vercel) | https://gopratle-hy-assignment-2k26.vercel.app |
| Browse requirements | https://gopratle-hy-assignment-2k26.vercel.app/requirements |
| Backend API (Render) | https://gopratle-hy-assignment-2k26.onrender.com |
| Health check | https://gopratle-hy-assignment-2k26.onrender.com/health |

> The backend runs on Render's free tier and sleeps when idle, so the first request can take up to ~50 seconds.

## The flow

1. **Event basics**: event name, type, single date or date range, location, optional venue, and the category (Planner / Performer / Crew).
2. **Category details (part 1)**: fields change with the chosen category.
3. **Category details (part 2)**: budget and remaining category-specific fields.
4. **Review & submit**: summary with edit links, then the requirement is saved under its category.

| Category | Step 2 | Step 3 |
|---|---|---|
| Event Planner | Services needed, expected guests | Planning scope, budget, notes |
| Performer | Performer type, genre | Duration, number of sets, equipment provided, budget, notes |
| Crew | Roles and headcount per role | Shift length, experience level, budget, notes |

## Tech stack

- **Frontend:** Next.js 15 (App Router, TypeScript), Tailwind CSS 4, React Hook Form, Zod
- **Backend:** Express 5, Mongoose 8, Zod
- **Database:** MongoDB Atlas
- **Tests:** Node test runner + Supertest + mongodb-memory-server
- **Hosting:** Vercel (frontend), Render (backend)

## Repository structure

```
frontend/   Next.js app: wizard (app/page.tsx), browse page (app/requirements)
  components/steps/     Step 1 basics, config-driven steps 2–3, review step
  lib/categoryConfig.ts Category → step → fields map that drives steps 2 and 3
  lib/schema.ts         Per-step Zod validation
backend/    Express API
  src/models/Requirement.js   Base schema + discriminators per category
  src/validation/             Zod schema (discriminated union on category)
  tests/                      API tests
```

See [frontend/README.md](frontend/README.md) and [backend/README.md](backend/README.md) for more detail.

## How data is categorised

All requirements live in one `requirements` collection. `category` is a **Mongoose discriminator key**, so each
document stores the shared Step 1 fields plus a `details` object whose schema depends on its category.
Validation happens twice: on the client per step, and on the server with a Zod discriminated union, so a
planner requirement can't be saved with crew fields.

```json
{
  "category": "crew",
  "eventName": "Tech Summit 2026",
  "eventType": "corporate",
  "dateType": "range",
  "startDate": "2026-12-12T00:00:00.000Z",
  "endDate": "2026-12-14T00:00:00.000Z",
  "location": "Bengaluru",
  "details": {
    "roles": [{ "role": "lighting", "count": 3 }, { "role": "photographer", "count": 2 }],
    "shiftHours": 10,
    "experienceLevel": "senior",
    "budget": { "min": 40000, "max": 60000, "currency": "INR" }
  },
  "status": "open",
  "createdAt": "..."
}
```

## API

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/requirements` | Create a requirement → `201 { id, category, status, createdAt, requirement }` |
| `GET` | `/api/requirements?category=planner` | List requirements, optionally filtered by category |
| `GET` | `/api/requirements/:id` | Get one requirement |
| `GET` | `/health` | Health check |

Validation errors return `400 { error, fields: { "details.budget.max": "message" } }`.

## Run locally

Requires Node.js 18+.

```bash
# Backend: http://localhost:5000
cd backend
npm install
cp .env.example .env   # set MONGODB_URI, or leave empty to use an in-memory MongoDB
npm run dev

# Frontend: http://localhost:3000
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### Environment variables

| App | Variable | Example |
|---|---|---|
| Backend | `MONGODB_URI` | `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/gopratle` |
| Backend | `CORS_ORIGINS` | `https://gopratle-hy-assignment-2k26.vercel.app` |
| Backend | `NODE_ENV` | `production` (on Render) |
| Frontend | `NEXT_PUBLIC_API_URL` | `https://gopratle-hy-assignment-2k26.onrender.com` |

## Testing

```bash
cd backend && npm test
```

13 API tests cover saving each category, single-day vs date-range events, and rejection of: unknown
categories, past dates, end date before start date, budget max below min, details from the wrong category,
duplicate crew roles, blank text and malformed JSON. Listing, category filtering and 404s are also covered.
The frontend flow was tested manually end to end in the browser.

## Edge cases handled

- End date before start date; dates in the past
- Switching category keeps each category's answers separate; only the selected one is submitted
- Whitespace-only text, budget max below min, duplicate crew roles
- Server-side errors mapped back to the correct field and step
- Double-submit protection, network error message, and a "waking up server" note for cold starts

## Assumptions

- No login; requirements are posted anonymously
- Location is a free-text city (no maps API)
- Budgets are in INR
- One category per requirement

## Limitations and possible improvements

- Add authentication so users can manage their own requirements
- Save drafts and allow editing or closing a posted requirement
- Location autocomplete and file uploads (e.g. reference images)
- Admin dashboard and email notifications to matching vendors
- Frontend unit/E2E tests (e.g. Playwright) and pagination on the browse page
