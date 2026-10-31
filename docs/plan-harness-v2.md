# Harness v2: plan

Drafted 2026-10-31 from a read of `household` (main @ 5dd64d7), `PlaylistBot` (staging @ a5a6e94) and this repo
(05d7221). Decisions settled with Danny the same day.

**Status:** Part 1 is built on branch `harness-v2`. `kit/scaffold.test.mjs` passes 18 of 18. A scaffolded plugin
installed into a throwaway config with the real CLI, and its harness check printed `Result: ok`. Not run yet: a live
kickoff against real Linear, GitHub, Netlify and Supabase (1e's from-scratch dry run). Part 2 (mixtape) is next.

## The vision

HarnessOnboarding is where every new project starts. Danny opens a Claude Code session in this folder, describes the
big idea, and leaves with three things:

- a repo
- a board
- the hosting and data services it needs

The repo is already wired with a harness, so the **next** session can pick up the first card and build.

The model is an agile product team:

- **Danny is the product owner and customer.** He brings ideas, makes decisions, runs QA on a real preview and signs off.
- **Linear (or another board) breaks ideas into chunks.** One card is one feature. Each card goes Scope → POC → Implement → QA →
  Document, and the next iteration starts from what got documented.
- **Every Claude Code session is a new engineer's first day.** The harness is their **playbook**: how this team works,
  in the pipeline skill, its references and the agents. The context files are the **docs on what's been built so far**:
  `CLAUDE.md` files and `docs/`. The playbook gets tuned per project, and the high-level practices come from here.
- **The team has roles.**
  - Opus leads: scopes, plans, decides and reviews.
  - Sonnet builds.
  - Haiku runs the mechanical checks.
  - Personas are the specialist reviewers: UX, database, platform.
  - Danny is the customer in QA.

The practices every generated harness carries:

- Mockups before code.
- Tests and a gate command.
- QA on a preview.
- Additive database migrations with access rules.
- Branch, PR and merge discipline, with a staging target.
- Documentation that loops back into the context files.

---

## Decisions (settled 2026-10-31)

1. **Install.** The kickoff session does it. It creates the repo with the harness committed inside it, runs the
   one-time install on this machine and checks it works. The README records the two commands for any other machine.
   Nothing about the harness lives only on one machine; it all rides in the project repo.
2. **Models.** Opus (high) leads. `builder` is Sonnet (medium), `qa-runner` Haiku (medium), `doc-writer` Sonnet,
   `context-check` Haiku, `context-audit` Sonnet.
3. **Harness and docs changes are a PR, not a card.** Card stages are for product work. Harness updates, playbook
   tweaks and doc reorganizations go straight to one reviewed PR. v2 adds this as a **maintenance path** next to the
   hotfix path. Mixtape's update is one harness PR.
4. **Intake skills may live on claude.ai.** Danny uses them in Cowork chat as well as Claude Code. Household's intake
   is already updated (sketches, Oct 31), and HOU-100 is not needed. v2 generates the project's intake skill as a
   package to upload to claude.ai, not a repo-only file.
   - *Observed:* the local copy Claude Code syncs (`~/.claude/skills/synced/…/household-scope-intake`) is still the
     Oct 15 version, which says "no mockups". The claude.ai/Cowork copy is current. Claude Code sessions may see the old
     one until the sync catches up.

---

## Part 1: HarnessOnboarding v2, the project kickoff

### 1a. Make this folder a kickoff studio

- Today the skill sits at `harness-onboarding/`, which Claude Code doesn't auto-load. This session used the
  account-synced copy instead, and **that copy has no `references/` folder**.
- Move the skill to `.claude/skills/harness-onboarding/` so opening this folder loads the repo's own copy.
- Add a short `CLAUDE.md`: "this repo starts new projects; say *I have a new project idea*".
- Keep a packaged `.skill` for claude.ai in Releases, built from the same folder, so the two can't drift.
- Add `kit/`: the harness files as **real files with `{{PLACEHOLDERS}}`**, not templates buried in markdown. That's
  the agents, hooks, `harness-check.mjs`, plugin manifests, the reference docs and a `CLAUDE.md` skeleton. Real files
  can be copied, validated and tested.

### 1b. The kickoff flow (replaces steps A–G)

Every outward-facing step is confirmed before it runs. Danny creates any new account himself; the session can't sign
up for services. Order of operations:

| # | Step | What happens | Why here |
| --- | --- | --- | --- |
| 1 | **The big idea** | Danny pitches it. Claude asks what it's for, who uses it, phone or desktop, and whether it's starting from scratch or an existing repo | Everything else depends on it |
| 2 | **Interview and advise** | Roles and tools, recommended per role and adapted to the connectors he has: board, repo, hosting, database, analytics, secrets, **models**. Plus "does it have UI?" (turns sketches on, sets frame sizes) and "what must a builder never run?" | Same as today, with the new questions |
| 3 | **Confirm the plan** | One compact summary: name, slug, a tool per role, QA target, gate command | The cheap moment to catch a wrong assumption |
| 4 | **Board** | Create the Linear team (or another board): the statuses Backlog → Scoping → POC → Implementation → QA → Documentation → Shipped, plus Dropped, and the `area-*` / `persona-*` / type labels | The idea needs somewhere to be broken down before code exists |
| 5 | **Repo** | `gh repo create`, clone locally, `main` as production, `staging` as the QA branch | Hosting and the harness both need it |
| 6 | **Scaffold** | The app skeleton (framework init, gate command) and the harness kit filled from `kit/`. First commit, push | The harness ships with the first commit |
| 7 | **Install and check** | `claude plugin marketplace add <clone>`, `claude plugin install <slug>@<slug>-local`, then `harness-check.mjs` should print ok | Proves the next session gets the playbook |
| 8 | **Hosting** | Connect the repo: production from `main`, the QA site from `staging`, previews per PR. First deploy green | Needs the repo; QA needs a preview target |
| 9 | **Database** (if any) | Create the project (free tier, after confirming cost), the local stack, auth settings, env vars into hosting and `.env.example`. No tables yet: they come with cards | Wired once, so cards only add migrations |
| 10 | **Seed the backlog** | Run the intake on the big idea. It gives ordered, pipeline-sized cards, with the first one or two scoped and **sketched** if they have UI | The next session starts on a real card |
| 11 | **Hand off** | A first-session prompt (`claude --agent pipeline-lead --effort high`, "what's next?"), the intake package to upload to claude.ai, and a short checklist of anything manual that's left | Clean start for engineer #1 |

### 1c. What the generated harness contains

| Piece | Path in the new repo | Source pattern |
| --- | --- | --- |
| Plugin manifests | `.claude/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `docs/harness-plugin.md` | HOU-87 |
| Pipeline skill (the playbook) | `.claude/skills/<slug>-pipeline/SKILL.md` | Household's shape: step 0 harness check, stage table, a playbook per stage, advance/pivot/drop, **hotfix and maintenance paths** |
| References | `…/references/{delegation,sketches,poc,qa,hotfix,labels,spikes}.md` | HOU-71/73/74/99, generalized |
| Agents | `.claude/agents/{pipeline-lead,builder,qa-runner,doc-writer,context-check,context-audit}.md` | The model table above. The gate, staging branch and forbidden commands come from the interview |
| Guards | `.claude/hooks/{hooks.json,agent-guard.mjs,builder-guard.mjs,qa-runner-guard.mjs,harness-check.mjs}` | Household. The builder can't push, deploy, push the DB or touch the board; the QA runner pushes only `staging` |
| Context files | Root `CLAUDE.md` (table of contents, stack, commands, rules, Shipped), folder `CLAUDE.md`s, `docs/shipped.md` | Household. Budgets are optional (`context-size.mjs`) |
| Personas | `docs/personas/{README,ux,db,…}.md` | Only the lenses this project needs (UX if it has UI, db if it has a database, platform if PWA or mobile) |
| Sketches | `sketches/` gitignored. The reference says frame widths, the tokens path and where screenshots go | HOU-99 |
| Intake skill | `<slug>-scope-intake.skill` package to upload to claude.ai | Household intake (Oct 31 version) |

### 1d. Spec, interview and docs edits

- `pipeline-spec.md`:
  - Add the vision framing ("each session is a new engineer; the harness is the playbook").
  - Three new non-negotiables: the harness lives in the repo, new UI is sketched at Scope, and Opus plans while
    cheaper models build.
  - Add the maintenance path.
  - Fix `ask_user_input_v0` to `AskUserQuestion` in Claude Code.
- `interview.md`: add the new questions to 1b steps 1–2, and remove the "where do I write the skill" question.
- `tool-roles.md`: add the models role, and preview tooling (browser pane, Playwright) for showing sketches.
- `example-output.md`: Trailhead as a kit, shown as a file tree plus the key excerpts.
- `README.md`: the vision, how to start a kickoff ("open this folder in Claude Code, say *I have a new project idea*"),
  and what you get.

### 1e. Verify

- **Dry run, from scratch:** a throwaway project with real tools, deleted afterwards. Check it reaches step 11 with
  `harness-check` ok and a green first deploy.
- **Dry run, existing repo:** mixtape (Part 2) is the real test of the existing-codebase branch.

---

## Part 2: mixtape (PlaylistBot), one harness PR

On a branch cut from `main`. The local checkout currently sits on `staging`.

- **Plugin:** make `.claude/` the `mixtape` plugin with a marketplace in the repo. Add `harness-check.mjs` and
  `docs/harness-plugin.md`, then install it on this machine.
- **Delegation:**
  - The 6 agents and guard hooks.
  - The builder guard refuses all `git push`, `gh`, `netlify` and `supabase db push`. This matters more here, because
    pushing `main` **is** the production deploy.
  - The QA runner may push only `origin staging` and rebuilds staging in a worktree.
  - The gate is `npm run lint && npm test`.
  - `doc-writer` writes the `docs/changes/` fragment, not the shared docs, which are folded at ship.
  - Add a Delegation section to `docs/pipeline-core.md`, and a delegation line in each stage skill.
- **Sketches at Scope:**
  - Add `pipeline-core` › Sketches, or a reference file: `sketches/<slug>/` gitignored, linking `public/tokens.css`,
    with mobile and desktop frames.
  - `pipeline-poc`'s "New web UX/UI" row builds the approved sketch instead of making a mockup.
  - `/design:ux-copy` moves to Scope, run on the sketch.
- **Maintenance path:** add it to `pipeline-core.md` (harness and docs changes are one PR, no card).
- **Danny, on claude.ai:**
  - Update `mixtape-scope-intake`. It still says "no mockups", and the PR will include a drafted replacement to upload.
  - Retire the Asana-era `playlist-bot-pipeline`, which still triggers on "what's next".
  - Optionally move `mixtape-context-audit` into the repo, since it isn't used in Cowork.
- **Later, separately:** trim root `CLAUDE.md` (28.9 KB, against household's 8 KB budget) and port `context-size.mjs`.

Order: Part 1 first, so mixtape is built from the v2 kit and doubles as its existing-repo test.
