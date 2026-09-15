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

Goal numbers, measured by `wc -c` of the loaded markdown.

| Surface                   | Target                | Loaded when                      |
| ------------------------- | --------------------- | -------------------------------- |
| Root `CLAUDE.md`          | ≤ {{ROOT_BUDGET}}     | Every session                    |
| {{SUB_CLAUDE_BUDGETS}}    |                       |                                  |
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

**Why the split:** a monolithic pipeline skill reloads *in full on every invocation*, not once per session. On the project this harness came from, the monolith was 21,346 chars; the split stage skills are 3.5–4.7K each.

**Rule for edits: never restate a shared fact inside a stage skill.** Seven copies is seven chances to drift.

⚠️ **`.claude/` is normally gitignored wholesale**, which would leave these skills untracked and absent from every other clone. This repo's `.gitignore` uses exclude-contents-then-negate, because git will not descend into an excluded directory. **If you add another authored skill, it needs its own negation line or it will silently not be tracked.**

---

## Known harness debt

Tracked here so it doesn't get lost. Each item should eventually become a Linear issue or be consciously deferred.

{{HARNESS_DEBT}}

---

## Review cadence

Review this doc at the start of any session where the last review was more than 4 weeks ago, or before any major refactor of the harness shape.

**Last full audit:** {{DATE}} — initial setup.
