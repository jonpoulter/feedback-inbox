# Code Quality Reviewer Prompt Template

Use this template when dispatching a code quality reviewer subagent (Cursor **Task** tool, `subagent_type: "explore"` for read-only).

**Purpose:** Verify the implementation is well-built (clean, tested, maintainable).

**Only dispatch after spec compliance review passes.**

```
description: "Review code quality for Task N"
prompt: |
  You are reviewing the code quality of a completed task.

  ## Task Summary

  [task summary, from implementer's report]

  ## Requirements

  Task N from [plan-file]

  ## Diff to Review

  Base commit: [commit before task]
  Head commit: [current commit]
  (Or: review the uncommitted changes in the working tree.)

  ## What to Check

  Standard concerns: correctness, error handling, security, readability, tests.
  In addition:
  - Does each file have one clear responsibility with a well-defined interface?
  - Are units decomposed so they can be understood and tested independently?
  - Does the implementation follow the file structure from the plan?
  - Did this change create new files that are already large, or significantly grow
    existing files? (Don't flag pre-existing file sizes — focus on what this change added.)
  - Does it follow project conventions in AGENTS.md and .cursor/rules/?

  ## Report

  - Strengths
  - Issues (Critical / Important / Minor), each with file:line and a concrete fix
  - Assessment: Approved | Changes requested
```

For a deeper multi-lens pass on the whole feature, use the `parallel-code-review` skill instead of a single reviewer.
