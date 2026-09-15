---
name: pipeline-document
description: {{PROJECT_NAME}} pipeline — the Documentation stage. Use whenever {{USER}} picks up an issue sitting in the Linear Documentation status, says "document this feature", "update the context files", "update CLAUDE.md for this", "write the change fragment", or "tick the feature off the shipped list". Also use when deciding which sub-CLAUDE.md a newly merged change belongs in. This stage hands off to `pipeline-ship` for the actual Documentation to Shipped move — don't use this skill for "ship it" requests. This is the {{PROJECT_NAME}} project.
---

# Pipeline stage 5 — Document

Read `docs/pipeline-core.md` first for the Linear team and status reference, startup routine, advance templates, and guardrails. This file covers only what's specific to Documentation.

## Start from the diff, not the labels

**`git diff --name-only {{PROD_BRANCH}}...HEAD` is the input to this stage.** It names what the card actually touched; route everything below off it. Labels are a browsing aid and describe the work incompletely by design.

## What Documentation is for

Writing knowledge back so the next card starts smarter than this one. This is the loop that makes the harness compound — treat it as part of the feature, not an afterthought.

## Context file routing

This table is the canonical path map for the whole harness. Every other stage points here.

{{PATH_ROUTING_TABLE}}

**Document in the most specific place.** Only touch the root `CLAUDE.md` for genuinely project-wide rules, a new cross-cutting gotcha, or the shipped list. A root file that accumulates folder-specific detail gets read on every session and pays for itself once.

## Write a fragment, not the shared docs

**This stage edits none of the shared context files.** It writes exactly one new file:

```
docs/changes/<CARD-ID>-<slug>.md      e.g. docs/changes/{{TEAM_KEY}}-61-best-of-hm-links.md
```

`pipeline-ship` folds every pending fragment into the shared docs at release and deletes them in the same commit.

**Why:** if every card's Documentation pass edits the same handful of shared files, every in-flight branch collides with every other *by construction*. A unique filename per card gives zero doc conflicts with no claims and no locks. Format and lifecycle: `docs/changes/README.md`.

## What belongs in a fragment

Durable knowledge, not a changelog entry. The test is whether a future session would be worse off not knowing it:

- **Gotchas** — the non-obvious thing that cost time. These are the highest-value lines in the whole harness.
- **Decisions and their reasoning** — especially anything that reverses an earlier rule. Say it reverses it, so nobody "corrects" it back.
- **New patterns** other code should follow
- **Contracts** — new env vars, new endpoints, changed shapes

What does *not* belong: a restatement of the diff, or prose that the code already says clearly.

## Chores and polish

`type/chore` and `type/polish` cards skip the feature-history and shipped-list sections of the fragment. A chore with nothing durable to say writes **no fragment at all** — that's a valid outcome, not a skipped step.

## Checklist

- [ ] Ran `git diff --name-only {{PROD_BRANCH}}...HEAD` and derived the target list from it
- [ ] Wrote `docs/changes/<CARD-ID>-<slug>.md` with frontmatter naming its fold targets
- [ ] New env vars recorded in the fragment's `env` list and present in `.env.example`
- [ ] Noted whether the README needs a setup change for a fresh clone
- [ ] Edited **none** of the shared context files directly

## Done when

- The fragment exists, is complete, and is written ready-to-use rather than as notes to rewrite later
- Nothing shared was edited
- The issue is ready for `pipeline-ship`
