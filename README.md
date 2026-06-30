# feedback-inbox

Internal team feedback inbox — submit items, list them, filter by status, and mark as reviewed.

**Stack:** Python 3.11+ (FastAPI, SQLAlchemy, SQLite) and React 18 (Vite, TypeScript).

## Prerequisites

- Python 3.11+
- Node.js and npm

## Quick start

```bash
# Backend (repo root)
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -e ".[dev]"

python scripts/seed.py        # optional demo data

cp .env.example .env          # optional: enable Sentry (set SENTRY_DSN)
uvicorn app.main:app --reload --port 8000 --env-file .env

# Frontend (separate terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

| Service | URL |
|---------|-----|
| API | http://localhost:8000 (OpenAPI at `/docs`) |
| UI | http://localhost:5173 |

## Documentation

- **[AGENTS.md](AGENTS.md)** — full local development, testing, architecture, and project conventions
- **[docs/SKILLS-WORKFLOW.md](docs/SKILLS-WORKFLOW.md)** — SDLC skill workflow (human reference)

Internal demo app — no production deployment configured.
