---
name: using-git-worktrees
description: Use when starting feature work that needs isolation from the current workspace or before executing an implementation plan - ensures an isolated workspace exists via native tools or a git worktree fallback.
---

# Using Git Worktrees

## Overview

Ensure work happens in an isolated workspace. Prefer your platform's native worktree tools. Fall back to manual git worktrees only when no native tool is available.

**Core principle:** Detect existing isolation first. Then use native tools. Then fall back to git. Never fight the harness.

**Announce at start:** "I'm using the using-git-worktrees skill to set up an isolated workspace."

This is a cross-cutting skill. In the SDLC it is typically used at the start of Phase 4 (execution), and is referenced by `subagent-driven-development`.

## Step 0: Detect Existing Isolation

**Before creating anything, check if you are already in an isolated workspace.**

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

**Submodule guard:** `GIT_DIR != GIT_COMMON` is also true inside git submodules. Before concluding "already in a worktree," verify you are not in a submodule:

```bash
# If this returns a path, you're in a submodule, not a worktree — treat as normal repo
git rev-parse --show-superproject-working-tree 2>/dev/null
```

**If `GIT_DIR != GIT_COMMON` (and not a submodule):** You are already in a linked worktree. Skip to Step 3. Do NOT create another worktree.

**If `GIT_DIR == GIT_COMMON` (or in a submodule):** You are in a normal repo checkout. Has the user already indicated a worktree preference? If not, ask for consent before creating a worktree:

> "Would you like me to set up an isolated worktree? It protects your current branch from changes."

Honor any declared preference without asking. If the user declines, work in place and skip to Step 3.

## Step 1: Create Isolated Workspace

Try these mechanisms in order.

### 1a. Native Worktree Tools (preferred)

If you have a native way to create a worktree (a tool named like `EnterWorktree`/`WorktreeCreate`, a `/worktree` command, or a `--worktree` flag), use it and skip to Step 3. Native tools handle directory placement, branch creation, and cleanup automatically. Using `git worktree add` when you have a native tool creates phantom state your harness can't manage.

Only proceed to Step 1b if you have no native worktree tool.

### 1b. Git Worktree Fallback

Create a worktree manually using git.

#### Directory Selection

Explicit user preference always beats observed filesystem state.

1. **Check your instructions for a declared worktree directory.** If specified, use it.
2. **Check for an existing project-local worktree directory:**
   ```bash
   ls -d .worktrees 2>/dev/null     # Preferred (hidden)
   ls -d worktrees 2>/dev/null      # Alternative
   ```
   If both exist, `.worktrees` wins.
3. **Otherwise**, default to `.worktrees/` at the project root.

#### Safety Verification (project-local directories only)

**MUST verify the directory is ignored before creating the worktree:**

```bash
git check-ignore -q .worktrees 2>/dev/null || git check-ignore -q worktrees 2>/dev/null
```

**If NOT ignored:** Add to `.gitignore`, commit the change, then proceed. This prevents accidentally committing worktree contents.

#### Create the Worktree

```bash
# For project-local: path="$LOCATION/$BRANCH_NAME"  (e.g. .worktrees/feature/status-filter)
git worktree add "$path" -b "$BRANCH_NAME"
cd "$path"
```

Use the project's branch convention: `feature/<short-description>` (see AGENTS.md).

**Sandbox fallback:** If `git worktree add` fails with a permission error, tell the user the sandbox blocked worktree creation and you're working in the current directory instead. Then run setup and baseline tests in place.

## Step 3: Project Setup

Auto-detect and run appropriate setup. For this repo:

```bash
# Backend (repo root)
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"

# Frontend
cd frontend && npm install && cd ..
```

Generic detection for other repos:

```bash
[ -f package.json ] && npm install
[ -f Cargo.toml ] && cargo build
[ -f requirements.txt ] && pip install -r requirements.txt
[ -f pyproject.toml ] && pip install -e ".[dev]"
[ -f go.mod ] && go mod download
```

## Step 4: Verify Clean Baseline

Run tests to ensure the workspace starts clean (use commands from AGENTS.md):

```bash
pytest            # backend
cd frontend && npm run build && cd ..   # frontend
```

**If tests fail:** Report failures, ask whether to proceed or investigate.
**If tests pass:** Report ready.

### Report

```
Worktree ready at <full-path>
Tests passing (<N> tests, 0 failures)
Ready to implement <feature-name>
```

## Quick Reference

| Situation | Action |
|-----------|--------|
| Already in linked worktree | Skip creation (Step 0) |
| In a submodule | Treat as normal repo (Step 0 guard) |
| Native worktree tool available | Use it (Step 1a) |
| No native tool | Git worktree fallback (Step 1b) |
| `.worktrees/` exists | Use it (verify ignored) |
| Directory not ignored | Add to `.gitignore` + commit |
| Permission error on create | Sandbox fallback, work in place |
| Tests fail during baseline | Report failures + ask |

## Red Flags

**Never:**
- Create a worktree when Step 0 detects existing isolation
- Use `git worktree add` when you have a native worktree tool — this is the #1 mistake
- Skip Step 1a by jumping straight to git commands
- Create a project-local worktree without verifying it's ignored
- Skip baseline test verification
- Proceed with failing tests without asking

**Always:**
- Run Step 0 detection first
- Prefer native tools over the git fallback
- Verify the directory is ignored for project-local worktrees
- Verify a clean test baseline
