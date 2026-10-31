# Hotfix path

For small, low-risk, unambiguous product fixes: a typo, a wrong link, a small style fix, a one-line bug.

1. Create a card titled `[hotfix] — short description`, straight into Implementation.
2. Branch `hotfix-<short-slug>` from `{{PROD_BRANCH}}`, fix it in the main session (no delegation), `fix(hotfix): ...`.
3. PR, preview, then the QA site and {{OWNER}}'s check, as in `.claude/skills/{{SLUG}}-pipeline/references/qa.md`.
4. Merge after sign-off, confirm production, and document only if a pattern or gotcha changed.

**Never hotfix** auth, data access rules, migrations, secrets, or deploy and hosting config. Those run the full
pipeline. A hotfix that starts to sprawl becomes a normal card.
