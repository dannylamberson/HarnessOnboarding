# Review personas

A persona is a standing review lens, like a specialist the team pulls into a review: a short file about how to look
at one class of decision. Scope uses them to raise what wasn't in the original idea, Implement follows their build
defaults, and QA uses them to plan what gets tested. They are **not** loaded every session: the pipeline skill sends
you to one when its row below fires.

Why a persona and not more `CLAUDE.md`: a gotcha says "this specific thing breaks" and loads with its folder. A
persona says "here is how to look at a whole kind of decision" and loads only when a stage calls for it.

## Routing

A stage consults every persona selected by **any** of these:

1. **A label on the card.** `persona-<name>` is how {{OWNER}} asks for a lens, and how Scope records the ones it used.
2. **Paths.** At Scope, the paths the spec says the work will touch. At Implement and QA,
   `git diff --name-only {{PROD_BRANCH}}...HEAD`.
3. **A stage rule** in the table, whatever the paths.

A label only adds a persona; a missing label never excludes one. Paths decide, and labels are hints.

| Persona | Label | Paths | Stage rules |
| --- | --- | --- | --- |
<!-- if:ui -->
| [`ux`](ux.md): usability, consistency, accessibility | `persona-ux` | {{FILL: UI paths, e.g. `src/components/**`, `src/pages/**` (not `*.md`)}} | **Scope:** any card that adds or changes something seen or tapped, and it decides whether to sketch. **Implement:** UI cards, read *Build defaults* first. **QA:** every card that changed the UI. |
<!-- endif -->
<!-- if:database -->
| [`db`](db.md): data model, access rules, migrations | `persona-db` | {{FILL: migration and schema paths, e.g. `supabase/migrations/**`}} | **Scope** and **POC:** any card that adds or changes data. **Implement:** while writing a migration. **QA:** around the hosted migration push, before and after. |
<!-- endif -->

Paths and stages not listed here have no persona. Proceed without one.

## Precedence

Where a persona overlaps a `CLAUDE.md` gotcha, **the gotcha wins**: it is always loaded for its folder. The persona
links to it instead of restating it, because two copies of a rule drift apart. A persona raises questions and flags
risk. It never overrides `CLAUDE.md` or a decision {{OWNER}} has made.

## Format

```markdown
# Persona: <name>

**Consulted:** <the stages; the exact paths live in the routing table above>
**Produces:** <the block it adds to a spec, and what it adds to the QA script>

## What this lens is for
<one paragraph, plus the values it ranks when they conflict>

## Scope: questions to ask
<in order; the ones that don't apply get a one-line "n/a">

## Build defaults
<what to do while writing code>

## QA
<what Claude checks first, and what {{OWNER}} checks by hand>

## Known landmines
<specific, cited things; link to the CLAUDE.md that owns each>
```

## Adding a persona

Add one when the same kind of review comment keeps coming up, not speculatively (a security lens once the app has a
public surface or holds third-party tokens; a platform lens for install, offline or push). Write the file in the
format above, add its routing row, and create its `persona-<name>` label on the board.
