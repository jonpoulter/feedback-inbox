# feedback-inbox — Agent context

## Overview

- **What it is:** Internal team feedback inbox — submit items, list them, filter by status, mark as reviewed.
- **Stack:** Python 3.11+ (FastAPI, SQLAlchemy, SQLite) + React 18 (Vite, TypeScript)
- **Repository:** single repo (this directory); **two dev processes** (API + frontend)
- **Observability:** Unhandled API errors are reported to Sentry when `SENTRY_DSN` is set (see env table). Cloud Agents should use Sentry MCP to investigate production issues (see Cursor Cloud section below).

## Local development

```bash
# Backend (repo root)
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -e ".[dev]"

python scripts/seed.py        # optional demo data

cp .env.example .env          # optional: configure Sentry (SENTRY_DSN)

# Without telemetry (Sentry off):
uvicorn app.main:app --reload --port 8000

# With Sentry (loads SENTRY_DSN/SENTRY_ENVIRONMENT from .env):
uvicorn app.main:app --reload --port 8000 --env-file .env

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

### Backend configuration (env vars)

All backend env vars are optional and fall back to the defaults below. Copy `.env.example` → `.env` and load with `uvicorn ... --env-file .env`. The root `.env` is gitignored; never commit real secrets.

| Variable | Default | Read in | Purpose |
|----------|---------|---------|---------|
| `DATABASE_URL` | `sqlite:///./feedback.db` | `app/db.py` | SQLAlchemy connection URL |
| `CORS_ORIGINS` | `http://localhost:5173` | `app/main.py` | Comma-separated allowed CORS origins |
| `SENTRY_DSN` | _(unset → Sentry off)_ | `app/main.py` | Sentry DSN; empty disables telemetry |
| `SENTRY_ENVIRONMENT` | `demo` | `app/main.py` | Sentry environment tag |

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
| GET | `/api/stats` | Inbox stats for current filters (`?status=…&category=…`, same as items list) |
| POST | `/api/items` | Create feedback |
| POST | `/api/items/{id}/review` | Mark reviewed |

Key paths:

- `app/` — Python API
- `frontend/src/` — React UI
- `tests/` — backend pytest
- `frontend/src/**/*.test.tsx` — frontend tests (if present)
- `scripts/seed.py` — demo data

## Cursor Cloud specific instructions

When working on **production bugs** or issues that reference Sentry:

1. **Diagnose with Sentry MCP** (connected via Cursor Integrations) before changing code:
   - Use `search_issues` / issue details for project `feedback-inbox`.
   - If the issue includes a Sentry permalink, start there.
   - Use Seer (`analyze_issue_with_seer`) when root cause is unclear.
   - This org uses EU Sentry (`de.sentry.io`) when a regional URL is required.

2. **Fix expectations:**
   - Reproduce from the stack trace and issue description; add or update tests for the failure mode.
   - Run `pytest` (repo root) and `cd frontend && npm run test` before opening a PR.

3. **Delivery:**
   - Work on a branch; open a PR to `main` (do not push directly to `main`).
   - PR description should include **`Fixes <Linear issue id>`** when closing a Linear ticket.

4. **Do not** add debug-only routes or commit secrets (`SENTRY_DSN`, auth tokens).

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

## Cursor Cloud specific instructions

Standard setup/test/run commands live in **Local development** and **Testing** above; the notes below only cover Cloud-specific gotchas.

- **Environment is Dockerfile-based:** `.cursor/environment.json` builds the base image from `.cursor/Dockerfile` (Ubuntu 24.04 + Python 3.12/`python3-venv`/pip + Node.js 22). `python3-venv` (ensurepip) lives in the base image because the stock image lacks it, which otherwise breaks `python3 -m venv .venv` on startup. System-level tooling changes go in `.cursor/Dockerfile`; per-startup dependency installs (pip/npm) stay in the `install` command.
- **Python interpreter:** Use `python3` (there is no `python` alias). The venv lives at `.venv/`; invoke tools as `.venv/bin/<tool>` (e.g. `.venv/bin/pytest`, `.venv/bin/ruff`, `.venv/bin/uvicorn`) without needing to `source` it.
- **Frontend `.env` is optional:** `frontend/src/api/client.ts` defaults `VITE_API_BASE_URL` to `http://localhost:8000`, so the UI talks to the API even without `frontend/.env`.
- **Two dev processes:** Run the API (`.venv/bin/uvicorn app.main:app --reload --port 8000`) and UI (`cd frontend && npm run dev`, serves on `:5173`) in separate long-lived terminals. Seed demo data with `.venv/bin/python scripts/seed.py` (writes `feedback.db` at repo root).
- **Stop hook:** `.cursor/hooks/check-tests.sh` re-runs `pytest` and `npm test` when the agent stops and will ask you to keep fixing if either fails — keep both suites green before finishing.

- **Approver:** Project owner (demo app — no production deploy)
- **Build UI:** `cd frontend && npm run build` → `frontend/dist/`
- **Deploy:** N/A for demo. If added later: serve `dist/` behind static hosting or reverse proxy; API on separate host; document env vars here.

