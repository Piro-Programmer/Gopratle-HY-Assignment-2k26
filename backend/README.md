# GoPratle Backend

Express 5 + Mongoose API that stores event requirements, categorised as `planner`, `performer` or `crew`.

## Run locally

```bash
cd backend
npm install
cp .env.example .env   # set MONGODB_URI, or leave it empty to use an in-memory MongoDB
npm run dev            # http://localhost:5000
npm test               # 13 API tests against an in-memory MongoDB
```

| Env var | Purpose |
|---|---|
| `PORT` | Port to listen on (default 5000) |
| `MONGODB_URI` | MongoDB Atlas connection string (required when `NODE_ENV=production`) |
| `CORS_ORIGINS` | Comma-separated allowed origins, e.g. `https://your-app.vercel.app` (empty = allow all) |

## Data model

One `requirements` collection. `category` is the Mongoose **discriminator key**, so every document holds the
common Step 1 fields plus a `details` sub-document whose schema depends on the category
(`PlannerRequirement`, `PerformerRequirement`, `CrewRequirement`). Indexed on `{ category, createdAt }`.

## API

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/requirements` | Create a requirement → `201 { id, category, status, createdAt, requirement }` |
| `GET` | `/api/requirements?category=crew&page=1&limit=20` | List, newest first, optional category filter |
| `GET` | `/api/requirements/:id` | Get one (404 if missing) |

Validation errors return `400 { error, fields: { "details.budget.max": "message", ... } }`, with keys matching form field paths.

### Example request

```json
{
  "eventName": "Sharma Wedding",
  "eventType": "wedding",
  "dateType": "range",
  "startDate": "2026-12-10",
  "endDate": "2026-12-12",
  "location": "Jaipur",
  "venue": "Rambagh Palace",
  "category": "planner",
  "details": {
    "services": ["decor", "catering"],
    "guestCount": 300,
    "planningScope": "full",
    "budget": { "min": 500000, "max": 800000 },
    "notes": "Prefer floral theme"
  }
}
```

Category `details` fields:
- **planner**: `services[]`, `guestCount`, `planningScope` (full/partial/day_of), `budget`, `notes?`
- **performer**: `performerType`, `genre?`, `durationHours`, `numberOfSets`, `equipmentProvided`, `budget`, `notes?`
- **crew**: `roles[{ role, count }]` (unique roles), `shiftHours`, `experienceLevel`, `budget`, `notes?`

## Validation rules
- Dates are `YYYY-MM-DD`; start date can't be in the past (1-day grace for time zones); range end ≥ start.
- Single-day events are stored with `endDate = startDate`.
- Budget `max ≥ min`; text is trimmed and blank strings rejected; unknown categories rejected.
