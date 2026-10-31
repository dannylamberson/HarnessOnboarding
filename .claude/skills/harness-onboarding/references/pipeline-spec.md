# The harness: canonical, tool-agnostic spec

This is the reference definition of the pipeline harness. It names no vendors. A scaffolded project gets a
customized copy (the `kit/`), with the same principles and the project's own tools and commands swapped in. Read this
before the interview so you know what you're building toward.

## The model: an agile product team

- **The user is the product owner and the customer.** They bring ideas, set priorities, make decisions, and run QA.
- **Claude Code is the team.** Each session starts cold, like **a new engineer on their first day**. Two artifacts
  bring them up to speed:
  - **The playbook (the harness):** how this team works. That's the pipeline skill and its references, the agents, the
    guard hooks, the review personas. It changes rarely, on purpose, through maintenance PRs.
  - **The docs (the context files):** what's been built so far. That's the root `CLAUDE.md` as a table of contents,
    folder `CLAUDE.md` files next to the code they describe, `docs/` for depth, and a Shipped log. It grows with every
    card.
- **A board holds the work.** Every idea becomes a card. Cards move left to right through fixed stages, and the
  card's status is the single source of truth for what to do next.
- **Roles by model.** Opus leads: scoping, sketches, plans, decisions, reviews, talking with the user. Sonnet builds
  from a written plan. Haiku runs mechanical checks. Personas are standing specialist reviewers (UX, data, platform),
  consulted when a card's paths call for them.

The point is that knowledge **compounds**: the Document stage writes what each card taught back into the docs, so the
next engineer starts smarter than the last.

## Where the harness lives

**In the project repo, always.** `.claude/` is a Claude Code plugin listed in a marketplace inside the repo
(`.claude-plugin/marketplace.json`). Installed once per machine from that machine's clone, it loads in place, from any
start folder, and updates with `git pull`. Nothing that governs the pipeline lives only in one person's account or on
one machine. A session's step 0, `harness-check.mjs`, proves the harness is live before work starts.

The one thing also installed elsewhere is the **intake skill**: its source is in the repo (`.claude/intake/`), and it's
uploaded to claude.ai so it works in chat sessions as well as Claude Code.

## The pipeline stages

| Board status | Work | Meaning |
| --- | --- | --- |
| Backlog | (not started) | Captured idea |
| Scoping | Scope | Spec it; sketch any new UI |
| POC | POC | Smallest proof the approach works |
| Implementation | Implement | Production build, PR, preview |
| QA | QA | The human tests the QA site |
| Documentation | Document | Write knowledge back |
| Shipped | (done) | Live and documented |
| Dropped | (abandoned) | Superseded or infeasible |

Every stage leaves a comment on the card (spec, POC result, PR link, QA sign-off, docs touched), so the comment
history is the paper trail. **Never skip stages.** On a board without statuses, use columns or sections; on one without
either, a tracked `backlog.md` with a section per stage.

## Core principles

**One card = one feature = one session.** Bundling is the classic cause of tangled, un-debuggable work. Push back on it,
even for "small" extras.

**See it before it's built.** New UI is sketched at Scope as throwaway HTML, with options side by side. The user picks
before the spec is signed off and before any code or migration exists. A UI argument settled with a sketch costs
minutes; settled at QA it costs a session per round, and sometimes a migration.

**The human runs QA.** Claude implements; the human uses the real thing on the QA site and reports back. Never call
something done because a build passed.

**Preview before production.** Work is reviewed on a QA site or preview; production ships only after sign-off.

**Confirm before advancing.** Moving a card, and anything bulk, destructive or outward-facing, gets a short preview and
an explicit OK, with buttons: **Proceed** / **Pause** / **Yes, and…** (`AskUserQuestion` in Claude Code,
`ask_user_input_v0` in claude.ai chat).

**Plan with the strong model, build with the cheap one.** Writing a plan precise enough for a cold subagent is where
the judgment goes, and reviewing its result is where the quality comes from.

**Knowledge compounds.** Documentation is part of the feature. It goes in the most specific file, within a size budget.

## Per-stage definitions

### 1. Scope

No app code. First name the paths the work will touch: they drive the labels, the personas and the dependencies. Run
the selected personas' Scope questions; anything they raise that the user didn't is an open question, not a decision.
**Sketch new UI** (a new screen, component or interaction) and get the user's pick; reused UI gets `Sketch: waived
(reason)`. Post a spec: problem, success criteria (observable), data and access rules, dependencies, persona notes,
open questions, sketch. **Done when** it's posted, every blocking question is answered, and the user approves.

### 2. POC

The smallest testable proof, run locally. A new screen builds the **approved sketch** with the real components. A
schema change is applied locally with its access rules proven. An API is called once and its shape logged. If nothing
fits, ask the user what a reasonable smoke test is. **Done when** the core mechanic works in one real scenario the user
can see.

### 3. Implement

Production code to the project's conventions (`CLAUDE.md` wins over the skill). Opus posts a plan on the card, the
builder writes it, Opus reviews the diff against the plan and opens the PR. Secrets stay server-side. New env vars go
in `.env.example`, with a reminder to set them in hosting and CI. Migrations are additive only. Build on a branch named
for the card, cut from the production branch. **Done when** the gate passes, a PR is open and linked on the card, and
the preview is green.

### 4. QA

Apply any migration to the hosted database (after confirming), put the branch on the QA site, and confirm the build is
the new one. Run the checks Claude can do itself first and fix what they find. Then send the human a short numbered test
script with a pass condition per line, and say what Claude couldn't check. On a bug, stay in QA and fix on the same
branch. After sign-off: merge, **confirm production actually changed** (a failed build leaves the old deploy live), and
rebuild the QA branch. **Done when** signed off, merged, and live.

### 5. Document

A brief (what changed, the decisions and who made them, gotchas, gaps) goes to `doc-writer`, which writes into the most
specific context files and the Shipped log. `context-check` measures every file against its budget and checks every
pointer. Opus reads the doc diff before committing. Every ten or so ships, a `context-audit` checks the docs against
live state. **Done when** the check passes and the docs are merged.

## The hotfix path

For small, low-risk, unambiguous product fixes (a typo, a wrong link, a one-line bug): a `[hotfix]` card straight to
Implementation, fixed in the main session, still with a PR, the QA site and the human's check. **Never** for auth, data
access rules, migrations, secrets or deploy config. A sprawling hotfix becomes a normal card.

## The maintenance path

Changes to the harness or the docs aren't product features, so they're **one PR, no card**. That covers the pipeline
skill, references, agents, hooks, `CLAUDE.md` files, a context audit's fixes, and a playbook tweak learned on a card. A
branch, the change, the context check, the user's review, a merge. A changed agent or hook reaches only new sessions.

## Delegation

| Agent | Model, effort | Job | Never |
| --- | --- | --- | --- |
| `pipeline-lead` | Opus, high (the main session) | Scope, sketches, plans, decisions, reviews, hotfixes, maintenance | Bundle cards, skip stages, advance without an OK |
| `builder` | Sonnet, medium | POC, Implement and QA-fix builds from a plan; commits locally | Push, deploy, touch the hosted database, the board or the PR |
| `qa-runner` | Haiku, medium | Merges into the QA branch, pushes it, waits for the build, runs shell checks | Push anything but the QA branch; fix anything |
| `doc-writer` | Sonnet | Document stage: the brief into the right files, within budget | Change code, commit, push |
| `context-check` | Haiku | Sizes, broken pointers, duplicates, ships since the audit | Edit anything |
| `context-audit` | Sonnet | Docs against the repo and live state, as a prioritized fix list | Edit anything, read secret values or app data |

- **The plan** a cold subagent gets names the card, branch and stage, every file and what it does, the exact wording,
  the approved sketch, the tests and gate, the decisions made and by whom, what's out of scope, and the personas.
- **The kick-back rule:** a decision the plan doesn't settle is a `BLOCKED` report, never a guess. The lead answers it
  from the docs or asks the user (scope, data, cost, auth and access rules always go to the user), then resumes the
  **same** agent.
- **The review checklist:** the diff against the plan, re-run the gate, persona build defaults, labels from the diff,
  anything the agent decided, nothing pushed.
- **Not worth delegating:** a hotfix, maintenance, or about 3 files and 50 lines or fewer.
- **Guards:** a plugin-level hook routes each subagent's Bash calls to its guard. The forbidden commands are listed
  once, in `.claude/harness.json`. A cloud session runs no hooks, so the rules also stay in the prompts.
- **Single-model option:** a user who doesn't want subagents gets the same pipeline without agents and guards. The
  main session does every stage.

## Personas

Standing review lenses in `docs/personas/`, routed by **paths** (the spec's at Scope, the diff's later), by a
`persona-*` label, or by a stage rule. Labels only add a persona. Each persona has Scope questions, build defaults, QA
checks and known landmines. They raise questions; the user decides; `CLAUDE.md` wins where they overlap. Start with
`ux` for projects with UI and `db` for projects with a database. Add others when the same review comment keeps coming
up, not speculatively.

## Context files and budgets

Root `CLAUDE.md` is a table of contents that loads every session: stack, commands, a context map, project rules,
gotchas, the 10 newest shipped cards. Folder `CLAUDE.md` files load when a file in their folder is read. `docs/`
loads only when read. Budgets: root 8 KB, the pipeline skill 16 KB, everything else 12 KB, the archive unbudgeted. A
file over budget moves detail down a level and leaves a pointer; it never cuts content.

## Advancing, pivots and drops

Preview the move (stage summary, from → to, flags such as env vars or a migration), get an OK, post the summary
comment, change the status. **A QA bug** stays in QA. **A POC that disproves the approach** posts a finding and a
`[PIVOT]` note and moves back to Scoping. **A drop** posts the reason and moves to Dropped.

## Research spikes

Scope defines the question, time box and the decision it unlocks. POC runs the investigation on a never-merged
`spike/<slug>` branch. Implement writes up findings and follow-up cards. QA confirms the findings answer the question.
Document keeps what's worth keeping.

## Git workflow

Stage specific files only, never `git add -A`. Commits are `type(slug): description`. Push the branch, open a PR that
links the card, and post the PR link on the card. Merge only after sign-off. Never skip hooks, force-push the
production branch, or amend after a failed hook. The QA branch is disposable: branches merge into it with `--no-ff`,
it's rebuilt after each ship, and it's never merged anywhere.

## Card naming

`slug — short description`. Kebab-case, unique, 30 characters or fewer. The slug is the branch, the commit scope and
the feature's name in the docs.

## Guardrails

1. One card per session. Push back on bundling.
2. Don't skip stages.
3. Respect "Blocked by:".
4. Read `CLAUDE.md` first, every session; run the harness check.
5. Secrets stay server-side.
6. Sketch new UI before the spec is signed off.
7. QA on the QA site; production only after sign-off.
8. Confirm before advancing, pushing a migration, or anything bulk, destructive or outward-facing.
9. The human runs QA.
10. Document in the most specific file, within budget.
11. Harness and docs changes are maintenance PRs, not cards.
