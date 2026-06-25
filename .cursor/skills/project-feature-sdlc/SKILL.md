---
name: project-feature-sdlc
description: >-
  Orchestrates end-to-end feature development: requirements and success criteria,
  phased implementation plan, TDD, execution, smoke tests, code review, atomic
  commits and PR docs, retrospective and long-term memory. Use when starting a new
  feature or significant change; when the user asks for SDLC, spec, plan-before-build,
  or structured delivery workflow.
---

# Project Feature SDLC

End-to-end delivery workflow for a single-repo project. Read [AGENTS.md](../../AGENTS.md) for stack, commands, and architecture.

**Announce at start:** "I'm using the project-feature-sdlc skill for this feature."

## Hard gates

Do **not** advance to the next phase until the gate for the current phase is satisfied.

| Phase | Gate — stop until |
|-------|-------------------|
| 1 → 2 | Written spec exists and **user approves** success criteria |
| 2 → 3 | Written plan exists and **user approves** scope, dependencies, reuse |
| 3 → 4 | Test plan reviewed; failing tests exist for new behavior (TDD red) |
| 4 → 5 | All targeted automated tests **pass** |
| 5 → 6 | Smoke checklist complete; evidence captured |
| 6 → 7 | Review findings addressed or explicitly accepted |
| 7 → 8 | PR opened (or user defers); human merge remains their choice |
| 8 | Retro saved; learnings persisted |

If the user says "skip gate" for a phase, note the waiver in the spec or PR body.

## Artifact locations

| Artifact | Path |
|----------|------|
| Specification | `docs/features/YYYY-MM-DD-<feature>-spec.md` |
| Implementation plan | `docs/features/YYYY-MM-DD-<feature>-plan.md` |
| Smoke checklist | `docs/features/YYYY-MM-DD-<feature>-smoke.md` |
| Retrospective | `context/retros/YYYY-MM-DD-<feature>.md` |

Templates: [templates/](templates/) in this skill directory.

**Conflict resolution:** spec beats plan beats AGENTS.md beats ad-hoc notes.

**Anti-pattern:** Do not rely on `~/.cursor/plans/` for team workflow — keep plans in `docs/features/` in git.

---

## Phase 1 — Requirements and success criteria

**Goal:** A testable specification before any implementation.

**Optional sub-skill:** `brainstorming` — one clarifying question at a time; no code until design approved.

**Steps:**

1. Load project context: `AGENTS.md`, `context/`, relevant `.cursor/rules/`.
2. Ask questions until success criteria are **measurable** (not vague "works well").
3. Propose 2–3 approaches with trade-offs if the solution space is unclear.
4. Write spec from [templates/spec.md](templates/spec.md) → `docs/features/…`.
5. **Gate:** User approves spec (explicit yes).

**Anti-patterns:** Starting implementation; accepting "we'll figure out tests later."

---

## Phase 2 — Phased implementation plan

**Goal:** Bite-sized tasks with dependency graph, reuse of existing code, no unnecessary abstractions.

**Primary sub-skill:** `writing-plans` after spec approval — adapt output to [templates/plan.md](templates/plan.md).

**Workspace skill:** `parallel-exploring` — launch explore subagents for large or unfamiliar codebases.

**Steps:**

1. Explore codebase — document what will be **extended** vs **created**.
2. **Reuse checklist** in plan: name files/modules to reuse; justify any new layer or dependency.
3. Build **dependency graph** — mark tasks **serial** vs **parallel** (mermaid in plan).
4. Per task: exact file paths and verification command from AGENTS.md.
5. List doc/rule updates required before PR.
6. **Gate:** User approves plan.

---

## Phase 3 — Test-driven development

**Goal:** Tests encode requirements before production code.

**Primary sub-skill:** `test-driven-development` — RED → GREEN → REFACTOR.

**Support skill:** `writing-tests` — pytest (backend) / Vitest (frontend) structure, fixtures, and conventions. Support only; does not replace RED-first TDD for new behavior.

**Bugfixes (required):**

- Add or update a regression test in the same change.
- Test should fail before the fix and pass after.

**Steps:**

1. Derive test cases from **each** success criterion in the spec.
2. Ask clarifying questions for ambiguous edge cases.
3. Add tests per plan task using commands from AGENTS.md.
4. Use mocks/fakes only at real boundaries (HTTP, DB, external APIs).
5. Run tests; confirm **new tests fail** for the right reason (RED).
6. **Gate:** Proceed when RED is demonstrated.

---

## Phase 4 — Execute implementation

**Goal:** Implement plan tasks; all automated tests green.

**Primary sub-skill:** `subagent-driven-development` (independent tasks) **or** `grinding-until-pass` (small/coupled work).

**Support skills:** `finding-dev-server-url` · `using-git-worktrees` (isolation) · `verification-before-completion` (gate every "done").

**Steps:**

1. Use a feature branch; do not commit on main without explicit consent.
2. Implement task-by-task; TDD GREEN then REFACTOR.
3. Run verification commands from plan after each task group.
4. Update docs/rules per plan checklist.
5. **Gate:** All tests in plan pass.

---

## Phase 5 — Smoke tests (running application)

**Goal:** Confirm behavior in a running app; catch regressions unit tests miss.

**Workspace skills:**

| Skill | Use when |
|-------|----------|
| `finding-dev-server-url` | Dev server URL or port unclear |
| `api-smoke-testing` | HTTP API smoke |
| `verifying-in-browser` | UI smoke in browser |
| `visual-qa-testing` | Layout and visual regressions |
| `recording-browser-flow-as-test` | Capture stable UI flows as tests |
| `screenshotting-changelog` | Evidence for smoke doc or PR |

**Steps:**

1. Write checklist from [templates/smoke-checklist.md](templates/smoke-checklist.md) → `docs/features/…-smoke.md`.
2. Start required services per AGENTS.md.
3. Run automated smoke commands; attach screenshots or command output as evidence.
4. **Gate:** Every smoke row checked or explicitly N/A with reason.

---

## Phase 6 — Code review

**Goal:** Architecture fit, security, anti-patterns, bloat — before merge.

**Workspace skills:** `parallel-code-review` · `auditing-security`

**Review against:** spec success criteria, plan reuse checklist, `.cursor/rules/`, security (secrets, injection, authz).

**Gate:** No open critical findings; user aware of accepted medium risks.

---

## Phase 7 — Atomic commits and PR documentation

**Goal:** Small, reviewable commits; PR tells reviewers what/why/how to test.

**Workspace skills:** `writing-commit-messages` · `creating-pr` · `babysitting-pr` · `parallel-ci-triage` · `screenshotting-changelog`

**Steps:**

1. Atomic commits — one logical change per commit.
2. Only commit when user asks.
3. PR body from [templates/pr-body.md](templates/pr-body.md).
4. **Gate:** PR ready for human review; human owns merge.

---

## Phase 8 — Retrospective and long-term memory

**Goal:** Capture learnings so the next session does not repeat mistakes.

> `saving-workspace-context` is **cross-cutting, not Phase-8-only**: load `context/` at session start and append learnings to `context/<topic>.md` the moment they surface (any phase) — long sessions get compacted, so deferring risks losing detail. Phase 8 here only **consolidates** those running notes into a structured retro.

**Workspace skills:** `saving-workspace-context` · `building-skills-from-patterns` · `suggesting-cursor-rules`

**Steps:**

1. Write retro from [templates/retrospective.md](templates/retrospective.md) → `context/retros/…`.
2. Update AGENTS.md, rules, or skills if learnings change how work should be done.
3. Append dated entries to `context/<topic>.md` for cross-cutting lessons.

**Gate:** Retro file exists; at least one concrete action row filled.

---

## Quick invocation

- "Run project-feature-sdlc for {feature}"
- "Start SDLC phase 1 for {idea}"
- "We're at phase 5 — run smoke tests"

Resume at the current phase; do not restart from phase 1 unless asked.

## Anti-patterns

- Implementation before approved spec/plan
- Skipping RED in TDD
- Giant single commit / unscoped agent task
- "Agent wrote it" without smoke or review
- New helpers duplicating existing utilities
