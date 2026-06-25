#!/usr/bin/env bash
set -euo pipefail

input="$(cat || true)"

if [[ "${input}" != *"git commit"* ]]; then
  echo '{ "permission": "allow" }'
  exit 0
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo '{ "permission": "allow" }'
  exit 0
fi

staged_diff="$(git diff --cached -- . 2>/dev/null || true)"

if [[ -z "${staged_diff}" ]]; then
  echo '{ "permission": "allow" }'
  exit 0
fi

has_debug_artifacts=0

# Customize these patterns for your project (keep in sync with debug-instrumentation-cleanup.mdc)
if [[ "${staged_diff}" == *"X-Debug-Session-Id"* ]] || \
   [[ "${staged_diff}" == *"#region agent log"* ]] || \
   [[ "${staged_diff}" == *"127.0.0.1:7487"* ]] || \
   [[ "${staged_diff}" == *"localhost:7487"* ]]; then
  has_debug_artifacts=1
fi

if [[ "${has_debug_artifacts}" -eq 1 ]]; then
  echo '{
    "permission": "deny",
    "user_message": "Commit blocked: staged changes include debug instrumentation. Remove debug-only code or document an active debug exception.",
    "agent_message": "The pre-commit hook denied this commit because debug-only artifacts were detected in staged changes."
  }'
  exit 0
fi

echo '{ "permission": "allow" }'
exit 0
