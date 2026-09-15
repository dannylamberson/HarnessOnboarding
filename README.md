# Harness Onboarding

A Claude skill that interviews you about a software project and installs a **repo-embedded
pipeline harness** — a Linear-driven build process made of per-stage skills committed into
your repo.

It's the "set up the harness for me" companion to the workflow described in
[Don't Prompt and Pray — Build Like a Dev Team](https://ddbbll.me). The barrier to building
software dropped; the discipline got more important. This installs that discipline into a
project in a few minutes.

## What it does

Invoke the skill and it runs a short interview — project basics, your tools, which folders
get context files, what your deploy topology is — then **copies a working harness into your
repo** and fills it in.

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
```

**Why in the repo?** The skills are versioned, travel with every clone, and get reviewed in
the same PR as the code they govern. A harness living in someone's personal Claude settings
is one that silently describes a workflow the repo abandoned weeks ago.

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
cadence. See [`references/context-economy.md`](harness-onboarding/references/context-economy.md).

## Opinions it holds, and why

Each of these reverses something that seems more obvious, and each has a measurement behind
it. Full reasoning in
[`references/pipeline-spec.md`](harness-onboarding/references/pipeline-spec.md).

| Opinion | Because |
| --- | --- |
| **Route context from the diff, never from labels** | Measured across 11 shipped merges, the area label described only **44%** of what cards actually touched — 5 migration cards missed their required review persona |
| **Document via a per-card fragment, folded at ship** | Direct edits to shared docs make every in-flight branch collide by construction — **8 conflicts in one week** |
| **Branch from production, never the integration tip** | A branch cut from the integration tip has every other in-flight feature as an ancestor, making exclusion impossible. Proven in sandbox repos |
| **One thin skill per stage, not a monolith** | A monolithic pipeline skill reloads *in full on every invocation*. The monolith was 21,346 chars; stage skills are 3.5–4.7K |
| **Verify the artifact, not the push** | Four days of production builds failed silently on a secrets scanner while merge, CI and push all looked healthy. Two ships no-opped |
| **Carry the evidence into every rule** | Rules stated as bare assertions get reasoned away by a sufficiently confident model |

## Install

This repo is the skill. The folder you install is `harness-onboarding/`.

- **Claude Code:** copy `harness-onboarding/` into your skills directory (e.g.
  `~/.claude/skills/`), or bundle it in a plugin as `skills/harness-onboarding/`.
- **Claude (Cowork):** Settings → Capabilities → add the skill.

Then start a session and say *"set up a pipeline harness for my new project"*.

Note the asymmetry: **this** skill is installed into your Claude session, because it's about
projects in general. What it *produces* goes into the repo, because that's about one project.

## What's inside

```
harness-onboarding/
├── SKILL.md                     the onboarding orchestrator
├── references/
│   ├── pipeline-spec.md         why the harness is shaped this way + the evidence
│   ├── context-economy.md       context budgets, splitting, personas
│   ├── tool-roles.md            role catalog, Linear setup, detection
│   ├── interview.md             the question flow
│   └── example-output.md        a real filled-in harness, for calibration
└── template/                    ← the actual harness, copied into your repo
    ├── SETUP.md                 copy map + placeholder legend
    ├── CLAUDE.md
    ├── gitignore-stanza.txt
    ├── docs/
    └── .claude/skills/pipeline-*/
```

## Why Linear

The stage model is built on Linear specifically, and the coupling is real: workflow statuses
*are* the pipeline, label groups have exclusivity semantics the routing depends on, and
`blockedBy` / `duplicateOf` are native relations rather than conventions in a notes field.

You can use a different board — the principles survive, the mechanics don't.
[`tool-roles.md`](harness-onboarding/references/tool-roles.md) lists exactly what needs rework.

## Customizing

Fork it and adjust `references/` and `template/`. The seven-stage backbone is opinionated on
purpose, but it's yours to tune.

And once it's installed, the harness is just files in your repo — editing it is a normal
commit, which is the whole point.

## License

MIT — see [LICENSE](LICENSE).
