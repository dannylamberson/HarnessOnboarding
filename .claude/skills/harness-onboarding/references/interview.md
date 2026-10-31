# The interview

Run this with the user at kickoff steps 1–2. Keep it conversational: ask in small batches, recommend a default for
each question so a non-expert can just say "sounds good", and reflect answers back. Skip what doesn't apply.

The goal is a filled answers file in the shape of `kit/answers.example.json` (values, flags, offLimits), kept in the
scratchpad as you go.

## Phase 0: Scratch or existing? (ask this first)

> "Are we starting from scratch, or adding the harness to an existing codebase?"

**Existing:** offer to read the repo before asking much else. Read it as `references/tool-roles.md` › Detecting
what's available describes (manifests, CI, deploy config, any `CLAUDE.md`, the folder layout, the scripts). Summarize
what you found and ask the user to correct it. Note where the repo already has its own pipeline skills, context
files or board conventions: the scaffold merges into those, it doesn't replace them (`references/scaffold.md` ›
Existing repos). Setup steps 4, 5, 8 and 9 shrink to checking what exists.

**Scratch:** you'll lean on recommendations, and setup creates the board, repo, hosting and database.

## Phase 1: The idea

- **The pitch,** in the user's words. Don't interrupt it with questions.
- **Name and slug.** Propose a kebab-case slug of 30 characters or fewer; it names the repo, the plugin, the skills
  and the commit scope.
- **One line,** and **the goal:** what success looks like. ("We stop using a group chat for this.") It steers every
  recommendation.
- **Who uses it, on what:** phone, desktop or both; one person, a household, a team, the public. This decides the
  sketch frames, the QA script and whether sign-in matters.
- **Project type:** web app or PWA, static or content site, API service, bot or automation, CLI or library, mobile.

## Phase 2: Roles and tools

For each role, lead with what's connected and what fits the goal, recommend, then let them choose. The catalog is in
`references/tool-roles.md`.

- **Board** (required, the pipeline's spine): which tool holds the Backlog → Shipped statuses.
- **Repo** (required): GitHub by default; confirm `gh` is signed in.
- **Hosting with a QA site** (required for anything deployable): production from the production branch, a QA site
  from a QA branch (`staging` by default), and a preview per PR if the host offers it.
- **Database** (optional): only if the project stores data. Free tier by default.
- **Analytics** (optional).
- **Secrets** (always discuss): local env file, hosting env, CI. Secrets never reach the client.
- **Models:** the default is Opus leading, Sonnet building, Haiku checking (`references/tool-roles.md` › Role 7).
  Offer the single-model option for someone who doesn't want subagents; it sets `flags.delegation` to false.

## Phase 3: Workflow specifics

- **QA:** who tests (the user, by default and strongly recommended), where (the QA site URL), and on what device.
- **The gate:** the one command that must pass for "Implement done" (lint + typecheck + test + build). From scratch,
  the scaffold creates it.
- **How to prove the QA build is new:** a command that prints the deployed commit SHA (a `build-meta.json` the build
  writes, or the SHA in a bundle). The QA runner polls it.
- **UI?** Yes turns sketches on (`flags.ui`). Then: where the design tokens live (`TOKENS_PATH`), and the frame sizes
  (`FRAMES`, e.g. 402px phone frames, or phone and 1280px desktop).
- **What must a builder never run?** Default: every `git push`, the deploy CLI, the hosted database push, the code
  host CLI (`gh`), the board CLI. These become `offLimits` regexes. Pushing the production branch is always on the
  list, because on most hosts that push *is* the production deploy.
- **Context folders:** which folders get their own `CLAUDE.md` (an app folder, a components folder, a server folder).
  They become rows of root's context map.

## Phase 4: Additional context (near the end)

> "Anything else a new engineer on this project should know on day one?"

- A vision or big-ideas doc, a north star, reference apps the user likes.
- Hard constraints: budget, free tier only, platforms, compliance, a tool's known gaps.
- House conventions not obvious from a repo.
- Known gotchas, past mistakes, and anything the AI should *never* do here.

These seed root `CLAUDE.md` › Project rules and Gotchas, and the personas' landmines.

## After the interview

Run kickoff step 3: restate the plan in one compact summary and get an explicit OK before setup creates anything.
