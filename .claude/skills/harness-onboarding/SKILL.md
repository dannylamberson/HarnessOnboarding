---
name: harness-onboarding
description: Kick off a new software project as an agile product team run with Claude Code. Interview the user about their idea, advise on the stack per role (board, repo, hosting with a QA site, database, analytics, models), walk them through setting each one up, create the GitHub repo, scaffold it with a pipeline harness (a repo-local plugin with the pipeline skill, sketch-first scoping, Opus-plans/Sonnet-builds/Haiku-checks agents, guard hooks, context files and personas), and seed the backlog with the first cards so the next session can start building. Use whenever someone says "I have a new project idea", "start a new project", "kick off a new app", "set up my harness", "make a pipeline for my repo", "onboard this codebase to the pipeline", or wants to run their AI-assisted development like a product team (scope, mockups, prove, implement, QA, document). Also for adding the harness to an existing codebase.
---

# Harness onboarding: the project kickoff

This skill turns a big idea into a project that's ready to build: a board with the first cards on it, a GitHub repo,
hosting with a QA site, a database if it needs one, and a **harness** committed in the repo. The next session opens
that repo and picks up the first card.

You are not building the application here. You are **setting up the team and its playbook**.

## The model behind it

- **The user is the product owner and the customer.** They bring ideas, make decisions, and run QA on a real preview.
- **Claude Code is the product team.** Every session is a new engineer's first day. The harness is their **playbook**:
  how the team works, in the pipeline skill, its references, agents and guards. The project's `CLAUDE.md` files and
  `docs/` are **the docs on what's been built so far**.
- **A board breaks ideas into chunks.** One card is one feature. Each card goes Scope → POC → Implement → QA →
  Document, with a hotfix path for small fixes and a maintenance path (one PR, no card) for harness and docs changes.
- **Roles by model:** Opus leads (scopes, sketches, plans, decides, reviews), Sonnet builds, Haiku runs mechanical
  checks. Personas are the specialist reviewers.

Read `references/pipeline-spec.md` before you start: it's the canonical definition, and the scaffolded harness must
keep its principles, not just its stage names.

## How to run it

Talk like a helpful collaborator, not a form. Ask one thing at a time, recommend a default for each question, and
explain jargon: many users aren't professional engineers. **Confirm before every step that creates something outside
this computer** (a repo, a board team, a hosting site, a database project), and before anything that costs money. The
user creates any new account themselves; never sign up for a service on their behalf.

Keep a running answers file as you go, in the shape of `kit/answers.example.json`, in the scratchpad. It feeds the
scaffold at step 6.

### 1. The big idea

Let the user pitch it in their own words. Then fill the gaps: what it's for and what success looks like, who uses it
and on what (phone, desktop, both), whether it starts from scratch or adapts an existing codebase. For an existing
codebase, offer to read it first (`references/interview.md` › Phase 0).

### 2. Interview and advise

Detect what's already connected (`references/tool-roles.md` › Detecting what's available), then run
`references/interview.md`. For each role, recommend options that fit the goal and what's connected, and let the user
choose. Roles: board, repo, hosting with a QA site, database, analytics, secrets, and models.

### 3. Confirm the plan

One compact summary: the name and slug, the tool per role, the QA site and branch, the gate command, whether there's
UI (sketches on) and a database, the models, and the commands a builder must never run. Get an explicit "looks good".
It's the cheap moment to catch a wrong assumption.

### 4–9. Set it up, in this order

Follow `references/setup.md`, one step at a time, confirming each:

| # | Step | Why here |
| --- | --- | --- |
| 4 | **Board:** the team or project, its stage statuses, the labels | The idea needs somewhere to be broken down before code exists |
| 5 | **Repo:** create it on GitHub, clone it, `main` plus the QA branch | Hosting and the harness both need it |
| 6 | **Scaffold:** the app skeleton and gate, then the harness from `kit/` (`references/scaffold.md`); first commit and push | The harness ships with the first commit |
| 7 | **Install and check:** the plugin on this machine, then `harness-check.mjs` | Proves the next session gets the playbook |
| 8 | **Hosting:** production from `main`, the QA site from the QA branch, PR previews; first deploy green | Needs the repo. QA needs a preview target |
| 9 | **Database** (if any): the project, the local stack, env vars into hosting and `.env.example`. No tables yet | Wired once, so cards only add migrations |

A step the user would rather do later becomes a line on the step 11 checklist, not a silent skip.

### 10. Seed the backlog

Run the scaffolded intake skill's steps (`.claude/intake/<slug>-scope-intake/SKILL.md` in the new repo) on the big
idea. The result is ordered, pipeline-sized cards. The first one or two are fully scoped and, if they add UI,
**sketched**, with the user's pick on the card. Usually the first card is a walking skeleton: the app shell, sign-in if
there is any, and one real screen.

### 11. Hand off

Give the user:

- **The first-session prompt,** in a copy-paste block: open the new repo, `claude --agent pipeline-lead --effort high`,
  "what's next?"
- **The intake skill for claude.ai.** Zip `.claude/intake/<slug>-scope-intake/` and tell them to upload it in claude.ai
  Settings → Capabilities, so it works in Cowork chat as well as Claude Code. The repo copy stays the source.
- **The checklist** of anything left by hand (a secret to paste into hosting, a step they deferred).
- **The reminder** that the playbook is theirs: practices learned on a card go back into the pipeline skill as a
  maintenance PR. Practices worth sharing across projects go back into this repo's `kit/`.

## Non-negotiables in every scaffolded harness

Adapt the wording to the project's tools, but keep all of these (`references/pipeline-spec.md` explains each):

- **The harness lives in the repo.** Pipeline skill, references, agents, hooks and context files are committed and
  load from the clone as a plugin. Nothing that governs the pipeline lives only on one machine. (The intake skill is
  also uploaded to claude.ai, from its repo source.)
- **One card = one feature = one session.** Push back on bundling.
- **New UI is sketched at Scope,** before the spec is signed off and before any code or migration. POC builds the
  picked sketch.
- **Opus plans and reviews; Sonnet builds; Haiku checks.** Subagents commit locally only. Guard hooks stop them from
  pushing, deploying or touching the hosted database and the board.
- **The human runs QA** on the QA site. Never declare done off a green build.
- **Preview before production.** Production ships only after sign-off.
- **Confirm before advancing** a card, with buttons (`AskUserQuestion` in Claude Code, `ask_user_input_v0` in
  claude.ai chat): **Proceed** / **Pause** / **Yes, and…**.
- **Document in the most specific place,** within budgets, so knowledge compounds.
- **Five stages, plus the hotfix and maintenance paths.**

## Reference files

- `references/pipeline-spec.md`: the canonical harness: stages, principles, delegation, sketches, the paths. Read first.
- `references/interview.md`: the question flow (steps 1–2).
- `references/tool-roles.md`: role catalog, recommendations per role, detecting what's connected (step 2).
- `references/setup.md`: provisioning each role, in order (steps 4–9).
- `references/scaffold.md`: filling `kit/` into the new repo, the answers file, what to write by hand (step 6).
- `references/example-output.md`: a worked kickoff, as a target to aim at.
- `kit/`: the harness files, with `{{PLACEHOLDERS}}`. `kit/scaffold.mjs` copies them; `kit/scaffold.test.mjs` checks the kit.
