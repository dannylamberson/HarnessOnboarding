# Using this template

Copy everything in this directory (except this file, `scaffold.mjs`, `scaffold.test.mjs` and `answers.example.json`) into the target repo's root, then fill in the placeholders. The onboarding skill does this with `scaffold.mjs`; these notes are the manual path and the reference for what each placeholder means.

**Why the odd names here:** the template lives inside `.claude/skills/harness-onboarding/`, and Claude Code loads any `CLAUDE.md` and `.claude/skills/` it finds under a folder you work in. So the template stores `.claude/` as `dot-claude/`, `.claude-plugin/` as `dot-claude-plugin/`, and `CLAUDE.md` as `CLAUDE.md.tmpl`. The scaffold maps them back.

## The scaffold

```bash
node scaffold.mjs --answers <answers.json> --target <repo>
```

The answers file has three parts (`answers.example.json` shows every key):

- **`values`**: the mechanical placeholders, filled everywhere. Prose placeholders stay out of it: the session writes those by hand after the scaffold lists them.
- **`flags`**: `ui` (sketches at Scope), `database` (migration rules), `delegation` (the agents and guards), `integration` (a long-lived integration branch that the QA runner may push). Each defaults to true. A `<!-- if:flag -->` … `<!-- endif -->` block is kept only when its flag matches, and the files that belong to a flag are dropped when it's off.
- **`offLimits`**: a regex `pattern` and a `label` per command no subagent may run (the deploy CLI, the database push, `gh`). `git push` is always refused to the builder; the QA runner may push only the integration branch.

It writes `.claude/harness.json` from these, appends the gitignore stanza once, never overwrites an existing file (it lists those for a hand merge), and lists every placeholder left by file and line. After changing anything in this folder, run `node scaffold.test.mjs`.

## What gets copied where

```
CLAUDE.md.tmpl                     → repo root /CLAUDE.md
docs/pipeline-core.md              → repo root /docs
docs/harness-notes.md              → repo root /docs
docs/changes/README.md             → repo root /docs/changes
docs/personas/README.md            → repo root /docs/personas
docs/feature-history.md            → repo root /docs
docs/delegation.md                 → repo root /docs                 (flag: delegation)
docs/sketches.md                   → repo root /docs                 (flag: ui)
docs/harness-plugin.md             → repo root /docs
dot-claude/skills/pipeline-*/      → repo root /.claude/skills
dot-claude/agents/                 → repo root /.claude/agents       (flag: delegation)
dot-claude/hooks/                  → repo root /.claude/hooks        (guards: flag delegation; harness-check always)
dot-claude/scripts/                → repo root /.claude/scripts
dot-claude/.claude-plugin/         → repo root /.claude/.claude-plugin
dot-claude-plugin/marketplace.json → repo root /.claude-plugin
(generated)                        → repo root /.claude/harness.json
gitignore-stanza.txt               → APPENDED to the repo's .gitignore, not copied
```

## After copying — the three things a skill cannot do for you

1. **Append the gitignore stanza and verify it.** Run `git check-ignore -v .claude/skills/pipeline-ship/SKILL.md .claude/agents/builder.md .claude/hooks/agent-guard.mjs .claude/harness.json`. **No output means the skills are tracked**, which is what you want. Output means they are ignored and would be absent from every other clone. This is the single easiest thing to get silently wrong.
2. **Create the Linear team and its workflow statuses**, in this order: Backlog · Scoping · POC · Implementation · QA · Documentation · Shipped · Dropped. Set Shipped's type to `completed` and Dropped's to `canceled`. Create the `type` label group as exclusive; create the `area-*` labels **ungrouped** (flat, multi-select).
3. **Confirm the deploy topology matches what you filled into `{{INTEGRATION_STEP}}`** — whether your host gives you a preview per branch, or you need a long-lived integration branch.

## Placeholder legend

### Identity

| Placeholder            | Meaning                                                  |
| ---------------------- | -------------------------------------------------------- |
| `{{PROJECT_NAME}}`     | Human-readable project name                              |
| `{{USER}}`             | Who runs QA and approves advances — a name, not "the user" |
| `{{SLUG}}`             | kebab-case, ≤30 chars: names the plugin (`<slug>@<slug>-local`) and the agents (`<slug>:builder`) |
| `{{DATE}}`             | Today, ISO format                                        |

### Linear

| Placeholder              | Meaning                                              |
| ------------------------ | ---------------------------------------------------- |
| `{{LINEAR_WORKSPACE}}`   | Workspace slug, as it appears in issue URLs          |
| `{{TEAM_NAME}}`          | Team name                                            |
| `{{TEAM_KEY}}`           | Team key — the `MIX` in `MIX-42`                     |
| `{{TYPE_LABELS}}`        | The exclusive `type` group members                   |
| `{{AREA_LABELS}}`        | The flat `area-*` labels, one per meaningful folder  |
| `{{PROJECT_TABLE}}`      | Linear Projects and what each covers, or "none yet"  |
| `{{ESTIMATE_RUBRIC}}`    | What each estimate value means on this team          |

### Code and deploy

| Placeholder                     | Meaning                                                        |
| ------------------------------- | -------------------------------------------------------------- |
| `{{PROD_BRANCH}}`               | Production branch, usually `main`                              |
| `{{BUILD_TEST_CMD}}`            | The command gating "Implement done"                            |
| `{{REPO_CONVENTIONS}}`          | House rules — module style, HTTP client, file layout            |
| `{{INTEGRATION_STEP}}`          | Step 7 of the git workflow: how a branch reaches a QA target    |
| `{{INTEGRATION_NOTE}}`          | Same topology, stated for the Implement stage                   |
| `{{QA_TARGET_NOTE}}`            | Where QA happens and how it is isolated from production data    |
| `{{DEPLOY_MODEL_NOTE}}`         | What actually triggers a production deploy                      |
| `{{DEPLOY_NOTE}}`               | One-line version of the above, for the guardrail list           |
| `{{BUILD_VERIFY_METHOD}}`       | **How to prove the deployed artifact carries the pushed commit** |
| `{{INTEGRATION_BRANCH}}`        | The long-lived QA branch, e.g. `staging` (flag `integration`)   |
| `{{QA_BUILD_CHECK}}`            | A shell command that prints the QA build's commit SHA; `qa-runner` polls it |
| `{{DEV_CMD}}`                   | The local dev server command                                    |
| `{{DB_LOCAL_CHECK}}`            | Rebuild the local database and run its tests (flag `database`)  |
| `{{DB_PUSH_CMD}}`               | Apply migrations to the hosted database; QA only, never a subagent |
| `{{DEPLOYMENT_SECTION}}`        | The root `CLAUDE.md` deployment runbook                         |

> `{{BUILD_VERIFY_METHOD}}` is the one people skip. A green CI run and a clean push are not proof that anything published. The usual answer is a build-stamped file (`build-meta.json` carrying `commitRef`) fetched with a cache-buster and compared against the pushed SHA. If you have no way to answer this, say so explicitly in the file rather than leaving the placeholder — an unverifiable ship is a known risk, not an oversight.

### Sketches (flag `ui`)

| Placeholder       | Meaning                                                        |
| ----------------- | -------------------------------------------------------------- |
| `{{TOKENS_PATH}}` | The design tokens CSS file sketches link, from the repo root   |
| `{{FRAMES}}`      | Frame sizes as a sentence, e.g. "Phone frames 402px wide" or "Phone frames 390px and desktop frames 1280px" |

### Secrets, security, analytics

| Placeholder                      | Meaning                                                |
| -------------------------------- | ------------------------------------------------------ |
| `{{RUNTIME_SECRETS_LOCATION}}`   | Where the runtime reads secrets                        |
| `{{SECURITY_SURFACES}}`          | What triggers a security review on this project        |
| `{{SECURITY_NOTE}}`              | The project's specific authz model, in two sentences   |
| `{{ANALYTICS_NOTE}}`             | Event naming convention, or "no analytics on this project" |

### Context files

| Placeholder                  | Meaning                                                           |
| ---------------------------- | ----------------------------------------------------------------- |
| `{{PATH_ROUTING_TABLE}}`     | **changed path → context file + persona.** The canonical map      |
| `{{SUB_CLAUDE_POINTERS}}`    | One line per sub-`CLAUDE.md`                                      |
| `{{SUB_CLAUDE_BUDGETS}}`     | Char budget per sub-file                                          |
| `{{SUB_CLAUDE_CONTENTS}}`    | What belongs in each                                              |
| `{{ROOT_BUDGET}}`            | Root budget. Start at 15,000 chars                                |
| `{{ON_DEMAND_DOCS}}`         | Reference docs not loaded by default, or "none yet"               |
| `{{PERSONA_PATH_TABLE}}`     | changed path → persona                                            |
| `{{PERSONA_STAGE_RULES}}`    | persona → stage, regardless of paths                              |
| `{{PERSONA_POINTERS}}`       | One line per persona, for root `CLAUDE.md`                        |
| `{{PERSONA_RULES}}`          | Same, for `harness-notes.md`                                      |

### Stage-specific

| Placeholder                 | Meaning                                                         |
| --------------------------- | ---------------------------------------------------------------- |
| `{{POC_TABLE}}`             | task type → what "smallest testable" means. Tune to project type |
| `{{SCOPE_PERSONA_NOTE}}`    | Which personas always run at Scope                               |
| `{{CONTEXT_BUDGET_CHECK}}`  | Optional: a budget check folded into the ship stage              |
| `{{PROJECT_GUARDRAILS}}`    | Project-specific guardrails appended to the universal list       |

### Root `CLAUDE.md` content

`{{ONE_PARAGRAPH_DESCRIPTION}}` · `{{STACK_LIST}}` · `{{REPO_LAYOUT}}` · `{{COMMANDS}}` · `{{ENV_VAR_NAMES}}` · `{{UNIVERSAL_RULES}}` · `{{SHIPPED_LIST}}` · `{{DROPPED_LIST}}` · `{{PROJECT_GOTCHAS}}` · `{{HARNESS_DEBT}}`

On a new project most of these are empty. That is fine — `{{SHIPPED_LIST}}` genuinely is empty, and `{{PROJECT_GOTCHAS}}` fills itself in as the Documentation stage folds fragments. Leave the headings so there is an obvious place for the first entry.

## A note on placeholders you cannot fill yet

Delete the section rather than leaving `{{PLACEHOLDER}}` in a live file. A stale placeholder reads as a fact that was never checked, and later sessions will treat it as one. The exception is `{{BUILD_VERIFY_METHOD}}` — replace that one with an explicit statement that verification is not yet possible, because the absence is itself the risk.
