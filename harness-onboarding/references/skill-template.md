# Skill template — produce `[slug]-pipeline/SKILL.md`

Fill this in from the interview to generate the user's pipeline skill. Replace every
`{{PLACEHOLDER}}`, drop optional sections that don't apply, and tune the POC table to the
project type. The result is written to `[slug]-pipeline/SKILL.md`.

## Placeholder legend

| Placeholder | From the interview |
| --- | --- |
| `{{PROJECT_NAME}}` | Human-readable project name |
| `{{SLUG}}` | kebab-case slug; the skill becomes `{{SLUG}}-pipeline` |
| `{{ONE_LINE}}` | One-line description |
| `{{GOAL}}` | The ultimate goal / what success looks like |
| `{{PROJECT_TYPE}}` | web app / static site / backend service / CLI / data-bot / mobile |
| `{{BOARD_TOOL}}` | Task board (Asana, Linear, GitHub Projects, markdown file, ...) |
| `{{BOARD_LOCATION}}` | Board URL/ID or path to the backlog file |
| `{{REPO_HOST}}` + `{{REPO}}` | Code host and `owner/repo` |
| `{{PROD_BRANCH}}` | Production branch (e.g. `main`) |
| `{{HOSTING}}` | Hosting platform |
| `{{PREVIEW_PATTERN}}` | How preview URLs look / staging target |
| `{{PROD_URL}}` | Production URL |
| `{{BACKEND}}` | Backend/DB tool, or "none" (drop the section) |
| `{{ANALYTICS}}` | Analytics tool, or "none" (drop the reminder) |
| `{{BUILD_TEST_CMD}}` | Command(s) that gate "Implement done" |
| `{{CONTEXT_FOLDERS}}` | Folders that get their own `CLAUDE.md` |
| `{{PROJECT_CONTEXT}}` | The Phase-4 extra context block |

## Writing the description

The generated skill's `description` is what makes it trigger in future sessions, so make
it specific and a little pushy. Name the project, the repo, the key tools, and the moments
it should fire: "pick up the next card", "what's next", "advance/ship a card", "work on
`{{SLUG}}`", mentions of the repo or its tools. Keep it under 1024 characters and use no
angle-bracket characters.

## Template (everything inside the fence is the file to write)

~~~markdown
---
name: {{SLUG}}-pipeline
description: "Workflow guide for building {{PROJECT_NAME}} ({{ONE_LINE}}) through a five-stage pipeline (Backlog, Scoping, POC, Implementation, QA, Documentation, Shipped) on {{BOARD_TOOL}}. Use whenever the user wants to pick up a task, work on the next card, advance a phase, complete a subtask, move a card forward, asks what's next on {{PROJECT_NAME}}, mentions a card slug, wants a quick hotfix to the live site, or talks about the {{REPO}} repo or {{PROJECT_NAME}}. Enforces one card per session, the hotfix shortcut, and how to update the board and {{REPO_HOST}} after each subtask."
---

# {{PROJECT_NAME}} pipeline

{{ONE_LINE}}. Goal: {{GOAL}}.

This skill governs all work on {{PROJECT_NAME}}. Each idea is one card on {{BOARD_TOOL}}
({{BOARD_LOCATION}}); cards flow through five fixed stages, one card per session.

## Stack

- Type: {{PROJECT_TYPE}}
- Code: {{REPO_HOST}} `{{REPO}}`, production branch `{{PROD_BRANCH}}`
- Hosting: {{HOSTING}} — preview at {{PREVIEW_PATTERN}}, production at {{PROD_URL}}
- Backend/data: {{BACKEND}}            (drop this line if none)
- Analytics: {{ANALYTICS}}             (drop this line if none)
- Build/test gate: `{{BUILD_TEST_CMD}}`

## Project context

{{PROJECT_CONTEXT}}

## Core principles

- One card = one feature = one session. Push back on bundling.
- The human runs QA on the preview, then reports back. Never call it done off a build alone.
- Confirm before advancing a card or doing anything bulk/destructive.
- Knowledge compounds: the Document stage writes findings back into CLAUDE.md.

## Pipeline stages

| Stage | Subtask | Meaning |
| --- | --- | --- |
| Backlog | (not started) | Captured idea |
| Scoping | 1. Scope | Spec the idea |
| POC | 2. POC | Smallest proof it works |
| Implementation | 3. Implement | Production build |
| QA | 4. QA | Human reviews the preview |
| Documentation | 5. Document | Write knowledge back |
| Shipped | (done) | Live and documented |
| Dropped | (abandoned) | Superseded/infeasible |

Every card has five subtasks: 1. Scope, 2. POC, 3. Implement, 4. QA, 5. Document. The
card's stage tells you which to work on. Never skip stages.

## Startup routine — every session

1. Read `CLAUDE.md` (and the sub-CLAUDE.md for the area you're touching).
2. Confirm the target card. If asked "what's next," pick the lowest non-Backlog stage.
3. Read the card (notes, subtasks, comments). Respect any "Blocked by:".
4. Restate the plan in one sentence and wait for the user's OK.

## Per-subtask playbook

### 1. Scope
No code. Post a spec comment on the card: problem, success criteria, dependencies, open
questions. Resolve questions with the user. Done when posted and approved.

### 2. POC
Smallest testable proof for a {{PROJECT_TYPE}}:
{{POC_TABLE}}
Done when the core mechanic works in one real scenario the user can see.

### 3. Implement
Production code to the project's conventions (read CLAUDE.md first). Secrets stay
server-side. New env vars go in `.env.example` (and the runtime + CI). Build on a feature
branch; let {{HOSTING}} create the preview. Done when `{{BUILD_TEST_CMD}}` passes, a PR is
open and linked on the card, and the preview is live.

### 4. QA
Share the preview URL ({{PREVIEW_PATTERN}}). Tell the user exactly what to check. Fix bugs
in the same branch and re-push. After sign-off, rebase if `{{PROD_BRANCH}}` moved, merge,
confirm production at {{PROD_URL}}.

### 5. Document
Update the most specific CLAUDE.md. Context folders: {{CONTEXT_FOLDERS}}. Root CLAUDE.md
only for project-wide rules or the Shipped list.

## Hotfix path
For small, low-risk, unambiguous fixes: create a `[hotfix]` card (no subtasks, skip
Scope/POC), fix on a branch, PR + preview + the user's QA, then merge and document if a
pattern changed. Not for anything touching secrets, auth, deploy config, or data schema.

## Advancing a card — confirm first
Preview the move (mark subtask complete, current stage to next, any flags), get an OK,
then update the board.

## Git workflow
Stage specific files only; commit `type({{SLUG}}-scope): ...`; push the branch; open a PR
linking the card; post the PR link on the card; merge to `{{PROD_BRANCH}}` after sign-off.

## Guardrails
One card per session; don't skip stages; respect blockers; read CLAUDE.md first; secrets
server-side; preview for QA, production after sign-off; confirm before advancing; the
human runs QA; document in the right CLAUDE.md; capture findings as card comments.
~~~

## After writing

- Actually remove the backend/analytics lines if the project has neither, rather than
  leaving "none".
- Expand `{{POC_TABLE}}` into 3-5 rows tailored to `{{PROJECT_TYPE}}` (see
  `pipeline-spec.md` for the master list).
- If the board is a markdown file rather than a tool, reword "card/stage/subtask" to mean
  sections and checklist items in that file, and drop board-tool specifics.
- Tell the user this generated skill is theirs to evolve as the project grows.
