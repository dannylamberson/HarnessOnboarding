# Pipeline core — shared conventions for every stage

Single source of truth for the facts every `pipeline-*` skill needs: the Linear team, how a session starts, how issues get created and named, how an issue advances, and the guardrails that don't belong to any one stage.

Each stage skill (`pipeline-groom`, `pipeline-scope`, `pipeline-poc`, `pipeline-implement`, `pipeline-qa`, `pipeline-document`, `pipeline-ship`) carries only its own playbook and points here for everything below.

**The editing rule that makes this work:** if you find yourself about to restate a status name, a guardrail, or an advance template inside a stage skill, put it here instead. Seven copies of a fact is seven chances for it to drift.

## Core principles

**One card = one feature = one session.** Bundling multiple issues into a session is the classic cause of tangled, hard-to-debug work. If work starts to feel bundled, stop and split it. Push back if {{USER}} asks to bundle.

This is about _features_, not calendar sessions — a large issue may legitimately span several. When it does: one issue, one branch, all commits on it regardless of session count. At a session boundary that doesn't finish the current stage, commit `wip(scope): description` so state survives, and do **not** advance the issue. The next session reads the issue's current status and the WIP commit, then resumes — it doesn't restart the stage.

**{{USER}} runs QA.** Claude implements; {{USER}} triggers real events and reports what was observed. Never simulate end-to-end results — wait for the report.

**Card tracking is mandatory.** All work ties to a specific issue with a verifiable identifier or URL. Never assume an issue exists, guess its identifier, or proceed without confirmation. No card reference → ask for the URL before starting.

### Session boundaries — default to continuing

Finishing a stage is **not** a reason to end a session. "One card = one feature = one session" means don't bundle _issues_; it never meant one stage per session. Re-reading the issue, `CLAUDE.md`, and the repo in a fresh session costs more than continuing, and an unnecessary handoff loses what this session already knows — what was tried, what was rejected and why. A fresh session then rediscovers it, or silently re-litigates it.

Propose a handoff only at one of these boundaries:

- **Scope just finished and the next stage writes code.** The spec is the handoff artifact.
- **QA is about to start, or QA just ended.** QA is long back-and-forth over real events and burns context fast. Either side of it is a fair place to break — two boundaries, not one.
- **Three or more stages are already done this session.** Permission, not obligation.
- **{{USER}} says the context feels heavy.** They can see the meter; you cannot.

Otherwise: say what you're doing next, and do it.

**One offer per boundary, and it goes in the prose.** Write it as a single sentence immediately before or after the advance-preview block — never inside the block (the `⚠️` line is for flags that need action), never as its own turn, and never as a third `AskUserQuestion` option. If the offer is declined, that boundary is closed; don't re-raise it. The next named boundary is a fresh offer.

**"Pause here" is not a handoff.** In the advance flow below, "Pause here" means hold the advance — there's a correction or something to add before the issue moves. Work continues in this session. A handoff is the opposite: the work stops here and resumes somewhere else. Don't conflate them, and don't turn the two-option advance question into a three-option one.

**Never assert how much context is left.** No tool exposes token or context usage. Don't estimate it, don't cite a percentage, don't say "we're running low." Use the observable boundaries above.

**Don't over-correct.** Never offering a break is worse than over-offering, because the boundaries above are real ones. The goal is a well-placed offer, not zero.

## The Linear team

- Workspace: `{{LINEAR_WORKSPACE}}`
- Team: `{{TEAM_NAME}}`, key `{{TEAM_KEY}}`
- Issues are addressed by identifier (`{{TEAM_KEY}}-42`) and have stable URLs: `https://linear.app/{{LINEAR_WORKSPACE}}/issue/{{TEAM_KEY}}-42/<slug>`

### Workflow statuses (left-to-right pipeline)

| Status         | Type      | Stage skill          |
| -------------- | --------- | -------------------- |
| Backlog        | backlog   | `pipeline-groom`     |
| Scoping        | unstarted | `pipeline-scope`     |
| POC            | started   | `pipeline-poc`       |
| Implementation | started   | `pipeline-implement` |
| QA             | started   | `pipeline-qa`        |
| Documentation  | started   | `pipeline-document`  |
| Shipped        | completed | `pipeline-ship`      |
| Dropped        | canceled  | `pipeline-ship`      |
| Duplicate      | duplicate | —                    |

`Duplicate` is a Linear built-in, not a pipeline stage — it's set by marking an issue a duplicate of another (`duplicateOf` on the save-issue tool), never by moving it there as a status. A card that turns out to be a duplicate goes there instead of `Dropped`, which keeps the link to the surviving issue.

**Refer to statuses by name, never by ID.** Names are stable and readable.

**The rule:** the issue's current status tells you which stage applies, and therefore which stage skill to use. An issue in Implementation → work the Implementation stage. Never skip stages.

**There is no subtask checklist.** The status _is_ the stage. Do not add per-card subtasks mirroring the stages — that creates a second source of truth that can disagree with the status.

### Labels

| Group    | Members                       | Routes anything?                            |
| -------- | ----------------------------- | ------------------------------------------- |
| `type`   | {{TYPE_LABELS}}               | **yes** — the stage checklists branch on it |
| `area-*` | {{AREA_LABELS}}               | **no** — browsing aid only                  |

`type` is an exclusive group — one label per issue, enforced by Linear. It is safe to route on: a card genuinely _is_ one type, and it can't be derived from a diff.

**`area-*` is flat (ungrouped), multi-select, and no harness rule branches on it.** Make it exclusive and it immediately misrepresents reality: a card's reach is plural, so one exclusive label can never represent it. An ungrouped card carries every area it touches — which fixes how it browses in Linear and nothing else. It is **not** safe to route on.

> Measured on the project this harness came from: across 11 shipped merges, the `area` label described only 44% of what cards actually touched, and 5 migration-writing cards missed their required review persona as a result. That's why the rule below exists.

**If a stage needs to know what a card touches, it reads the diff** — `git diff --name-only {{PROD_BRANCH}}...HEAD`, fed into the path routing table in `pipeline-document`. **Never re-key a harness rule back onto `area`.**

There is no `persona` label group. Linear label groups are exclusive by design, and review lenses don't fit that shape — one issue can need several, and some apply by stage rather than by content. Route personas from changed paths plus the stage rules below.

### Persona routing

Personas are review lenses in `docs/personas/`. They are **not** loaded every session — they're consulted at specific moments.

**By changed path** — from `git diff --name-only {{PROD_BRANCH}}...HEAD`, or from the paths the card's spec says it will touch when no code exists yet. Never from a label:

{{PERSONA_PATH_TABLE}}

**By stage, regardless of paths:**

{{PERSONA_STAGE_RULES}}

Paths not listed have no persona mapping — proceed without consulting one unless a stage rule applies.

**Where a persona overlaps a folder's `CLAUDE.md` gotcha, the gotcha is the source of truth** (it's always-loaded for that folder). The persona links to it instead of restating it.

### Projects

A Linear Project groups a multi-issue body of work. It replaces any `[bracket]` suffix in a title. Sequencing lives in the native `blockedBy` relation, not a notes line.

{{PROJECT_TABLE}}

One issue = one session still applies — the Project only groups related issues visually and tells you which issues may share a design doc. An unassigned issue is fine; a mis-filed one makes a project's progress bar lie.

## Linear MCP operations

Tool names vary by install; the operations you need:

- **List issues** — filterable by team, status, label, project
- **Get issue** — pass `includeRelations: true` for comments plus `blockedBy` / `blocks` / `relatedTo`
- **Save issue** (create or update) — handles `state`, `labels`, `project`, `priority`, `estimate`, `blockedBy`, `blocks`, `relatedTo`
- **List/save comments** — specs, PR links, findings, written as plain markdown
- **List statuses**, **list labels**

**There is no delete tool for issues or labels.** Anything requiring deletion is a manual UI step — say so rather than attempting it.

Search works normally in Linear — use it whenever it's faster than filtering by status.

## Startup routine — every session

1. **Read `CLAUDE.md`** in the repo root — source of truth for stack, conventions, gotchas. Do not skip.
2. **Confirm the target issue.** Either {{USER}} named one (identifier, URL, or slug), or ask. If they say "what's next," list issues filtered by the lowest-stage non-Backlog status.
3. **Find the issue:**
   - Identifier or URL given → get issue directly
   - Slug only → list issues filtered to the status you expect it in
   - Not there → **stop and ask for the identifier or URL. Do not guess.**
4. **Tiebreaker when several issues share a status**, in order: (a) blockers first — an issue that blocks another active issue outranks everything; (b) priority, higher first; (c) estimate, smaller first, to ship something quickly; (d) older issue wins (earlier `createdAt`) when nothing else separates them. Say which issue you picked and why.
5. **Read the issue** with `includeRelations: true` (comments + relations). Check its `blockedBy` relation.
6. **Read the containing Project/Milestone, when the issue has one.** Orientation plus a release-grouping signal — never a fact a card depends on; anything the card actually needs lives in the card itself, because a stale Project description would otherwise silently mislead every card under it. Skip entirely when the issue has no Project.

   The read has one job: decide whether this card's Milestone (or the Project's description, if no Milestone) describes an end-state that is **incoherent when shipped partial** — a half-built feature live in prod is worse than none — or whether the card is fine to ship alone. This is a property of that description's actual language ("playable end to end" vs. "ongoing by nature, expect cards to keep arriving"), not of Project membership itself. Getting this wrong in the permissive direction — flagging every chore as hold-worthy — trains {{USER}} to ignore the signal, so read for the actual claim, not a keyword match.

   Carry the conclusion forward silently. It surfaces as a hold candidate at `pipeline-qa` and `pipeline-ship`.

7. **Respect blockers.** If `blockedBy` names another issue, confirm it's in Shipped. If not, stop and say so.
8. **Restate the plan in one sentence** — which issue, which stage, what "done" looks like. Wait for an OK before real work.

## Card creation workflow

Creating an issue is one step — no parent/subtask split:

```
{ title: "card-slug — description", team: "{{TEAM_KEY}}", state: "Backlog",
  labels: ["feature", "area-x", "area-y"], description: "…spec…" }
```

Set `state` to wherever the issue actually starts (usually `Backlog`).

**Apply exactly one `type` label, and every `area-*` label the work is expected to touch.** A card that will reach three areas carries all three. This is the Scope stage's job and it is the only stage that can do it, since a backlog card has no diff to read.

Derive the area set from the spec you just wrote: name the paths the work will touch, then map each through the routing table in `pipeline-document`.

Being wrong here costs nothing — no harness rule reads these, and later stages correct the set from the actual diff. Under-labelling is the more common error; when a card plausibly touches an area, label it.

## Card naming

```
[slug] — [short description]
```

- Slug: kebab-case, ≤30 chars, unique across the team
- Example: `cmd-top — /top command: top artists leaderboard`
- The slug becomes the commit scope, the branch name, and the feature slug in `CLAUDE.md`

## Research spike cards

Some issues are investigations rather than features — the description says "research spike," "feasibility study," or "investigate." Tag them `type/spike`. The same stages still apply, but each means something different:

| Stage          | For a spike                                                                            |
| -------------- | -------------------------------------------------------------------------------------- |
| Scoping        | Define the research question and what answer would let us proceed or close the issue   |
| POC            | Run the investigation — query the data, test the API, read the docs                    |
| Implementation | Write findings up as a Linear comment; if actionable, create a follow-up Backlog issue |
| QA             | Verify the findings are complete and the follow-up issue captures what's needed        |
| Documentation  | Preserve anything durable as a gotcha in the right `CLAUDE.md`; close or drop the issue |

Spikes don't produce a PR unless the investigation needed a throwaway script — in which case commit it to a `spike/[slug]` branch, reference it in the Linear comment, and don't merge it.

## Advancing a card — always confirm first

Never move an issue silently. Show a preview, then ask.

**Standard advance:**

```
Ready to advance "[issue title]":
  ➡️  Status: [Current] → [Next]
  ⚠️  [Flags: env vars to add, manual steps needed]
```

Then `AskUserQuestion` with two options: **"Proceed"** (advance) and **"Pause here"** (stay put).

**Final advance (→ Shipped):** this is the one status change that doesn't stand alone — `pipeline-ship` owns the mechanics and its preview is richer. Use `pipeline-ship`'s template whenever an issue is actually being shipped. **Its single "Ship it" confirmation covers the whole sequence — merge, push, verify the build, and the status update. Don't run a second `AskUserQuestion` before touching Linear** — that's a duplicate prompt for a decision already made, not a second real checkpoint.

**On selection:**

- **Proceed / Ship it:** update the issue's `state` to the next status. Linear's `completed` type marks it done automatically — there's no separate "mark complete" step.
- **Pause here / Hold:** don't move the issue. Hear the correction, then keep working. This holds the advance, not the session.
- **Anything typed in "Other":** post it as a comment first, then proceed (assume they meant Proceed).

## Pivots and drops

**POC proves the approach won't work** — pivot back to Scoping:

1. Post a finding comment explaining why and the new direction.
2. Confirm.
3. Set status to `Scoping`.

**Bug found during QA** — stay in QA; don't move the issue backward. Fix in the branch, redeploy, re-test.

**Dropping a card:**

1. Post a comment explaining why, so the reasoning survives.
2. Preview: "Ready to drop `[issue title]` — move to Dropped."
3. `AskUserQuestion` with **"Drop it"** / **"Keep it"**.
4. On "Drop it": set status to `Dropped`.

## Capturing findings

When work turns up something worth preserving, post it as a comment on the issue immediately, in the form **Finding → Source → Implication**. Worth capturing: observed rate limits, workarounds applied, decisions and their reasoning, unexpected dependencies, useful links.

The fixed shape is what makes a finding foldable into a context file later instead of stranded in comment history.

If a finding invalidates the whole approach, confirm the new direction and follow the pivot procedure above.

## Universal guardrails

1. **One card per session.** Push back on bundling.
2. **Card reference is mandatory.** Verifiable identifier or URL, always.
3. **Don't skip stages.** Every status, even the trivial ones.
4. **Respect `blockedBy`.** Stop if the blocker isn't Shipped.
5. **Read `CLAUDE.md` first.** Every session.
6. **Confirm before advancing** any issue's status.
7. **Capture findings** as Linear comments whenever something non-obvious is learned.
8. **{{USER}} runs QA.** Never simulate end-to-end results.
9. **Secrets never ship to the client.** Read them server-side. Every new env var goes in `.env.example` and must be added to the runtime environment and CI secrets store.
10. **Don't push `{{PROD_BRANCH}}` until {{USER}} signs off.** {{DEPLOY_NOTE}}
11. **Verify production actually rebuilt before calling anything shipped.** A green CI run and a clean push are not proof — the host's build can still fail and publish nothing. See `pipeline-ship`.
12. **Rebase before merging if `{{PROD_BRANCH}}` moved.** `git fetch origin {{PROD_BRANCH}} && git rebase origin/{{PROD_BRANCH}}`.
13. **Documentation writes a fragment, not the shared docs.** One file per card under `docs/changes/`, folded at ship. See `pipeline-document` and `docs/changes/README.md`.

{{PROJECT_GUARDRAILS}}

## Git workflow

1. **Cut the branch from `{{PROD_BRANCH}}`** — `git checkout -b feature/<slug> {{PROD_BRANCH}}`. Never from the integration branch's tip: a branch cut from there has every other in-flight feature as an ancestor, which makes it impossible to ship one without the rest.
2. Stage specific files only — never `git add -A` or `git add .`
3. Commit format: `type(scope): description`, scope = card slug
4. Push the branch
5. Open a PR with `gh pr create` — body must include the Linear issue URL. The URL, or a bare `{{TEAM_KEY}}-42`, in the PR title or body is what auto-links the PR to the issue in Linear. Since the branch name doesn't carry the issue ID, this is the only linking mechanism. Don't skip it.
6. Post the PR URL as a comment on the issue
7. {{INTEGRATION_STEP}}

Never skip hooks (`--no-verify`), never `--amend` after a failed hook — fix it and make a new commit. Never force-push a feature branch or `{{PROD_BRANCH}}`.
