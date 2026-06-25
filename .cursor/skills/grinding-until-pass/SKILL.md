---
name: grinding-until-pass
description: Keep iterating on code changes until the tests pass, the build succeeds, or linting is clean. Runs in a tight loop of fix → run → check → repeat. Use when you want the agent to autonomously grind through test failures or build errors.
---

# Grind Until Pass

Use this skill when you want the agent to keep working autonomously until a specific goal is met — all tests pass, the build succeeds, or linting is clean. Instead of stopping after one attempt, the agent loops until done.

## Step 0: Detect the stack

This is a **cross-stack** repo (see [AGENTS.md](../../../AGENTS.md)): a Python backend (`app/`, `tests/`) and a React frontend (`frontend/`). Grind the stack(s) you changed; if a change touches both, grind both.

```bash
# Backend (repo root): pytest + ruff via pyproject.toml
ls pyproject.toml tests/ 2>/dev/null

# Frontend: Vitest + tsc
grep -E "vitest|tsc" frontend/package.json
```

## Steps

1. **Define the goal command** — the command whose exit code determines success. Pick the branch that matches the code under test:

   **Backend (Python — run from repo root; activate the venv first):**

   - Tests: `pytest` (or `pytest tests/test_services.py -v` to scope)
   - Lint: `ruff check .`
   - Format check: `ruff format --check .`
   - All of the above: `ruff check . && ruff format --check . && pytest`

   **Frontend (`cd frontend` first):**

   - Tests: `npm test` (alias for `vitest run`) or `npx vitest run`
   - Type-check / lint: `npm run lint` (alias for `tsc --noEmit`)
   - Build: `npm run build`
   - All of the above: `npm run lint && npm test && npm run build`

   **Both stacks at once** — reuse the project hook script, which runs backend `pytest` and frontend `vitest` and skips a stack that has no tests:

   ```bash
   bash .cursor/hooks/check-tests.sh </dev/null
   ```

2. **Run the command** — execute it and capture the output.

3. **If it fails — analyze and fix**:
   - Read the error output carefully.
   - Identify the root cause: failing test assertion, type error, lint violation, import error, etc.
   - Make the minimal fix. Don't refactor — just fix the error.
   - Go back to step 2.

4. **If it passes — stop and report**:
   - Report what was fixed and how many iterations it took.
   - Summarize the changes made.

## Rules for the Loop

- **Maximum 10 iterations** — if after 10 attempts the command still fails, stop and report what's blocking progress. Something fundamental is wrong and needs human input.
- **Fix one thing at a time** — don't try to fix all errors at once. Fix the first error, re-run, and see if the fix resolves downstream errors too.
- **Don't delete tests** — if a test is failing, fix the code to make it pass. Don't modify the test unless the test itself is clearly wrong (testing old behavior that was intentionally changed).
- **Don't suppress errors** — fix the actual problem. Don't silence with frontend escapes (`@ts-ignore`, `eslint-disable`, `any`) or backend ones (`# type: ignore`, `# noqa`, broad `except Exception: pass`).
- **Track progress** — if the number of errors is increasing instead of decreasing, stop and reassess the approach.

## When to Use This

- After a large refactor that broke multiple tests
- After upgrading a dependency that introduced type errors
- After merging a branch with conflicts that need resolution
- When you want to "just make it green" and trust the agent to grind through it

## Advanced: Cursor Hooks Integration

This repo already automates the grind via a `stop` hook in [.cursor/hooks.json](../../../.cursor/hooks.json). After the agent's turn ends it runs [.cursor/hooks/check-tests.sh](../../../.cursor/hooks/check-tests.sh) (backend `pytest` + frontend `vitest`); if anything fails the script emits a `followup_message`, which prompts the agent to keep grinding:

```json
{
  "version": 1,
  "hooks": {
    "stop": [
      {
        "command": ".cursor/hooks/check-tests.sh",
        "timeout": 180,
        "loop_limit": 3
      }
    ]
  }
}
```

Notes on the real config (don't copy the older single-array `{ "event": "stop" }` shape — that schema is wrong):

- Events are keys under `hooks` (e.g. `stop`), each holding an array of hook definitions.
- `loop_limit` caps how many times the follow-up loop can re-fire, so the grind can't run forever.
- `timeout` (seconds) bounds each run.
- The script reads the stop-event JSON on stdin, runs both stacks, returns `{ "followup_message": "..." }` on failure or `{}` on success, and **fails open** so a broken hook never wedges a session. The frontend branch self-skips when vitest isn't installed or no test files exist.

## Notes

- This works best with fast test suites. If your tests take 5+ minutes, the loop will be slow.
- Stop at the first failure for faster iteration: `pytest -x` (backend) or `vitest run --bail 1` (frontend).
- The agent will be thorough but not creative — if the fix requires a design change, it'll need human guidance.
