---
name: writing-plans
description: Use when you have a spec or requirements for a multi-step task, before touching code. Produces a bite-sized, dependency-ordered implementation plan with exact files, code, and verification commands.
---

# Writing Plans

## Overview

Write comprehensive implementation plans assuming the engineer has zero context for this codebase and questionable taste. Document everything they need: which files to touch for each task, the code, how to test it, and which docs to check. Give them the whole plan as bite-sized tasks. DRY. YAGNI. TDD. Frequent commits.

Assume they are a skilled developer who knows almost nothing about this toolset or problem domain, and doesn't know good test design well.

This is the **driver** for SDLC Phase 2. Pair it with `parallel-exploring` for codebase mapping, and adapt the output to the project's plan template at [project-feature-sdlc/templates/plan.md](../project-feature-sdlc/templates/plan.md).

**Announce at start:** "I'm using the writing-plans skill to create the implementation plan."

**Save plans to:** `docs/features/YYYY-MM-DD-<feature>-plan.md` (per project-feature-sdlc artifact locations).

## Prerequisites

- An approved spec exists (`docs/features/YYYY-MM-DD-<feature>-spec.md`). If not, return to SDLC Phase 1 (use `brainstorming` or the orchestrator's Phase 1 steps).

## Scope Check

If the spec covers multiple independent subsystems, suggest breaking this into separate plans — one per subsystem. Each plan should produce working, testable software on its own.

## File Structure

Before defining tasks, map which files will be created or modified and what each is responsible for. This is where decomposition decisions get locked in.

- Design units with clear boundaries and well-defined interfaces. One clear responsibility per file.
- Prefer smaller, focused files over large ones that do too much.
- Files that change together should live together. Split by responsibility, not by technical layer.
- In existing codebases, follow established patterns. Don't unilaterally restructure; a targeted split is reasonable if a file you're modifying has grown unwieldy.

## Reuse Checklist (required)

Per project-feature-sdlc, the plan MUST document what will be **extended** vs **created**. Name the existing files/modules you will reuse and justify any new layer or dependency.

## Bite-Sized Task Granularity

**Each step is one action (2-5 minutes):**
- "Write the failing test" — step
- "Run it to make sure it fails" — step
- "Implement the minimal code to make the test pass" — step
- "Run the tests and make sure they pass" — step
- "Commit" — step

## Plan Document Header

**Every plan MUST start with this header:**

```markdown
# [Feature Name] Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or grinding-until-pass to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** [One sentence describing what this builds]

**Architecture:** [2-3 sentences about approach]

**Tech Stack:** [Key technologies/libraries — see AGENTS.md]

---
```

## Task Structure

````markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

- [ ] **Step 1: Write the failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"

- [ ] **Step 3: Write minimal implementation**

```python
def function(input):
    return expected
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/path/test.py::test_name -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/path/test.py app/path/file.py
git commit -m "feat: add specific feature"
```
````

## Dependency Graph

Mark tasks **serial** vs **parallel** and include a small mermaid graph so the executor knows what can run concurrently.

## No Placeholders

Every step must contain the actual content an engineer needs. These are **plan failures** — never write them:
- "TBD", "TODO", "implement later", "fill in details"
- "Add appropriate error handling" / "add validation" / "handle edge cases"
- "Write tests for the above" (without actual test code)
- "Similar to Task N" (repeat the code — tasks may be read out of order)
- Steps that describe what to do without showing how (code blocks required for code steps)
- References to types, functions, or methods not defined in any task

## Remember
- Exact file paths always
- Complete code in every step — if a step changes code, show the code
- Exact commands with expected output (use commands from AGENTS.md)
- DRY, YAGNI, TDD, frequent commits

## Self-Review

After writing the complete plan, check it against the spec with fresh eyes. This is a checklist you run yourself — not a subagent dispatch.

1. **Spec coverage:** Can you point to a task implementing each spec requirement? List gaps.
2. **Placeholder scan:** Search for the red flags above. Fix them.
3. **Type consistency:** Do types, signatures, and names used in later tasks match earlier tasks?

Fix issues inline. If you find a spec requirement with no task, add the task.

## Execution Handoff

After saving the plan, offer the execution choice:

**"Plan complete and saved to `docs/features/<filename>-plan.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — fresh subagent per task, two-stage review between tasks, fast iteration → use `subagent-driven-development`.

**2. Inline grind** — execute tasks in this session, looping until tests pass → use `grinding-until-pass`.

**Which approach?"**

The user approves the plan (SDLC gate 2 → 3) before any implementation begins.
