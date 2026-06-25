#!/usr/bin/env bash
# Stop-event hook: re-run backend + frontend tests after the agent stops.
# If anything fails, return a followup_message so the agent keeps grinding
# (see .cursor/skills/grinding-until-pass). Fails open on internal errors so a
# broken hook never wedges a session. loop_limit in hooks.json caps the loop.
set -uo pipefail

# Drain the stop-event payload on stdin (not needed for this check).
cat >/dev/null 2>&1 || true

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." 2>/dev/null && pwd)" || { echo '{}'; exit 0; }
cd "$ROOT" || { echo '{}'; exit 0; }

failures=""

# ---- Backend: pytest (prefer the project venv) ----
if [ -x ".venv/bin/pytest" ]; then
  PYTEST=".venv/bin/pytest"
elif command -v pytest >/dev/null 2>&1; then
  PYTEST="pytest"
else
  PYTEST=""
fi

if [ -n "$PYTEST" ] && [ -d "tests" ]; then
  if ! backend_out="$("$PYTEST" -q 2>&1)"; then
    failures+=$'Backend (pytest) FAILED:\n'"$(printf '%s\n' "$backend_out" | tail -n 25)"$'\n\n'
  fi
fi

# ---- Frontend: vitest (only when installed AND test files exist) ----
if [ -x "frontend/node_modules/.bin/vitest" ]; then
  if find frontend/src -type f \
      \( -name '*.test.ts' -o -name '*.test.tsx' -o -name '*.spec.ts' -o -name '*.spec.tsx' \) \
      2>/dev/null | grep -q .; then
    if ! frontend_out="$(cd frontend && npm test --silent 2>&1)"; then
      failures+=$'Frontend (vitest) FAILED:\n'"$(printf '%s\n' "$frontend_out" | tail -n 25)"$'\n\n'
    fi
  fi
fi

if [ -n "$failures" ]; then
  msg=$'Automated test hook detected failing tests. Fix them before finishing.\n\n'"${failures}"$'Re-run locally: `pytest` (backend); `cd frontend && npm test` (frontend).'
  if command -v jq >/dev/null 2>&1; then
    jq -n --arg m "$msg" '{followup_message: $m}'
  else
    echo '{ "followup_message": "Automated test hook detected failing tests. Run pytest and (cd frontend && npm test) and fix the failures before finishing." }'
  fi
  exit 0
fi

echo '{}'
exit 0
