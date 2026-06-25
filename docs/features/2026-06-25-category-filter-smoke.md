# Category Filter — Smoke Test Checklist

> Run against a **running** application (see [AGENTS.md](../../AGENTS.md)).
> **Spec:** [2026-06-25-category-filter-spec.md](2026-06-25-category-filter-spec.md)

## Environment

- [x] API running: `uvicorn app.main:app --reload --port 8000`
- [x] UI running: `npm run dev` (http://localhost:5173)
- [x] Test data: existing seeded items plus two ad-hoc items ("Smoke bug", "Smoke idea")

## Functional checks

| # | Steps | Expected | Pass |
|---|-------|----------|------|
| 1 | Click category "Process" | List shows only `process` items ("Weekly review ritual", "X") | ☑ |
| 2 | Compose "Reviewed" status + "Other" category | No matching items; clear filtered-empty message | ☑ |
| 3 | "All categories" present as the clear-filter option | Selecting it restores the unfiltered list | ☑ |

## API checks

```bash
curl -s "localhost:8000/api/items?category=bug"            # -> only category=bug items
curl -s "localhost:8000/api/items?status=new&category=idea" # -> only status=new AND category=idea
curl -s "localhost:8000/api/items?category=nonsense" -o /dev/null -w "%{http_code}\n"  # -> 422
```

Results: `category=bug` returned only bug items; `status=new&category=idea` returned only new idea items; invalid category returned **422**.

## UI checks

- [x] Dev server URL confirmed: http://localhost:5173
- [x] Browser smoke: category bar renders (All categories / Bug / Idea / Process / Other) alongside the status bar
- [x] Process filter narrows the list; Reviewed + Other shows "No feedback matches these filters."
- [x] No console/network errors observed during interactions

## Automated test evidence

| Check | Command | Result |
|-------|---------|--------|
| Backend | `pytest` | 13 passed |
| Backend lint | `ruff check .` | All checks passed |
| Frontend | `npm run test -- --run` | 25 passed |
| Frontend lint | `npm run lint` (tsc) | Clean |

## Evidence for reviewers

| Artifact | Location |
|----------|----------|
| Screenshot — Process filter | Captured in smoke session (process-only list) |
| Screenshot — filtered-empty | Captured in smoke session ("No feedback matches these filters.") |
| Test output | See Automated test evidence table |
