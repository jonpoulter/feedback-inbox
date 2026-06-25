# Defense-in-Depth Validation

## Overview

When you fix a bug caused by invalid data, adding validation at one place feels sufficient. But that single check can be bypassed by different code paths, refactoring, or mocks.

**Core principle:** Validate at EVERY layer data passes through. Make the bug structurally impossible.

## Why Multiple Layers

Single validation: "We fixed the bug." Multiple layers: "We made the bug impossible."

Different layers catch different cases:
- Entry validation catches most bugs
- Business logic catches edge cases
- Environment guards prevent context-specific dangers
- Debug logging helps when other layers fail

## The Four Layers

### Layer 1: Entry Point Validation
Reject obviously invalid input at the API boundary.

```python
def create_item(db, payload: FeedbackItemCreate):
    if not payload.title.strip():
        raise ValueError("title cannot be empty")
    # ... proceed
```

(Pydantic schemas already enforce much of this at the FastAPI boundary — lean on them.)

### Layer 2: Business Logic Validation
Ensure data makes sense for this operation.

```python
def mark_reviewed(db, item_id: int):
    item = db.get(FeedbackItem, item_id)
    if item is None:
        raise ItemNotFoundError(item_id)
    # ... proceed
```

### Layer 3: Environment Guards
Prevent dangerous operations in specific contexts (e.g. refuse to touch the real DB during tests).

```python
if os.getenv("ENV") == "test" and not db_url.endswith(":memory:"):
    raise RuntimeError("Refusing to run tests against a non-memory database")
```

### Layer 4: Debug Instrumentation
Capture context for forensics before risky operations. Remove debug-only logging before completion.

## Applying the Pattern

1. **Trace the data flow** — where does the bad value originate? Where is it used?
2. **Map all checkpoints** — list every point the data passes through.
3. **Add validation at each layer** — entry, business, environment, debug.
4. **Test each layer** — try to bypass layer 1, verify layer 2 catches it.

## Key Insight

Each layer catches bugs the others miss: different code paths bypass entry validation, mocks bypass business checks, edge cases need environment guards, and debug logging identifies structural misuse. **Don't stop at one validation point.**
