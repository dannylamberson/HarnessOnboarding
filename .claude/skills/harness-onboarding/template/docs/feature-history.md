# Feature history

Full descriptions of every shipped feature.

**This file is unbounded and is never loaded by default.** It is read only on explicit request — an audit, a retrospective, or a question about why something was built the way it was. That's what lets it grow without cost.

The root `CLAUDE.md` carries **slugs and status only**; the long-form description lives here. Keeping those two apart is what stops the root file — read on every single session — from filling up with history.

## How entries get here

Nobody writes this file by hand. The flow is:

1. A card's **Documentation** stage writes a fragment under `docs/changes/` containing a `## feature-history` section, written ready to append verbatim.
2. **`pipeline-ship`** folds that section into this file at release, then deletes the fragment.

If you find yourself editing this file directly during a card, something has gone wrong — the fragment is the right place.

## Format

Newest at the top, so the file reads as a reverse chronology.

```markdown
## <slug>

**Shipped:** YYYY-MM-DD · **Card:** <TEAM>-nn

<what it does, from a user's point of view — not a description of the diff>

<why it was built this way, if the reasoning isn't obvious. Especially any
approach that was tried and rejected: that's the part a future session would
otherwise re-litigate.>
```

The second paragraph is the one worth writing. What shipped is usually recoverable from the code; *what was tried and abandoned, and why* is recoverable from nowhere else.

---

<!-- Entries begin below. Newest first. -->
