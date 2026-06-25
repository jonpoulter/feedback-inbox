# Root Cause Tracing

## Overview

Bugs often manifest deep in the call stack (a file created in the wrong location, a database opened with the wrong path, an empty value passed far from its origin). Your instinct is to fix where the error appears, but that's treating a symptom.

**Core principle:** Trace backward through the call chain until you find the original trigger, then fix at the source.

## When to Use

- Error happens deep in execution (not at the entry point)
- Stack trace shows a long call chain
- Unclear where invalid data originated
- Need to find which test/code triggers the problem

## The Tracing Process

### 1. Observe the symptom
```
Error: write failed in /unexpected/location
```

### 2. Find the immediate cause
What code directly causes this? Identify the exact call and its arguments.

### 3. Ask: what called this?
Walk up the chain:
```
operation(badValue)
  → called by middleLayer()
  → called by entryPoint()
  → called by test/handler
```

### 4. Keep tracing up
What value was passed at each level? Often an empty string, `None`, or default that resolves to something dangerous (e.g. empty path → current working directory).

### 5. Find the original trigger
Where did the bad value first appear? That's the source — fix there.

## Adding Instrumentation

When you can't trace manually, log just before the dangerous operation (not after it fails). Include the argument, the resolved value, relevant environment, and a stack capture.

Python example:
```python
import traceback, sys

def risky_operation(path: str):
    print(
        f"DEBUG risky_operation: path={path!r} cwd={os.getcwd()!r}",
        file=sys.stderr,
    )
    traceback.print_stack()
    # ... proceed
```

Run and capture:
```bash
pytest -s 2>&1 | grep 'DEBUG risky_operation'
```

> Remove debug-only instrumentation before marking work complete (see `.cursor/rules/debug-instrumentation-cleanup.mdc`).

## Key Principle

**NEVER fix just where the error appears.** Trace back to find the original trigger, fix at the source, and consider adding validation at each layer (see defense-in-depth.md) so the bug becomes impossible.

## Stack Trace Tips

- **In tests:** print to stderr (`file=sys.stderr`) — captured loggers may be suppressed.
- **Before the operation:** log before the dangerous call, not after it fails.
- **Include context:** arguments, resolved paths, cwd, environment, timestamps.
- **Capture the stack:** `traceback.print_stack()` (Python) / `new Error().stack` (JS) shows the complete call chain.
