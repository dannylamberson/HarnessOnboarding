# QA: the QA site and the test script

{{OWNER}} tests on the QA site, `{{QA_URL}}`, built from the `{{QA_BRANCH}}` branch. `{{QA_BRANCH}}` is `{{PROD_BRANCH}}`
plus a `--no-ff` merge of each card in QA. It's disposable: never merged anywhere, rebuilt after each ship.

## Putting a branch on QA

<!-- if:delegation -->
`qa-runner` (`.claude/skills/{{SLUG}}-pipeline/references/delegation.md` › By stage) does the mechanical part from a short plan: the card, the jobs and
the branches, in order. The plan gives it the check that proves the QA build is the new one:
<!-- endif -->
<!-- if:!delegation -->
Merge the branch into `{{QA_BRANCH}}` in a worktree (`.claude/worktrees/qa`), push it once, and wait for the build. This
proves the QA build is the new one:
<!-- endif -->

```
{{QA_BUILD_CHECK}}
```

- **One push per batch.** Every push is a deploy.
- **A merge conflict** is aborted, with no push. The lead decides what goes on `{{QA_BRANCH}}` instead.
- **What's on QA right now:** `git log --merges --oneline origin/{{PROD_BRANCH}}..origin/{{QA_BRANCH}}`.

## The test script

1. Start from the spec's success criteria and each persona's "QA to carry forward" lines.
2. Add the standing checks of each persona the diff selects.
3. Run what Claude can check itself first (small and large screens, dark mode, the console, the gate) and fix what it
   finds before sending the URL.
4. Send {{OWNER}} a short numbered list grouped by feature, with a pass condition on each line. Include a slow or
   offline network when relevant, and each kind of user when the data is shared.
5. Say what Claude checked and what it couldn't, so the gaps land on {{OWNER}}'s list.

## After sign-off

1. Rebase if `{{PROD_BRANCH}}` moved, and merge the PR.
2. Confirm production ({{PROD_URL}}) shows the new build. A failed build leaves the old deploy live, and the merge
   looks fine.
3. Rebuild `{{QA_BRANCH}}` from `{{PROD_BRANCH}}` plus whatever is still in QA.
