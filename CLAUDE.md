# HarnessOnboarding

This repo is where new projects start. Open this folder in Claude Code, say **"I have a new project idea"**, and the
`harness-onboarding` skill (`.claude/skills/harness-onboarding/SKILL.md`) runs a kickoff. It interviews Danny and advises
on the stack, then sets up the board, the GitHub repo, hosting and the database. It scaffolds the new repo with the
pipeline harness and seeds the backlog, so the project's next session can start building.

## The idea in one paragraph

Claude Code is Danny's agile product team. Each session is a new engineer's first day. The **harness** is their
playbook: the pipeline skill, its references, the agents and the guards. The project's **context files** (`CLAUDE.md`,
`docs/`) are the docs on what's been built so far. Ideas become cards on a board. Each card runs Scope → POC → Implement
→ QA → Document, and the next iteration starts from what got documented.

## Layout

| Path | What |
| --- | --- |
| `.claude/skills/harness-onboarding/SKILL.md` | The kickoff flow, steps 1–11 |
| `.claude/skills/harness-onboarding/references/` | The canonical spec, the interview, tool roles, setup steps per tool, how to scaffold, a worked example |
| `.claude/skills/harness-onboarding/kit/` | The harness files a new repo gets, with `{{PLACEHOLDERS}}`. `dot-claude/` becomes `.claude/`, `dot-claude-plugin/` becomes `.claude-plugin/`, and `SLUG` in a path becomes the project slug |
| `.claude/skills/harness-onboarding/kit/scaffold.mjs` | Copies the kit into a target repo from an answers file and reports any placeholder left |
| `docs/` | Plans and notes about this repo |

## Rules for changing this repo

- **Changes here are maintenance PRs, not cards.** One branch, one PR, Danny reviews.
- **The kit is the source of truth for new projects.** A practice proven in a live project (household, mixtape)
  gets generalized into the kit here. Keep project names, IDs and URLs out of the kit.
- **Keep the kit's code placeholder-free.** Hooks and scripts read `.claude/harness.json` at runtime, so
  `node --check` and the tests in `kit/scaffold.test.mjs` run on the kit as it is.
- **Run `node .claude/skills/harness-onboarding/kit/scaffold.test.mjs`** after changing the kit. It scaffolds a scratch
  repo and checks the guards, the harness check and the context-size script.
