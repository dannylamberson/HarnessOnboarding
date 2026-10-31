# Scaffold: filling the kit into the new repo (kickoff step 6)

Two halves, in order: the **app skeleton** (so there's a gate to run), then the **harness** from `kit/`.

## The app skeleton

The smallest app that builds and deploys, in the stack the user picked. Nothing feature-shaped: features are cards.

- **Init** with the framework's own starter (`npm create vite@latest`, `npx create-next-app`, …), into the clone.
- **The gate:** one script, `check`, that runs lint, typecheck, test and build in that order and fails on any of them.
  One trivial test so the test step has something to run.
- **`build-meta.json`:** a step in the build that writes the deployed commit SHA into the output (`setup.md` › 8.3).
- **`.env.example`** with names only.
- **Design tokens** when there's UI (sketches link them): one CSS file of custom properties (colors for light and dark, spacing, radius,
  type sizes) at `TOKENS_PATH`, used by the app's base styles.
- Run the gate locally and confirm it passes before going on.

## The answers file

The interview filled it: `values` for every `{{KEY}}`, `flags` (`ui`, `database`, `delegation`), and `offLimits`
(regex `pattern` plus a `label` per command a subagent may never run). `kit/answers.example.json` shows every key.
Escape backslashes in the JSON regexes. Add the deploy CLI, the database push and `gh` at minimum; `git push` is
always refused to the builder by the guard itself.

## Run the scaffold

```
node <this skill>/kit/scaffold.mjs --answers <answers.json> --target <clone>
```

It copies the kit, mapping `dot-claude` → `.claude`, `dot-claude-plugin` → `.claude-plugin`, `SLUG` → the slug and
dropping `.tmpl`. It fills every `{{KEY}}`, keeps or drops the `<!-- if:flag -->` blocks, writes
`.claude/harness.json`, and appends the harness lines to `.gitignore`. Then it prints three lists:

- **Placeholders with no answer:** a key missing from the answers. Add it and run again (exit 2 until none).
- **Exists, not written:** never overwritten without `--force`. Merge by hand (below).
- **FILL markers:** `{{FILL: ...}}` lines for you to write by hand from the interview: the context map rows, the
  project rules, the personas' paths, project-specific POC rows. Replace each one; none may survive the first commit.

## Then by hand

1. Write every FILL marker. The project rules and gotchas come from interview Phase 4.
2. Folder `CLAUDE.md` files for the folders the skeleton has (a sentence or two each), with rows in root's context map.
3. `node .claude/scripts/context-size.mjs` passes, and `grep -rn "{{" .` finds nothing outside `node_modules`.
4. **Commit on `main`:** stage the files by name (or by folder: the skeleton, `.claude/`, `.claude-plugin/`, `docs/`,
   `CLAUDE.md`, `README.md`, `.gitignore`), never `git add -A`.
   `chore(kickoff): scaffold <name> with the pipeline harness`. Push.
5. Cut the QA branch (`setup.md` › 5.4).

## Existing repos

The scaffold never overwrites, so run it straight at the clone, on a branch (`harness-kickoff`), and merge what it
skipped by hand:

- **An existing pipeline skill or stage skills:** keep the project's own playbook and add what's missing from the
  kit's (the step 0 harness check, sketches at Scope, delegation, the maintenance path) as sections in theirs. Don't
  run two pipeline skills side by side.
- **An existing root `CLAUDE.md`:** keep it. Add the context-map rows for the harness and the commands table rows.
  If it's over the 8 KB budget, say so; trimming it is a separate maintenance PR.
- **Existing personas or docs:** keep theirs, and route them in `docs/personas/README.md`.
- **Existing account-level skills** for the same project (on claude.ai or in `~/.claude/skills`): list them for the
  user. One that duplicates or contradicts the repo's playbook should be retired, by the user, in their settings.

Land it as **one maintenance PR**, not a card. The user reviews it, and it merges like any other.
