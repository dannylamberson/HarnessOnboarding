# `docs/changes/` — per-card release fragments

One file per card, written at the **Documentation** stage, folded into the shared docs at **ship** and then deleted.

**Why this exists:** if every card's Documentation pass edits the same handful of shared files (root `CLAUDE.md`, the sub-`CLAUDE.md` files, the feature history), then every in-flight branch collides with every other **by construction**. On the project this harness came from, that meant 8 `CLAUDE.md` conflicts in a single week.

A unique filename per card means zero doc conflicts by construction. No claims, no locks, no coordination.

## Filename

```
docs/changes/<CARD-ID>-<slug>.md      e.g. docs/changes/{{TEAM_KEY}}-61-best-of-hm-links.md
```

## Format

Frontmatter carries everything the fold needs; each `##` heading is one fold target.

```markdown
---
card: {{TEAM_KEY}}-61
slug: best-of-hm-links
type: feature # feature | bug | chore | polish | spike
paths: # from `git diff --name-only {{PROD_BRANCH}}...HEAD`, never from a label
  - <path>
  - <path>
targets: # derived from paths via pipeline-document's routing table
  - <folder>/CLAUDE.md
env: [] # new env vars needing the runtime env + CI secrets, or []
readme: false # true if README.md needs a setup-section update
---

## feature-history

- ✅ **best-of-hm-links** — <the full long-form bullet, ready to append verbatim>

## root-shipped-list

best-of-hm-links

## <folder>/CLAUDE.md

<prose, and which section it belongs in>
```

Sections are written **ready to use**, not as notes to be rewritten at ship time. The feature-history bullet is appended verbatim; the sub-`CLAUDE.md` prose is the only part the fold reads with judgment.

`type/chore` and `type/polish` skip the `## feature-history` and `## root-shipped-list` sections entirely — their fragment carries only sub-`CLAUDE.md` prose, and a chore with nothing durable to say writes no fragment at all.

## Lifecycle

| When           | What happens                                                       |
| -------------- | ------------------------------------------------------------------ |
| Documentation  | the card writes its fragment; it edits none of the shared docs     |
| Ship           | `pipeline-ship` folds every fragment for the shipping cards        |
| After the fold | the folded fragments are deleted in the same commit                |
| Card dropped   | delete its fragment along with the card                            |

`ls docs/changes/` at ship time is the check for anything unfolded. A non-empty directory between releases is normal — those are cards that have merged but not yet shipped.

## Known cost

Between a card merging and its release shipping, the shared docs do not describe the merged feature — the fragment does. That is deliberate, and it is bounded by how long a release stays open.

If your project runs a formatter, add this directory to its ignore list so fragments are not reformatted.
