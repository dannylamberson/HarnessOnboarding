# Tool roles — what the harness needs, and what fills each role

The harness is decoupled from any specific vendor. It needs a *capability* in each role,
and several tools satisfy each one. Recommend based on the user's goal and on what they
already have — never force a stack. If they already use a tool that fills a role, prefer
it; the best harness is the one they'll actually keep using.

## Detecting what's already available

Do this before recommending (step B in `SKILL.md`). It keeps suggestions grounded.

- **MCP connectors / tools.** Search the available tools for each role's keywords (task
  board, repo, hosting, database, analytics). In an environment with deferred tools, use
  the tool-search mechanism with terms like "asana", "linear", "github", "supabase",
  "netlify", "vercel", "cloudflare", "posthog". A present connector is a strong signal to
  recommend that tool — the integration is already there.
- **CLIs.** Check for relevant command-line tools (e.g. a git host CLI, a hosting CLI) —
  their presence means PRs and deploys can be driven from the session.
- **Existing repo (adapting branch).** Read config to infer the stack without asking:
  - Package manifests / lock files → language, framework, scripts (lint/test/build).
  - CI config → how tests and deploys already run.
  - Deploy/hosting config files → the current hosting platform.
  - Any existing `CLAUDE.md` / docs → conventions already written down.
- If a connector registry is available, you can also surface options the user hasn't
  connected yet and offer to suggest them.

Report what you found before moving on, so the user can correct it.

## Role 1 — Task board (required: the pipeline's spine)

**Capability needed:** columns/sections that map to the stages (Backlog → Shipped),
cards that can hold a checklist of the five subtasks, and comments for specs, PR links,
and findings.

| Option | Good when | Notes |
| --- | --- | --- |
| Asana | You like a clean board + subtasks | Sections = stages; subtasks = the five steps |
| Linear | Dev-centric teams, keyboard-driven | Statuses = stages; sub-issues or a checklist for steps |
| Jira | You're already in the Atlassian world | Heavier; map workflow statuses to stages |
| GitHub Projects / Issues | You want everything in the repo host | Project columns = stages; issue task-list = steps |
| Trello | Lightest visual board | Lists = stages; checklist = steps |
| Notion / ClickUp | You already run your life there | Database with a status field = stages |
| Markdown backlog file | No tool, want zero setup | A tracked `backlog.md` with sections; lowest friction, no automation |

**Adapt:** if no board connector is present, either recommend GitHub Issues/Projects
(usually already available with the repo) or the markdown fallback.

## Role 2 — Version control / code host (required)

**Capability needed:** branches, pull requests, and ideally a CLI so the session can open
PRs and the platform can build previews.

| Option | Notes |
| --- | --- |
| GitHub | Most common; `gh` CLI; pairs with most hosting platforms |
| GitLab | Built-in CI/CD; `glab` CLI |
| Bitbucket | Common in Atlassian shops |

Confirm the production branch name and that the PR CLI is available.

## Role 3 — Hosting + preview deploys (required for anything deployable)

**Capability needed — this is the load-bearing one:** an automatic **preview/staging
deploy per branch or PR**. That preview URL is the QA target. Without it, the human
can't review before merge, and the harness loses its safety net.

| Option | Good for | Notes |
| --- | --- | --- |
| Cloudflare Pages | Static + edge functions | Per-branch previews; functions for dynamic bits |
| Netlify | Static + serverless functions | Deploy previews per PR; simple CLI |
| Vercel | Next.js and frontends | Preview deploy per push; strong DX |
| Render / Railway / Fly | Long-running backends, containers, DBs | Preview/staging environments for services |
| GitHub Pages | Pure static/docs | Simple, but no previews — use a staging branch/site |
| AWS Amplify / others | Already on that cloud | Confirm per-branch previews exist |

**Adapt:** match to project type — static/content site → Cloudflare Pages / Netlify /
Vercel; backend service → Render / Railway / Fly. If the chosen host lacks per-branch
previews, define a dedicated staging branch/site as the QA target instead.

## Role 4 — Backend / database (optional)

Only if the project stores or serves data. **Capability needed:** a data store and/or
server-side compute, with a safe way to apply schema changes and keep secrets server-side.

| Option | Good when | Notes |
| --- | --- | --- |
| Supabase | Postgres + auth + storage, fast start | SQL migrations; generous free tier |
| Firebase | Realtime/mobile, Google ecosystem | Document model; rules-based access |
| Neon / Postgres | You want plain Postgres | Serverless branches on Neon |
| PlanetScale / Turso | Scalable MySQL / edge SQLite | Branch-based schema workflows |
| None | Static or client-only | Skip this role and drop the section from the skill |

## Role 5 — Analytics / observability (optional)

If they want to measure usage or catch errors. **Capability needed:** capture meaningful
user actions and/or surface runtime errors.

| Option | Notes |
| --- | --- |
| PostHog | Product analytics, autocapture, session replay, flags |
| GA4 | Ubiquitous pageview/event analytics |
| Plausible / Fathom | Lightweight, privacy-friendly pageviews |
| Sentry | Error/exception tracking |

If chosen, the generated skill should remind: instrument meaningful actions with a clear
`[object]_[verb]` event name.

## Role 6 — Secrets (always discuss, even if there's no "tool")

**Principle to enforce everywhere:** secrets never ship to the client. There are usually
three places a secret must be set, and the generated skill should remind the user of all
three when a new one is introduced:

1. Local dev — an ignored env file (e.g. `.env.local`), mirrored as keys-only in
   `.env.example`.
2. Runtime — the hosting platform's environment settings (often per-environment:
   preview and production).
3. CI — the repo host's secrets store, if CI needs them.

## A note on the AI's own context (not a tool to pick, but part of the harness)

The `CLAUDE.md` context files are required regardless of stack — they're how the AI gets
oriented each session. The generated skill should assume a root `CLAUDE.md` exists and
that scoped folders get their own. This isn't optional; it's half of what makes the
harness work.
