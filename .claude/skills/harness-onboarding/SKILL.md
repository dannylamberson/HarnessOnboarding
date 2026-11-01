---
name: harness-onboarding
description: Kick off a new software project as an agile product team run with Claude Code, or onboard an existing codebase. Interviews the user about the idea, advises on the stack, walks them through setting up Linear, the GitHub repo, hosting and the database, then installs a repo-embedded pipeline harness (per-stage skills for groom, scope, poc, implement, qa, document, ship; sketches of new UI at Scope; Opus-plans, Sonnet-builds, Haiku-checks agents behind guard hooks; context files with budgets) and seeds the backlog so the next session can start building. Use whenever someone says "I have a new project idea", "start a new project", "kick off a new app", "set up my harness", "make a pipeline for my repo", "I want the Linear ticket pipeline for this project", or "help me run my project like a dev team".
---

# Harness onboarding: the project kickoff

This skill starts a project with its product team already in place. It runs a kickoff: interview, set up the tools,
install a **repo-embedded pipeline harness**, seed the backlog. The project's next session opens the repo and picks up
the first card.

You are not building their application. You are installing *the team and the playbook that govern how it gets built*,
so a fresh session behaves like a disciplined product team instead of a one-prompt gamble.

**The model:** the user is the product owner and the customer. They bring ideas, decide, and run QA. Every Claude Code
session is a new engineer on their first day. The harness is the engineer's **playbook**: the stage skills,
`docs/pipeline-core.md` and the agents. The context files are **the docs on what's been built so far**. Linear breaks
ideas into cards. Opus leads (grooms, scopes, sketches, plans, reviews, ships), Sonnet builds, and Haiku checks.

**The harness is already written.** It lives in `template/`. Your job is to interview, set up, copy it in, and fill in
the blanks, not to compose a pipeline from scratch.

## What gets installed

Into the user's repo, not their Claude settings:

```
CLAUDE.md                           root context file
docs/pipeline-core.md               shared source of truth for every stage
docs/harness-notes.md               context budgets, what lives where, the maintenance path
docs/delegation.md                  which model does what, the plan format, the review checklist
docs/sketches.md                    throwaway HTML sketches of new UI at Scope
docs/harness-plugin.md              installing the harness on a machine
docs/changes/README.md              per-card doc fragments
docs/feature-history.md             written only at ship, by the fold
docs/personas/README.md             review-lens format
.claude/skills/pipeline-groom/      ┐
.claude/skills/pipeline-scope/      │
.claude/skills/pipeline-poc/        │ one thin skill per stage,
.claude/skills/pipeline-implement/  │ committed to the repo
.claude/skills/pipeline-qa/         │
.claude/skills/pipeline-document/   │
.claude/skills/pipeline-ship/       ┘
.claude/agents/                     pipeline-lead (Opus), builder (Sonnet), qa-runner (Haiku),
                                    doc-writer (Sonnet), context-check (Haiku), context-audit (Sonnet)
.claude/hooks/                      guard hooks (subagents can't push or deploy) and harness-check.mjs
.claude/scripts/context-size.mjs    budgets, broken pointers, ships since the last audit
.claude/harness.json                the guards' forbidden commands, the budgets
.claude/.claude-plugin/plugin.json  ┐ .claude/ as a plugin, so the agents and guards
.claude-plugin/marketplace.json     ┘ register from any folder
```

Plus a stanza appended to their `.gitignore`.

**Why in the repo:** the skills are versioned, travel with every clone, get reviewed in the same PR as the code they
govern, and can't drift out of sync with the project. A harness that lives in someone's personal Claude settings is a
harness that silently describes a workflow the repo abandoned weeks ago.

**Why also a plugin:** the plugin is not a second copy. It's the same `.claude/` folder, installed once per machine
from that machine's own clone and loaded **in place**, so `git pull` updates it. It registers the agents and their
guard hooks from any start folder, and the startup check (`harness-check.mjs`) proves they're live.

## Read first

- `references/pipeline-spec.md`: **why the harness is shaped this way**, and the evidence behind the non-obvious calls.
  Read before interviewing, so you can explain any part of it and push back when a request would break something
  load-bearing.
- `references/context-economy.md`: the half of the harness that isn't the pipeline. Commonly skipped; it's the part
  that gets discovered late and expensively.

## The process

Work through these in order. Talk like a collaborator, not a form: ask one thing at a time, recommend defaults, never
dump the whole interview at once. Many users are not professional engineers; explain jargon you reach for.

**Confirm before every step that creates something outside this computer** (a Linear team, a repo, a hosting site, a
database project), and before anything that costs money. The user creates any new account and signs in themselves.

### A. The big idea

Let them pitch it in their own words. Then frame what they'll get: a few questions, the tools set up, and a working
pipeline committed into a repo, with the first cards on the board. Confirm they want to proceed.

### B. Detect what's available

`references/tool-roles.md` › "Detecting what's already available". Check MCP connectors, relevant CLIs (`gh`, the
hosting and database CLIs), and, for an existing repo, the config files that reveal the stack.

**Check for the Linear connector specifically.** If it's absent, say so now: the harness works without it, but every
stage skill assumes issues can be read and updated from the session, and that becomes manual work.

### C. Interview

Run `references/interview.md`. It branches on **scratch vs. existing codebase**, and it's short: you're filling
blanks, not designing. Keep the answers in a scratchpad file shaped like `template/answers.example.json`; it feeds
the scaffold in step F.

Questions the flow deliberately forces, because they change the generated text rather than decorate it:

- **Which QA-target shape:** preview-per-branch, or a long-lived integration branch. Changes the git workflow and the
  QA runner.
- **How to verify a deploy landed.** Most people have no answer. Record the absence rather than leaving it blank.
- **Does it have UI?** Turns sketches on, and sets the sketch frames and the tokens path.
- **What may a subagent never run?** The deploy CLI, the database push, `gh`. These become the guards' list.

### D. Confirm the plan

Restate in one compact summary: name and slug, who runs QA, the Linear team, the tool per role, the QA-target shape,
the commands, the context-file folders, UI or not, the models. Get an explicit "looks good". This is the cheap moment
to catch a wrong assumption.

### E. Set up the tools

`references/setup.md`, one step at a time, each confirmed: **Linear** (the team, its statuses, its labels) → **the
repo** (create it on GitHub, clone it) → **hosting** (production, the QA target, a way to read the deployed SHA) →
**the database**, if any (the project, the local stack, env vars; no tables yet). For an existing project, each step
shrinks to checking what's there. A step the user defers goes on the wrap-up checklist.

### F. Install the harness

1. **Confirm the target repo path.** For a new project, the app skeleton comes first (`references/setup.md` ›
   Skeleton), so there's a gate to run.
2. **Copy `template/` in with the scaffold:**
   `node <this skill>/template/scaffold.mjs --answers <answers.json> --target <repo>`. It copies the tree (mapping
   `dot-claude` → `.claude` and dropping `.tmpl`), fills the mechanical placeholders, keeps or drops the optional
   parts by flag, writes `.claude/harness.json`, appends the gitignore stanza, and lists every placeholder left. It
   never overwrites an existing file; it lists those for a hand merge.
3. **Write every placeholder it lists.** The legend is in `template/SETUP.md`. Where something doesn't apply, **delete
   the section rather than leaving `{{PLACEHOLDER}}` in a live file**: a stale placeholder reads as a fact nobody
   checked, and later sessions treat it as one.
4. **Write pushy, project-specific `description` lines** in each stage skill's frontmatter. Name the project, the
   Linear status, and the phrases the user would actually say. Each under 1024 characters, no angle brackets.
5. **Verify the harness is tracked.** This is the step that silently fails:

   ```bash
   git check-ignore -v .claude/skills/pipeline-ship/SKILL.md .claude/agents/builder.md .claude/hooks/agent-guard.mjs .claude/harness.json
   ```

   **No output means tracked**, which is what you want. Any output means they're ignored and would be absent from
   every other clone. Fix the gitignore before moving on.
6. `node .claude/scripts/context-size.mjs` passes. Commit the harness on the production branch and push. Cut the
   integration branch, if there is one.

Use `references/example-output.md` to calibrate how specific a filled-in placeholder should be.

### G. Install the plugin and check

From the clone: `claude plugin validate .claude`, `claude plugin validate .`, then `claude plugin marketplace add
<absolute clone path>` and `claude plugin install <slug>@<slug>-local`. Then `node .claude/hooks/harness-check.mjs`
should end `Result: ok`. If `claude` isn't on the PATH, give the user the commands. A session already running won't
see the new agents; the next one will.

### H. Seed the backlog

Turn the big idea into cards with `pipeline-core`'s card creation workflow: ordered, one feature each, with `blockedBy`
relations and a Project when there are three or more. Usually the first is a walking skeleton: the app shell, sign-in
if there is any, and one real screen. Then **run `pipeline-scope` on the first card**, including its sketch if it adds
UI, so the user's first build session starts at POC with a picked design.

### I. Wrap up

Give them:

- **The first-session prompt:** open the repo, `claude --agent pipeline-lead --effort high`, "what's next?".
- **A manual checklist** for what's left: secrets in all three places (local, runtime, CI), a custom domain, any
  setup step they deferred.
- **The reminder:** the harness is theirs to evolve. It's in their repo, so a change to it is a maintenance PR
  (`docs/harness-notes.md` › Maintenance path). A practice worth sharing across projects goes back into this repo's
  `template/`.

## Non-negotiables to preserve

Full reasoning and evidence in `references/pipeline-spec.md`. Adapt the wording to their tools; don't drop the
substance:

- **One card = one feature = one session.** But finishing a *stage* is not a reason to end a session.
- **The human runs QA.** Never simulate end-to-end results.
- **Confirm before advancing,** with exactly *one* confirmation per decision. The ship gate's single "Ship it" covers
  the whole sequence.
- **See it before it's built.** New UI is sketched at Scope, and the user picks before the spec is approved. POC
  builds the pick.
- **Opus plans and reviews; Sonnet builds; Haiku checks.** Subagents commit locally only, behind guard hooks.
- **Document via a fragment,** folded at ship, not direct edits to shared files.
- **Route from the diff, never from labels.**
- **The status is the stage.** No subtask checklist.
- **Branch from production, never from the integration tip.**
- **Never restate a shared fact in a stage skill.**
- **Verify the artifact, not the push.**
- **Harness and docs changes are a maintenance PR, not a card.**
- **Carry the evidence.** Rules with measurements survive; assertions get reasoned away.

## If they want to deviate

Don't refuse: explain the cost, then build what they asked for. Common ones:

- **A different board.** The principles survive; the mechanics don't. `tool-roles.md` lists what needs rework.
- **A hotfix lane.** The `type` label approach supersedes it and is better. Explain why, and build the lane if they
  still want it.
- **No subagents.** Set `flags.delegation` to false: no agents or guards, and the main session runs every stage.
  Explain what the plan-and-review split catches.

## Reference files

| File | Read it |
| --- | --- |
| `references/pipeline-spec.md` | First: the rationale and the non-negotiables |
| `references/context-economy.md` | First: context budgets, splitting, personas |
| `references/tool-roles.md` | Steps B and C: roles, detection, Linear setup |
| `references/interview.md` | Step C: the question flow |
| `references/setup.md` | Step E: setting up Linear, the repo, hosting and the database; the app skeleton |
| `references/example-output.md` | Step F: calibration for filled-in placeholders |
| `template/SETUP.md` | Step F: the copy map, the placeholder legend, the scaffold's flags |
| `template/scaffold.test.mjs` | After changing the template: `node template/scaffold.test.mjs` |
