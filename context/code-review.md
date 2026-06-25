# Code review

## 2026-06-25 — Use Bugbot at two points in Phase 7 (PR)

For feature work going through project-feature-sdlc, run Bugbot in two
complementary ways during Phase 7:

1. Local Bugbot subagent as a final pre-commit gate. Launch one `bugbot`
   subagent (readonly) with `Diff: branch changes` against the repo root
   before making commits. It computes the branch diff vs the merge-base with
   the default branch and returns severity-sorted findings. Address agreed
   findings before committing. Complements (does not replace) the
   parallel-code-review pass in Phase 6.
2. Cursor Bugbot GitHub App on the opened PR. After push, Bugbot reviews the
   diff and posts findings (inline comments or a summary review). Triage those
   and push fixes as needed.

**GitHub App enablement (not the same as repo access):** granting the Cursor
GitHub App access to a repository under GitHub Connections → Manage is necessary
but not sufficient. Bugbot must also be **enabled per repository** via the toggle
in the [Bugbot dashboard](https://cursor.com/dashboard/bugbot). An active
Bugbot subscription (usage-based billing) is required. Team-owned repos need a
team admin to enable Bugbot for that repo.

If Bugbot does not auto-run on the PR, trigger manually with a PR comment:
`bugbot run`. For support/debugging, use `bugbot run verbose=true` to obtain a
request ID.

Net: catch issues locally before they reach the PR (faster loop), then let the
GitHub App catch anything diff-context-dependent on the PR itself.
