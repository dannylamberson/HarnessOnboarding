---
name: pipeline-implement
description: {{PROJECT_NAME}} pipeline — the Implementation stage. Use whenever {{USER}} picks up an issue sitting in the Linear Implementation status, says "let's implement this", "build it for real", "write the production code", "open the PR", or asks to advance a card from Implementation to QA. Also use when writing unit tests or a security review block for new endpoints, database functions, or access policies. This is the {{PROJECT_NAME}} project.
---

# Pipeline stage 3 — Implement

Read `docs/pipeline-core.md` first for the Linear team and status reference, startup routine, git workflow, advance templates, and guardrails. This file covers only what's specific to Implementation.

## Work out what this touches, from paths not labels

**`git diff --name-only {{PROD_BRANCH}}...HEAD` is the input.** It names what the card actually touches; load the sub-`CLAUDE.md` each path maps to (routing table in `pipeline-document`), and **re-read it as the diff grows** — Implementation routinely reaches past what POC predicted.

## What Implementation is for

Production code, to the project's conventions. Those conventions live in `CLAUDE.md` — read it first and let it win over your own defaults.

The POC is not the starting point for the code, only for the approach. Rewrite rather than clean up.

## Repo conventions

{{REPO_CONVENTIONS}}

## Secrets

**Secrets never ship to the client.** Read them server-side. Stop and flag if a secret is heading for the browser — that's a stop-work condition, not a note for the PR description.

Every new env var goes in three places, and the card's advance preview must flag all three:

1. `.env.example` (keys only, committed)
2. The runtime environment {{RUNTIME_SECRETS_LOCATION}}
3. CI secrets, if CI needs it

## Security review

Required for any new or changed {{SECURITY_SURFACES}}. Produce a short **Security Reviewer notes** block on the Linear issue covering: who can call this, what happens if an unauthenticated caller does, and what the failure mode is if the check is wrong.

{{SECURITY_NOTE}}

## Analytics

{{ANALYTICS_NOTE}}

## Branch and integrate

Cut from `{{PROD_BRANCH}}`, never from the integration branch's tip — see the git workflow in `docs/pipeline-core.md` for why this is load-bearing.

{{INTEGRATION_NOTE}}

## Unfinished sessions

If the session ends mid-stage, commit `wip(scope): description` and push. **Do not advance the issue.** The next session resumes from the status plus the WIP commit.

## Done when

- `{{BUILD_TEST_CMD}}` passes
- New env vars are in `.env.example` and flagged for the runtime and CI
- A PR is open, with the Linear issue URL in the title or body
- The PR URL is posted as a comment on the issue
- A reviewable build exists for QA
