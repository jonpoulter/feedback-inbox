# Testing Anti-Patterns

**Load this reference when:** writing or changing tests, adding mocks, or tempted to add test-only methods to production code.

## Overview

Tests must verify real behavior, not mock behavior. Mocks are a means to isolate, not the thing being tested.

**Core principle:** Test what the code does, not what the mocks do.

**Following strict TDD prevents these anti-patterns.**

## The Iron Laws

```
1. NEVER test mock behavior
2. NEVER add test-only methods to production classes
3. NEVER mock without understanding dependencies
```

## Anti-Pattern 1: Testing Mock Behavior

**The violation:**
```typescript
// ❌ BAD: Testing that the mock exists
test('renders sidebar', () => {
  render(<Page />);
  expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
});
```

**Why this is wrong:**
- You're verifying the mock works, not that the component works
- Test passes when mock is present, fails when it's not
- Tells you nothing about real behavior

**The fix:**
```typescript
// ✅ GOOD: Test real component or don't mock it
test('renders sidebar', () => {
  render(<Page />);  // Don't mock sidebar
  expect(screen.getByRole('navigation')).toBeInTheDocument();
});
```

### Gate Function

```
BEFORE asserting on any mock element:
  Ask: "Am I testing real component behavior or just mock existence?"

  IF testing mock existence:
    STOP - Delete the assertion or unmock the component

  Test real behavior instead
```

## Anti-Pattern 2: Test-Only Methods in Production

**The violation:** Adding a method like `destroy()` to a production class that is only ever called from tests.

**Why this is wrong:**
- Production class polluted with test-only code
- Dangerous if accidentally called in production
- Violates YAGNI and separation of concerns
- Confuses object lifecycle with entity lifecycle

**The fix:** Put cleanup in test utilities, not production classes.

### Gate Function

```
BEFORE adding any method to production class:
  Ask: "Is this only used by tests?"
  IF yes: STOP - put it in test utilities instead

  Ask: "Does this class own this resource's lifecycle?"
  IF no: STOP - wrong class for this method
```

## Anti-Pattern 3: Mocking Without Understanding

**The violation:** Mocking a method that has a side effect the test depends on, so the test passes/fails for the wrong reason.

**Why this is wrong:**
- Mocked method had a side effect the test depended on
- Over-mocking to "be safe" breaks actual behavior
- Test passes for wrong reason or fails mysteriously

**The fix:** Mock at the correct (lowest) level — the slow/external operation — and preserve the behavior the test needs.

### Gate Function

```
BEFORE mocking any method:
  1. "What side effects does the real method have?"
  2. "Does this test depend on any of those side effects?"
  3. "Do I fully understand what this test needs?"

  IF depends on side effects:
    Mock at lower level, NOT the high-level method the test depends on

  IF unsure what test depends on:
    Run test with real implementation FIRST, observe, THEN mock minimally

  Red flags: "I'll mock this to be safe" / "This might be slow, better mock it"
```

## Anti-Pattern 4: Incomplete Mocks

**The violation:** Mocking only the fields you think you need, so code breaks when it accesses a field you omitted.

**The Iron Rule:** Mock the COMPLETE data structure as it exists in reality, not just fields your immediate test uses.

### Gate Function

```
BEFORE creating mock responses:
  1. Examine actual API response from docs/examples
  2. Include ALL fields system might consume downstream
  3. Verify mock matches real response schema completely
  If uncertain: include all documented fields
```

## Anti-Pattern 5: Tests as Afterthought

**The violation:** "Implementation complete, no tests written, ready for testing."

**The fix:** Testing is part of implementation. Follow the TDD cycle — write failing test, implement to pass, refactor, THEN claim complete.

## Quick Reference

| Anti-Pattern | Fix |
|--------------|-----|
| Assert on mock elements | Test real component or unmock it |
| Test-only methods in production | Move to test utilities |
| Mock without understanding | Understand dependencies first, mock minimally |
| Incomplete mocks | Mirror real API completely |
| Tests as afterthought | TDD - tests first |
| Over-complex mocks | Consider integration tests |

## The Bottom Line

**Mocks are tools to isolate, not things to test.**

If TDD reveals you're testing mock behavior, you've gone wrong. Test real behavior or question why you're mocking at all.
