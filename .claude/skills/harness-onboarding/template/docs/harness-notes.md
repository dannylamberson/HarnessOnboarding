# Harness notes — how the context is shaped

**Created:** {{DATE}}
**Purpose:** Living document for harness and context decisions. Updated whenever the harness shape changes.

---

## Why this document exists

Claude's effectiveness on this project is bottlenecked by how much of the *right* context lands in the model's window at the right time. Two failure modes are equally bad:

1. **Too little context** — Claude misses a load-bearing constraint and ships a regression.
2. **Too much context** — `CLAUDE.md` becomes a wall of feature history that gets read on every session, eating budget better spent on actual code.

This doc tracks how the harness is shaped to avoid both.

---

## Token budget targets

Goal numbers, measured by `node .claude/scripts/context-size.mjs` (LF bytes, as git stores them; it also checks every
pointer). The numbers it enforces live in `.claude/harness.json` › budgets; keep this table and that file in step.

| Surface                   | Target                | Loaded when                      |
| ------------------------- | --------------------- | -------------------------------- |
| Root `CLAUDE.md`          | ≤ {{ROOT_BUDGET}}     | Every session                    |
| {{SUB_CLAUDE_BUDGETS}}    |                       |                                  |
| `.claude/skills/pipeline-*/SKILL.md` | ≤ 12,000 each | When its stage runs |
| `docs/pipeline-core.md`  | ≤ 24,000              | Every stage                      |
| `docs/feature-history.md` | unbounded             | Only on explicit request         |
| On-demand docs            | unbounded             | On demand                        |

If any file exceeds its target, that is the signal to split it — not to compress the prose. **Intact gotchas at a slightly higher char count beat fuzzy ones at a lower one.**

### How to split, in order of preference

1. **Move reference catalogs to on-demand docs.** Inventories, per-item contracts, API surfaces — anything you look *up* rather than need to *know*. What stays behind is rules and gotchas, which is the load-bearing content.
2. **Add a second axis** once one exists. If your project has a dimension that cuts across folders — a mode, a tenant type, a platform — a card in that dimension usually touches several folders at once, so one cross-layer doc beats several folder-scoped sections. Give a new dimension its own doc from the start rather than letting it accrete.
3. **Move stale narrative to `docs/feature-history.md`.** History is worth keeping and not worth loading.

Splitting is lossless relocation, never deletion. Verify fact-by-fact against the pre-edit version, not just by char count, and leave a pointer behind.

---

## What lives where

These rules govern any future addition to the harness.

### Root `CLAUDE.md`

Project description · stack · repo layout · commands · env var inventory (names only) · rules that apply across every layer · post-task checklist · deployment · pointers to sub-files and key docs · feature list (slug + status only) · genuinely cross-cutting gotchas

### Sub-`CLAUDE.md` (one per folder that has its own conventions)

Rules and gotchas for that folder only. If a fact is only true inside one folder, it belongs there — where it is loaded exactly when relevant and costs nothing the rest of the time.

{{SUB_CLAUDE_CONTENTS}}

### On-demand docs

Reference material you look up rather than need loaded: per-item contracts, full API inventories, wiring detail, design token catalogs.

---

## Persona usage rules

Personas live in `docs/personas/`. They are explicitly **not** loaded every session — they are consulted at the stages named in `docs/pipeline-core.md`.

{{PERSONA_RULES}}

**If a persona's content overlaps a sub-`CLAUDE.md` gotcha, the gotcha is the source of truth** (it is always-loaded for the relevant folder). The persona links to it instead of restating it.

---

## Pipeline shape

The pipeline lives in the repo, not in a user-installed skill:

1. **`docs/pipeline-core.md`** — the source of truth. Linear team/status reference, startup routine, card creation and naming, advance/pivot/drop templates, guardrails, git workflow.
2. **`.claude/skills/pipeline-*/SKILL.md`** — one stage playbook each, pointing at pipeline-core for everything shared.
<!-- if:delegation -->
3. **`.claude/agents/`, `.claude/hooks/`, `.claude/harness.json`** — the subagents (Opus leads; Sonnet builds and writes
   docs; Haiku checks) and the guard hooks that stop them pushing or deploying (`docs/delegation.md`).
<!-- endif -->
4. **`.claude/.claude-plugin/` and `.claude-plugin/marketplace.json`** — `.claude/` is also a Claude Code plugin, installed
   once per machine from its own clone. It loads **in place** from the clone, so it can't drift from the repo: it's
   the same files, registered from any start folder, with the guard hooks live (`docs/harness-plugin.md`).

**Why the split:** a monolithic pipeline skill reloads *in full on every invocation*, not once per session. On the project this harness came from, the monolith was 21,346 chars; the split stage skills are 3.5–4.7K each.

**Rule for edits: never restate a shared fact inside a stage skill.** Seven copies is seven chances to drift.

⚠️ **`.claude/` is normally gitignored wholesale**, which would leave these skills untracked and absent from every other clone. This repo's `.gitignore` uses exclude-contents-then-negate, because git will not descend into an excluded directory. **If you add another authored skill, it needs its own negation line or it will silently not be tracked.** The same
goes for the harness's other tracked parts: `agents/`, `hooks/`, `scripts/`, `.claude-plugin/` and `harness.json` each
have a negation line.

---

## Maintenance path

Changes to **how the team works**, and to the docs themselves, aren't product features, so they're **one PR, no card**:
the stage skills, this file, `docs/harness-notes.md`, the agents and hooks, `.claude/harness.json`, a context
audit's picked fixes, a split of a file that went over budget, a playbook tweak learned on a card.

1. Branch `harness/<topic>` or `docs/<topic>` from `{{PROD_BRANCH}}`.
2. Make the change in the main session. Moving docs can go to `doc-writer`.
3. Run `node .claude/scripts/context-size.mjs`. For a hook or script change, also run it once by hand with a sample input.
4. Open the PR with what changed and why; {{USER}} reviews it and it merges on their OK. A changed agent or hook reaches
   only **new** sessions, so say so in the PR.
5. Add a line to `docs/harness-notes.md` › Known harness debt if the change leaves something undone.

A change that alters what the app does, even in a doc-like file (copy users see, a config the app reads, a seed), is
product work: a card, with a `type` label. `chore` and `polish` cards are the shortcut for small product fixes.

---

## Known harness debt

Tracked here so it doesn't get lost. Each item should eventually become a Linear issue or be consciously deferred.

{{HARNESS_DEBT}}

---

## Review cadence

Review this doc at the start of any session where the last review was more than 4 weeks ago, or before any major refactor of the harness shape.

**Last full audit:** {{DATE}} — initial setup.

The context check counts ships since the date on the line above (`**Shipped:**` dates in `docs/feature-history.md`),
and says an audit is due at `.claude/harness.json` › auditEvery. Record each audit by updating that line and adding
its headline below it. The `context-audit` agent runs one.
