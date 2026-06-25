# Category Filter — Specification

> **Status:** Approved
> **Date:** 2026-06-25
> **Owner:** Project owner

## Problem statement

The feedback inbox can be filtered by status (All / New / Reviewed) but not by
category. As the volume of feedback grows, reviewers cannot focus on a single
category (e.g. only `bug` items, or only `idea` items) without scanning the
whole list. They need to narrow the inbox to one category, optionally combined
with the existing status filter.

## Success criteria

Measurable outcomes that define "done". Each item must be verifiable.

- [ ] User can filter the inbox by one category (`bug` | `idea` | `process` | `other`); an "All categories" option clears the filter.
- [ ] The category filter composes with the status filter (e.g. New + Bug returns only items where `status == new` AND `category == bug`).
- [ ] `GET /api/items` returns HTTP 422 for an invalid category value.
- [ ] When the active filters match no items, the list shows a clear message ("No feedback matches these filters.") distinct from the no-items-yet message.
- [ ] All existing tests stay green; new behaviour is covered by pytest (backend) and Vitest (frontend).

## Scope

### In scope

- New `category` query param on `GET /api/items` (default `all`), AND-combined with the existing `status` param, validated server-side.
- `CategoryFilterBar` UI button group (All categories / Bug / Idea / Process / Other) alongside the existing `StatusFilterBar`.
- Frontend state wiring in `App.tsx` so both filters drive the list reload.
- Distinct empty-state message in `FeedbackList` when filters are active and match nothing.
- pytest + Vitest coverage for the new behaviour.

### Out of scope

- Multi-select category filtering (one category at a time only).
- Filtering by free-text search, date range, or any field other than status/category.
- Persisting the selected filters across page reloads (URL/query-string or storage).
- Any change to the create/review flows or the `FeedbackItem` data model.

## Constraints

- Follow the existing server-side filter pattern (mirror `status` handling in `app/services.py` and `app/main.py`); do not introduce client-side-only filtering.
- Backend: Python 3.11+ (FastAPI, SQLAlchemy); validation errors map to HTTP 422 as the status filter already does.
- Frontend: React 18 + TypeScript; reuse existing component/test conventions.
- Dev CORS unchanged; no new dependencies.

## Open questions

| # | Question | Answer | Resolved |
|---|----------|--------|----------|
| 1 | Server-side or client-side filtering? | Server-side (`category` query param, AND with status) | ☑ |
| 2 | UI presentation? | Button group mirroring `StatusFilterBar` | ☑ |

## Assumptions

- Categories remain the fixed set defined in `app/models.py` (`CATEGORIES`) and `app/schemas.py` (`Category`); no dynamic/custom categories.
- "All categories" is represented as the sentinel value `all`, consistent with the `all` value used by the status filter.

## References

- [AGENTS.md](../../AGENTS.md) — API surface, domain model, testing commands
- [.cursor/rules/feature-sdlc.mdc](../../.cursor/rules/feature-sdlc.mdc) — required workflow
- Implementation plan: `docs/features/2026-06-25-category-filter-plan.md` (to follow once spec approved)
