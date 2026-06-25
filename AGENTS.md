# feedback-inbox — Agent context

## Overview

- **What it is:** Internal team feedback inbox — submit items, list them, filter by status, mark as reviewed.
- **Stack:** Python 3.11+ (FastAPI, SQLAlchemy, SQLite) + React 18 (Vite, TypeScript)
- **Repository:** single repo (this directory); **two dev processes** (API + frontend)

## Local development

```bash
# Backend (repo root)
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -e ".[dev]"

python scripts/seed.py        # optional demo data

uvicorn app.main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

| Service | URL | Notes |
|---------|-----|--------|
| **API** | http://localhost:8000 | FastAPI; OpenAPI at `/docs` |
| **UI** | http://localhost:5173 | Vite dev server (default port) |
| **UI → API** | `VITE_API_BASE_URL` | Set in `frontend/.env` → `http://localhost:8000` |

**Dev CORS:** FastAPI allows `http://localhost:5173` in development. Do not widen CORS for production without review.

## Testing

| Type | Command | Where |
|------|---------|--------|
| Backend unit | `pytest tests/test_services.py -v` | repo root |
| Backend API | `pytest tests/test_api.py -v` | repo root |
| All backend | `pytest` | repo root |
| Frontend unit | `npm run test` | `frontend/` |
| E2E | `npm run test:e2e` | `frontend/` (Playwright; run API + seed first) |
| Lint (Python) | `ruff check .` | repo root |
| Lint (UI) | `npm run lint` | `frontend/` |
| Format (Python) | `ruff format .` | repo root |

**Test database:** Backend tests use in-memory SQLite (`sqlite:///:memory:`). Do **not** use `feedback.db` in tests.

**Smoke (manual):** API up on `:8000`, UI on `:5173`, seeded data visible, filter and “mark reviewed” work in the browser.

## Branching

- Feature branches: `feature/<short-description>` (e.g. `feature/status-filter`)
- Default branch: `main`
- Do not commit on default branch without explicit user consent.

## Architecture

**Backend (`app/`)** — JSON API only; no server-rendered HTML.

- `app/main.py` — FastAPI app, CORS, routes
- `app/services.py` — business logic (filter, status transitions)
- `app/models.py` / `app/schemas.py` — ORM + Pydantic
- `app/db.py` — SQLite engine, sessions

**Frontend (`frontend/`)** — React SPA built with Vite.

- `frontend/src/main.tsx` — entry
- `frontend/src/App.tsx` — inbox layout
- `frontend/src/api/` — fetch wrappers (`VITE_API_BASE_URL`)
- `frontend/src/components/` — list, form, filter, review actions

**Domain model:** `FeedbackItem` — `id`, `title`, `body`, `category` (`bug` | `idea` | `process` | `other`), `status` (`new` | `reviewed`), `created_at`.

**Data flow:** React (5173) → `fetch` → FastAPI (8000) → `services.py` → SQLite (`feedback.db` in dev).

**API surface:**

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/items` | List items (`?status=new\|reviewed\|all`, `?category=bug\|idea\|process\|other\|all`; combined with AND) |
| POST | `/api/items` | Create feedback |
| POST | `/api/items/{id}/review` | Mark reviewed |

Key paths:

- `app/` — Python API
- `frontend/src/` — React UI
- `tests/` — backend pytest
- `frontend/src/**/*.test.tsx` — frontend tests (if present)
- `scripts/seed.py` — demo data

## Cursor guardrails

| Mechanism | Location |
|-----------|----------|
| Feature SDLC | `.cursor/rules/feature-sdlc.mdc` → `project-feature-sdlc` skill |
| Debug cleanup | `.cursor/rules/debug-instrumentation-cleanup.mdc` |
| Hooks | `.cursor/hooks.json` |
| Feature docs | `docs/features/` |
| Learnings | `context/` |

New features and multi-file changes: follow **project-feature-sdlc** (spec → plan → TDD → smoke → retro).

Cross-stack features typically touch `app/` and `frontend/src/` — note both in plans and smoke checklists.

## Do not edit without asking

- `feedback.db` (local dev data; gitignored)
- `.venv/`, `frontend/node_modules/`
- `frontend/dist/` (build output)
- Lock files: `uv.lock`, `frontend/package-lock.json` (unless dependency change is intentional)
- `frontend/.env.local` (machine-specific)

## Production / release

- **Approver:** Project owner (demo app — no production deploy)
- **Build UI:** `cd frontend && npm run build` → `frontend/dist/`
- **Deploy:** N/A for demo. If added later: serve `dist/` behind static hosting or reverse proxy; API on separate host; document env vars here.

