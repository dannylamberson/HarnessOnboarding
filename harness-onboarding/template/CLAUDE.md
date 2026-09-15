# {{PROJECT_NAME}} — CLAUDE.md

<!--
  This is the root context file. It is read at the start of EVERY session, so
  everything in it is paid for every time. Keep it to project-wide facts.

  Budget: {{ROOT_BUDGET}} chars. Check with `wc -c CLAUDE.md`.
  When it goes over, move detail into a sub-CLAUDE.md or an on-demand doc —
  the rules for that are in docs/harness-notes.md.
-->

## Project

{{ONE_PARAGRAPH_DESCRIPTION}}

## Stack

{{STACK_LIST}}

## Repo layout

```
{{REPO_LAYOUT}}
```

## Commands

```bash
{{COMMANDS}}
```

## Environment variables

Never commit `.env` — use `.env.example` for documentation. Secrets live in {{RUNTIME_SECRETS_LOCATION}} and in CI secrets.

Key vars (full descriptions in `.env.example`): {{ENV_VAR_NAMES}}

## Universal rules

Rules that apply across every layer. Folder-specific rules belong in that folder's file.

{{UNIVERSAL_RULES}}

## Folder-specific guidance

These files load automatically when files in that folder are read. Don't duplicate their content here.

{{SUB_CLAUDE_POINTERS}}

## Personas, conscience, pipeline

Consulted at specific stages — not loaded by default. See each file for usage rules.

{{PERSONA_POINTERS}}

- `docs/pipeline-core.md` — **pipeline workflow source of truth.** Linear team/status reference, startup routine, card creation and naming, advance/pivot/drop templates, universal guardrails, git workflow. Each stage has its own repo-local skill in `.claude/skills/` carrying only that stage's playbook. **Don't restate a shared fact inside a stage skill — it belongs here.**
- `docs/harness-notes.md` — how the harness is shaped; what lives where; context budgets
- `docs/feature-history.md` — full descriptions of every shipped feature. **Written only at ship time**, by `pipeline-ship`'s fold. A card's Documentation stage writes a fragment under `docs/changes/` instead of editing the shared docs (`docs/changes/README.md`).

### On-demand reference

Read when you need the detail; not loaded by default.

{{ON_DEMAND_DOCS}}

## Post-task checklist

After completing any task: `{{BUILD_TEST_CMD}}` must pass before committing.
Commit message format: `type(scope): short description` — scope is the card slug.

## Deployment

{{DEPLOYMENT_SECTION}}

## Features (status only — full descriptions in `docs/feature-history.md`)

### Shipped

{{SHIPPED_LIST}}

### Deferred / dropped

{{DROPPED_LIST}}

## Project-wide gotchas

These don't fit a single folder. Folder-specific gotchas live in the sub-CLAUDE.md files.

<!--
  The highest-value lines in the whole harness. A gotcha earns its place here
  only if it is genuinely cross-cutting. Anything folder-scoped goes in that
  folder's file, where it is loaded only when relevant.

  Write each one as: what goes wrong → why it is not obvious → what to do instead.
-->

{{PROJECT_GOTCHAS}}
