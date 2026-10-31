---
name: {{SLUG}}-pipeline
description: "Workflow guide for building {{PROJECT_NAME}} ({{ONE_LINE}}) through a five-stage pipeline (Backlog, Scoping, POC, Implementation, QA, Documentation, Shipped) on {{BOARD}}. Use whenever {{OWNER}} wants to pick up a task, work on the next card, advance a stage, move a card forward, asks what's next on {{PROJECT_NAME}}, mentions a card slug or {{ISSUE_PREFIX}}-number, wants a quick hotfix to the live app, wants to change the harness or the docs, or talks about the {{REPO}} repo, its hosting, its data or {{PROJECT_NAME}} generally. Enforces one card per session, sketches before code, the hotfix and maintenance paths, delegation to cheaper models, and how to update the board and the repo after each stage."
---

# {{PROJECT_NAME}} pipeline

{{ONE_LINE}}. Goal: {{GOAL}}.

This skill is the team playbook. Every session is a new engineer's first day: this file says how the team works, and
the `CLAUDE.md` files say what has been built. {{OWNER}} is the product owner and the customer. Each idea is one card
on {{BOARD}}. Cards flow through five fixed stages, one card per session.

## Stack

The stack, URLs, IDs and commands are in root `CLAUDE.md`.

## Core principles

- **One card = one feature = one session.** Push back on bundling, even "small" extras.
- **See it before it's built.** New UI is sketched at Scope and {{OWNER}} picks before the spec is signed off.
- **{{OWNER}} runs QA** on the QA site (`{{QA_BRANCH}}`), then reports back. Never call it done off a green build.
- **Confirm before advancing** a card or doing anything bulk, destructive or outward-facing.
<!-- if:delegation -->
- **Opus plans and reviews; Sonnet builds; Haiku checks** (`references/delegation.md`).
<!-- endif -->
- **Knowledge compounds:** the Document stage writes findings back into the most specific `CLAUDE.md`.

## Pipeline stages

| Board status | Work in this stage | Meaning |
| --- | --- | --- |
| Backlog | (not started) | Captured idea |
| Scoping | Scope | Spec the idea, sketch any new UI |
| POC | POC | Smallest proof it works |
| Implementation | Implement | Production build, PR, preview |
| QA | QA | {{OWNER}} tests the QA site |
| Documentation | Document | Write knowledge back |
| Shipped | (done) | Live and documented |
| Dropped | (abandoned) | Superseded or infeasible |

**The card's status is the single source of truth** for which stage to work on. Every stage leaves a comment on the
card (spec, POC result, PR link, QA sign-off, docs touched), so its comments are the paper trail. Never skip stages.
Card title: `slug — short description` (kebab-case slug, 30 characters or fewer, unique). The slug is the branch, the
commit scope and the feature's name in the docs.

## Labels and personas

Cards carry `area-*` labels for what they touch and a `persona-*` label for each review lens consulted. **Labels are
hints; paths decide.** Scope applies labels from the paths it names. Implement and QA compare the diff
(`git diff --name-only {{PROD_BRANCH}}...HEAD`) with the labels and fix them. Choose personas by union: the
`persona-*` labels, the path rules in `docs/personas/README.md`, and that file's stage rules. A missing label never
excludes a persona. Personas raise questions; {{OWNER}} decides, and `CLAUDE.md` wins where they overlap.

## Startup routine (every session)

0. Run `node "${CLAUDE_PLUGIN_ROOT}/hooks/harness-check.mjs"` (unexpanded: `node .claude/hooks/harness-check.mjs`). A
   MISS gets its offers as buttons, never a silent fallback.
<!-- if:delegation -->
1. Start with `claude --agent pipeline-lead --effort high`. In the desktop app, pick Opus and high effort by hand.
<!-- endif -->
2. Confirm the target card. If asked "what's next," take the card furthest along that isn't Shipped. If nothing is in
   flight, propose the top Backlog card.
3. Read the card (description, comments, labels). Respect any "Blocked by:".
4. Restate the plan in one sentence and wait for {{OWNER}}'s OK.

## Per-stage playbook

### 1. Scope
No app code. First **state which paths the work will touch**, as a one-line list: it drives the labels, the personas
and the spec's dependencies. Apply the matching `area-*` labels, choose the personas, and run each one's Scope
questions against the idea. Anything they raise that {{OWNER}} didn't mention is an open question for them.

<!-- if:ui -->
**New UI gets sketched before sign-off:** throwaway HTML, options side by side, so {{OWNER}} picks by looking, not by
reading (`references/sketches.md`). Skip it only when the card reuses existing UI, and say so in the spec.

<!-- endif -->
Post a spec comment on the card:
- Problem (1–2 sentences)
- Success criteria: concrete, and for UI what {{OWNER}} should see and tap. Fold in what the personas added.
<!-- if:database -->
- Data: new tables or columns, and the access rule for each
<!-- endif -->
- Dependencies: env vars, other cards, external services
- Persona notes: one block per persona, in the shape its file gives. "QA to carry forward" lines feed QA's script.
- Open questions, including the personas'
<!-- if:ui -->
- Sketch: {{OWNER}}'s pick with a screenshot, or `Sketch: waived (reason)`
<!-- endif -->

Add a `persona-*` label for each persona consulted. Done when the spec is posted, every question is resolved, and
{{OWNER}} approves.

### 2. POC
The smallest testable proof, run locally. What it looks like for each kind of task is in `references/poc.md`.
<!-- if:ui -->
A new screen builds the approved sketch with the real components; new UI with no Sketch line gets sketched first.
<!-- endif -->
If the task doesn't fit, ask {{OWNER}} what a reasonable smoke test is before writing code. Done when the core
mechanic works in one real scenario {{OWNER}} can see.

### 3. Implement
Production code following `CLAUDE.md`'s conventions, which win if they conflict with this skill.
<!-- if:delegation -->
- **Opus plans, Sonnet builds.** Post the plan on the card, delegate the build to `builder`, review it with the
  checklist in `references/delegation.md`, then open the PR.
<!-- endif -->
- **Secrets stay server-side.** A secret in client code or a client-exposed env var is a bug: stop and flag it. New
  env vars go in `.env.example`, and {{OWNER}} gets a reminder to set them in hosting (and CI, if it reads them).
<!-- if:database -->
- **Migrations are additive only:** new tables and nullable columns, each with its access rules. A destructive
  change gets its own later card, run once no deployed code uses the old shape.
<!-- endif -->
- **Personas:** read the *Build defaults* of each selected persona before writing. If the diff selects a persona the
  spec didn't consult, consult it now.
- Branch `slug`, cut from `{{PROD_BRANCH}}`, never from `{{QA_BRANCH}}`. {{PREVIEW}}. Never deploy to production here.
- Unfinished session: commit `wip(slug): ...`, push, and don't advance the card.

Done when `{{GATE_CMD}}` passes, a PR is open with the card linked, the PR link is on the card, and the preview is green.

### 4. QA
The detail is in `references/qa.md`. In short:
<!-- if:database -->
1. Apply any new migration to the hosted database (`{{DB_PUSH_CMD}}`), **after confirming with {{OWNER}}**: it
   touches production data. Run the `db` persona's checks before and after.
<!-- endif -->
2. Put the branch on the QA site (`{{QA_URL}}`, branch `{{QA_BRANCH}}`), confirm the build shows the latest SHA, and
   share the URL plus which branches it holds.
3. Run the checks Claude can do itself first and fix what they find. Then send {{OWNER}} a short numbered test script
   with a pass condition for each line, built from the success criteria, the personas' "QA to carry forward" lines
   and their standing checks. Say what Claude checked and what it couldn't.
4. Wait for {{OWNER}}'s report. On a bug, stay in QA: fix on the same branch (`fix(slug): ...`), put it back on the QA
   site, and say what to re-check.
5. After sign-off: rebase if `{{PROD_BRANCH}}` moved, merge the PR, confirm production ({{PROD_URL}}) shows the new
   build, then rebuild `{{QA_BRANCH}}`.

Done when {{OWNER}} signs off on the QA site, the PR is merged, and production is live.

### 5. Document
<!-- if:delegation -->
1. **Brief.** Write what a cold subagent can't know: the card, what changed, the decisions and who made them, new
   gotchas, known gaps.
2. **`doc-writer`** (Sonnet) takes the brief and the diff, edits the most specific files per root's context map, and
   adds the card to root › Shipped and `docs/shipped.md`.
3. **`context-check`** (Haiku) runs `node .claude/scripts/context-size.mjs` and looks for duplicated lines.
4. **Over budget or a broken pointer:** send `doc-writer` back once. Still failing: ask {{OWNER}}.
5. **Read the doc diff** before committing. It's your card; the subagents only wrote it down.
<!-- endif -->
<!-- if:!delegation -->
Update the most specific file per root's context map, add the card to root › Shipped and `docs/shipped.md`, and run
`node .claude/scripts/context-size.mjs`.
<!-- endif -->
6. **Audit due:** when the context check reports enough ships since the last audit, run `context-audit` after this
   card's docs merge. Its fixes need {{OWNER}}'s yes and go in a maintenance PR.

Also update `.env.example`, and `README.md` if fresh-clone setup changed. Done when the context check passes and the
docs are merged, or {{OWNER}} confirms none are needed.

## Hotfix path
Small, low-risk, unambiguous product fixes skip Scope and POC (`references/hotfix.md`). Never hotfix auth, data
access rules, migrations, secrets, or deploy config.

## Maintenance path
Changes to the harness or the docs (this skill, its references, agents, hooks, `CLAUDE.md` files, a context audit's
fixes) are **one PR, not a card**: a branch, the change, a review by {{OWNER}}, a merge (`references/maintenance.md`).

## Advancing a card (confirm first)
Use `AskUserQuestion` with buttons (**Proceed** / **Pause** / **Yes, and…**) to preview the move:

```
Ready to advance "slug — ...":
  - Stage summary comment: [one line on what this stage produced]
  - Move: [current status] -> [next status]
  - Flags: [env vars to set, a migration to push, manual steps]
```

On OK, post the stage summary comment and change the card's status. **Pivot:** if the POC shows the approach won't
work, post a finding and a `[PIVOT]` note, confirm, and move the card back to Scoping. **Drop:** post the reason,
confirm, and move it to Dropped. Research spikes: `references/spikes.md`.

## Git workflow
Stage specific files only, never `git add -A` or `git add .`. Commits are `type(slug): description` (feat, fix,
chore, docs, wip). Push the branch and open a PR whose body links the card, then post the PR link on the card. Merge
to `{{PROD_BRANCH}}` only after {{OWNER}} signs off. Never skip hooks, force-push `{{PROD_BRANCH}}`, or amend after a
failed hook. `{{QA_BRANCH}}` is disposable: branches merge into it with `--no-ff`, it's rebuilt from
`{{PROD_BRANCH}}` after each ship, and it's never merged anywhere.

## Guardrails
1. One card per session. Push back on bundling.
2. Don't skip stages, even when they're trivial.
3. Respect "Blocked by:".
4. Read `CLAUDE.md` first, every session.
5. Secrets stay server-side.
6. QA happens on the QA site. Production only after {{OWNER}} signs off.
7. Confirm before advancing, pushing a migration, or anything bulk, destructive or outward-facing.
8. {{OWNER}} runs QA. Never declare UI good off a build alone.
9. Document in the most specific file. Capture non-obvious findings as card comments as you go.
10. Personas raise questions and {{OWNER}} decides. They never override `CLAUDE.md`.
