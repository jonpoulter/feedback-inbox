---
name: visual-qa-testing
description: Support skill for visual/UX QA — launch the app in the browser and check how it looks (layout, spacing, colors, alignment, responsive viewports). Use after UI/visual changes; for functional "does it work" smoke use verifying-in-browser.
---

# Visual QA

**Support skill — visual/UX changes only.** Reach for this *after* the functional smoke gate (`verifying-in-browser`, the Phase 5 primary) when the concern is specifically how the UI **looks**: layout, spacing, colors, alignment, and responsiveness across viewports. For "does the app still work?" (rendering, console/network health, interactions, verdict), use `verifying-in-browser` instead.

Stay framework-agnostic: never hardcode start commands, ports, or URLs. Read the dev command from the project's [AGENTS.md](../../../AGENTS.md) and discover the live URL at runtime (see `finding-dev-server-url`).

## How It Works

This skill drives Cursor's browser tools. Navigation, screenshots, and snapshots come from Cursor's **built-in browser** (`cursor-ide-browser`, no install). Console messages, network inspection, viewport resizing, and hover come from the **Playwright MCP** plugin — so this skill assumes that plugin is enabled; if it isn't, those steps won't resolve (see the MCP notes in `AGENTS.md`).

## Steps

1. **Get the app URL** — check whether a dev server is already running by following `finding-dev-server-url`. If none is running, start the UI dev server using the command documented in `AGENTS.md`, with `block_until_ms: 0` so it runs in the background, then poll the terminal output for the framework's "ready" line and capture the URL it prints.

   Use that discovered URL — referred to below as `<app-url>` — for every browser step. Do not assume a port.

2. **Navigate to the page** — use `browser_navigate` to open the relevant page at the URL from step 1:

   ```
   Tool: browser_navigate
   Arguments: { "url": "<app-url>", "take_screenshot_afterwards": true }
   ```

   If the change is on a specific route, navigate directly to it (e.g., `/settings`, `/dashboard`).

3. **Take a screenshot** — capture the current state:

   ```
   Tool: browser_take_screenshot
   Arguments: { "fullPage": true }
   ```

   Review the screenshot for visual issues: layout breaks, missing content, wrong colors, misaligned elements.

4. **Check console for errors** — look for JavaScript errors or warnings:

   ```
   Tool: browser_console_messages
   ```

   Report any errors, especially `TypeError`, `ReferenceError`, failed imports, or React hydration mismatches.

5. **Audit network requests** — check for failed API calls or unexpected requests:

   ```
   Tool: browser_network_requests
   ```

   Look for: 4xx/5xx status codes, CORS errors, excessively large responses, unnecessary duplicate requests.

6. **Interact if needed** — if the change involves interactive elements (buttons, forms, modals), use `browser_click`, `browser_fill`, or `browser_hover` to test the interaction, then take another screenshot to verify.

7. **Report findings** — summarize:
   - Screenshot shows the UI looks correct (or what's wrong)
   - Console is clean (or list errors found)
   - Network requests are healthy (or list failures)

## Notes

- Always use `browser_snapshot` before clicking elements to get the correct element refs.
- For responsive testing, use `browser_resize` to check different viewport sizes.
- Use `browser_navigate` with `position: "side"` to open the browser beside your code.
