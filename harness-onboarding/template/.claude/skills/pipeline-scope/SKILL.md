---
name: pipeline-scope
description: {{PROJECT_NAME}} pipeline — the Scope stage. Use whenever {{USER}} picks up an issue sitting in the Linear Scoping status, says "scope this out", "write the spec", "what would this take", "get this ready to build", or asks to advance a card from Scoping to POC. Also use when turning a raw idea into a new Linear issue with a spec attached. No code is written at this stage. This is the {{PROJECT_NAME}} project.
---

# Pipeline stage 1 — Scope

Read `docs/pipeline-core.md` first for the Linear team and status reference, startup routine, card creation and naming, advance templates, and guardrails. This file covers only what's specific to Scope.

## Name the paths before anything else

There's no diff yet, so the honest input is the idea itself. **State out loud which paths the work will touch**, then load the sub-`CLAUDE.md` each one maps to (routing table in `pipeline-document`). That path list does three jobs: it drives the `area-*` labels, it selects the personas to consult, and it is the thing the spec's dependencies section is derived from.

Getting the list wrong is cheap and self-correcting — later stages re-derive it from the real diff. Not making one is expensive.

## What Scope is for

Turning an idea into a spec another session could build from without re-deriving your reasoning. **No code.** If you find yourself writing implementation, you're in POC.

## The spec

Post it as a Linear comment on the issue:

```
## Spec

**Problem** — 1–2 sentences. What's wrong or missing, for whom.

**Success criteria** — concrete and checkable. For visual work, describe the
intended look and behavior, not just "looks good".

**Approach** — the shape of the solution, and the paths it touches.

**Dependencies** — env vars/secrets, other cards, external services, schema.

**Out of scope** — what this card deliberately isn't doing. This is the
section that prevents scope creep at Implementation.

**Open questions** — every one resolved before advancing.
```

## Personas

Consult the ones the path list and the stage rules in `docs/pipeline-core.md` select. Each produces a short notes block appended to the spec — not a rewrite of it.

{{SCOPE_PERSONA_NOTE}}

## Sibling cards

If the issue sits in a Project, read its siblings' descriptions and comments. This is the one stage that does sibling-level reading — it's how shared design decisions get made once instead of three times. The Project/Milestone-level read that applies through to ship is in the startup routine.

## Labels

Scope is **the only stage that can label a card from intent**, since a backlog card has no diff. Apply one `type` and every plausible `area-*`. See `docs/pipeline-core.md`.

## Open questions are blocking

An unresolved open question is the single most common cause of a POC that proves the wrong thing. Resolve every one with {{USER}} before advancing. If a question can't be resolved without building something, that's a `type/spike`, not a feature card.

## Done when

- The spec is posted as a Linear comment
- Every open question is resolved
- `type` and `area-*` labels are set
- {{USER}} has approved the spec
