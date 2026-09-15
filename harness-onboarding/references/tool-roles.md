# Tool roles — what the harness needs in each slot

The board is **Linear**, and that's a commitment rather than a preference (see below). Every other role stays decoupled: the harness needs a *capability*, and several tools satisfy each. If the user already uses something that fills a role, prefer it — the best harness is the one they'll keep using.

## Detecting what's already available

Do this before recommending. It keeps suggestions grounded.

- **MCP connectors.** Search available tools for each role's keywords. In an environment with deferred tools, use the tool-search mechanism with terms like `linear`, `github`, `supabase`, `netlify`, `vercel`, `cloudflare`, `posthog`. A present connector is a strong signal — the integration is already there.
- **CLIs.** Check for `gh`, a hosting CLI, a database CLI. Their presence means PRs and deploys can be driven from the session.
- **Existing repo.** Read config to infer the stack without asking: package manifests and lock files → language, framework, scripts; CI config → how tests and deploys run; deploy config → the hosting platform; any existing `CLAUDE.md` → conventions already written down.

Report what you found before moving on, so the user can correct it.

**If the Linear MCP connector is absent, say so early.** The harness can be generated without it, but every stage skill assumes issues can be read and updated from the session. Without the connector that becomes manual work, and the user should know before you write it.

## Role 1 — Task board: Linear

**This role is not a menu.** The stage model is built on Linear specifically, and the coupling is real rather than cosmetic:

- **Workflow statuses are the pipeline.** No subtask checklist, no board sections — the status *is* the stage. Swapping in a tool whose statuses aren't first-class breaks the routing that every stage skill depends on.
- **Label groups have exclusivity semantics.** `type` is an exclusive group, which is what makes it safe to branch on. `area-*` is deliberately ungrouped and multi-select, which is what stops anyone routing on it.
- **`blockedBy` is a native relation**, not a convention in a notes field. The startup routine reads it directly.
- **`duplicateOf` preserves the link** to a surviving issue, which a `Dropped` status would lose.
- **Projects, Milestones and Initiatives** give the startup routine a real hierarchy to read for batch-ship coherence.

### What to set up

| Thing        | Setup                                                                                   |
| ------------ | --------------------------------------------------------------------------------------- |
| Team         | One team. Note its key — the `MIX` in `MIX-42`                                           |
| Statuses     | Backlog · Scoping · POC · Implementation · QA · Documentation · Shipped · Dropped        |
| Status types | Shipped → `completed`; Dropped → `canceled`; the middle four → `started`                 |
| `type` group | **Exclusive.** `feature` · `bug` · `chore` · `polish` · `spike`                          |
| `area-*`     | **Ungrouped, flat, multi-select.** One per meaningful folder                             |
| Projects     | Only when a real multi-issue body of work exists. Don't create them speculatively        |

Creating the team, statuses and labels is a **manual UI step** — put it in the wrap-up checklist. Linear's MCP has no delete tool for issues or labels either, so anything requiring deletion is also manual.

### If the user genuinely wants a different board

Don't refuse — but be honest about the cost. The parts that need rework: the status table and every stage skill's frontmatter, the label routing rules, the `blockedBy` check in the startup routine, and the duplicate handling. The principles survive; the mechanics don't.

The nearest fits are **GitHub Projects** (statuses map, but relations are weaker) and **Jira** (workflow statuses map well, heavier setup). A **markdown backlog file** works for a solo project with no connector at all — sections become statuses — but you lose the comment thread where specs and findings live, which is a bigger loss than it sounds.

## Role 2 — Version control / code host (required)

Branches, pull requests, and ideally a CLI so the session can open PRs.

| Option    | Notes                                                    |
| --------- | -------------------------------------------------------- |
| GitHub    | Most common; `gh` CLI; auto-links PRs to Linear issues    |
| GitLab    | Built-in CI/CD; `glab` CLI                                |
| Bitbucket | Common in Atlassian shops                                 |

Confirm the production branch name and that the PR CLI is available. **Confirm how PRs link to Linear issues** — since branch names in this harness carry the card slug rather than the issue ID, the URL or a bare identifier in the PR title or body is the only linking mechanism.

## Role 3 — Hosting + a QA target (required for anything deployable)

**The load-bearing capability is a reviewable target that isn't production.** How you get one has two shapes, and the answer changes the generated git workflow — ask explicitly rather than assuming:

**Shape A — preview per branch.** The host builds every branch or PR. Simplest: QA happens on that URL, and the harness needs no integration branch.

**Shape B — a long-lived integration branch.** One shared target (`staging`) that several in-flight features merge into. Needed when the QA target must be a single known URL, when previews are unavailable, or when features need testing *together*.

If Shape B, three rules follow and the generated harness must carry all three:

1. Feature branches are cut from **production**, never from the integration tip — otherwise exclusion is impossible.
2. The integration branch is **disposable** and rebuilt after every release.
3. It is **never merged into production**; production is fed by per-feature merges.

| Option                      | Good for                      | Preview shape              |
| --------------------------- | ----------------------------- | -------------------------- |
| Cloudflare Pages            | Static + edge functions       | Per-branch previews        |
| Netlify                     | Static + serverless functions | Deploy previews per PR     |
| Vercel                      | Next.js and frontends         | Preview deploy per push    |
| Render / Railway / Fly      | Long-running backends         | Preview/staging services   |
| GitHub Pages                | Pure static/docs              | None — needs Shape B       |

**Also ask how production deploys.** If the host auto-publishes from git, then pushing the production branch *is* the deploy, and there's no separate gate holding the line — the generated harness has to say so explicitly.

**And ask how to verify a deploy landed.** This is the question people don't have an answer to. A green CI run and a clean push are not proof; a failing build publishes nothing while everything upstream looks healthy. The usual answer is a build-stamped file carrying the commit SHA, fetched with a cache-buster. If there's no answer, record that absence in the harness as a known risk.

## Role 4 — Backend / database (optional)

Only if the project stores or serves data. Needs a data store and/or server-side compute, with a safe way to apply schema changes and keep secrets server-side.

| Option              | Good when                             |
| ------------------- | ------------------------------------- |
| Supabase            | Postgres + auth + storage, fast start |
| Firebase            | Realtime/mobile, Google ecosystem     |
| Neon / plain Postgres | You want plain Postgres             |
| PlanetScale / Turso | Scalable MySQL / edge SQLite          |
| None                | Static or client-only — drop the role |

If chosen, ask **where authorization actually lives**. If the client holds a key that reaches the database directly, authz must live in row-level policies rather than only in the server layer — and that becomes a `security-reviewer` persona plus a guardrail, not a footnote.

## Role 5 — Analytics / observability (optional)

| Option             | Notes                                                       |
| ------------------ | ----------------------------------------------------------- |
| PostHog            | Product analytics, autocapture, session replay, flags       |
| GA4                | Ubiquitous pageview/event analytics                         |
| Plausible / Fathom | Lightweight, privacy-friendly                               |
| Sentry             | Error/exception tracking                                    |

If chosen, the generated harness should carry an event-naming convention (`[object]_[verb]` works well) and a note that signup and activation events must be explicit — autocapture misses them.

## Role 6 — Secrets (always discuss, even with no "tool")

**Secrets never ship to the client.** A secret heading for the browser is a stop-work condition, not a PR note.

There are usually three places a secret must be set, and the harness should remind the user of all three whenever one is introduced:

1. **Local dev** — an ignored env file, mirrored keys-only in `.env.example`
2. **Runtime** — the hosting platform's environment settings, often per-environment
3. **CI** — the repo host's secrets store, if CI needs it

Missing #2 or #3 is the classic cause of a build that passes locally and fails silently in production.

## Role 7 — Claude's own context (not a choice, but a role)

The `CLAUDE.md` files and the repo-local skills are how Claude gets oriented each session. This isn't optional; it's half of what makes the harness work, and it has its own economics.

**Read `context-economy.md`.** At minimum the generated harness needs: a root `CLAUDE.md`, one sub-file per folder with its own conventions, a char budget for each, and the path-routing table that maps changed paths to both.
