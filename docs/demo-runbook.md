# Agentic SDLC Demo — Live Runbook

Repeatable steps for each demo run. One-time setup (MCP, Slack, Linear, Sentry, Cloud Agents) is assumed complete.

Bug-specific repro and Linear ticket templates live here; generic Sentry guidance for Cloud Agents is in [AGENTS.md](../AGENTS.md#cursor-cloud-specific-instructions).

**Repo:** `jonpoulter/feedback-inbox`  
**Bug:** `GET /api/stats` divides by zero when the filtered inbox has zero items (e.g. **Reviewed** filter with no reviewed items).

---

## Pre-demo reset (~5 min before)

Do this so the bug trigger is deterministic.

```bash
# Repo root, venv active
lsof -ti tcp:8000 | xargs kill 2>/dev/null
lsof -ti tcp:5173 | xargs kill 2>/dev/null

rm -f feedback.db
python scripts/seed.py

# Terminal 1 — API (Sentry on)
uvicorn app.main:app --reload --port 8000 --env-file .env

# Terminal 2 — UI
cd frontend && npm run dev
```

**Verify baseline:** open http://localhost:5173 — 4 items, all **new**, inbox shows `0% reviewed`.

| Check | Expected |
|-------|----------|
| `curl -s http://localhost:8000/api/stats` | `{"total":4,"reviewed":0,"percent_reviewed":0}` |
| `curl -s -o /dev/null -w "%{http_code}" "http://localhost:8000/api/stats?status=reviewed"` | `500` |

> If `feedback.db` is not reset, or items were already marked reviewed, the **Reviewed** filter may not crash. Always reset + seed before the demo.

---

## Dry-run results (local, 2026-06-30)

| Step | Status | Notes |
|------|--------|-------|
| Seeded bug (`/api/stats` + UI `% reviewed`) | **PASS** | `app/services.py` `get_stats()` unguarded divide |
| Fresh DB + seed → Reviewed filter → 500 | **PASS** | `curl .../api/stats?status=reviewed` → HTTP 500 |
| Stack trace points at `get_stats` line 50 | **PASS** | `ZeroDivisionError: division by zero` in uvicorn log |
| Backend + frontend tests | **PASS** | `pytest` 16 passed; `npm run test` 27 passed |
| Sentry event from stats bug | **VERIFY** | Confirm new issue in Sentry UI after triggering in browser |
| Sentry MCP from Agent | **VERIFY** | MCP timed out in automated check — confirm in Cursor Settings → MCP |
| Slack emoji → Linear issue | **VERIFY** | Manual: post + react in demo channel |
| Assign Linear issue → Cursor | **VERIFY** | Manual: assignee **Cursor**; check [Cloud Agents dashboard](https://cursor.com/dashboard/cloud-agents) |
| Cloud Agent opens PR | **VERIFY** | Needs GitHub connected + `[repo=jonpoulter/feedback-inbox]` or default repo |
| Bugbot on PR | **VERIFY** | Enable in Cursor dashboard for this repo |
| Human merge → Linear Done + Slack | **VERIFY** | PR body `Fixes ENG-XXX`; Linear GitHub + Slack apps configured |

---

## Live demo script (~30 min)

### Beat 1 — Show the broken product (2 min)

1. Open **http://localhost:5173** (seeded inbox, 4 new items).
2. Say: *"Team added a '% reviewed' stat for triage."*
3. Click **Reviewed** in the status filter bar.
4. **Expected:** error banner in UI; network tab shows `GET /api/stats?status=reviewed` → **500**; list may be empty.

**Talk track:** *"Filtering to reviewed items shouldn't take down the inbox — but it does."*

---

### Beat 2 — Production signal in Sentry (3 min)

1. Open **Sentry → Issues** (project: feedback-inbox).
2. Find **`ZeroDivisionError`** on transaction **`/api/stats`** (environment: `demo`).
3. Copy **issue permalink** and short ID (e.g. `FEEDBACK-INBOX-N`).
4. Optional: run **Seer** root-cause from Sentry UI or via Agent + Sentry MCP.

**Talk track:** *"This isn't a mock — it's a real unhandled exception from the running app."*

---

### Beat 3 — Report in Slack → Linear (3 min)

1. In the demo Slack channel, post (paste real Sentry link):

   ```
   Inbox crashes when I filter to Reviewed — nothing loads.
   Sentry: <paste permalink>
   [repo=jonpoulter/feedback-inbox]
   ```

2. React with the configured **emoji** to create a Linear issue in **Demo Backend**.

**Expected:** Linear issue created with Slack text + link in description.

**Talk track:** *"Support intake stays in Slack; work is tracked in Linear."*

---

### Beat 4 — Delegate to Cursor Cloud Agent (2 min)

1. Open the new Linear issue.
2. Set assignee to **Cursor** (or comment `@Cursor fix the divide-by-zero in inbox stats when the filtered set is empty; add a test; open a PR with Fixes ENG-XXX`).
3. Open [cursor.com/dashboard/cloud-agents](https://cursor.com/dashboard/cloud-agents) — confirm a run started.

**Expected:** Status comment on the Linear issue; agent run visible in dashboard.

**If blocked:** check GitHub integration, default repo, API usage headroom, on-demand spend setting.

---

### Beat 5 — Agent diagnoses + fixes (8 min)

Watch the Cloud Agent (dashboard or Linear updates):

1. Reads ticket + Sentry context (permalink in issue, or Sentry MCP).
2. Writes **failing test** for empty filtered stats (RED).
3. Fixes `get_stats`: `percent_reviewed = round(reviewed / total * 100) if total else 0` (GREEN).
4. Runs `pytest` and `cd frontend && npm run test`.
5. Opens **PR** with `Fixes ENG-XXX` in description.

**Expected fix locations:**
- `app/services.py` — guard `total == 0`
- `tests/test_api.py` — assert 200 with `percent_reviewed: 0` for empty set

---

### Beat 6 — CI + Bugbot (5 min)

1. Open the PR on GitHub.
2. Wait for **CI** (backend + frontend jobs green).
3. Show **Bugbot** review comment on the PR.

**Talk track:** *"Automated review before a human merges."*

---

### Beat 7 — Human in the loop (3 min)

1. Review the diff (one-line guard + test).
2. Approve and **merge** to `main` (branch protection if enabled).

**Expected:** GitHub merge; CI on `main` green.

---

### Beat 8 — Close the loop (3 min)

1. **Linear:** issue moves to **Done** (magic word `Fixes ENG-XXX` in PR).
2. **Slack:** Linear app posts status update in channel.
3. **Sentry:** resolve the issue (UI or MCP `update_issue`).
4. **Product:** pull `main`, restart API, reset DB + seed, click **Reviewed** — should show `0% reviewed`, no error.

**Talk track:** *"Ticket → telemetry → agent → PR → CI → review → merge → stakeholders notified."*

---

## Integration troubleshooting

| Symptom | Likely cause | Fix |
|---------|----------------|-----|
| Reviewed filter works (no crash) | Stale DB or items already reviewed | `rm feedback.db && python scripts/seed.py` |
| No Sentry event | API started without `--env-file .env` | Restart with env file; trigger again |
| Slack reaction does nothing | Linear app not in channel | `/invite @Linear` in channel |
| Assign to Cursor does nothing | Linear↔Cursor not linked / no Cloud Agent setup | Dashboard → Integrations |
| Agent runs but no PR | GitHub not connected or wrong repo | Default repo or `[repo=...]` on issue |
| Agent can't reach Sentry | Cloud Agent MCP OAuth / network | Embed stack trace + permalink in Linear issue |
| CI fails on agent PR | Missing test update or lint | Agent should run `pytest` before push |

---

## Post-demo cleanup

- Resolve or ignore test Sentry issues from rehearsal.
- Close/delete throwaway Linear issues and test PRs.
- Do **not** commit with `/debug/` routes or live DSN in tracked files.
