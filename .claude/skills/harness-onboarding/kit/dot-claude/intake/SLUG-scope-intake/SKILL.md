---
name: {{SLUG}}-scope-intake
description: "Turns a big or fuzzy {{PROJECT_NAME}} idea, feature or bug into ordered, pipeline-sized cards on {{BOARD}} with specs, HTML sketches of any new UI, labels, blocked-by links and a Claude Code kickoff prompt. Use whenever {{OWNER}} describes a new idea for {{PROJECT_NAME}}: 'make a card for X', 'I want to add Y', 'here's a bug', 'let's scope this out'. Not for cards already in flight ({{SLUG}}-pipeline does those)."
---

# {{PROJECT_NAME}} scope intake

{{OWNER}} works {{PROJECT_NAME}} through the `{{SLUG}}-pipeline` skill: one card = one feature = one Claude Code
session, moving Backlog → Scoping → POC → Implementation → QA → Documentation → Shipped. That skill assumes a
well-formed card already exists.

This skill is the **front door**, like a product manager's backlog refinement. {{OWNER}} arrives with an idea that is
too big, too vague, or just unwritten, and leaves with cards a coding session can pick up cold. It runs in a chat
session (Cowork) or in Claude Code. The source lives in the repo at `.claude/intake/{{SLUG}}-scope-intake/` and is
uploaded to claude.ai from there, so edit it in the repo and re-upload.

**Hard rule: no app code, no migrations.** If checking an idea makes you want to write SQL or a component, put the
idea in the spec's "POC approach" instead. Staying code-free keeps this stage cheap.

<!-- if:ui -->
**The one exception is sketches:** throwaway static HTML of new UI for a Tier A card, in the gitignored
`sketches/<slug>/` folder (Step 6). A sketch costs minutes here; the same UI argument settled at POC or QA costs a
coding session per round.

<!-- endif -->
## Step 0: Load only the context you need

Read in layers, and stop as soon as you can answer. {{OWNER}}'s checkout is the source of truth. In a chat session,
read it through the computer connection if there is one; otherwise use the GitHub connector (`{{REPO}}`) and say
which files you couldn't see.

1. **Always:** root `CLAUDE.md`: the stack, rules, gotchas and the Shipped list, which says what already exists.
2. **Personas, routing table only:** `docs/personas/README.md` › Routing. It decides which lenses fire.
3. **Each selected persona, only its Scope questions.**
4. **Folder `CLAUDE.md` files, only for the paths in play.**
5. **The board:** list the cards to see slugs and status, catch duplicates, and spot an existing card for the same idea.
<!-- if:database -->
6. **The database, read-only,** only when the idea depends on data that already exists. Never apply a migration.
<!-- endif -->

## Step 1: Understand the idea and size it

Ask a question only if something load-bearing is missing. Then check three things before slicing:

- **Already shipped?** Compare with the Shipped list.
- **Already on the board?** Then you're *upgrading that card*, not creating a duplicate. Preserve {{OWNER}}'s words:
  append, never overwrite, and confirm before editing more than one card.
- **Tiny?** A copy tweak, a style fix or a one-line bug is the hotfix path (`[hotfix] — ...` straight to
  Implementation). Say so and stop. Never offer a hotfix for auth, access rules, migrations, secrets or deploy config.

Brainstorm first only when the idea is a direction rather than a solution, or {{OWNER}} asks to think it through.

## Step 2: Slice into pipeline-sized cards

A slice must fit one Claude Code session end to end. Rule of thumb: **one capability, at most one migration, one
primary screen or flow, and roughly seven or fewer observable success criteria.** More than that is two slices.

- **Vertical, thin, shippable.** Each slice leaves the app better and usable, not a "database layer" card and a "UI
  layer" card that ship nothing alone. The exception is a true **enabler** that two or more later slices need.
- **Unknowns become spikes:** a question, a time box, and the decision the answer unlocks.
- **A destructive schema change is its own later card**, after no deployed code uses the old shape.
- **v1 first.** Park nice-to-haves as follow-up slices.

Set the build order from real dependencies, with a short walking skeleton first so {{OWNER}} can use something early.

**Depth by proximity:**
- **Tier A, full spec:** the first card with no unmet blocker, and at most one more. These get Steps 5–8.
- **Tier B, pre-scoped:** everything later, created in Backlog with a solid brief. The pipeline's own Scope stage
  refines it just in time, since later specs go stale as earlier slices land.

## Step 3: Show the breakdown and confirm before creating anything

One compact table, then ask with `AskUserQuestion` (**Create these** / **Adjust the plan**):

| # | Slug | Kind | Blocked by | Expected paths | Tier | Notes |
| --- | --- | --- | --- | --- | --- | --- |

Below it: which personas will fire and why, in a line each, and which cards are existing ones being upgraded. Slugs
are kebab-case, 30 characters or fewer, unique: the slug becomes the branch and the Shipped entry. Three or more
cards from one idea: propose a board project for them.

## Step 4: Create the cards

Dependencies are real relations (blocked-by), plus one `**Blocked by:** <slug>` line in the description, since the
pipeline's startup routine reads it. Tier B cards get no labels; Tier A cards get every applicable `area-*` plus a
`persona-*` per lens consulted.

**Tier B description:**

```
## Problem
1–2 sentences: who hits this, when, what it costs today.
## Success criteria
- [ ] Observable outcomes, not implementation.
## Out of scope
## Data and dependencies
**Blocked by:** <slug> (omit if none)
## Expected paths
## Persona hints
(for ux, say whether the card adds a new screen, component or interaction, so Scope knows to sketch it)
## Open questions
- [blocking] ... / [non-blocking] ...
## Context
Part of: <big idea> (step k of n). Unblocks: <slugs>. Decisions made during intake: ...
```

**Tier A:** create it directly in **Scoping** with the same description plus labels, then do Steps 5–8.

## Step 5: Ground the Tier A spec in reality

Re-read the relevant `CLAUDE.md` gotchas so the spec doesn't contradict one. Run each selected persona's Scope
questions. **Anything a persona raises that {{OWNER}} didn't mention is an open question for them, not a decision for
you.** Whatever you can't verify becomes an explicit open question.

<!-- if:ui -->
## Step 6: Sketch new UI (Tier A)

**Read the pipeline's `references/sketches.md` first** (`.claude/skills/{{SLUG}}-pipeline/references/sketches.md`). It's
the source of truth for when to sketch, what a sketch is, and what the spec's Sketch section holds. Don't restate it
or drift from it. What follows is only how intake does it.

- **Decide.** New screen, component or interaction: sketch. Reused UI: `Sketch: waived (reason)`. No UI: leave the
  section out. A close call: ask {{OWNER}}.
- **Draw** in `sketches/<slug>/<screen>.html` in the clone (through the computer connection in chat). Copy the frame
  and option CSS from an existing sketch if there is one. Edit the file in place later; never retype it from an
  earlier, possibly truncated, tool result.
- **Show** it rendered: in Claude Code, the browser pane. In chat, screenshot it with Playwright at a wide viewport,
  light mode plus dark mode when color matters, and send the PNG. Ask which option with `AskUserQuestion`, iterate in
  the same file until {{OWNER}} picks.
- **Record** only the chosen option: screenshot its frames, upload the image to the card, embed it in the spec's
  Sketch section. If the upload is refused, write `Screenshot: sketches/<slug>/<pick>.png, upload pending` and put
  the upload first in the kickoff prompt.

<!-- endif -->
## Step 7: Write the spec

Post it as a comment on the card with these headings (the stage skills look for them), leading with a three-bullet
"Key decisions" callout:

```
**Spec: <slug>**
> Key decisions: ...
## Problem
## Success criteria          (P0 acceptance criteria, observable)
## Non-goals
## P1 / P2                   (fast follows, and design hooks so v1 doesn't block them)
## Data                      (tables/columns and the access rule for each)
## Dependencies              (env vars, other cards, services)
## POC approach              (the smallest testable build)
## Persona notes             (one block per persona, in its file's shape, including "QA to carry forward")
## Open questions            ([blocking] / [non-blocking])
## Sketch                    ({{OWNER}}'s pick with its screenshot; or `Sketch: waived (reason)`; omit for no UI)
```

Resolve every **blocking** question before advancing. Wait for "looks good".

## Step 8: Advance to POC and hand off

Preview the move with `AskUserQuestion` (**Proceed** / **Pause here**):

```
Ready to advance "<slug> — ...":
  Move: Scoping -> POC
  Spec posted; persona labels applied
  Sketch: option <X> picked | waived (reason) | no UI
  Flags: env vars to set, manual steps
```

On Proceed, move the card to POC. Then give {{OWNER}} the kickoff prompt in a copy-paste block **and** post it on the
card as "Coding session kickoff prompt", with no placeholders left:

```
Pick up {{ISSUE_PREFIX}}-<n> "<slug> — <description>" at POC. <card URL>
Start with: claude --agent pipeline-lead --effort high. Follow the {{SLUG}}-pipeline skill. One card per session.
Problem: <1–2 sentences>
POC approach: <from the spec>
Sketch: <option picked, sketches/<slug>/<file>.html | waived (reason) | no UI>
Read first: root CLAUDE.md, plus <the folder CLAUDE.md files the paths need>.
Personas: <names>. Key constraints from Scope: <...>
Expected paths: <list>. Blocked by: <none | slug>. Unblocks: <slugs>.
```

Finish with a table of everything created (identifier, link, status, blocked by) and the build order.

## Guardrails

1. **No app code.** Research, writing, and throwaway sketches in `sketches/` only.
2. **Confirm before creating** cards, before bulk-editing existing ones, and before advancing.
3. **One card = one feature = one session.** Split compound asks; push back on bundling.
4. **Match the repo's reality:** unverified claims become open questions.
5. **Respect {{OWNER}}'s recorded decisions** in `CLAUDE.md`. Ask before anything that costs money.
6. **Don't set priority** unless {{OWNER}} gives one; build order is carried by blocked-by.
7. **Don't advance past POC.** Later stages belong to coding sessions and {{OWNER}}'s QA.
