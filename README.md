# Harness Onboarding

**Start every new project with a product team already in place.**

Open this repo in Claude Code, say *"I have a new project idea"*, and pitch it. The `harness-onboarding` skill runs a
kickoff:

1. It interviews you about the idea and advises on the stack, one role at a time: board, repo, hosting with a QA
   site, database, analytics, secrets, models.
2. It walks you through setting each one up: the board's stages and labels, a new GitHub repo, production and QA
   sites, the database.
3. It scaffolds the repo with a **pipeline harness** committed inside it, and installs it.
4. It turns your idea into the first cards on the board, with the first one scoped and its screens sketched.
5. It hands you a one-line prompt for the first build session.

It's the companion to the workflow in
[Don't Prompt and Pray — Build Like a Dev Team](https://ddbbll.me). Building software got cheap; discipline got more
important.

## The idea

Treat Claude Code like an agile product team. **You're the product owner and the customer.** Every Claude Code
session is a new engineer's first day, so it needs two things:

- **A playbook:** how this team works. Every idea is one card. Each card goes **Scope → POC → Implement → QA →
  Document**, one card per session, with a hotfix path for small fixes and a maintenance path for changes to the
  playbook itself.
- **The docs:** what's been built so far. That's `CLAUDE.md` files next to the code, written back at the end of every
  card, so the next engineer starts smarter than the last.

## What every scaffolded harness does

- **Mockups before code.** New UI is sketched as throwaway HTML at Scope, with options side by side, and you pick
  before anything is built or any database changes.
- **Opus plans, Sonnet builds, Haiku checks.** The main session (Opus) scopes, plans and reviews. A `builder` agent
  (Sonnet) writes code from the plan; a `qa-runner` (Haiku) handles the QA branch and the shell checks; `doc-writer`
  and `context-check` keep the docs current and within budget.
- **Guard hooks** stop subagents from pushing, deploying, touching the hosted database or the board.
- **You run QA** on a real QA site, from a short test script. Nothing is "done" off a green build.
- **The harness lives in the repo** as a Claude Code plugin. It loads from any folder, updates with `git pull`, and
  checks itself at the start of every session.
- **Review personas** (UX, database) raise the questions you'd otherwise hit in QA.

## Using it

Clone this repo, open the folder in Claude Code, and say *"I have a new project idea"*. Opening the folder is enough:
the skill lives in `.claude/skills/harness-onboarding/`, so it loads from the repo.

It also adapts an existing codebase: say *"set up the harness on my repo at …"*.

To use it in claude.ai chat as well, zip `.claude/skills/harness-onboarding/` and upload it in Settings →
Capabilities. Kickoff steps that create repos, run the scaffold or install the plugin need Claude Code.

## What's inside

```
.claude/skills/harness-onboarding/
├── SKILL.md                    # the kickoff, steps 1–11
├── references/
│   ├── pipeline-spec.md        # the canonical, tool-agnostic harness
│   ├── interview.md            # the questions
│   ├── tool-roles.md           # options per role, and detecting what you have
│   ├── setup.md                # provisioning board, repo, hosting, database, in order
│   ├── scaffold.md             # filling the kit into a repo
│   └── example-output.md       # a worked kickoff
└── kit/                        # the harness files a new repo gets, with {{PLACEHOLDERS}}
    ├── scaffold.mjs            # copies and fills the kit from an answers file
    ├── scaffold.test.mjs       # scaffolds scratch repos and checks the guards, scripts and flags
    └── …
```

## Changing it

Practices proven in a real project get generalized into `kit/` here, as a PR. After changing the kit, run:

```
node .claude/skills/harness-onboarding/kit/scaffold.test.mjs
```

## License

MIT, see [LICENSE](LICENSE).
