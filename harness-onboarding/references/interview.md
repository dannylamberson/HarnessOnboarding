# The interview

Run this with the user to collect everything the generated `[slug]-pipeline` skill
needs. Keep it conversational: ask in small batches, recommend a default for each
question so a non-expert can just say "sounds good," and reflect answers back. You do
not need every field — if something doesn't apply, note it and move on.

The goal is to come out with a filled-in version of the placeholder legend in
`references/skill-template.md`.

## Phase 0 — Scratch or existing? (ask this first)

> "Are we starting this project from scratch, or setting the harness up on an existing
> codebase?"

**If existing:** this is the high-leverage branch. Offer to look at the repo before
asking much else.

- Ask for the repo path or URL.
- Read it the way `references/tool-roles.md` → "Detecting what's available" describes:
  manifest/lock files, CI config, deploy config, any existing `CLAUDE.md`, the folder
  layout, the test/lint/build scripts.
- Summarize back what you found — stack, hosting, test commands, conventions — and ask
  the user to correct anything. This pre-fills most of Phase 2 and 3, so you can skip
  questions you've already answered from the repo.

**If from scratch:** you'll lean more on recommendations. Note that some pieces (the
repo, the board, hosting) don't exist yet — the wrap-up checklist will tell the user to
create them.

## Phase 1 — Project basics

- **Name** — human-readable (e.g. "Acme Billing Portal").
- **Slug** — kebab-case, short; becomes the skill name `[slug]-pipeline` and the commit
  scope. Propose one from the name and confirm.
- **One-line description** — what it is.
- **The ultimate goal** — what success looks like. This matters: it steers tool
  recommendations (a content/marketing site, a SaaS with logins, an internal tool, and a
  CLI library each want a different stack).
- **Project type** — pick the closest: web app, static/content site, backend/API
  service, CLI or library, data/automation/bot, mobile. Drives the POC examples and the
  hosting/backend recommendations.

## Phase 2 — Roles and tools

For each role, lead with what you detected in step B and what fits their goal, recommend,
then let them choose. Full catalog and recommendations are in `references/tool-roles.md`.
Keep the harness decoupled: you're filling a *capability*, and several tools fit each.

- **Task board** (required — the pipeline's spine). Which board will hold the
  Backlog → Shipped columns? If they have none and want the lightest path, a tracked
  markdown backlog file is a valid fallback.
- **Version control / code host** (required). Where the repo lives; confirm the PR CLI.
- **Hosting + preview deploys** (required for anything deployable). The critical
  capability is an automatic preview/staging deploy per branch — that's the QA target.
- **Backend / database** (optional). Only if the project stores or serves data.
- **Analytics / observability** (optional). If they want to measure usage or catch errors.
- **Secrets** (always discuss). Where secrets live for local, runtime, and CI — and
  reaffirm that secrets never ship to the client.

## Phase 3 — Workflow specifics

- **Who runs QA and where.** Default and strongly recommended: the human runs QA on a
  preview/staging URL. Capture the preview URL pattern and the production URL.
- **Commands.** The lint/test/build commands that gate "Implement done" (e.g. a single
  combined command). If none yet, note that and keep the gate to "build succeeds."
- **Branch + deploy model.** Production branch name; how previews are produced; how
  production deploys (merge-triggered vs. a manual deploy command).
- **Context-file layout.** Confirm there's a root `CLAUDE.md` and which folders get their
  own sub-`CLAUDE.md` (e.g. an app folder, a components folder, a server/functions
  folder). This drives the Document stage's routing table.

## Phase 4 — Additional context (ask this near the end)

> "Anything else you want baked into how the AI works on this project?"

Invite them to fold in whatever would make a fresh session smarter or safer:

- A vision / "big ideas" doc, north-star, or roadmap.
- Hard constraints (budget, compliance, platform limits, a tool's known gaps).
- House conventions (naming, code style, commit style) not already obvious from the repo.
- Known gotchas or past mistakes to avoid.
- Anything the AI should *never* do on this project.

Capture these as a short "project context" block to seed the generated skill and the
user's root `CLAUDE.md`.

## After the interview

You should now have enough to fill `references/skill-template.md`. Before generating,
run step E from `SKILL.md`: restate the plan in one compact summary (project, slug, tool
per role, QA model, commands, context-file layout) and get an explicit OK.
