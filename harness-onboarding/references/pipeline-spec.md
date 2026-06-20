# The harness — canonical, tool-agnostic spec

This is the reference definition of the pipeline harness. It names no specific
vendors. When you generate a `[slug]-pipeline` skill, you embed a *customized*
version of this — same principles, the user's actual tools and commands swapped in.

Read this before interviewing so you understand what you're building toward.

## Contents

- The two halves of the harness
- The pipeline stages
- Core principles
- Per-stage definitions
- The hotfix path
- Advancing a card
- QA failures and pivots
- Dropping a card
- Research spikes
- Capturing findings
- Git workflow
- Card naming
- Guardrails

## The two halves of the harness

**1. Persistent context.** The AI starts every session cold. Two artifacts give it memory:

- **The skill** — the generated `[slug]-pipeline` skill, which encodes *how to work this project*: the stages, the rules, where things live. It's standing instructions, read whenever the skill triggers.
- **Context files** — one root `CLAUDE.md` plus scoped sub-`CLAUDE.md` files in the folders they describe. These capture *what the project is*: stack, conventions, decisions, and a running list of what's shipped. The AI reads them at the start of a session so it works as if it had been on the team all along.

**2. The pipeline.** Every idea becomes a card on a task board. Cards flow left to right through fixed stages. The board's columns/sections are the stages; the card's current column tells you which stage to work on.

## The pipeline stages

| Stage (board section) | Subtask the AI works on | Meaning |
| --- | --- | --- |
| Backlog | (not started) | Captured idea, not yet picked up |
| Scoping | 1. Scope | Turn the idea into a small spec |
| POC | 2. POC | Smallest proof the approach works |
| Implementation | 3. Implement | Production build |
| QA | 4. QA | Human reviews on a preview target |
| Documentation | 5. Document | Write knowledge back into context files |
| Shipped | (done) | Live and documented |
| Dropped | (abandoned) | Superseded or infeasible |

Every parent card carries the same five subtasks in order: `1. Scope`, `2. POC`,
`3. Implement`, `4. QA`, `5. Document`. **Never skip stages** — the column the card
sits in is the single source of truth for what to do next.

## Core principles

**One card = one feature = one session.** Don't bundle multiple cards into a single
session — bundling is the classic cause of tangled, hard-to-debug work. If a task
starts to feel bundled, stop and split it. Push back if the user asks to bundle.

**The human runs QA.** The AI implements; the human triggers real behavior on a real
preview and reports what they saw. Never simulate end-to-end results or call something
done because a build passed. Wait for the human's report.

**Confirm before advancing.** Moving a card between stages, and any bulk or destructive
action, gets a one-line preview and an explicit OK first.

**Knowledge compounds.** The Document stage exists so the next card is easier than the
last. Treat documentation as part of the feature, not an afterthought.

## Per-stage definitions

### 1. Scope

No code. Translate the card's notes into a short spec, posted as a comment on the card:

- Problem statement (1-2 sentences)
- Success criteria (concrete; for visual work, describe the intended look/behavior)
- Dependencies (env vars/secrets, other cards, external services)
- Open questions

Resolve every open question with the user before marking Scope done.
**Done when:** the spec is posted, questions are answered, and the user approves.

### 2. POC

The smallest testable proof the approach works — enough to validate direction, not
production-ready. What "smallest" means depends on the work; a few patterns:

| Task type | POC looks like |
| --- | --- |
| New page or UI section | Static mock of the layout, reviewed locally; content can be placeholder |
| Visual/styling change | Apply to one representative component, eyeball the direction |
| Third-party embed | Drop it on a throwaway page; confirm it loads with no console errors |
| New API route / function | Write it, run locally, hit it once, confirm the response shape |
| Schema/data change | Apply on a branch/throwaway target; confirm the shape |
| External API integration | A throwaway script that makes one real call and logs the result |
| Migration / infra | Validate the mechanism on a non-production target first |

If the task doesn't fit, ask the user what a reasonable smoke test would be before writing code.
**Done when:** the core mechanic works in at least one real scenario the user can see.

### 3. Implement

Production code, following the project's conventions (which live in `CLAUDE.md` — read
it first and let it win). General rules to carry into any generated skill:

- Keep components small and colocated; shared logic in a `lib/`-style folder.
- **Secrets never ship to the client.** Read them server-side; never embed keys in
  client code or public env vars. Stop and flag if a secret heads to the browser.
- Every new env var goes in `.env.example`, and the user is reminded to add it wherever
  the runtime and CI read secrets.
- Decide deliberately whether new content belongs in code or in a CMS/data source.
- Instrument meaningful user actions with an analytics event if the project has analytics.
- Build on a feature branch and let the hosting platform produce a **preview deploy**;
  never deploy to production during Implement.
- If a session doesn't finish, commit `wip(scope): ...`, push, and resume next session.
  Don't advance the card on a WIP session.

**Done when:** the build (and lint/tests, if any) pass, env vars are in `.env.example`,
a PR is open with the card linked, the PR link is posted on the card, and the branch's
preview deploy is live for review.

### 4. QA

The human reviews the **preview/staging target**, not production. The AI's job:

1. Confirm the preview reflects the latest push and share the exact URL.
2. Tell the user precisely what to check — pages, interactions, responsive/mobile,
   edge cases named in the card, failure modes to probe.
3. Wait for the report.
4. On a bug: fix in the same branch (`fix(scope): ...`), push so the preview rebuilds,
   say what to re-check. Repeat until the user signs off.
5. After sign-off: rebase if the production branch moved, merge to production, confirm
   the production deploy went out.

**Done when:** the user confirms on the preview, the PR is merged, and production is live.

### 5. Document

Update the most specific context file that covers the change. Precise, scoped docs —
not one growing root file.

| Changed area | File to update |
| --- | --- |
| A specific folder's code | that folder's `CLAUDE.md` |
| Cross-cutting / project-wide | root `CLAUDE.md` |

Only touch the root `CLAUDE.md` for project-wide rules, a new gotcha, or to tick the
feature off a "Shipped" list. Add new env vars to `.env.example`; update the README if
setup changed for a fresh clone.
**Done when:** the relevant context files are updated (or confirmed as needing none).

## The hotfix path

The five stages are for *features* — things that benefit from a spec, a proof, and a
deliberate content decision. Small, obvious fixes don't need that ceremony. The hotfix
path is the sanctioned shortcut: **a card is still created for the paper trail, but it
has no subtasks and skips Scope/POC.**

Use a hotfix only when the change is small, low-risk, and unambiguous — a copy/typo fix,
a wrong link, a small style correction, an alt-text tweak, a content fix, a dependency
bump, a one-line bug fix. Do **not** hotfix anything new or significant, a new
page/section, or anything touching secrets, auth, DNS, deploy config, or data schema —
those run the full pipeline. The fix still goes through a PR, a preview, and the human's
QA before merge. If a hotfix starts sprawling, convert it to a normal card.

## Advancing a card — always confirm first

Show a one-line preview, then wait for the OK:

```
Ready to advance "[card]":
  - Mark subtask "[N]. [name]" complete
  - Move: [current stage] -> [next stage]
  - [Any flags: env vars/secrets to add, manual steps]
Proceed?
```

On confirmation: mark the subtask complete, move the card to the next section, and on
the final advance also mark the parent card complete and move it to Shipped.

## QA failures and pivots

**Bug found in QA** — stay in QA, don't move the card backward. Post a finding (what
broke → what changes), fix in the branch, push, tell the user what to re-check.

**POC proves the approach won't work** — pivot back to Scoping. Post a finding
explaining why, add a `[PIVOT]` note with the new direction to the card, confirm with
the user, then move the card back to Scoping.

## Dropping a card

When a feature is superseded or infeasible: post a comment explaining why, confirm, then
move the card to Dropped and mark the parent complete. Leave the subtasks as-is so the
history stays readable.

## Research spikes

Cards marked "research/investigate/feasibility" still use the five subtasks, but they
mean: Scope = define the question; POC = run the investigation; Implement = write up
findings (and create a follow-up card if actionable); QA = confirm findings are
complete; Document = preserve anything worth keeping in `CLAUDE.md`. Spikes don't
produce a merged PR unless a throwaway script was needed (commit to a `spike/[slug]`
branch, reference it, don't merge).

## Git workflow

1. Stage specific files only — never `git add -A` / `git add .`
2. Commit `type(scope): description` — scope = the card slug
3. Push the feature branch (the platform builds a preview)
4. Open a PR whose body links the card; post the PR link back on the card
5. QA happens on the preview; production deploys when the PR merges

Never skip hooks, never force-push shared branches, never `--amend` after a failed
hook — fix and make a new commit. Rebase onto the production branch before merging if it
moved.

## Card naming

Slug-first: `[slug] — [short description]`. Slug is kebab-case, unique, ≤ 30 chars. The
slug becomes the commit scope and the feature's name in `CLAUDE.md`. Propose a slug and
confirm before creating a card.

## Guardrails

1. One card per session. Push back on bundling.
2. Don't skip stages — all five, even when trivial.
3. Respect blockers — if a card says "Blocked by: X", stop unless X is shipped.
4. Read `CLAUDE.md` first, every session.
5. Secrets stay server-side; flag any heading client-side.
6. Preview for QA; production only after the human signs off.
7. Confirm before advancing a card or doing anything bulk/destructive.
8. The human runs QA — never declare a visual/interactive feature good off a build alone.
9. Document in the most specific `CLAUDE.md`, not the root.
10. Capture non-obvious findings as card comments as you learn them.
