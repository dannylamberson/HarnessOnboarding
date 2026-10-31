# Tool roles: what the harness needs, and what fills each role

The harness is decoupled from any specific vendor. It needs a *capability* in each role, and several tools satisfy
each one. Recommend based on the user's goal and on what they already have; never force a stack. If they already use a
tool that fills a role, prefer it: the best harness is the one they'll keep using.

## Detecting what's already available

Do this before recommending (kickoff step 2). It keeps suggestions grounded.

- **MCP connectors.** Search the available tools for each role's keywords. In an environment with deferred tools, use
  tool search with terms like "linear", "asana", "github", "supabase", "netlify", "vercel", "cloudflare", "posthog". A
  connected tool is a strong reason to recommend it: setup can drive it from the session.
- **CLIs.** Check `gh auth status`, and for the hosting and database CLIs (`netlify`, `vercel`, `wrangler`,
  `supabase`). A present, signed-in CLI means setup can run it.
- **An existing repo.** Read config to infer the stack without asking:
  - Package manifests and lock files: language, framework, scripts (lint, test, build).
  - CI config: how tests and deploys already run.
  - Deploy config (`netlify.toml`, `vercel.json`, `wrangler.toml`): the hosting platform.
  - Existing `CLAUDE.md`, `.claude/skills/`, docs: conventions and any pipeline already written down.
- If a connector registry is available, surface options the user hasn't connected yet.

Report what you found before moving on, so the user can correct it.

## Role 1: Board (required, the pipeline's spine)

**Capability needed:** statuses (or columns) for the stages, Backlog → Shipped plus Dropped. Labels for `area-*` and
`persona-*`. Blocked-by relations if it has them. Comments for specs, PR links and findings. Ideally image uploads
for sketch screenshots.

| Option | Good when | Notes |
| --- | --- | --- |
| Linear | The recommended default for a solo builder; has an MCP connector | Workflow statuses = stages; labels, blocked-by and file uploads all work through the connector |
| GitHub Projects / Issues | You want everything in the repo host | Project status field = stages; labels native; `gh` drives it |
| Asana | You like a clean board | Sections = stages |
| Jira | You're already in the Atlassian world | Heavier; map workflow statuses to stages |
| Trello | The lightest visual board | Lists = stages |
| Notion / ClickUp | You already run your life there | A database with a status field = stages |
| Markdown backlog file | No tool, zero setup | A tracked `backlog.md` with a section per stage; no automation |

## Role 2: Repo (required)

**Capability needed:** branches, pull requests, and a CLI so the session can create the repo and open PRs.

| Option | Notes |
| --- | --- |
| GitHub | The default; `gh` creates the repo and opens PRs, and it pairs with every host below |
| GitLab | Built-in CI/CD; `glab` CLI |
| Bitbucket | Common in Atlassian shops |

## Role 3: Hosting with a QA site (required for anything deployable)

**Capability needed (the load-bearing one):** a **QA site** built from a QA branch (`staging` by default) that holds
every card in QA at once, plus production from the production branch. A preview per PR is a bonus, and a good place to
run the gate. Without a QA target the human can't review before merge, and the harness loses its safety net.

Also find out whether pushing the production branch deploys production. On most hosts it does, which is why the
builder guard refuses every push.

| Option | Good for | Notes |
| --- | --- | --- |
| Netlify | Static and SPA sites, serverless functions | A second site on the QA branch is the QA site; deploy previews per PR; MCP connector |
| Cloudflare Pages / Workers | Static and edge | Branch deploys give the QA URL; `wrangler` CLI |
| Vercel | Next.js and front ends | Preview per push; a branch domain for the QA branch |
| Render / Railway / Fly | Long-running services, containers | A staging environment from the QA branch |
| GitHub Pages | Pure static or docs | No previews; a second repo or path for QA |

## Role 4: Database (optional)

Only if the project stores data. **Capability needed:** a data store with access rules, schema migrations in the
repo, a local copy for POC, and server-side secrets.

| Option | Good when | Notes |
| --- | --- | --- |
| Supabase | Postgres, auth, storage, fast start | SQL migrations, RLS, a local stack in Docker, a free tier, an MCP connector |
| Firebase | Realtime or mobile, Google ecosystem | Document model; rules-based access |
| Neon / Postgres | Plain Postgres | Branches per environment on Neon |
| Turso / PlanetScale | Edge SQLite / MySQL | Branch-based schema workflows |
| None | Static or client-only | `flags.database: false` drops the db persona and the migration rules |

Ask whether previews, QA and production will share one database. On a free tier they usually do, which makes
additive-only migrations a hard rule.

## Role 5: Analytics and observability (optional)

| Option | Notes |
| --- | --- |
| PostHog | Product analytics, session replay, flags; proxy it if ad blockers matter |
| Plausible / Fathom | Light, privacy-friendly pageviews |
| Sentry | Errors and exceptions |

If chosen, the Implement stage instruments meaningful actions with an `object_verb` event name.

## Role 6: Secrets (always discuss)

**The principle everywhere:** secrets never reach the client. A new secret is set in three places, and the pipeline
reminds the user of each:

1. Local: a gitignored env file, mirrored as keys only in `.env.example`.
2. Runtime: the hosting platform's env settings, per environment (QA and production).
3. CI: the repo host's secrets store, if CI needs them.

## Role 7: Models and agents

**Capability needed:** a strong model to lead, and cheaper ones to build and check.

| Option | Good when | What gets scaffolded |
| --- | --- | --- |
| Opus leads, Sonnet builds, Haiku checks (default) | Any project past a toy. The plan-and-review split catches mistakes, and builds cost less | All six agents (`pipeline-lead`, `builder`, `qa-runner`, `doc-writer`, `context-check`, `context-audit`) and their guards |
| Single model, no subagents | A tiny project, or a plan where subagents aren't worth it | No agents or guards; the main session runs every stage (`flags.delegation: false`) |

The main session starts with `claude --agent pipeline-lead --effort high`. In the desktop app, the user picks Opus
and high effort by hand.

## Preview tooling (for sketches and QA checks)

Not a role to pick, but check it's there: the Claude Code browser pane (or Playwright) to open sketches and run UI
checks, and the dev server's `--host` flag to put a sketch on a phone over Wi-Fi.

## A note on the AI's own context

The `CLAUDE.md` files are required regardless of stack: they're the new engineer's docs on what's been built. The kit
scaffolds a root `CLAUDE.md` as a table of contents, `docs/shipped.md` and the context-size check. Folders get their
own `CLAUDE.md` as the code grows. This isn't optional; it's half of what makes the harness work.
