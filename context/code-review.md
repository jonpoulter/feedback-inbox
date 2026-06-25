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
2. Cursor Bugbot GitHub App on the opened PR. Once the PR is pushed, the
   installed GitHub App auto-reviews and posts inline comments. Triage those
   and push fixes as needed.

Net: catch issues locally before they reach the PR (faster loop), then let the
GitHub App catch anything diff-context-dependent on the PR itself.
