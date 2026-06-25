---
name: screenshotting-changelog
description: Generate a visual changelog or PR description by taking before/after screenshots of UI changes using Cursor's built-in browser. Use when preparing a PR with visual changes; reconstructs the "before" baseline from the base branch via a worktree, and handles new-UI (after-only) cases.
---

# Screenshot Changelog

Use this skill when preparing a pull request that includes visual/UI changes. Capture before/after screenshots to create a visual changelog reviewers can scan without running the app.

Stay framework-agnostic: never hardcode start commands, ports, or URLs. Read the dev command(s) from the project's [AGENTS.md](../../../AGENTS.md) and discover live URLs at runtime (see `finding-dev-server-url`). Screenshots come from Cursor's built-in browser (`cursor-ide-browser`); the responsive-resize variation below needs the **Playwright MCP** plugin (`browser_resize` is not in the native tool set).

## First: do you even have a baseline?

Before/after only makes sense for **modified** UI. Classify the change first:

- **Modified existing UI** → capture before *and* after (see "Reconstructing the baseline" below).
- **Brand-new UI** (page/component that didn't exist on the base branch) → there is no "before." Capture **after-only** and label it **New** — don't fake an empty baseline.
- **Base branch won't run** (the PR added a migration, schema change, new deps/env the base lacks) → a faithful baseline may be impractical. Fall back to after-only, or compare against an archived screenshot from the last release if you keep one.

## Reconstructing the baseline (work is already committed)

At PR time your changes are committed, so `git stash` captures nothing — you must run the **base branch** to get "before." Prefer a worktree so both branches run side by side (see `using-git-worktrees`):

```bash
# Base branch in a separate worktree, feature branch stays in place
git worktree add ../<repo>-base <base-branch>   # e.g. main
```

Run each branch's dev server (on different ports) per `AGENTS.md`, with `block_until_ms: 0`, and discover each URL via `finding-dev-server-url`. Avoid the `git checkout` back-and-forth — it thrashes the running server and risks losing uncommitted state.

**Data parity (this repo):** the UI renders data from FastAPI + SQLite (`feedback.db`), so a fair comparison needs the *same* data on both branches. Seed each branch identically (`python scripts/seed.py` per `AGENTS.md`) before screenshotting; otherwise you're diffing seed data, not UI. If the feature changed the schema, the base branch may not run against the new DB — treat that as the "base won't run" case above.

## Steps

1. **Capture the "before" state** — using the base-branch URL from the worktree (call it `<base-url>`), screenshot each affected page:

   ```
   Tool: browser_navigate
   Arguments: { "url": "<base-url>/affected-route", "take_screenshot_afterwards": true }
   ```

   ```
   Tool: browser_take_screenshot
   Arguments: { "fullPage": true, "filename": "before-<page>.png" }
   ```

   Repeat for each affected page or component state. (Skip this step entirely for brand-new UI.)

2. **Capture the "after" state** — using the feature-branch URL (call it `<app-url>`), screenshot the same routes:

   ```
   Tool: browser_navigate
   Arguments: { "url": "<app-url>/affected-route", "take_screenshot_afterwards": true }
   ```

   ```
   Tool: browser_take_screenshot
   Arguments: { "fullPage": true, "filename": "after-<page>.png" }
   ```

3. **Generate the changelog** — create a summary describing what changed visually:

   ```markdown
   ## Visual Changes

   ### Homepage
   **Before:**
   ![before](before-homepage.png)

   **After:**
   ![after](after-homepage.png)

   Changes: Updated hero section layout, new CTA button color, added testimonials section.
   ```

4. **Include in the PR description** — paste the visual changelog into the PR body so reviewers can see the changes at a glance without running the app locally.

5. **Clean up** — if you created a baseline worktree, remove it when done:

   ```bash
   git worktree remove ../<repo>-base
   ```

## Variations

- **Responsive comparison** (needs the Playwright MCP): use `browser_resize` to capture screenshots at mobile (375px), tablet (768px), and desktop (1280px) widths.
- **Dark mode comparison**: if the app has a dark mode toggle, capture both themes.
- **Interactive states**: capture hover states, open modals, filled forms, and error states.

## Notes

- Screenshots are saved to the workspace. You can reference them in markdown or upload them to the PR.
- For component-level screenshots, navigate to a Storybook URL or a specific component route.
- This is most valuable for design-heavy PRs — skip it for backend-only changes.
