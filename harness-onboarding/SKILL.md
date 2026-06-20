---
name: harness-onboarding
description: Interview a user about a software project and generate a tailored, tool-agnostic "pipeline harness" skill that governs their AI-assisted development workflow. Use this whenever someone wants to set up a development pipeline or workflow harness, scaffold a repeatable build process, onboard a new or existing codebase to a ticket-driven pipeline, generate a project-pipeline skill, create a backlog-to-shipped workflow, or asks for help structuring how they use AI coding tools like a product team (scope, prove, implement, QA, document). Also trigger for phrases like "set up my harness", "make a pipeline skill for my repo", "I want the Asana or Linear ticket pipeline for this project", or "help me run my project like a dev team". It walks the user through choosing tools per role (task board, version control, hosting and preview deploys, backend, analytics), adapts to whatever connectors they already have, then writes a ready-to-install pipeline skill for their project.
---

# Harness onboarding

This skill turns a short interview into a **tailored pipeline skill** for someone's project.

You are not building their application here. You are building the *skill that will structure how their application gets built* in every future session — a `[slug]-pipeline` skill, customized to their project and their tools, embedding a proven workflow so a fresh session behaves like a disciplined one-person product team instead of a one-prompt gamble.

The output is a single file: `[slug]-pipeline/SKILL.md`, ready for the user to install and invoke.

## What "the harness" is

Read `references/pipeline-spec.md` before you interview. It is the canonical, tool-agnostic definition of the harness, and the generated skill must embed its principles — not just a list of stage names.

In one breath, the harness is two things working together:

1. **Persistent context** — a skill that encodes *how to work the project* (the pipeline below), plus `CLAUDE.md` context files the AI reads at the start of every session so it shows up already understanding the codebase.
2. **A ticket-driven pipeline** — every idea becomes one card; each card flows through five fixed stages (**Scope → POC → Implement → QA → Document**), one card per session, with a lightweight **hotfix path** for small fixes. Connected tools (a task board, version control, hosting with preview deploys, optionally a backend and analytics) carry the work between stages.

The whole point is that knowledge *compounds*: the Document stage writes findings back into the context files, so the next card starts smarter than the last.

## The process

Work through these steps in order. Talk like a helpful collaborator, not a form — ask one thing at a time, recommend sensible defaults, and never dump the whole interview at once. Many users of this skill are not professional engineers; explain any jargon you reach for.

### A. Frame it

Tell the user, briefly, what you'll do and what they'll get: a few questions, then a `[slug]-pipeline` skill tailored to their project that they install and invoke to run their workflow. Confirm they want to proceed.

### B. Detect what's already available

Before recommending anything, look at the user's environment so your recommendations fit reality instead of guessing. Read `references/tool-roles.md` → "Detecting what's available". In short: check which MCP connectors/tools are present (task board, repo host, hosting, database, analytics), check for relevant CLIs, and — if adapting an existing codebase — look at the repo for config files that reveal the stack. Note what you find; you'll lean on it in step D.

### C. Interview

Read `references/interview.md` and run it. It branches early on the most important question — **starting from scratch vs. adapting an existing codebase** — and ends by asking whether they want to fold in **any additional context** (a vision doc, constraints, conventions, gotchas). Resolve ambiguity as you go; don't bank questions for the end.

### D. Recommend tools per role

Read `references/tool-roles.md`. For each role the harness needs filled (task board, version control, hosting + preview, backend/data, analytics, secrets), recommend named options that fit the user's goals and whatever you detected in step B — then let them choose. Stay decoupled from any specific vendor: the harness needs a *capability* in each role, and several tools satisfy each one. If the user already uses something, prefer it.

### E. Confirm the plan

Restate, in one compact summary: the project name and slug, the chosen tool per role, the QA model (who tests and where), the commands, and the context-file layout. Get an explicit "looks good" before generating. This is the cheap moment to catch a wrong assumption.

### F. Generate the skill

Read `references/skill-template.md` and fill it in with everything you collected. Then:

- Confirm where to write it. Default to `[slug]-pipeline/SKILL.md` inside the user's skills directory (e.g. `.claude/skills/[slug]-pipeline/SKILL.md`) or a `skills/` folder in their repo — ask if unsure.
- Replace every placeholder. Drop optional sections the project doesn't use (e.g. backend/database) and tune the POC examples to the project type.
- Write a **pushy, project-specific `description`** so the generated skill reliably triggers in future sessions (see the template's guidance).
- Keep the generated skill's principles intact — see below.

Use `references/example-output.md` as a concrete target for what a good filled-in result looks like.

### G. Wrap up

Hand off cleanly:

- Tell them how to install and invoke the new skill (and that this is a separate step — generating the file does not register it).
- Give a short **manual setup checklist** for the pieces a skill can't create for them: create the board and its stage columns/sections, add a root `CLAUDE.md` to the repo, confirm preview deploys are wired, and add any secrets in the right places.
- Remind them the skill is theirs to evolve — as the project grows, update the generated skill and the `CLAUDE.md` files.

## Non-negotiables to bake into every generated skill

These are what make the harness work rather than just look like process. Preserve them in whatever you generate, adapting the wording to the user's tools — explained more fully in `references/pipeline-spec.md`:

- **One card = one feature = one session.** Bundling is what creates un-debuggable messes. The generated skill should push back on bundling.
- **The human runs QA.** Claude implements; the user verifies on a real preview and reports back. Never declare something done off a green build alone.
- **Preview before production.** Work is reviewed on a preview/staging target; production ships only after sign-off.
- **Confirm before advancing** a card between stages, and before any bulk or destructive action.
- **Document in the most specific place.** Findings and patterns go in the nearest `CLAUDE.md`, not a growing root file — this is the loop that makes knowledge compound.
- **Keep the five stages + the hotfix path.** Don't let a generated skill silently skip stages; small fixes use the hotfix shortcut, everything else runs the pipeline.

## Reference files

- `references/pipeline-spec.md` — the canonical tool-agnostic harness (stages, principles, guardrails). Read first.
- `references/interview.md` — the question flow to run with the user. Read in step C.
- `references/tool-roles.md` — role catalog, recommendations per role, and how to detect what the user has. Read in steps B and D.
- `references/skill-template.md` — the fill-in template for the generated `[slug]-pipeline` skill. Read in step F.
- `references/example-output.md` — a worked example of a generated skill, as a target to aim at.
