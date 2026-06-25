---
name: brainstorming
description: Use before creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements, and design through one-question-at-a-time dialogue before any implementation.
---

# Brainstorming Ideas Into Designs

Help turn ideas into fully formed designs and specs through natural collaborative dialogue.

Start by understanding the current project context, then ask questions one at a time to refine the idea. Once you understand what you're building, present the design and get user approval.

This is the optional sub-skill for **SDLC Phase 1** (requirements). Its terminal state is a written, user-approved spec — after which you hand off to `writing-plans` (Phase 2). It does not replace `project-feature-sdlc`; it feeds it.

<HARD-GATE>
Do NOT invoke any implementation skill, write any code, or scaffold anything until you have presented a design and the user has approved it. This applies to EVERY change regardless of perceived simplicity.
</HARD-GATE>

## Anti-Pattern: "This Is Too Simple To Need A Design"

Every change goes through this process. "Simple" changes are where unexamined assumptions cause the most wasted work. The design can be short (a few sentences for truly simple work), but you MUST present it and get approval.

## Checklist

Create a task for each item and complete them in order:

1. **Explore project context** — read `AGENTS.md`, `context/`, relevant `.cursor/rules/`, recent commits
2. **Ask clarifying questions** — one at a time, understand purpose/constraints/success criteria
3. **Propose 2-3 approaches** — with trade-offs and your recommendation
4. **Present design** — in sections scaled to their complexity, get user approval after each section
5. **Write spec** — save to `docs/features/YYYY-MM-DD-<feature>-spec.md` using [project-feature-sdlc/templates/spec.md](../project-feature-sdlc/templates/spec.md)
6. **Spec self-review** — inline check for placeholders, contradictions, ambiguity, scope
7. **User reviews written spec** — ask the user to review the spec file before proceeding
8. **Transition to planning** — hand off to `writing-plans`

## The Process

**Understanding the idea:**

- Check the current project state first (files, docs, recent commits).
- Assess scope: if the request describes multiple independent subsystems, flag it immediately and help decompose into sub-projects before refining details. Each sub-project gets its own spec → plan → implementation cycle.
- For appropriately-scoped work, ask questions one at a time. Prefer multiple-choice when possible. Only one question per message.
- Focus on purpose, constraints, and **measurable** success criteria (not vague "works well").

**Exploring approaches:**

- Propose 2-3 different approaches with trade-offs.
- Lead with your recommended option and explain why.

**Presenting the design:**

- Present the design once you understand what you're building.
- Scale each section to its complexity. Ask after each section whether it looks right.
- Cover: architecture, components, data flow, error handling, testing.
- For this project, note cross-stack impact: features often touch `app/` (FastAPI) and `frontend/src/` (React).

**Design for isolation and clarity:**

- Break the system into smaller units that each have one clear purpose, communicate through well-defined interfaces, and can be understood and tested independently.
- For each unit: what does it do, how do you use it, what does it depend on?

**Working in existing codebases:**

- Explore the current structure before proposing changes. Follow existing patterns.
- Include targeted improvements to code you're already touching, but don't propose unrelated refactoring.

## After the Design

**Documentation:**

- Write the validated design (spec) to `docs/features/YYYY-MM-DD-<feature>-spec.md`.
- Commit the spec only when the user asks (per project git policy).

**Spec self-review** (fresh eyes):

1. **Placeholder scan:** Any "TBD"/"TODO"/vague requirements? Fix them.
2. **Internal consistency:** Do sections contradict each other? Does architecture match feature descriptions?
3. **Scope check:** Focused enough for a single plan, or does it need decomposition?
4. **Ambiguity check:** Could any requirement be read two ways? Pick one and make it explicit.

**User review gate:**

> "Spec written to `<path>`. Please review it and let me know if you want changes before we write the implementation plan."

Wait for the user. If they request changes, make them and re-run the self-review. Only proceed once the user approves (SDLC gate 1 → 2).

**Transition:**

- Invoke `writing-plans` to create the implementation plan. Do NOT invoke any other implementation skill.

## Key Principles

- **One question at a time** — don't overwhelm
- **Multiple choice preferred** — easier to answer
- **YAGNI ruthlessly** — remove unnecessary features
- **Explore alternatives** — propose 2-3 approaches before settling
- **Incremental validation** — present design, get approval before moving on
- **Be flexible** — go back and clarify when something doesn't make sense

> Note: This repo does not vendor the Superpowers browser "visual companion." Brainstorm in text; if a visual would help, describe it or use the project's screenshot/QA skills during the smoke phase.
