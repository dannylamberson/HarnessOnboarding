---
name: pipeline-poc
description: {{PROJECT_NAME}} pipeline — the POC stage. Use whenever {{USER}} picks up an issue sitting in the Linear POC status, says "work on the POC", "build a proof of concept", "smoke test this approach", "validate this before I build it", or asks to advance a card from POC to Implementation. Also use when {{USER}} wants a throwaway mockup, a one-off API probe, or a schema change applied just far enough to confirm it works. This is the {{PROJECT_NAME}} project.
---

# Pipeline stage 2 — POC

Read `docs/pipeline-core.md` first for the Linear team and status reference, startup routine, advance templates, and guardrails. This file covers only what's specific to POC.

## Work out what this touches, from paths not labels

**Name the paths the work is expected to touch, before writing code.** At POC there's usually no diff yet, so the honest input is the card's spec — state the expected paths out loud, load the sub-`CLAUDE.md` each one maps to (routing table in `pipeline-document`), and correct the list from `git diff --name-only {{PROD_BRANCH}}...HEAD` as soon as code exists.

## What POC is for

The smallest testable proof the approach works — enough to validate direction, **not** production-ready. A POC that looks shippable is a POC that took too long.

The question a POC answers is "does this approach work at all," not "is this good." Resist polishing.

## What "smallest testable" means, by task type

{{POC_TABLE}}

If the task doesn't fit any row, ask {{USER}} what a reasonable smoke test would be before writing code.

## Throwaway is allowed here, and only here

POC code may be ugly, hardcoded, and uncommitted to the real architecture. Say so explicitly in the commit message (`poc(scope): …`) so nobody later mistakes it for a considered decision. Implementation rewrites it; it does not inherit it.

## Schema and data changes

Apply on a local or throwaway target first, then the shared one. A migration that has only ever run against production has not been tested — it has been deployed.

Confirm the shape before moving on: query it back, don't assume the write succeeded.

## When the POC fails

That's a successful POC. It answered the question. Follow the pivot procedure in `docs/pipeline-core.md`: post a finding explaining why and the new direction, confirm, and set the status back to `Scoping`.

Do not quietly redesign the approach inside the POC stage — the spec is what's wrong, and the spec lives in Scope.

## Done when

- The core mechanic works in at least one real scenario {{USER}} can see
- Findings are posted as Linear comments
- Throwaway code is either committed as clearly-labelled POC work or discarded
- {{USER}} has seen it work
