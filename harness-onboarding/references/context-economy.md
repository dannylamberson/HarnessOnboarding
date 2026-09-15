# The context economy — the half of the harness that isn't the pipeline

The pipeline decides *what work happens in what order*. The context economy decides *what Claude knows when it starts*. A project can have a perfect pipeline and still degrade, because every session begins by loading a context file that has quietly grown into a wall of history.

This file has no counterpart in most workflow guides, and it is the half that gets discovered late and expensively. Read it before generating a harness, and make sure the generated `docs/harness-notes.md` carries the project's actual numbers.

## The two failure modes

They are symmetrical and equally bad:

1. **Too little context** — Claude misses a load-bearing constraint and ships a regression. The fix feels obvious: write more down.
2. **Too much context** — the root `CLAUDE.md` becomes a 14k-token wall of feature history read on *every* session, spending budget that would be better spent on the actual code. The fix is not obvious, because the file got that way one reasonable addition at a time.

Failure mode 2 is the one teams walk into, because every individual line in an oversized context file was worth writing. The question is never "is this worth knowing" — it's "is this worth knowing *every session*."

## The measurement that makes this real

On the project this harness was extracted from, left ungoverned for a few months:

| File                | Grew to      | Budget | Over by |
| ------------------- | ------------ | ------ | ------- |
| `public/CLAUDE.md`  | 60,654 chars | 9,000  | 6.7×    |
| `lib/CLAUDE.md`     | 57,538 chars | 9,000  | 6.4×    |
| `netlify/CLAUDE.md` | 23,117 chars | 8,000  | 2.9×    |

Two consolidation passes brought four files from **115,590 → ~34,220 chars with zero content lost** — everything was relocated, not deleted. The lesson isn't "write less." It's **"decide where each thing loads, and check."**

## The rule: budget, then split

Give every always-loaded file a char budget, measured with `wc -c`. When a file exceeds it, that is a signal to **split, not to compress**. Lossy-compressing precise gotcha prose to hit a number is a bad trade — intact gotchas at a slightly higher char count beat fuzzy ones at a lower one.

Starting budgets for a new project — deliberately generous, because a new project has little to say and tightening later is easier than discovering a limit:

| Surface            | Start at     |
| ------------------ | ------------ |
| Root `CLAUDE.md`   | 15,000 chars |
| Each sub-file      | 10,000 chars |
| On-demand docs     | unbounded    |

The numbers matter less than the habit of checking. Re-baseline them after the first real consolidation pass to whatever the post-split sizes actually are — then a future overage means content is accreting again, which is exactly the signal you want.

## The three splits, in order of preference

### 1. Move reference catalogs to on-demand docs

The highest-value split and usually the first one needed. Separate what you **look up** from what you must **know**:

- **Look up** — per-function contracts, full API inventories, per-page wiring, design token catalogs. Goes to `docs/<topic>.md`, read on demand.
- **Know** — rules and gotchas. Stays in the always-loaded file.

Leave a one-line pointer behind. What remains after this split is purely load-bearing, which is why the remaining file can legitimately sit higher than a naive budget suggests.

### 2. Add a second axis, once one exists

Folder is the obvious axis, and for a while it's the only one. But most projects eventually grow a dimension that cuts *across* folders — a mode, a tenant type, a platform, a customer tier. When a card in that dimension routinely touches three folders at once, one cross-layer doc beats three folder-scoped sections: one read instead of three.

The tell is a sub-file where a large contiguous block is only relevant to one variant. Rule of thumb:

- Needed **regardless** of the dimension → stays in the folder file
- Needed **only** within one value of it → goes to `docs/<dimension>/<value>.md`

**Give a new dimension its own doc from the start** rather than letting it accrete into the folder files and paying for the extraction later.

### 3. Move stale narrative to feature history

`docs/feature-history.md` is unbounded and read only on explicit request. Long-form descriptions of shipped features belong there; the root file carries slug + status only.

## Splitting is relocation, never deletion

Verify **fact by fact** against the pre-edit version, not by char count. A split that loses one gotcha has done more damage than the oversized file ever did — and it does it silently, because nothing references the missing line.

Leave a pointer at the origin so the path from "I'm working in this folder" to "the detail lives there" is one hop.

## Personas: the on-demand rule applied to judgment

Rules and gotchas are facts. Personas are *lenses* — how to think about a class of decision. Same economics, same solution: **not loaded every session**, consulted at named stages or when named paths change.

Two rules keep them from becoming context debt:

- **The gotcha wins.** Where a persona overlaps a sub-`CLAUDE.md` gotcha, the gotcha is the source of truth — it's always-loaded for its folder, so it's the one guaranteed to be in context. The persona links to it rather than restating it.
- **Don't create them speculatively.** Add a persona when the same class of review comment keeps recurring. An unused persona is context debt that looks like diligence.

## Route from the diff, never from a label

The natural instinct is to tag each card with the area it touches and route context off the tag. **This does not work, and it fails quietly.**

Measured across 11 shipped merges on the source project: the area label described **44%** of what cards actually touched. Five migration-writing cards consequently missed the database-review persona. The cause is structural — a card's reach is *plural* and known only in retrospect, while a label is applied up front, usually while the work is still hypothetical.

The reliable input is the diff:

```bash
git diff --name-only <prod-branch>...HEAD
```

Feed it through one path-routing table that maps paths to both context files and personas. Every stage that needs to know a card's reach reads that same table. Labels stay as a browsing aid — useful in Linear's UI, load-bearing nowhere.

At Scope, where no diff exists yet, the honest substitute is to **state the expected paths out loud** and correct the list as soon as code exists. That's an intent, not a claim.

## Audit cadence

Re-read the harness notes when the last review is more than four weeks old, or before any major refactor. An audit checks three things:

1. **Budgets** — `wc -c` every always-loaded file against its target.
2. **Accuracy** — does every pointer still resolve? Does every named file still exist under that name? Stale pointers are the most common form of harness rot, and they are invisible until a session follows one.
3. **Debt** — is the "known harness debt" list still true, and has anything on it become cheap enough to fix?

Record each audit in `docs/harness-notes.md` with its date and headline finding. The record is what makes the next audit fast.

## What to carry into the generated harness

- A budget table with real numbers in `docs/harness-notes.md`
- A "what lives where" section, so future additions have an obvious home
- The path-routing table, owned by `pipeline-document` and referenced by every other stage
- The persona precedence rule
- An audit cadence with a dated log
