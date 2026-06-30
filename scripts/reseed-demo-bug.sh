#!/usr/bin/env bash
# Re-seed the demo divide-by-zero bug on main after a Cloud Agent fix has merged.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PYTEST="${ROOT}/.venv/bin/pytest"
RUFF="${ROOT}/.venv/bin/ruff"
RESEED_PY="${ROOT}/scripts/reseed_demo_bug.py"

DO_PULL=false
DO_COMMIT=false
DO_PUSH=false
FORCE=false

usage() {
  cat <<EOF
Usage: $(basename "$0") [--pull] [--commit] [--push] [--force]

Re-apply the demo stats bug so Cloud Agent can fix it again on the next run.

  --pull    git fetch && git pull origin main before reseeding
  --commit  commit changes with standard demo reseed message
  --push    push to origin main (requires --commit)
  --force   run even if working tree has uncommitted changes

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

if [[ "$DO_PULL" == true ]]; then
  echo "==> Pulling latest main..."
  git fetch origin
  git pull origin main
fi

echo "==> Applying demo bug reseed..."
python3 "$RESEED_PY"

echo "==> Verifying tests (no ZeroDivisionError test expected)..."
if [[ ! -x "$PYTEST" ]]; then
  echo "error: .venv/bin/pytest not found — run: pip install -e \".[dev]\"" >&2
  exit 1
fi
if grep -q 'ZeroDivisionError' tests/test_api.py; then
  echo "error: tests/test_api.py still references ZeroDivisionError" >&2
  exit 1
fi
"$PYTEST" -q

if [[ -x "$RUFF" ]]; then
  echo "==> Running ruff..."
  "$RUFF" check .
fi

echo "==> Demo bug reseeded successfully."
echo "    curl check (with API running):"
echo "    curl -s -o /dev/null -w '%{http_code}' 'http://localhost:8000/api/stats?status=reviewed'"
echo "    expected: 500"

if [[ "$DO_COMMIT" == true ]]; then
  git add \
    app/services.py \
    tests/test_api.py \
    tests/test_services.py \
    scripts/reseed_demo_bug.py \
    scripts/reseed-demo-bug.sh \
    docs/demo-runbook.md
  git add -u scripts/patches/ 2>/dev/null || true
  if git diff --cached --quiet; then
    echo "==> No changes to commit (already reseeded)."
  else
    git commit -m "$(cat <<'EOF'
chore: re-seed demo stats bug for next run

Revert agent fix via reseed-demo-bug.sh so Cloud Agent can
diagnose and fix again on the next demo cycle.
EOF
)"
    echo "==> Committed."
  fi
fi

if [[ "$DO_PUSH" == true ]]; then
  git push origin main
  echo "==> Pushed to origin/main."
fi
