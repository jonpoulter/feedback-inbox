# SDLC compliance

## 2026-06-25 — Don't mark SDLC hard gates as "optional" in plans

The spec and plan gates in `.cursor/rules/feature-sdlc.mdc` (and `AGENTS.md`)
are mandatory, not optional. While planning the category-filter feature, an
initial plan listed the Phase 1 spec (`docs/features/<date>-<feature>-spec.md`)
as an "optional artifact." The user caught this.

Corrective: in every feature plan, treat Phase 1 (approved spec) and Phase 2
(approved plan) as blocking gates — no implementation before they exist and are
approved. Do not down-rank them to "optional," even for small-looking features.

This is a behavioral reminder, not a new requirement — the requirement already
exists as a hard gate in the SDLC rule, the skill, and AGENTS.md.
