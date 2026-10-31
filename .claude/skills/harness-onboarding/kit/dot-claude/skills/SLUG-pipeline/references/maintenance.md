# Maintenance path

Changes to how the team works, and to the docs, aren't product features, so they don't run Scope → POC → Implement →
QA → Document. They're **one PR, no card**:

- the harness: the pipeline skill and its references, the agents, the hooks, `.claude/harness.json`
- the docs: `CLAUDE.md` files and `docs/`, moving or trimming them to fit their budgets, a context audit's fixes
- a playbook tweak learned on a card ("next time, do X at QA")

## How

1. Branch `harness-<topic>` or `docs-<topic>` from `{{PROD_BRANCH}}`.
2. Make the change in the main session. Moving docs can go to `doc-writer`.
3. Run `node .claude/scripts/context-size.mjs`. For a hook or script change, also run it once by hand with a sample input.
4. Open the PR with what changed and why. {{OWNER}} reviews it; merge on their OK. A docs-only PR skips the production
   deploy when the host allows it (a skip marker in the commit message).
5. A changed agent or hook reaches only **new** sessions. Say so in the PR.

## Not maintenance

A change that alters what the app does, even in a doc-like file (a config the app reads, a seed, copy shown to users),
is product work: a card, or the hotfix path when it qualifies.
