---
name: pipeline-ship
description: {{PROJECT_NAME}} pipeline — shipping to production and closing cards out. Use whenever {{USER}} says "ship it", "let's do a batch ship", "merge this to {{PROD_BRANCH}}", "push to prod", "what's ready to ship", "rebuild staging", or asks to move an issue from Documentation to Shipped. Also use when merging approved feature branches into {{PROD_BRANCH}}, excluding an unready feature from a batch, cleaning up merged branches, or dropping an issue to the Dropped status. This is the {{PROJECT_NAME}} project.
---

# Pipeline — Ship

Read `docs/pipeline-core.md` first for the Linear team and status reference, advance templates, and guardrails. This file covers the production ship and the final card close-out.

## The push is not proof the ship landed

{{DEPLOY_MODEL_NOTE}}

**A green CI run and a clean push are not proof.** The host still has to build, and a failing build publishes nothing while the merge, CI, and push all look healthy. This failure is silent and it is the reason this section exists.

**Before calling anything shipped, verify the deployed artifact carries the commit you pushed.** {{BUILD_VERIFY_METHOD}}

If the build failed: say so plainly, do not advance the cards, and fix forward. A card that says Shipped when nothing shipped is worse than an open card.

## What is ready to ship

A card is shippable when it is in `Documentation`, its branch is merged or ready to merge, and its fragment exists under `docs/changes/`.

Check for hold candidates first: any card the QA stage flagged as **incoherent when shipped partial** is a candidate to exclude, not an automatic hold. Surface it; let {{USER}} decide.

## How exclusion works

Because feature branches are cut from `{{PROD_BRANCH}}` and never from the integration branch's tip, any one feature can be left out of a release without dragging the others. This is the entire reason for that branching rule — if a branch were cut from the integration tip, every other in-flight feature would be an ancestor and exclusion would be impossible.

## Ship sequence

1. **Confirm the set.** List the cards shipping and any being excluded, with the reason for each exclusion.
2. **Rebase if `{{PROD_BRANCH}}` moved** — `git fetch origin {{PROD_BRANCH}} && git rebase origin/{{PROD_BRANCH}}`.
3. **Merge each feature branch into `{{PROD_BRANCH}}`** individually, not via the integration branch. The integration branch is disposable and is never merged into `{{PROD_BRANCH}}`.
4. **Fold the fragments** (below) and delete them in the same commit.
5. **Push `{{PROD_BRANCH}}`.**
6. **Verify the build actually published** — see above. This step is not optional.
7. **Advance the cards** to `Shipped`.
8. **Clean up** merged branches and rebuild the integration branch from the new `{{PROD_BRANCH}}`.

## Folding the fragments

For every shipping card, read `docs/changes/<CARD-ID>-<slug>.md` and apply each `##` section to the target its frontmatter names:

- Sections written ready-to-use are appended verbatim — that is the point of the format.
- Sub-`CLAUDE.md` prose is the only part read with judgment: place it in the right section, and merge rather than duplicate if it overlaps something already there.
- **Delete every folded fragment in the same commit as the fold.** A fragment that survives its fold gets folded twice.

`ls docs/changes/` is the check for anything unfolded. A non-empty directory between releases is normal — those are cards merged but not yet shipped.

{{CONTEXT_BUDGET_CHECK}}

## The ship gate — one confirmation, not two

```
Ready to ship:
  📦  Cards: [list]
  🚫  Excluded: [card — reason, or "none"]
  ➡️  Merging each feature branch into {{PROD_BRANCH}} — this IS the production deploy
  📝  Folding N fragments
  ⚠️  [env vars to add, manual steps]
```

Then `AskUserQuestion` with **"Ship it"** / **"Hold"**.

**"Ship it" covers the entire sequence** — merge, fold, push, build verification, and the Linear status updates. **Do not run a second `AskUserQuestion` before touching Linear.** That is a duplicate prompt for a decision already made, not a second real checkpoint.

**"Hold" at this gate usually means parking, not a correction.** Ask what is being held for, and leave the cards where they are.

## Dropping a card

1. Post a comment explaining why, so the reasoning survives.
2. Delete its fragment, if one exists.
3. Preview: "Ready to drop `[issue title]` — move to Dropped."
4. `AskUserQuestion` with **"Drop it"** / **"Keep it"**.
5. On "Drop it": set status to `Dropped`. If it was superseded by another issue, use `duplicateOf` instead so the link to the survivor is kept.

## Done when

- Every shipping card's branch is merged into `{{PROD_BRANCH}}`
- Every fragment is folded and deleted
- The deployed artifact is **verified** to carry the pushed commit
- Every shipped card is in `Shipped`
- The integration branch is rebuilt and merged branches are cleaned up
