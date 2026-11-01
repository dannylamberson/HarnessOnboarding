---
name: pipeline-groom
description: {{PROJECT_NAME}} pipeline — Backlog grooming. Use whenever {{USER}} says "groom the backlog", "clean up the backlog", "is this card still relevant", "audit the backlog", "next grooming chunk", "triage {{TEAM_KEY}}-nn", or asks to set priorities/estimates/labels across Backlog cards. Runs a deep 3-card chunk: checks each card for redundancy against shipped work, fixes Project/Milestone and type/area labels, assigns estimate and priority from the rubric, posts findings to Linear, and recommends keep / drop / duplicate / advance-to-Scoping. This is the {{PROJECT_NAME}} project.
---

# Pipeline stage 0 — Backlog grooming

Read `docs/pipeline-core.md` first for the Linear team, status table, label groups, Project list, and MCP operations. This file covers only grooming.

Grooming is the stage _before_ Scoping. Scoping asks "how do we build this?" Grooming asks **"should this card still exist, and is it filed correctly?"** A card that survives grooming is safe for `pipeline-scope` to pick up. Grooming never writes code and never touches a branch.

## Chunk size — three cards, deep

Three cards per run, done properly, beats twenty skimmed. Grooming that just rubber-stamps labels is worse than none — it makes a stale backlog look reviewed.

Stop after three and give the run summary. If {{USER}} asks for another chunk, start a new one.

### What counts as "already groomed"

Post a grooming comment on every card you touch, stamped with the date. That comment is the record — a card carrying one from the current pass is groomed; skip it when selecting the next chunk.

### Selection order

1. Cards with no `type` label (unfileable as-is)
2. Oldest `createdAt` first among the rest
3. Skip anything already groomed this pass

## Per card: the four questions

### 1. Is this still relevant?

Check the card's ask against what has actually shipped. The failure mode is a card describing a problem that a later card already solved as a side effect.

- Read the root `CLAUDE.md` shipped list and `docs/feature-history.md`
- Search Linear for cards with overlapping slugs or descriptions

Outcomes: **keep** · **drop** (post why first) · **duplicate** (use `duplicateOf`, never the Dropped status — it keeps the link to the surviving issue)

### 2. Project, Milestone, and type label

Exactly one `type` label. If the card genuinely spans two types, it's two cards.

Assign a Project only when the card actually belongs to one. An unassigned issue is fine; a mis-filed one makes a project's progress bar lie.

### 3. Area labels

Multi-select and flat. Derive them from the paths the card will plausibly touch, via the routing table in `pipeline-document`. Under-labelling is the common error — when a card plausibly touches an area, label it. Nothing routes on these, so being wrong is cheap.

### 4. Estimate and priority

{{ESTIMATE_RUBRIC}}

Priority: reserve the top level for things actively broken in production. A backlog where everything is urgent has no priorities.

## Write it back

Post one comment per card:

```
## Grooming pass — YYYY-MM-DD

**Relevance:** <keep / drop / duplicate of {{TEAM_KEY}}-nn> — <one line why>
**Filing:** type/<x>, areas: <list>, Project: <name or none>
**Sizing:** estimate <n>, priority <level>
**Recommendation:** <keep in Backlog / advance to Scoping / drop>
```

## What you may not do

- Write code, cut a branch, or touch a file outside `docs/`
- Advance a card past Scoping
- Drop a card without posting the reason first and confirming
- Delete anything — Linear has no delete tool for issues or labels; say so and leave it

## Handing off to Scoping

A card is Scoping-ready when it has a `type` label, a clear ask, and no unresolved "is this still needed" question. Recommend the advance; use the standard advance flow in `docs/pipeline-core.md` to actually move it.

## Run summary

End every run with: cards reviewed, outcome per card, and what you'd groom next.
