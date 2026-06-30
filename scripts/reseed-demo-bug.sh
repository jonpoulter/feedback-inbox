#!/usr/bin/env bash
# Re-seed the demo divide-by-zero bug on main after a Cloud Agent fix has merged.
# Applies scripts/patches/demo-bug-reseed.patch (inverse of the agent fix).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PATCH="${ROOT}/scripts/patches/demo-bug-reseed.patch"
PYTEST="${ROOT}/.venv/bin/pytest"
RUFF="${ROOT}/.venv/bin/ruff"

DO_PULL=false
DO_COMMIT=false
DO_PUSH=false
FORCE=false

usage() {
  cat <<EOF
Usage: $(basename "$0") [--pull] [--commit] [--push] [--force]

Re-apply the demo stats bug so Cloud Agent can fix it again on the next run.

  --pull    git fetch && git pull origin main before applying patch
  --commit  commit changes with standard demo reseed message
  --push    push to origin main (requires --commit)
  --force   apply even if working tree has uncommitted changes

Run from repo root after merging the agent's fix PR.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --pull) DO_PULL=true ;;
    --commit) DO_COMMIT=true ;;
    --push) DO_PUSH=true ;;
    --force) FORCE=true ;;
    -h | --help) usage; exit 0 ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
  shift
done

if [[ "$DO_PUSH" == true && "$DO_COMMIT" != true ]]; then
  echo "error: --push requires --commit" >&2
  exit 1
fi

cd "$ROOT"

if [[ "$(git branch --show-current)" != "main" ]]; then
  echo "error: must be on main (current: $(git branch --show-current))" >&2
  exit 1
fi

if [[ "$FORCE" != true && -n "$(git status --porcelain)" ]]; then
  echo "error: working tree has uncommitted changes (use --force to override)" >&2
  git status --short
  exit 1
fi

if [[ ! -f "$PATCH" ]]; then
  echo "error: patch not found: $PATCH" >&2
  exit 1
fi

# Idempotent: already in demo-bug state
if grep -q 'percent_reviewed = round(reviewed / total \* 100)$' app/services.py \
  && grep -q 'test_stats_empty_filtered_set_crashes' tests/test_api.py \
  && ! grep -q 'if total else 0' app/services.py; then
  echo "Already reseeded — demo bug is present on main."
  exit 0
fi

if [[ "$DO_PULL" == true ]]; then
  echo "==> Pulling latest main..."
  git fetch origin
  git pull origin main
fi

echo "==> Applying demo bug reseed patch..."
if ! git apply --check "$PATCH" 2>/dev/null; then
  echo "error: patch does not apply cleanly. Files may have drifted." >&2
  echo "Regenerate with:" >&2
  echo "  git diff HEAD b0a7eb7 -- app/services.py tests/test_api.py tests/test_services.py \\" >&2
  echo "    > scripts/patches/demo-bug-reseed.patch" >&2
  exit 1
fi
git apply "$PATCH"

echo "==> Verifying crash test..."
if [[ ! -x "$PYTEST" ]]; then
  echo "error: .venv/bin/pytest not found — run: pip install -e \".[dev]\"" >&2
  exit 1
fi
"$PYTEST" tests/test_api.py::test_stats_empty_filtered_set_crashes -v

if [[ -x "$RUFF" ]]; then
  echo "==> Running ruff..."
  "$RUFF" check .
fi

echo "==> Demo bug reseeded successfully."
echo "    curl check (with API running):"
echo "    curl -s -o /dev/null -w '%{http_code}' 'http://localhost:8000/api/stats?status=reviewed'"
echo "    expected: 500"

if [[ "$DO_COMMIT" == true ]]; then
  git add app/services.py tests/test_api.py tests/test_services.py
  git commit -m "$(cat <<'EOF'
chore: re-seed demo stats bug for next run

Revert agent fix via reseed-demo-bug.sh so Cloud Agent can
diagnose and fix again on the next demo cycle.
EOF
)"
  echo "==> Committed."
fi

if [[ "$DO_PUSH" == true ]]; then
  git push origin main
  echo "==> Pushed to origin/main."
fi
