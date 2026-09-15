---
name: harness-onboarding
description: Interview a user about a software project and install a repo-embedded "pipeline harness" — a Linear-driven development workflow made of per-stage skills committed into their repo. Use this whenever someone wants to set up a development pipeline or workflow harness, scaffold a repeatable build process, onboard a new or existing codebase to a ticket-driven pipeline, generate project pipeline skills, create a backlog-to-shipped workflow, or asks for help structuring how they use AI coding tools like a product team (groom, scope, prove, implement, QA, document, ship). Also trigger for phrases like "set up my harness", "make a pipeline skill for my repo", "I want the Linear ticket pipeline for this project", or "help me run my project like a dev team". It detects their connectors, runs a short interview, copies a working harness tree into their repo, and fills it in for their project.
---

# Harness onboarding

This skill installs a **repo-embedded pipeline harness** into someone's project.

You are not building their application. You are installing *the structure that governs how their application gets built* in every future session — so a fresh session behaves like a disciplined one-person product team instead of a one-prompt gamble.

**The harness is already written.** It lives in `template/`. Your job is to interview, copy it in, and fill in the blanks — not to compose a pipeline from scratch.

## What gets installed

Into the user's repo, not their Claude settings:

```
CLAUDE.md                          root context file
docs/pipeline-core.md              shared source of truth for every stage
docs/harness-notes.md              context budgets and what-lives-where
docs/changes/README.md             per-card doc fragments
docs/personas/README.md            review-lens format
.claude/skills/pipeline-groom/     ┐
.claude/skills/pipeline-scope/     │
.claude/skills/pipeline-poc/       │ one thin skill per stage,
.claude/skills/pipeline-implement/ │ committed to the repo
.claude/skills/pipeline-qa/        │
.claude/skills/pipeline-document/  │
.claude/skills/pipeline-ship/      ┘
```

Plus a stanza appended to their `.gitignore`.

**Why in the repo:** the skills are versioned, travel with every clone, get reviewed in the same PR as the code they govern, and can't drift out of sync with a plugin. A harness that lives in someone's personal Claude settings is a harness that silently describes a workflow the repo abandoned weeks ago.

## Read first

- `references/pipeline-spec.md` — **why the harness is shaped this way**, and the evidence behind the non-obvious calls. Read before interviewing so you can explain any part of it and push back when a request would break something load-bearing.
- `references/context-economy.md` — the half of the harness that isn't the pipeline. Commonly skipped; it's the part that gets discovered late and expensively.

## The process

Work through these in order. Talk like a collaborator, not a form — ask one thing at a time, recommend defaults, never dump the whole interview at once. Many users are not professional engineers; explain jargon you reach for.

### A. Frame it

Tell them briefly what they'll get: a few questions, then a working pipeline committed into their repo that governs every future session. Confirm they want to proceed.

### B. Detect what's available

Before recommending anything, look at their environment. `references/tool-roles.md` → "Detecting what's already available". Check MCP connectors, relevant CLIs, and — if adapting an existing repo — the config files that reveal the stack.

**Check for the Linear connector specifically.** If it's absent, say so now: the harness works without it, but every stage skill assumes issues can be read and updated from the session, and that becomes manual work.

Report what you found so they can correct it.

### C. Interview

Run `references/interview.md`. It branches on **scratch vs. existing codebase**, and it's short — the harness is already written, so you're filling blanks, not designing.

Two questions the flow deliberately forces, because they change the generated text rather than just decorating it:

- **Which QA-target shape** — preview-per-branch, or a long-lived integration branch. Changes the git workflow.
- **How to verify a deploy landed.** Most people have no answer. Record the absence rather than leaving it blank.

### D. Confirm the plan

Restate in one compact summary: project name and slug, who runs QA, the Linear team, tool per role, QA-target shape, commands, and which folders get context files. Get an explicit "looks good."

This is the cheap moment to catch a wrong assumption.

### E. Install the harness

1. **Confirm the target repo path.**
2. **Copy `template/` in**, per the map in `template/SETUP.md`. Copy the files; don't retype them.
3. **Append the gitignore stanza** from `template/gitignore-stanza.txt` to their `.gitignore`.
4. **Fill every placeholder.** The legend is in `template/SETUP.md`. Where something doesn't apply, **delete the section rather than leaving `{{PLACEHOLDER}}` in a live file** — a stale placeholder reads as a fact nobody checked, and later sessions treat it as one.
5. **Write pushy, project-specific `description` lines** in each stage skill's frontmatter. They're what makes the right stage trigger in future sessions. Name the project, the Linear status, and the phrases the user would actually say. Keep each under 1024 characters, no angle brackets.
6. **Verify the skills are tracked** — this is the step that silently fails:

   ```bash
   git check-ignore -v .claude/skills/pipeline-ship/SKILL.md
   ```

   **No output means tracked**, which is what you want. Any output means they're ignored and would be absent from every other clone. Fix the gitignore before moving on.

Use `references/example-output.md` to calibrate how specific a filled-in placeholder should be.

### F. Wrap up

Give them a **manual setup checklist** for what a skill can't do:

- **Create the Linear team and its workflow statuses** in order: Backlog · Scoping · POC · Implementation · QA · Documentation · Shipped · Dropped. Set Shipped's type to `completed`, Dropped's to `canceled`.
- **Create the `type` label group as exclusive**; create `area-*` labels **ungrouped** (flat, multi-select). This distinction is load-bearing — see the spec.
- Confirm the QA target and preview deploys are actually wired.
- Add secrets in all three places: local, runtime, CI.
- Commit the harness.

Then tell them how to start: create a card in Backlog and say "let's groom the backlog" or "pick up <slug>." Remind them the harness is theirs to evolve — it's in their repo, so editing it is a normal commit.

## Non-negotiables to preserve

Full reasoning and evidence in `references/pipeline-spec.md`. Adapt the wording to their tools; don't drop the substance:

- **One card = one feature = one session** — but finishing a *stage* is not a reason to end a session.
- **The human runs QA.** Never simulate end-to-end results.
- **Confirm before advancing** — and exactly *one* confirmation per decision. The ship gate's single "Ship it" covers the whole sequence.
- **Document via a fragment**, folded at ship. Not direct edits to shared files.
- **Route from the diff, never from labels.**
- **The status is the stage** — no subtask checklist.
- **Branch from production, never from the integration tip.**
- **Never restate a shared fact in a stage skill.**
- **Verify the artifact, not the push.**
- **Carry the evidence.** Rules with measurements survive; assertions get reasoned away.

## If they want to deviate

Don't refuse — explain the cost, then build what they asked for. Two common ones:

- **A different board.** The principles survive; the mechanics don't. `tool-roles.md` lists what needs rework.
- **A hotfix lane.** The `type` label approach supersedes it and is better. Explain why, and build the lane if they still want it.

## Reference files

| File                            | Read it                                        |
| ------------------------------- | ---------------------------------------------- |
| `references/pipeline-spec.md`   | First — the rationale and the non-negotiables  |
| `references/context-economy.md` | First — context budgets, splitting, personas   |
| `references/tool-roles.md`      | Steps B and C — roles, detection, Linear setup |
| `references/interview.md`       | Step C — the question flow                     |
| `references/example-output.md`  | Step E — calibration for filled-in placeholders |
| `template/SETUP.md`             | Step E — the copy map and placeholder legend   |
