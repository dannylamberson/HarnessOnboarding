# HarnessOnboarding

This repo is where new projects start. Open this folder in Claude Code, say **"I have a new project idea"**, and the
`harness-onboarding` skill (`.claude/skills/harness-onboarding/SKILL.md`) runs a kickoff. It interviews Danny, sets up
Linear, the GitHub repo, hosting and the database with him, installs the repo-embedded pipeline harness, and seeds
the backlog, so the project's next session can start building.

## The idea in one paragraph

Claude Code is Danny's agile product team. Each session is a new engineer's first day. The **harness** is their
playbook: the per-stage skills, `docs/pipeline-core.md`, the agents and the guards. The project's **context files**
(`CLAUDE.md`, `docs/`) are the docs on what's been built so far. Ideas become Linear cards. Each card runs Groom →
Scope → POC → Implement → QA → Document → Ship. Opus leads, Sonnet builds and Haiku checks.

## Layout

| Path | What |
| --- | --- |
| `.claude/skills/harness-onboarding/SKILL.md` | The kickoff, steps A–I |
| `.claude/skills/harness-onboarding/references/` | The rationale and evidence (`pipeline-spec.md`), context economy, tool roles, the interview, setting up the tools, a worked example |
| `.claude/skills/harness-onboarding/template/` | The harness a project gets. `dot-claude/` becomes `.claude/`, `dot-claude-plugin/` becomes `.claude-plugin/`, and `CLAUDE.md.tmpl` becomes `CLAUDE.md` (stored so that this repo doesn't load them). `SETUP.md` has the copy map and the placeholder legend |
| `.claude/skills/harness-onboarding/template/scaffold.mjs` | Copies the template into a repo from an answers file, fills the mechanical placeholders, and lists the rest |
| `docs/` | Plans and notes about this repo |

## Rules for changing this repo

- **Changes here are maintenance PRs, not cards.** One branch, one PR, Danny reviews.
- **The template is the source of truth for new projects.** A practice proven on a live project (household, mixtape)
  gets generalized into `template/` here, with its evidence. Keep project names, IDs and URLs out of the template.
- **Never restate a shared fact in a stage skill.** Shared facts live in `template/docs/pipeline-core.md`, as in any
  project the template produces.
- **Keep the template's code placeholder-free.** Hooks and scripts read `.claude/harness.json` at runtime.
- **Run `node .claude/skills/harness-onboarding/template/scaffold.test.mjs`** after changing the template. It
  scaffolds scratch repos and checks placeholders, git tracking, the guards, the harness check, the context check
  and the flags.
