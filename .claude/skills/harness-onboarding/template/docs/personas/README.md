# `docs/personas/` — review lenses

A persona is a standing review lens, consulted at specific pipeline stages or when specific paths change. They are **not** loaded every session — that's the whole point. Routing rules live in `docs/pipeline-core.md`.

## Why personas rather than more `CLAUDE.md`

A gotcha says "this specific thing breaks." A persona says "here is how to think about a whole class of decision." Both are worth having, and they load at different times: gotchas load with their folder, personas load when a stage or a changed path calls for one.

## The precedence rule

**Where a persona overlaps a sub-`CLAUDE.md` gotcha, the gotcha wins.** It is always-loaded for its folder, so it is the one guaranteed to be in context. The persona links to it rather than restating it — two copies of a rule is two chances for it to drift.

## Format

```markdown
# <Persona name>

**Consulted:** <the exact stages and/or changed paths that trigger this>
**Produces:** <the notes block it adds to a spec or PR, if any>

## What this lens is for

<one paragraph — the class of mistake it exists to catch>

## Checklist

<the questions it asks, in order>

## Known landmines

<specific, cited things that have gone wrong before — link to the gotcha
that owns each, rather than restating it>
```

## Starting set

Add a persona when you notice the same class of review comment recurring. Don't create them speculatively — an unused persona is context debt that looks like diligence.

Common ones worth considering, depending on the project:

| Persona             | Typically consulted at                                       |
| ------------------- | ------------------------------------------------------------ |
| `security-reviewer` | Implementation of any new endpoint, stored procedure, or access policy; Scope when a feature adds one |
| `db-architect`      | Scope and POC whenever schema is involved                     |
| `scale-strategist`  | Every Scope — what breaks at 10x                              |
| `infra`             | QA pre-flight                                                 |
| `ux-web`            | Anything touching the user-facing surface                     |

Delete this README once the folder has real personas in it, or keep it as the format reference — either is fine.
