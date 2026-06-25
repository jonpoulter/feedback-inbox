# Cursor skills in this starter kit

All skills referenced by `.cursor/rules/feature-sdlc.mdc` are vendored here in the repo
(single source of truth). Cursor auto-discovers each `SKILL.md`; nothing depends on a
machine-global plugin. This file documents provenance only — it is not read by the agent.

## Project-authored

- `project-feature-sdlc` — 8-phase feature delivery orchestration
- `saving-workspace-context` — persist learnings to `context/`

## From [awesome-cursor-skills](https://github.com/spencerpauly/awesome-cursor-skills)

`parallel-exploring`, `writing-tests`, `grinding-until-pass`, `finding-dev-server-url`, `api-smoke-testing`, `verifying-in-browser`, `visual-qa-testing`, `recording-browser-flow-as-test`, `parallel-code-review`, `auditing-security`, `writing-commit-messages`, `creating-pr`, `babysitting-pr`, `parallel-ci-triage`, `building-skills-from-patterns`, `suggesting-cursor-rules`, `screenshotting-changelog`

**Locally adapted (do not blind-copy on refresh):**

- `writing-tests` — rewritten cross-stack with a stack-detection step and separate backend (pytest/FastAPI/SQLAlchemy fixtures) and frontend (Vitest/Testing Library) branches.
- `grinding-until-pass` — added stack detection and cross-stack goal commands (pytest/ruff backend, Vitest/tsc frontend); hooks example corrected to this repo's real `.cursor/hooks.json` schema and `.cursor/hooks/check-tests.sh`.
- `finding-dev-server-url` — added FastAPI/Uvicorn detection (framework row, `uvicorn …` command example, default port 8000).
- `verifying-in-browser` — made framework-agnostic: removed hardcoded `npm run dev` / `localhost:3000`, delegates URL discovery to `finding-dev-server-url` + start command to `AGENTS.md`, and notes UI-vs-API (use `api-smoke-testing` for API-only changes).
- `visual-qa-testing` — made framework-agnostic (same delegation as `verifying-in-browser`); scoped as the visual/UX-only support skill vs. the functional `verifying-in-browser` primary; corrected provider attribution (console/network/resize/hover come from the Playwright MCP, not native `cursor-ide-browser`).
- `screenshotting-changelog` — made framework-agnostic (delegates URL/start to `finding-dev-server-url` + `AGENTS.md`); replaced the broken `git stash` baseline with a base-branch **worktree** flow (work is already committed at PR time); added new-UI (after-only) handling and a SQLite/seed data-parity note; flagged the Playwright MCP dependency for responsive resize.
- `building-skills-from-patterns` — added a "persisted context" input path: mine `context/retros/*` and dated `context/<topic>.md` entries for cross-feature recurring learnings, then triage to skill/rule/hook (proposals gated on user approval). Complements the cross-cutting `saving-workspace-context`.
- `suggesting-cursor-rules` — added a cross-reference noting it is the rule-authoring half that `building-skills-from-patterns` delegates to for convention-type learnings (no duplicated context-mining logic).
- `api-smoke-testing` — base URL is now discovered via `finding-dev-server-url` (no assumed port); start command delegated to `AGENTS.md`; curl examples use a `<base-url>` placeholder.
- `creating-pr` — self-review verification step made cross-stack and delegated to `AGENTS.md` (backend `pytest`/`ruff` + frontend `npm test`/`npm run lint`) instead of frontend-only `npm` commands.
- `babysitting-pr` — CI-fix commands made cross-stack and delegated to `AGENTS.md` (backend `pytest`/`ruff` + frontend `npm` build/lint/test) instead of frontend-only.
- `parallel-ci-triage` — local CI-equivalent example made cross-stack (`ruff`/`pytest` + frontend `npm`) and pointed at `AGENTS.md`.

To refresh from upstream: re-clone awesome-cursor-skills and copy `resources/<skill>/` into `.cursor/skills/<skill>/`. For the two skills above, re-apply the local cross-stack adaptations instead of overwriting.

## From [Superpowers](https://github.com/obra/superpowers) (vendored + adapted)

These methodology skills were copied from the Superpowers plugin and **adapted** for this
repo: `superpowers:<skill>` references were rewritten to local skill names, plan/spec paths
were changed to `docs/features/…`, examples use this project's stack (FastAPI/pytest, React/Vite,
Playwright), and Claude-Code-specific machinery (the brainstorming Node "visual companion",
self-test fixtures) was omitted.

- `brainstorming` — Phase 1 requirements dialogue (text-only; visual companion omitted)
- `writing-plans` — Phase 2 plan authoring
- `test-driven-development` (+ `testing-anti-patterns.md`) — Phase 3 RED→GREEN→REFACTOR
- `subagent-driven-development` (+ `implementer-prompt.md`, `spec-reviewer-prompt.md`, `code-quality-reviewer-prompt.md`) — Phase 4 execution via Cursor Task subagents
- `verification-before-completion` — cross-cutting completion gate
- `systematic-debugging` (+ `root-cause-tracing.md`, `defense-in-depth.md`, `condition-based-waiting.md`) — cross-cutting debugging
- `using-git-worktrees` — cross-cutting workspace isolation

Superpowers is MIT-licensed; retain attribution to the upstream project when redistributing.
To refresh: re-pull Superpowers and re-apply the adaptations above (don't blind-copy — verify
no `superpowers:` references or `docs/superpowers/` paths leak in).

## Deliberately NOT vendored (superseded to avoid redundancy)

| Upstream skill | Use instead |
|----------------|-------------|
| `executing-plans` | `subagent-driven-development` / `grinding-until-pass` |
| `requesting-code-review` | `parallel-code-review` |
| `writing-skills` | `building-skills-from-patterns` |
| `dispatching-parallel-agents` | `parallel-exploring` (explore) / `subagent-driven-development` (execute) |

## Phase mapping

`.cursor/rules/feature-sdlc.mdc` (always loaded) and `project-feature-sdlc/SKILL.md`.
Invariant: every skill named in the rule exists at `.cursor/skills/<name>/SKILL.md`.
