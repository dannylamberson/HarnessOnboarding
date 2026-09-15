# The interview

Collect what's needed to fill the placeholders in `template/SETUP.md`. Keep it conversational: ask in small batches, recommend a default for each question so a non-expert can just say "sounds good," and reflect answers back.

**The interview is short now.** The harness itself is already written — it lives in `template/`. You're filling blanks in a structure that exists, not designing one from scratch. If you find yourself asking a question whose answer doesn't map to a placeholder in `SETUP.md`, you probably don't need to ask it.

## Phase 0 — Scratch or existing? (ask first)

> "Are we starting from scratch, or setting the harness up on an existing codebase?"

**If existing** — the high-leverage branch. Offer to read the repo before asking much else:

- Ask for the repo path or URL.
- Read it per `tool-roles.md` → "Detecting what's already available".
- Summarize back what you found — stack, hosting, test commands, folder layout, conventions — and ask them to correct it.

This pre-fills most of Phase 2 and nearly all of Phase 3. Skip the questions you've already answered.

**If from scratch** — lean on recommendations. Note that the repo, the Linear team, and hosting don't exist yet; the wrap-up checklist will cover creating them.

## Phase 1 — Project basics

- **Name** — human-readable.
- **Slug** — kebab-case, short. Propose one from the name and confirm.
- **Who runs QA** — a name, not "the user." It goes into every stage skill, and "Danny triggers the webhook and reports back" reads very differently from "the user should test it."
- **One-line description** and **the ultimate goal** — steers the POC table and the tool recommendations.
- **Project type** — web app, static site, backend service, CLI/library, data/automation, mobile. Drives `{{POC_TABLE}}`.

## Phase 2 — Tools

Lead with what you detected, recommend, then let them choose. Catalog in `tool-roles.md`.

- **Linear** — confirm the workspace slug and team key, or note the team needs creating. Not a menu; see `tool-roles.md` if they push back.
- **Code host** (required) — and confirm the PR CLI, plus how PRs will link to Linear issues.
- **Hosting + QA target** (required if deployable) — **ask which of the two shapes applies**, preview-per-branch or a long-lived integration branch. This is a real fork that changes the generated git workflow, not an implementation detail.
- **How production deploys** — auto-publish on push, or a separate gate? If it auto-publishes, the push *is* the deploy and the harness must say so.
- **How to verify a deploy landed.** Ask it directly. Most people don't have an answer, and the absence is itself worth recording — an unverified ship is the failure mode that looks like success.
- **Backend/database** (optional) — and if there is one, where authorization lives.
- **Analytics** (optional).
- **Secrets** — where they live for local, runtime, and CI.

## Phase 3 — Workflow specifics

- **Commands** — the lint/test/build command that gates "Implement done." If none yet, keep the gate at "build succeeds" and say so.
- **Production branch name.**
- **Context-file layout** — *which folders get their own `CLAUDE.md`?* This drives `{{PATH_ROUTING_TABLE}}`, which every stage reads. Get it explicitly; don't infer it from the folder list alone, since not every folder needs one.
- **What triggers a security review** — new endpoints? schema changes? anything touching auth? Shapes the `security-reviewer` persona and the Implement stage.
- **Repo conventions** — module style, HTTP client, test runner, anything a new file must follow.

## Phase 4 — Extra context (near the end)

> "Anything else you want baked into how Claude works on this project?"

- A vision doc, north-star, or roadmap
- Hard constraints — budget, compliance, platform limits, a known-broken third-party API
- House conventions not obvious from the repo
- **Known gotchas or past mistakes.** Push a little here. This is the highest-value question in the interview, because gotchas are the one thing that can't be re-derived from the code. Ask what's bitten them before.
- Anything Claude should *never* do on this project

Capture these as the seed of `{{PROJECT_GOTCHAS}}` and `{{UNIVERSAL_RULES}}`.

## Phase 5 — Personas

> "Are there review lenses you want applied at specific stages?"

Most new projects need none on day one, and **speculative personas are context debt that looks like diligence**. Suggest one only where the project obviously calls for it — a `security-reviewer` when there's auth or a public endpoint; a `db-architect` when there's real schema.

Say explicitly that personas are added later, as recurring review comments reveal the need. `docs/personas/README.md` carries the format.

## After the interview

Restate in one compact summary: project name and slug, who runs QA, the Linear team, the tool per role, the QA target shape, the commands, and which folders get context files. Get an explicit "looks good" before generating.

This is the cheap moment to catch a wrong assumption.
