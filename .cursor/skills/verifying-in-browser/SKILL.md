---
name: verifying-in-browser
description: After making UI changes, start the dev server, open the app in Cursor's built-in browser, and verify everything works — check rendering, console errors, and network health. Use proactively after UI changes; for API-only changes use api-smoke-testing.
---

# Verify in Browser

Use this skill proactively after making code changes to verify the app actually works. Don't just trust that the code is correct — launch it and check.

This skill verifies a **rendered UI**. For API-only changes (e.g. FastAPI routes with no UI surface), prefer `api-smoke-testing` instead — there's no page to look at.

Stay framework-agnostic: never hardcode start commands, ports, or URLs. Read the dev command from the project's [AGENTS.md](../../../AGENTS.md) and discover the live URL at runtime (see `finding-dev-server-url`).

## Steps

1. **Get the app URL** — check whether a dev server is already running by following `finding-dev-server-url` (it scans terminals and reports the live `http://localhost:<port>` for whatever framework is running).

   If none is running, start the UI dev server using the command documented in `AGENTS.md` for this repo, with `block_until_ms: 0` so it runs in the background. Then poll the terminal output for the framework's "ready" line and capture the URL it prints.

   Use that discovered URL — referred to below as `<app-url>` — for every browser step. Do not assume a port.

2. **Open in the side browser** — launch the app beside your code using the URL from step 1:

   ```
   Tool: browser_navigate
   Arguments: { "url": "<app-url>", "position": "side", "take_screenshot_afterwards": true }
   ```

3. **Quick health check** — run these three checks:

   **Console errors:**
   ```
   Tool: browser_console_messages
   ```
   Flag any errors. Warnings about deprecations can be noted but aren't blockers.

   **Network failures:**
   ```
   Tool: browser_network_requests
   ```
   Flag any 4xx/5xx responses, failed fetches, or CORS errors.

   **Visual check:**
   Review the screenshot. Does the page render? Is the layout correct? Are there any blank screens or loading spinners that never resolve?

4. **Navigate to the changed page** — if your changes are on a specific route, navigate there and repeat the checks.

5. **Test interactions** — if you changed a form, button, or interactive element:
   - Take a `browser_snapshot` to get element refs
   - Click, fill, or hover on the changed elements
   - Take another screenshot to verify the result

6. **Report the verdict** — tell the user:
   - "Verified in browser — page renders correctly, no console errors, all network requests healthy."
   - Or: "Found issues: [list of problems]"

## When to Use This

- After changing any React component, CSS, or layout code
- After modifying API routes or data fetching
- After updating environment variables or configuration
- After installing or removing dependencies
- Before committing — as a final sanity check

## Notes

- Use `position: "side"` to see code and browser at the same time.
- If the dev server is already running, skip step 1 and go straight to navigating.
- For SSR apps, check both the initial server-rendered HTML and the client-hydrated state.
