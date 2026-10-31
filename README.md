# Harness Onboarding

**Start every new project with a product team already in place.** Open this repo in Claude
Code, say *"I have a new project idea"*, and pitch it. The `harness-onboarding` skill
interviews you, sets up Linear, the GitHub repo, hosting and the database with you, installs a
**repo-embedded pipeline harness**, and seeds the backlog, so your next session picks up the
first card and builds.

The idea: treat Claude Code like an agile product team. You're the product owner and the
customer. Every session is a new engineer's first day, so it needs a **playbook** (how this team
works: per-stage skills committed into your repo) and **the docs** (what's been built so far:
`CLAUDE.md` files, written back at the end of every card).

It's the "set up the harness for me" companion to the workflow described in
[Don't Prompt and Pray — Build Like a Dev Team](https://ddbbll.me). The barrier to building
software dropped; the discipline got more important. This installs that discipline into a
project in a few minutes.

## What it does

It runs a kickoff:

1. **The big idea** and a short interview: your tools, which folders get context files, your
   deploy topology, whether there's UI, which models.
2. **Set up the tools** with you, one confirmed step at a time: the Linear team and statuses, a
   new GitHub repo, production and a QA target, the database.
3. **Install the harness:** copy the template into the repo and fill it in, then install it as a
   plugin and check it's live.
4. **Seed the backlog:** the idea becomes ordered cards, with the first one scoped and its new
   screens sketched.
5. **Hand off** a one-line prompt for the first build session.

The interview is short on purpose. The harness is already written; you're filling blanks in
a structure that exists, not designing one from scratch.

## What gets installed

Into your repo, not your Claude settings:

```
CLAUDE.md                          root context file
docs/pipeline-core.md              shared source of truth for every stage
docs/harness-notes.md              context budgets and what-lives-where
docs/changes/                      per-card documentation fragments
docs/personas/                     review lenses, consulted per stage
.claude/skills/pipeline-groom/     ┐
.claude/skills/pipeline-scope/     │
.claude/skills/pipeline-poc/       │ one thin skill per stage,
.claude/skills/pipeline-implement/ │ committed to the repo
.claude/skills/pipeline-qa/        │
.claude/skills/pipeline-document/  │
.claude/skills/pipeline-ship/      ┘
.claude/agents/                    Opus lead, Sonnet builder, Haiku QA runner, doc agents
.claude/hooks/                     guards (subagents can't push or deploy), the startup check
docs/delegation.md                 which model does what
docs/sketches.md                   throwaway HTML sketches of new UI, at Scope
```

**Mockups before code.** A card that adds UI gets a throwaway HTML sketch at Scope, with options
side by side. You pick before anything is built or any database changes, which is where QA
back-and-forth used to come from.

**Opus plans, Sonnet builds, Haiku checks.** The main session (Opus) grooms, scopes, sketches,
plans, reviews and ships. A `builder` (Sonnet) writes code from the plan, a `qa-runner` (Haiku)
does QA's mechanical work, and `doc-writer` and `context-check` keep the docs. Guard hooks stop
subagents from pushing, deploying or touching the database.

**Why in the repo?** The skills are versioned, travel with every clone, and get reviewed in
the same PR as the code they govern. A harness living in someone's personal Claude settings
is one that silently describes a workflow the repo abandoned weeks ago. The same `.claude/`
folder is also installed as a plugin, loaded in place from each machine's clone, so the agents
and guards register from any folder and `git pull` keeps it current.

## The pipeline

```
Backlog → Scoping → POC → Implementation → QA → Documentation → Shipped
   ↑                                                      ↓
   └────────── knowledge loops back into CLAUDE.md ───────┘
```

Every idea is one Linear issue. **The issue's status is the stage** — no subtask checklist,
no second source of truth. One card, one feature, one branch.

Two stages commonly left out of workflow designs, and shouldn't be:

- **Groom** asks *"should this card still exist?"* — a different question from Scope's *"how
  do we build it?"* Backlogs rot, and a stale backlog that looks reviewed is worse than one
  that obviously isn't.
- **Ship** is its own stage, not QA's tail: batch composition, per-feature merges, the
  documentation fold, and build verification.

Documentation runs **before** Ship, which is backwards from the intuitive order and is what
makes conflict-free documentation possible.

## The part most workflow guides skip

Half the harness is the pipeline. The other half is the **context economy** — deciding what
Claude knows when it starts, and what that costs every session.

Left ungoverned on the project this was extracted from, one context file reached 60,654
chars — 6.7× its budget — and was being read on every single session. Consolidation brought
four files from 115,590 to ~34,220 chars with zero content lost.

So the installed harness ships with char budgets, a splitting procedure, and an audit
cadence. See [`references/context-economy.md`](.claude/skills/harness-onboarding/references/context-economy.md).

## Opinions it holds, and why

Each of these reverses something that seems more obvious, and each has a measurement behind
it. Full reasoning in
[`references/pipeline-spec.md`](.claude/skills/harness-onboarding/references/pipeline-spec.md).

| Opinion | Because |
| --- | --- |
| **Route context from the diff, never from labels** | Measured across 11 shipped merges, the area label described only **44%** of what cards actually touched — 5 migration cards missed their required review persona |
| **Document via a per-card fragment, folded at ship** | Direct edits to shared docs make every in-flight branch collide by construction — **8 conflicts in one week** |
| **Branch from production, never the integration tip** | A branch cut from the integration tip has every other in-flight feature as an ancestor, making exclusion impossible. Proven in sandbox repos |
| **One thin skill per stage, not a monolith** | A monolithic pipeline skill reloads *in full on every invocation*. The monolith was 21,346 chars; stage skills are 3.5–4.7K |
| **Verify the artifact, not the push** | Four days of production builds failed silently on a secrets scanner while merge, CI and push all looked healthy. Two ships no-opped |
| **Sketch new UI at Scope, before code** | UI iteration was where POC and QA sessions burned the most rounds; a sketch settles it in one look |
| **Opus plans and reviews; cheaper models build and check** | Planning and review are where the judgment is. The review caught a builder's formatter run that buried a real change under ~3,000 lines |
| **Harness and docs changes are a PR, not a card** | There's no product behavior to prove or QA, so the stages would be ceremony |
| **Carry the evidence into every rule** | Rules stated as bare assertions get reasoned away by a sufficiently confident model |

## Using it

Clone this repo and open the folder in Claude Code. The skill lives in
`.claude/skills/harness-onboarding/`, so opening the folder loads it. Then say *"I have a new
project idea"*, or *"set up the harness on my repo at …"* for an existing codebase.

To use it outside this folder, copy `.claude/skills/harness-onboarding/` into
`~/.claude/skills/`, or zip it and add it in claude.ai Settings → Capabilities. The setup and
install steps (creating repos, running the scaffold, installing the plugin) need Claude Code.

Note the asymmetry: **this** skill is about projects in general. What it *produces* goes into
the project's repo, because that's about one project.

## What's inside

```
.claude/skills/harness-onboarding/
├── SKILL.md                     the kickoff, steps A–I
├── references/
│   ├── pipeline-spec.md         why the harness is shaped this way + the evidence
│   ├── context-economy.md       context budgets, splitting, personas
│   ├── tool-roles.md            role catalog, Linear setup, models, detection
│   ├── interview.md             the question flow
│   ├── setup.md                 setting up Linear, the repo, hosting, the database
│   └── example-output.md        a real filled-in harness, for calibration
└── template/                    ← the actual harness, copied into your repo
    ├── SETUP.md                 copy map + placeholder legend
    ├── scaffold.mjs             copies and fills the template from an answers file
    ├── scaffold.test.mjs        scaffolds scratch repos and checks the result
    ├── CLAUDE.md.tmpl           (stored with odd names so this repo doesn't load them)
    ├── gitignore-stanza.txt
    ├── docs/
    ├── dot-claude/              → .claude/: skills, agents, hooks, scripts, plugin manifest
    └── dot-claude-plugin/       → .claude-plugin/marketplace.json
```

## Why Linear

The stage model is built on Linear specifically, and the coupling is real: workflow statuses
*are* the pipeline, label groups have exclusivity semantics the routing depends on, and
`blockedBy` / `duplicateOf` are native relations rather than conventions in a notes field.

You can use a different board — the principles survive, the mechanics don't.
[`tool-roles.md`](.claude/skills/harness-onboarding/references/tool-roles.md) lists exactly what needs rework.

## Customizing

Fork it and adjust `references/` and `template/`. The seven-stage backbone is opinionated on
purpose, but it's yours to tune. After changing the template, run
`node .claude/skills/harness-onboarding/template/scaffold.test.mjs`.

And once it's installed, the harness is just files in your repo — editing it is a normal
commit, which is the whole point.

## License

MIT — see [LICENSE](LICENSE).
