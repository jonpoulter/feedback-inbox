# Retrospective — Category Filter

**Date:** 2026-06-25  
**PR:** https://github.com/jonpoulter/feedback-inbox/pull/1

## Outcomes vs success criteria

| Criterion | Met? | Notes |
|-----------|------|-------|
| User can filter by one category; "All categories" clears the filter | ✅ | `CategoryFilterBar` + server-side `category=all` default |
| Category filter composes with status filter (AND) | ✅ | `list_items(status, category)`; API + App tests |
| API returns 422 for invalid category values | ✅ | FastAPI `CategoryFilter` Literal validation |
| Empty list shows distinct message when filters match nothing | ✅ | `FeedbackList` `filtersActive` prop + App integration test |
| Existing tests green; new behaviour covered by pytest + Vitest | ✅ | 14 pytest, 27 Vitest after review fixes |

## What went well

- TDD RED/GREEN per task (backend service → API → client → components → App wiring).
- Clean reuse of the existing `StatusFilter` / `StatusFilterBar` pattern end-to-end.
- Phase 6 parallel review found no critical/high issues; local Bugbot subagent and GitHub Bugbot App both reported no bugs on PR #1.
- Spec and plan gates caught scope early; review follow-ups (#1–#5, #7) tightened tests and added a composite DB index.

## What was harder than expected

- Bugbot GitHub App returned "Bugbot is disabled for this repository" despite GitHub App repo access under GitHub Connections → Manage. Required enabling Bugbot per-repository in the Bugbot dashboard (separate from granting access).
- Smoke screenshots were captured to a temp directory (`/var/folders/.../T/cursor/screenshots/`) and not persisted in-repo; smoke doc references them descriptively only.

## Learnings for future agents

| Learning | Action |
|----------|--------|
| SDLC spec/plan gates must not be marked "optional" in plans | See [context/sdlc-compliance.md](../sdlc-compliance.md) |
| Run local Bugbot subagent pre-commit + GitHub Bugbot on PR; enable repo in dashboard | See [context/code-review.md](../code-review.md) (updated with enablement nuance) |
| Composite index on `(status, category, created_at)` added; `create_all` does not alter existing dev DBs | Note in PR/smoke when adding indexes; dev `feedback.db` may need recreate |
| Category values duplicated across frontend components (deferred) | Optional follow-up: shared `CATEGORY_OPTIONS` module |

## Process improvements

- [ ] New / updated skill: none — `project-feature-sdlc` and `review-bugbot` skills sufficient
- [ ] New / updated rule: none — existing `feature-sdlc.mdc` hard gates cover the compliance slip
- [x] Doc update: `context/sdlc-compliance.md`, `context/code-review.md`, `docs/features/*`
- [x] Saved to `context/`: retro (this file), sdlc-compliance, code-review

## Metrics (optional)

- Cycle time: single session (spec → PR #1)
- Rework: one Phase 6 review pass (test gaps + index); Bugbot enablement troubleshooting on PR
