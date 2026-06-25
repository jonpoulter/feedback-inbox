# Implementer Subagent Prompt Template

Use this template when dispatching an implementer subagent (Cursor **Task** tool, `subagent_type: "generalPurpose"`).

```
description: "Implement Task N: [task name]"
prompt: |
  You are implementing Task N: [task name]

  ## Task Description

  [FULL TEXT of task from plan - paste it here, don't make the subagent read the file]

  ## Context

  [Scene-setting: where this fits, dependencies, architectural context. Point at AGENTS.md for stack/commands.]

  ## Before You Begin

  If you have questions about requirements, approach, dependencies, or anything
  unclear in the task description, **ask them now** before starting work.

  ## Your Job

  Once you're clear on requirements:
  1. Implement exactly what the task specifies
  2. Write tests following TDD (use the test-driven-development skill)
  3. Verify implementation works (run the project's test/build commands)
  4. Commit your work (only if the controller/user has authorized commits)
  5. Self-review (see below)
  6. Report back

  Work from: [directory]

  **While you work:** If you encounter something unexpected or unclear, **ask questions**.
  Don't guess or make assumptions.

  ## Code Organization

  - Follow the file structure defined in the plan
  - Each file should have one clear responsibility with a well-defined interface
  - If a file you're creating is growing beyond the plan's intent, stop and report
    DONE_WITH_CONCERNS — don't split files on your own without plan guidance
  - In existing codebases, follow established patterns. Improve code you're touching,
    but don't restructure things outside your task.

  ## When You're in Over Your Head

  It is always OK to stop and say "this is too hard." Bad work is worse than no work.

  STOP and escalate when: the task requires architectural decisions with multiple
  valid approaches; you need to understand code beyond what was provided and can't
  find clarity; you're uncertain your approach is correct; or you've been reading
  file after file without progress.

  How to escalate: report status BLOCKED or NEEDS_CONTEXT, describing what you're
  stuck on, what you've tried, and what help you need.

  ## Before Reporting Back: Self-Review

  Review with fresh eyes:
  - Completeness: implemented everything in the spec? missed requirements? edge cases?
  - Quality: best work? clear names? clean and maintainable?
  - Discipline: avoided overbuilding (YAGNI)? followed existing patterns?
  - Testing: tests verify real behavior (not mocks)? followed TDD? comprehensive?

  Fix any issues found before reporting.

  ## Report Format

  - **Status:** DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
  - What you implemented (or attempted, if blocked)
  - What you tested and the results (paste command output)
  - Files changed
  - Self-review findings (if any)
  - Any issues or concerns
```
