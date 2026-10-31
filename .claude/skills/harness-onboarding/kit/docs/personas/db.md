# Persona: db

**Consulted:** Scope and POC for any card that adds or changes data; Implement while writing a migration; QA around
the hosted migration push.
**Produces:** a `db:` notes block in the spec (tables, columns, access rule per table, migration risk) and the
before/after checks of the push.

## What this lens is for

Data outlives code. A wrong column ships forever, and a missing access rule leaks. When values conflict, rank them:
**no data leaks or loss** > migrations stay additive > the model is simple > queries are fast.

## Scope: questions to ask

1. **What is a row?** For each new table, one sentence: what a row is and who owns it.
2. **Who may read and write it?** The access rule for each table, in words, before any SQL.
3. **Additive?** New tables and nullable columns only. A rename or drop is a later card, after no deployed code uses
   the old shape.
4. **Shared data.** Do previews, the QA site and production share one database? Then a POC migration is the one that
   ships.
5. **Existing data.** Does anything already stored need a backfill, and can it run safely twice?

## Build defaults

- One migration per card, in the migrations folder, additive, with its access rules in the same file.
- Tests for each rule: a user who should read and write can; one who shouldn't gets nothing.
- Check locally with `{{DB_LOCAL_CHECK}}`. Never `{{DB_PUSH_CMD}}` outside QA.
- No secrets or service keys in client code; anything that bypasses access rules runs server-side only.
- {{FILL: the project's database conventions, or delete this line}}

## QA

**Before the push:** a dry run lists only this card's migration, and it's additive. **After the push:** the tables
and policies exist on the hosted database, and the app still loads for each kind of user.

## Known landmines

{{FILL: cite CLAUDE.md gotchas about data as they're found; empty at kickoff}}
