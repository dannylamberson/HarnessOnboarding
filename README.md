# Harness Onboarding

A Claude skill that interviews you about a software project and generates a **tailored
pipeline skill** for it — your own repeatable, ticket-driven build process

It's the "set up the harness for me" companion to the workflow described in
[Don't Prompt and Pray — Build Like a Dev Team](https://ddbbll.me). The barrier to
building software dropped; the discipline got more important. This skill installs that
discipline into any new project in a few minutes.

## What it does

Invoke the skill and it walks you through a short interview:

1. **Scratch or existing?** — starting fresh, or adapting an existing codebase (it'll read
   the repo to learn your stack).
2. **Project basics** — name, goal, type.
3. **Tools per role** — it recommends options for each role (task board, version control,
   hosting + preview deploys, backend, analytics) and adapts to whatever connectors you
   already have. Nothing is hard-coded to one vendor.
4. **Workflow specifics** — who runs QA and where, your build/test commands, your context-
   file layout.
5. **Extra context** — any vision doc, constraints, conventions, or gotchas to bake in.

Then it writes a `your-project-pipeline/SKILL.md` that governs how every future session
works: every idea becomes one card, each card flows through five fixed stages
(**Scope → POC → Implement → QA → Document**) with a hotfix shortcut, and documentation
loops back so the project's context compounds over time.

## The harness in one picture

```
   Persistent context  ──────────────────────────────┐
   (this skill + CLAUDE.md, read every session)       │ knowledge
                                                       │ loops back
   Backlog → Scope → POC → Implement → Preview → QA → Ship → Document ┘
   (task board)        (version control / hosting / backend, per your choices)
```

## Install

This repo is the skill. The folder you install is `harness-onboarding/`.

- **Claude (Cowork):** Settings → Capabilities → add the skill (use the `.skill` package
  from Releases, or point at this folder).
- **Claude Code:** copy `harness-onboarding/` into your skills directory (e.g.
  `~/.claude/skills/`), or bundle it in a plugin as `skills/harness-onboarding/`.

Then start a session and say something like *"set up a pipeline harness for my new
project"* — the skill takes it from there.

## What's inside

```
harness-onboarding/
├── SKILL.md                     # the onboarding orchestrator
└── references/
    ├── pipeline-spec.md         # canonical, tool-agnostic definition of the harness
    ├── interview.md             # the question flow
    ├── tool-roles.md            # role catalog + recommendations + how to detect your tools
    ├── skill-template.md        # the fill-in template for the generated skill
    └── example-output.md        # a worked example of a generated pipeline skill
```

## How the generated skill works

The output is a single `SKILL.md` for your project. It keeps the parts that make the
harness work — one card per session, the human runs QA on a preview, confirm before
advancing, document in the most specific place — and maps them onto *your* tools and
commands. As your project grows, edit the generated skill and your `CLAUDE.md` files;
they're yours.

## Customizing

Fork it and adjust the `references/` files: add tools to `tool-roles.md`, change the
default pipeline in `pipeline-spec.md`, or reshape the interview. The five-stage backbone
is opinionated on purpose, but nothing stops you from tuning it to how you like to work.

## License

MIT — see [LICENSE](LICENSE).
