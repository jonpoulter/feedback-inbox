---
name: subagent-driven-development
description: Use when executing an implementation plan with independent tasks in the current session. Dispatches a fresh subagent per task with two-stage review (spec compliance, then code quality) after each.
---

# Subagent-Driven Development

Execute a plan by dispatching a fresh subagent per task, with two-stage review after each: spec compliance review first, then code quality review.

This is the recommended **driver for SDLC Phase 4** when the plan has mostly independent tasks. For small or tightly-coupled work, use `grinding-until-pass` instead. Gate every "done" with `verification-before-completion`.

**Why subagents:** You delegate tasks to specialized agents with isolated context. By crafting their instructions precisely, you keep them focused. They never inherit your session's history — you construct exactly what they need. This also preserves your own context for coordination.

**Core principle:** Fresh subagent per task + two-stage review (spec then quality) = high quality, fast iteration.

**Continuous execution:** Do not pause to check in between tasks. Execute all tasks from the plan without stopping. The only reasons to stop are: a BLOCKED status you cannot resolve, genuine ambiguity that prevents progress, or all tasks complete.

## When to Use

```
Have an implementation plan?  ── no ──> brainstorm/plan first
        │ yes
Tasks mostly independent?      ── no, tightly coupled ──> grinding-until-pass
        │ yes
Use subagent-driven-development (this skill)
```

In Cursor, dispatch subagents with the **Task** tool (`subagent_type: "generalPurpose"` for implementers/reviewers, or `"explore"` for read-only review).

## The Process

For each task:

1. Read the plan once. Extract ALL tasks with full text and context. Create a TodoWrite list.
2. **Dispatch implementer subagent** using [implementer-prompt.md](implementer-prompt.md) (paste full task text — don't make the subagent read the plan file).
3. If the implementer asks questions, answer them, then re-dispatch.
4. Implementer implements, tests, commits, self-reviews, and reports a status.
5. **Dispatch spec compliance reviewer** using [spec-reviewer-prompt.md](spec-reviewer-prompt.md). If issues → implementer fixes → re-review until ✅.
6. **Only after spec ✅, dispatch code quality reviewer** using [code-quality-reviewer-prompt.md](code-quality-reviewer-prompt.md). If issues → implementer fixes → re-review until approved.
7. Mark the task complete in TodoWrite.
8. When all tasks are done, dispatch a final review of the whole implementation (use `parallel-code-review`), then proceed to SDLC Phase 5 (smoke) and Phase 7 (commits/PR).

## Model Selection

Use the least powerful model that can handle each role.

- Touches 1-2 files with a complete spec → fast, cheap model
- Touches multiple files with integration concerns → standard model
- Requires design judgment or broad codebase understanding → most capable model

## Handling Implementer Status

Implementer subagents report one of four statuses:

- **DONE:** Proceed to spec compliance review.
- **DONE_WITH_CONCERNS:** Read the concerns first. If about correctness/scope, address before review. If observations, note and proceed.
- **NEEDS_CONTEXT:** Provide the missing context and re-dispatch.
- **BLOCKED:** Assess the blocker — provide more context, re-dispatch with a more capable model, break the task into smaller pieces, or escalate to the human if the plan is wrong.

**Never** ignore an escalation or force the same model to retry without changes.

## Prompt Templates

- [implementer-prompt.md](implementer-prompt.md) — dispatch implementer subagent
- [spec-reviewer-prompt.md](spec-reviewer-prompt.md) — dispatch spec compliance reviewer
- [code-quality-reviewer-prompt.md](code-quality-reviewer-prompt.md) — dispatch code quality reviewer

## Red Flags

**Never:**
- Start implementation on `main` without explicit user consent (use a `feature/<…>` branch; see AGENTS.md)
- Skip reviews (spec compliance OR code quality)
- Proceed with unfixed issues
- Dispatch multiple implementation subagents in parallel for the same code (conflicts)
- Make a subagent read the plan file (provide full text instead)
- Start code quality review before spec compliance is ✅ (wrong order)
- Move to the next task while either review has open issues

**If a reviewer finds issues:** the same implementer subagent fixes them, then the reviewer reviews again. Repeat until approved. Don't skip the re-review.

## Integration

**Required workflow skills:**
- `using-git-worktrees` — ensure an isolated workspace before starting
- `writing-plans` — creates the plan this skill executes
- `parallel-code-review` — multi-lens review for the final pass
- `verification-before-completion` — gate every completion claim

**Subagents should use:**
- `test-driven-development` — subagents follow TDD for each task

**Alternative:**
- `grinding-until-pass` — for small or tightly-coupled work in this session
