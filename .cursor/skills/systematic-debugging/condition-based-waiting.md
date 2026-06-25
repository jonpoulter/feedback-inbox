# Condition-Based Waiting

## Overview

Flaky tests often guess at timing with arbitrary delays. This creates race conditions where tests pass on fast machines but fail under load or in CI.

**Core principle:** Wait for the actual condition you care about, not a guess about how long it takes.

## When to Use

- Tests have arbitrary delays (`setTimeout`, `sleep`, `time.sleep()`)
- Tests are flaky (pass sometimes, fail under load)
- Tests time out when run in parallel
- Waiting for async operations to complete

**Don't use when** testing actual timing behavior (debounce, throttle). Always document WHY if an arbitrary timeout is genuinely required.

## Core Pattern

```typescript
// ❌ BEFORE: guessing at timing
await new Promise(r => setTimeout(r, 50));
expect(getResult()).toBeDefined();

// ✅ AFTER: waiting for the condition
await waitFor(() => getResult() !== undefined);
expect(getResult()).toBeDefined();
```

Playwright (this project's E2E tool) has built-in auto-waiting and web-first assertions — prefer `expect(locator).toBeVisible()` over manual sleeps.

## Quick Patterns

| Scenario | Pattern |
|----------|---------|
| Wait for event | `waitFor(() => events.find(e => e.type === 'DONE'))` |
| Wait for state | `waitFor(() => machine.state === 'ready')` |
| Wait for count | `waitFor(() => items.length >= 5)` |
| Wait for element | `await expect(page.getByRole('listitem')).toHaveCount(5)` |

## Generic Implementation

```typescript
async function waitFor<T>(
  condition: () => T | undefined | null | false,
  description: string,
  timeoutMs = 5000,
): Promise<T> {
  const start = Date.now();
  while (true) {
    const result = condition();
    if (result) return result;
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Timeout waiting for ${description} after ${timeoutMs}ms`);
    }
    await new Promise(r => setTimeout(r, 10)); // poll every 10ms
  }
}
```

## Common Mistakes

- **Polling too fast** (`setTimeout(check, 1)`) wastes CPU → poll every ~10ms.
- **No timeout** → loops forever; always include a timeout with a clear error.
- **Stale data** → call the getter inside the loop for fresh data.

## When an Arbitrary Timeout IS Correct

First wait for the triggering condition, then wait a known, documented duration based on real timing — never a guess. Always comment WHY.
