---
name: writing-tests
description: Analyze existing code and write comprehensive unit and integration tests for it. Detects the stack and test framework (pytest for the Python backend, Vitest/Testing Library for the React frontend), identifies untested code paths, and generates tests with proper fixtures/mocking, edge cases, and assertions. Use when adding tests, improving coverage, or testing a specific module.
---

# Writing Tests

Use this skill to **structure tests per project conventions** — both when adding tests to existing/legacy code (coverage work) and as Phase 3 support while following `test-driven-development`.

This is **support**, not a replacement for TDD. For new behavior and bugfixes under the SDLC, `test-driven-development` is primary: write the failing test first (RED), watch it fail, then implement. This skill tells you *how* to write tests in this repo (which framework, where files go, fixtures, mocking boundaries); it does not authorize writing tests after the fact for new behavior.

## Step 1: Detect the stack

This is a **cross-stack** repo (see [AGENTS.md](../../../AGENTS.md)): a Python backend (`app/`) and a React frontend (`frontend/`). Pick the branch that matches the code under test.

```bash
# Backend (repo root): pytest via pyproject.toml
ls pyproject.toml tests/ 2>/dev/null
grep -E "pytest" pyproject.toml

# Frontend: Vitest / Testing Library
grep -E "vitest|jest|@testing-library|playwright" frontend/package.json
```

- Code in `app/` or `tests/` → **Backend (pytest)** branch below.
- Code in `frontend/src/` → **Frontend (Vitest)** branch below.

Always read existing test files first and mirror their conventions before writing new ones.

---

## Backend (Python / pytest / FastAPI / SQLAlchemy)

### Setup

Already configured in [pyproject.toml](../../../pyproject.toml) (`pytest`, `httpx`) and `tests/`. Test commands (from AGENTS.md):

```bash
pytest                              # all backend tests
pytest tests/test_services.py -v    # unit (service layer)
pytest tests/test_api.py -v         # API (FastAPI TestClient)
```

**Test DB:** in-memory SQLite (`sqlite:///:memory:`). Never use `feedback.db` in tests.

### File layout

Tests live in `tests/` at the repo root (not next to source):

- Service/business logic → `tests/test_services.py`
- API/HTTP routes → `tests/test_api.py`
- Shared fixtures → `tests/conftest.py`

Follow the existing fixtures in [tests/conftest.py](../../../tests/conftest.py): `db_session` (in-memory engine, tables created/dropped per test) and `client` (FastAPI `TestClient` with the `get_db` dependency overridden).

### Analyze the target code

Identify: public functions (`app/services.py`), routes (`app/main.py`), Pydantic validation (`app/schemas.py`), status transitions, and error paths (e.g. `ItemNotFoundError` → 404).

### Unit tests (service layer)

Use the `db_session` fixture and real objects — no mocks for the DB; the in-memory engine *is* the boundary.

```python
from app.schemas import FeedbackItemCreate
from app.services import create_item, mark_reviewed


def test_mark_reviewed_sets_status(db_session):
    item = create_item(
        db_session,
        FeedbackItemCreate(title="Slow export", body="Too slow", category="bug"),
    )

    updated = mark_reviewed(db_session, item.id)

    assert updated.status == "reviewed"
```

Cover edge/error cases explicitly:

```python
import pytest
from app.services import ItemNotFoundError, mark_reviewed


def test_mark_reviewed_missing_item_raises(db_session):
    with pytest.raises(ItemNotFoundError):
        mark_reviewed(db_session, 999)
```

### API tests (routes)

Use the `client` fixture; assert status codes and JSON bodies.

```python
def test_create_and_list_item(client):
    create = client.post(
        "/api/items",
        json={"title": "Add dark mode", "body": "For triage", "category": "idea"},
    )
    assert create.status_code == 201
    assert create.json()["status"] == "new"

    listed = client.get("/api/items?status=new")
    assert listed.status_code == 200
    assert len(listed.json()) == 1
```

### Mocking (backend)

- Don't mock SQLAlchemy or the session — use the in-memory DB.
- Mock only true external boundaries (outbound HTTP, third-party APIs, the clock/filesystem when relevant).
- See `test-driven-development`'s [testing-anti-patterns.md](../test-driven-development/testing-anti-patterns.md) before adding mocks.

### Run and verify

```bash
pytest -v
```

Per `verification-before-completion`, paste the real summary (e.g. `7 passed`) before claiming tests pass.

---

## Frontend (TypeScript / React / Vitest)

### Setup

If no runner is configured in `frontend/package.json`:

```bash
cd frontend
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

Add scripts to `frontend/package.json`:

```json
{ "test": "vitest run", "test:watch": "vitest" }
```

### File layout

Place tests next to the source, matching existing convention:

- `frontend/src/utils/format.ts` → `frontend/src/utils/format.test.ts`
- `frontend/src/components/Button.tsx` → `frontend/src/components/Button.test.tsx`

### Structure

```ts
import { describe, it, expect, vi } from "vitest";

describe("functionName", () => {
  it("returns formatted output for valid input", () => { /* ... */ });
  it("handles empty string", () => { /* ... */ });
  it("throws on invalid argument", () => { /* ... */ });
});
```

### Components (Testing Library)

```tsx
import { render, screen, fireEvent } from "@testing-library/react";

it("renders the button and handles click", () => {
  const onClick = vi.fn();
  render(<Button onClick={onClick}>Click me</Button>);
  fireEvent.click(screen.getByRole("button", { name: "Click me" }));
  expect(onClick).toHaveBeenCalledOnce();
});
```

### Mocking (frontend)

Mock data-fetching hooks/modules, not the component under test:

```ts
vi.mock("@/hooks/useUser", () => ({
  useUser: () => ({ user: { name: "Test" }, isLoading: false }),
}));
```

### Run and verify

```bash
cd frontend && npm test
```

---

## What to test (both stacks)

- **Always:** public API, error handling, edge cases (empty, null, zero, negative, missing IDs), state transitions (`new` → `reviewed`), async behavior.
- **Skip:** private implementation details, third-party internals, trivial getters/setters, type-only code.

## Notes

- Match the existing test style in each stack (`pytest` function tests with fixtures; Vitest `it()`/`describe()`).
- Test behavior and outputs, not internal calls.
- Descriptive names: `test_list_items_filters_by_status`, not `test1`.
- For async frontend code, `await` results or use `resolves`/`rejects`. For backend async, use `pytest.mark.anyio`/`asyncio` only if the code under test is async (current services are sync).
- When adding regression tests for a bug, the test must fail before the fix and pass after (see `test-driven-development`).
