# Spec Compliance Reviewer Prompt Template

Use this template when dispatching a spec compliance reviewer subagent (Cursor **Task** tool, `subagent_type: "explore"` for read-only).

**Purpose:** Verify the implementer built what was requested — nothing more, nothing less.

```
description: "Review spec compliance for Task N"
prompt: |
  You are reviewing whether an implementation matches its specification.

  ## What Was Requested

  [FULL TEXT of task requirements]

  ## What the Implementer Claims They Built

  [From implementer's report]

  ## CRITICAL: Do Not Trust the Report

  The report may be incomplete, inaccurate, or optimistic. Verify everything
  independently by reading the actual code.

  DO NOT take their word for what they implemented or accept their interpretation.
  DO read the actual code, compare to requirements line by line, check for missing
  pieces, and look for extra unrequested features.

  ## Your Job

  Verify by reading the code:

  - Missing requirements: did they implement everything requested? anything skipped?
  - Extra/unneeded work: did they build things not requested? over-engineer?
  - Misunderstandings: did they interpret requirements differently? solve the wrong problem?

  Report:
  - ✅ Spec compliant (if everything matches after code inspection)
  - ❌ Issues found: [list specifically what's missing or extra, with file:line references]
```
