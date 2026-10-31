# The harness — what it is and why it's shaped this way

The **text** of the harness now lives in `template/` — that's what gets copied into a project. This file is the **rationale**: the principles behind the shape, and the evidence for the non-obvious calls.

Read it before interviewing, so you can explain any part of the generated harness and push back when a request would break something load-bearing. Don't restate the template's text here; if a fact belongs in the harness itself, it belongs in `template/`.

## The two halves

**1. Persistent context.** Claude starts every session cold. Two artifacts give it memory:

- **The repo-local skills** — `docs/pipeline-core.md` plus one thin skill per stage in `.claude/skills/`. These encode *how to work this project*.
- **Context files** — a root `CLAUDE.md` plus scoped sub-files in the folders they describe. These capture *what the project is*.

The second half has its own reference: `context-economy.md`. It is not optional reading — it's the part of the harness that gets discovered late and expensively.

**2. The pipeline.** Every idea becomes a Linear issue. Issues flow left to right through workflow statuses. The issue's status tells you which stage to work.

## The stages

```
Backlog → Scoping → POC → Implementation → QA → Documentation → Shipped
                                                                  ↘ Dropped
```

Seven stages, each with one skill. Two of them are commonly left out of workflow designs and shouldn't be:

- **Grooming** (operating on Backlog) asks *"should this card still exist, and is it filed correctly?"* — a different question from Scope's *"how do we build it?"* Backlogs rot, and a stale backlog that looks reviewed is worse than one that obviously isn't.
- **Ship** is its own stage, not QA's tail. It carries batch composition, per-feature merges, the documentation fold, and build verification. That's too much to append to QA.

**Documentation runs before Ship, not after.** This ordering is what makes the fragment-fold possible, and it's backwards from the intuitive "ship it, then write it up."

## Non-negotiables

These are what make the harness work rather than just look like process. Preserve them in whatever you generate.

### One card = one feature = one session

Bundling is what creates un-debuggable messes. But this is about *features*, not calendar sessions — a large card may legitimately span several. **Finishing a stage is not a reason to end a session.**

That clarification matters more than it looks. Read naively, "one card one session" produces an assistant that offers a handoff at every stage boundary, and each unnecessary handoff loses what the session knew: what was tried, what was rejected and why. The generated harness names four legitimate boundaries and forbids asserting how much context is left — no tool exposes it.

### The human runs QA

Claude implements; the human triggers real behavior on a real target and reports back. Never simulate end-to-end results, and never call something done off a green build.

### Confirm before advancing

A one-line preview and an explicit choice before any status change or bulk action. Use a two-option prompt — Proceed / Pause here — not a prose "Proceed?".

**And exactly one confirmation per decision.** The ship gate's single "Ship it" covers merge, push, verification and the status update. A second prompt before touching the board is a duplicate for a decision already made — it trains people to click through prompts, which is the opposite of what a confirmation is for.

### Document in the most specific place, via a fragment

Findings go in the nearest `CLAUDE.md`, not a growing root file. But the *write* is deferred: the Documentation stage writes one fragment under `docs/changes/`, and Ship folds them.

**Why:** if every card's Documentation pass edits the same shared files, every in-flight branch collides with every other *by construction*. Measured: 8 `CLAUDE.md` conflicts in one week. A unique filename per card gives zero conflicts with no locks. Accepted cost: between merge and release the shared docs don't describe the merged feature — the fragment does.

### Route from the diff, not from labels

`git diff --name-only <prod-branch>...HEAD` is the input to Implement, QA, Document and Ship. One path-routing table maps paths to context files *and* personas.

**Why:** measured across 11 shipped merges, the area label described only 44% of what cards actually touched, and 5 migration-writing cards missed their required review persona. A card's reach is plural and known in retrospect; a label is singular and applied up front. **Never re-key a harness rule back onto a label.**

### The status is the stage — no subtask checklist

Linear's workflow statuses already *are* the pipeline. Adding per-card subtasks that mirror the stages creates a second source of truth that can disagree with the first.

This reverses the older, Asana-shaped design where each card carried five subtasks. If a user asks for subtasks because they've seen that pattern, explain the tradeoff rather than silently obliging.

### Branch from production, never from the integration tip

Feature branches are cut from `main`. If they're cut from the integration branch's tip instead, every other in-flight feature becomes an ancestor — and excluding one unready feature from a release becomes impossible.

This was proven in throwaway sandbox repos, and it reverses what seems obviously more convenient. **Mark it as a deliberate reversal in the generated harness**, so a future session doesn't "correct" it back.

### Never restate a shared fact in a stage skill

Seven stage skills means seven chances for a fact to drift. Anything shared lives in `docs/pipeline-core.md`; stage skills carry only their own playbook and point back.

**Why thin skills:** a monolithic pipeline skill reloads *in full on every invocation*, not once per session. The source project's monolith was 21,346 chars; the split stage skills are 3.5–4.7K each.

### Verify the artifact, not the push

A green CI run and a clean `git push` are not proof anything published. On the source project, every production build across four days failed on a secrets scanner and two ships silently no-opped while merge, CI and push all looked healthy.

The generated harness must name a concrete verification method. If the project genuinely has none, say so explicitly in the file rather than leaving it blank — an unverifiable ship is a known risk, not an oversight.

### See it before it's built: sketch new UI at Scope

A card that adds a new screen, component or interaction gets a throwaway HTML sketch before the spec is approved:
options side by side, linked to the real design tokens, in a gitignored `sketches/` folder. The user picks; POC
builds the pick with the real components. Reused UI gets a one-line waiver.

**Why:** on household, UI iteration was where POC and QA sessions burned the most rounds, and a layout argument
settled at QA sometimes needed a second migration. A sketch settles in minutes what a spec paragraph leaves open; in
the first dry run the user called the sketch "clearer" than the spec it illustrated. It's a Scope step, not a stage:
the user decided that, so it costs one look, not one session.

### Opus plans and reviews; Sonnet builds; Haiku checks

The main session runs on Opus at high effort and keeps the judgment: grooming, scoping, sketches, plans, every
decision, reviewing what comes back, merging and shipping. A `builder` agent on Sonnet writes code from a written
plan. A `qa-runner` on Haiku does QA's mechanical work. `doc-writer` (Sonnet) writes fragments and folds them,
`context-check` (Haiku) measures, and `context-audit` (Sonnet) checks the docs against live state. A decision the plan
doesn't settle comes back as a fixed-shape BLOCKED report, never a guess, and the lead runs a review checklist on
every result.

**Why:** writing a plan precise enough for a cold subagent is where the judgment goes, and reviewing its diff is where
the quality comes from; the typing in between is what cheaper models are for. On household the split held quality
while moving most build tokens to Sonnet, and the review caught deviations, like a builder's formatter run that
buried a real change under ~3,000 lines of reformatting, before they reached a PR.

**Guard hooks, not just prompts:** subagents commit locally only. A plugin-level hook routes each subagent's shell
commands to its guard, which refuses `git push`, the deploy CLI, the database push and `gh` (the list lives in
`.claude/harness.json`). A hook whose script is missing fails open, so the integration branch lives in a worktree,
and a cloud session runs no hooks, so the rules stay in the prompts too.

### The harness loads from the clone, as a plugin

`.claude/` is also a Claude Code plugin, listed in a marketplace inside the repo and installed once per machine from
that machine's clone. It loads **in place** (no copy, no version bump), so it can't drift from the repo: `git pull`
updates it. That's what registers the agents and their guard hooks from any start folder. Every session starts with
`harness-check.mjs`, which proves the plugin is installed from this clone, the clone has the production branch's
`.claude/` changes, and the guards can run, and offers buttons on a miss.

### Harness and docs changes are a maintenance PR, not a card

Product work runs the stages. Changes to how the team works (the stage skills, `pipeline-core.md`, agents, hooks) and
to the docs themselves (an audit's fixes, a split over budget) are one branch, one PR, the user's review. Running them
through Scope → Ship spends a session per tweak on ceremony that protects nothing: there's no product behavior to
prove or QA. A changed agent or hook reaches only new sessions, so the PR says so.

### Carry the evidence

Rules with measurements attached survive. Rules stated as assertions invite a future session to reason its way out of them, and a sufficiently confident model will.

Where a rule *reverses* an earlier one, say so in the text. Two rules in this spec are explicit reversals, and both would otherwise look like mistakes to a reader encountering them fresh.

## Stage definitions in brief

Full playbooks are in `template/.claude/skills/`. In one line each:

| Stage          | What it is                                                                       | Done when                                          |
| -------------- | -------------------------------------------------------------------------------- | -------------------------------------------------- |
| Groom          | Should this card exist, and is it filed right? Three cards deep, never twenty skimmed | Recommendation posted per card                     |
| Scope          | Idea → spec another session could build from. No code                            | Spec posted, open questions resolved, approved     |
| POC            | Smallest proof the approach works. Throwaway allowed here and only here          | Core mechanic works in one scenario the human sees |
| Implement      | Production code to the project's conventions. Rewrites the POC, doesn't inherit it | Build passes, PR open and linked, reviewable build |
| QA             | The human verifies real behavior on a real target                                | Human confirms; every named failure mode exercised |
| Document       | Write one fragment; edit no shared docs                                          | Fragment complete and ready-to-use                 |
| Ship           | Merge, fold, push, **verify**, advance                                           | Deployed artifact verified to carry the commit     |

## The hotfix question

Earlier versions of this harness had a sanctioned hotfix shortcut: a card that skipped Scope and POC for small, obvious fixes.

The source project dropped it, and what replaced it is better: the `type` label. A `chore` or `polish` card runs the full pipeline — which is cheap when there's nothing to scope and nothing to prove — but skips the feature-history and shipped-list sections at Documentation, and writes no fragment at all when it has nothing durable to say.

That keeps one path instead of two, and it puts the shortcut where the ceremony actually costs something (documentation) rather than where it protects you (scope and proof). **Default to the label approach.** If a user specifically wants a hotfix lane, build it — but tell them what it costs.

## Research spikes

Cards tagged `type/spike` run the same statuses with different meanings: Scope defines the question, POC runs the investigation, Implement writes up findings, QA verifies they're complete, Document preserves anything durable. Spikes don't produce a merged PR unless a throwaway script was needed — commit that to `spike/[slug]`, reference it, don't merge.
