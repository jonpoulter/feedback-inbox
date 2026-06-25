---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes. Find the root cause first; symptom fixes are failure.
---

# Systematic Debugging

## Overview

Random fixes waste time and create new bugs. Quick patches mask underlying issues.

**Core principle:** ALWAYS find the root cause before attempting fixes. Symptom fixes are failure.

This is a cross-cutting skill — use it in any SDLC phase the moment something breaks. It pairs with `test-driven-development` (Phase 4 fix) and `verification-before-completion` (confirm the fix). When debugging requires temporary instrumentation, follow `.cursor/rules/debug-instrumentation-cleanup.mdc` and remove all debug-only changes before marking work complete.

## The Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If you haven't completed Phase 1, you cannot propose fixes.

## When to Use

Use for ANY technical issue: test failures, bugs, unexpected behavior, performance problems, build failures, integration issues.

**ESPECIALLY when:** under time pressure, "just one quick fix" seems obvious, you've already tried multiple fixes, a previous fix didn't work, or you don't fully understand the issue.

**Don't skip when:** the issue seems simple (simple bugs have root causes too), you're in a hurry (rushing guarantees rework), or someone wants it fixed NOW (systematic is faster than thrashing).

## The Four Phases

Complete each phase before proceeding to the next.

### Phase 1: Root Cause Investigation

**BEFORE attempting ANY fix:**

1. **Read error messages carefully** — don't skip errors/warnings; read stack traces completely; note line numbers, file paths, error codes.
2. **Reproduce consistently** — can you trigger it reliably? Exact steps? Every time? If not reproducible → gather more data, don't guess.
3. **Check recent changes** — git diff, recent commits, new dependencies, config changes, environmental differences.
4. **Gather evidence in multi-component systems** — when the system has multiple components (e.g., React → fetch → FastAPI → services → SQLite), add diagnostic instrumentation at each boundary, log what enters and exits each component, run once to see WHERE it breaks, then investigate that component.
5. **Trace data flow** — when the error is deep in the call stack, trace backward to the source. See [root-cause-tracing.md](root-cause-tracing.md). Quick version: where does the bad value originate? What called this with the bad value? Keep tracing up. Fix at source, not symptom.

### Phase 2: Pattern Analysis

1. **Find working examples** — locate similar working code in the same codebase.
2. **Compare against references** — read reference implementations completely, not skimmed.
3. **Identify differences** — list every difference, however small. Don't assume "that can't matter."
4. **Understand dependencies** — what components, settings, config, environment, and assumptions does this need?

### Phase 3: Hypothesis and Testing

1. **Form a single hypothesis** — "I think X is the root cause because Y." Be specific.
2. **Test minimally** — smallest possible change, one variable at a time.
3. **Verify before continuing** — worked? → Phase 4. Didn't? → form a NEW hypothesis; don't pile on fixes.
4. **When you don't know** — say "I don't understand X," don't pretend, ask for help, research more.

### Phase 4: Implementation

1. **Create a failing test case** — simplest reproduction; use `test-driven-development`. MUST have before fixing.
2. **Implement a single fix** — address the root cause; ONE change; no "while I'm here" improvements.
3. **Verify the fix** — test passes now? No other tests broken? Issue actually resolved? Use `verification-before-completion`.
4. **If the fix doesn't work** — STOP. Count attempts. If < 3: return to Phase 1 with new information. **If ≥ 3: question the architecture (step 5).**
5. **If 3+ fixes failed: question architecture** — if each fix reveals new coupling, or requires "massive refactoring," or creates new symptoms elsewhere, STOP and discuss fundamentals with your human partner. This is a wrong architecture, not a failed hypothesis.

**Optional hardening:** After fixing at the source, consider adding validation at multiple layers so the bug becomes structurally impossible — see [defense-in-depth.md](defense-in-depth.md).

## Red Flags - STOP and Follow Process

If you catch yourself thinking:
- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- "Add multiple changes, run tests"
- "It's probably X, let me fix that"
- "I don't fully understand but this might work"
- Proposing solutions before tracing data flow
- "One more fix attempt" (when already tried 2+)
- Each fix reveals a new problem in a different place

**ALL of these mean: STOP. Return to Phase 1.** If 3+ fixes failed, question the architecture.

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Issue is simple, don't need process" | Simple issues have root causes too. Process is fast for simple bugs. |
| "Emergency, no time for process" | Systematic debugging is FASTER than guess-and-check thrashing. |
| "Just try this first, then investigate" | First fix sets the pattern. Do it right from the start. |
| "I'll write test after confirming fix" | Untested fixes don't stick. Test first proves it. |
| "Multiple fixes at once saves time" | Can't isolate what worked. Causes new bugs. |
| "Reference too long, I'll adapt the pattern" | Partial understanding guarantees bugs. Read it completely. |
| "One more fix attempt" (after 2+ failures) | 3+ failures = architectural problem. Question pattern, don't fix again. |

## Quick Reference

| Phase | Key Activities | Success Criteria |
|-------|---------------|------------------|
| **1. Root Cause** | Read errors, reproduce, check changes, gather evidence | Understand WHAT and WHY |
| **2. Pattern** | Find working examples, compare | Identify differences |
| **3. Hypothesis** | Form theory, test minimally | Confirmed or new hypothesis |
| **4. Implementation** | Create test, fix, verify | Bug resolved, tests pass |

## Flaky Tests / Timing

If you're chasing flaky tests caused by arbitrary delays, replace timeouts with condition polling — see [condition-based-waiting.md](condition-based-waiting.md).

## When Process Reveals "No Root Cause"

If investigation shows the issue is truly environmental, timing-dependent, or external: document what you investigated, implement appropriate handling (retry, timeout, clear error), and add monitoring/logging. **But:** 95% of "no root cause" cases are incomplete investigation.

## Related Skills

- `test-driven-development` — for the failing test case (Phase 4, Step 1)
- `verification-before-completion` — verify the fix worked before claiming success
