# Example: a kickoff, start to finish

A worked example of the target. **Trailhead** is a made-up project; `kit/answers.example.json` holds its answers, and
`kit/scaffold.test.mjs` scaffolds exactly this.

## 1–3. The idea, the interview, the plan

> "My hiking group plans every trip in a group chat and things get lost: who's driving, which trail, what to bring.
> I want an app on our phones for it."

The confirmed summary:

```
Trailhead (slug trailhead): a phone-first trip planner for a small hiking group.
Goal: the group plans every trip here instead of a group chat.
Users: 6 friends, iPhones, invite-only. From scratch.
Board: Linear, team Trailhead (TRL)        Repo: GitHub dannylamberson/trailhead (private)
Hosting: Netlify. Production from main → trailhead.example.com; QA site from staging → trailhead-qa.netlify.app
Database: Supabase (free tier), Postgres + RLS + Auth. Shared by previews, QA and production → additive migrations
Gate: npm run check (lint, typecheck, test, build)   QA build check: build-meta.json commitRef
UI: yes. Sketches at Scope in 402px phone frames, tokens at src/styles/tokens.css
Models: Opus leads, Sonnet builds, Haiku checks
Builders may never run: git push, gh, netlify, supabase db push
QA: Danny, on his iPhone, on the QA site
```

## 4–9. Setup, as it ran

| Step | What happened |
| --- | --- |
| 4 Board | Danny created team Trailhead (TRL) and set its workflow to the eight statuses. The session created `area-ui`, `area-db`, `area-functions`, `area-infra`, `area-harness`, `persona-ux`, `persona-db` |
| 5 Repo | `gh repo create dannylamberson/trailhead --private --clone` |
| 6 Scaffold | Vite + React + TypeScript, `npm run check`, a `build-meta.json` step, `tokens.css`. Then `scaffold.mjs`: 35 files, 13 FILL markers written by hand. First commit on `main`, pushed; `staging` cut and pushed |
| 7 Install | `claude plugin marketplace add …\trailhead`, `claude plugin install trailhead@trailhead-local`; `harness-check.mjs` → `Result: ok` |
| 8 Hosting | Two Netlify sites from the repo: `trailhead` on `main`, `trailhead-qa` on `staging`. Both green; `build-meta.json` showed the pushed SHA |
| 9 Database | Danny confirmed the free-tier cost; project `trailhead` created; `supabase init`, `start`, `link`; sign-ups off; both origins in Auth's redirect list. No tables |

## The repo it produced

```
trailhead/
├── CLAUDE.md                          # table of contents: stack, commands, context map, rules, gotchas, Shipped
├── README.md                          # setup, plus the two plugin-install commands for a new machine
├── .gitignore                         # + .claude/worktrees/, sketches/, env files
├── .claude-plugin/marketplace.json    # trailhead-local: lists the plugin below
├── .claude/
│   ├── .claude-plugin/plugin.json     # the trailhead plugin
│   ├── harness.json                   # slug, branches, offLimits for the guards, context budgets
│   ├── agents/                        # pipeline-lead (Opus), builder (Sonnet), qa-runner (Haiku),
│   │                                  #   doc-writer (Sonnet), context-check (Haiku), context-audit (Sonnet)
│   ├── hooks/                         # hooks.json → agent-guard → builder-guard / qa-runner-guard; harness-check
│   ├── scripts/context-size.mjs       # sizes vs budgets, broken pointers, ships since the last audit
│   ├── skills/trailhead-pipeline/     # the playbook
│   │   ├── SKILL.md
│   │   └── references/                # delegation, sketches, poc, qa, hotfix, maintenance, spikes
│   └── intake/trailhead-scope-intake/ # the front door; also uploaded to claude.ai
├── docs/
│   ├── harness-plugin.md  shipped.md  shipped-archive.md  audits.md
│   └── personas/                      # README (routing), ux, db
└── src/ …                             # the Vite skeleton
```

## 10. The backlog it seeded

| # | Slug | Blocked by | Tier |
| --- | --- | --- | --- |
| TRL-1 | `app-shell` — installable shell, sign-in, empty trips list | — | A: scoped, sketched (option B picked), in POC |
| TRL-2 | `trip-create` — create a trip with a date and a trail | `app-shell` | A: scoped, sketched, in Scoping |
| TRL-3 | `trip-roster` — who's in, who's driving | `trip-create` | B |
| TRL-4 | `packing-list` — a shared list per trip | `trip-create` | B |
| TRL-5 | `trail-lookup-spike` — can we pull trail data for free? | — | B (spike) |

## 11. The handoff

```
Open C:\Users\danny\ClaudeCode\trailhead in Claude Code and run:
  claude --agent pipeline-lead --effort high
Then say: "what's next on Trailhead?" (it picks up TRL-1 app-shell at POC)
```

Plus: `trailhead-scope-intake.zip` to upload in claude.ai Settings → Capabilities, and a checklist with one item left
(point `trailhead.example.com` at the production site).

## An excerpt of the playbook

From `.claude/skills/trailhead-pipeline/SKILL.md`, Scope:

```markdown
### 1. Scope
No app code. First **state which paths the work will touch**, as a one-line list: it drives the labels, the personas
and the spec's dependencies. ...

**New UI gets sketched before sign-off:** throwaway HTML, options side by side, so Danny picks by looking, not by
reading (`references/sketches.md`). Skip it only when the card reuses existing UI, and say so in the spec.
```

And `.claude/harness.json`, which the guards read:

```json
{
  "slug": "trailhead",
  "prodBranch": "main",
  "qaBranch": "staging",
  "offLimits": [
    { "pattern": "\\bsupabase\\b.*\\bdb\\s+push\\b", "label": "supabase db push" },
    { "pattern": "(^|[;&|(`]\\s*)(npx\\s+)?gh(\\s|$)", "label": "gh" },
    { "pattern": "(^|[;&|(`]\\s*)(npx\\s+)?netlify(\\s|$)", "label": "netlify" }
  ],
  "budgets": { "root": 8192, "pipelineSkill": 16384, "default": 12288, "none": ["docs/shipped-archive.md"] },
  "auditEvery": 10
}
```
