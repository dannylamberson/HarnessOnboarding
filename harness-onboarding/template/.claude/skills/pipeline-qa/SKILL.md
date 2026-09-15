---
name: pipeline-qa
description: {{PROJECT_NAME}} pipeline — the QA stage. Use whenever {{USER}} picks up an issue sitting in the Linear QA status, says "this is ready to test", "what should I test", "I found a bug on the preview", "put this on staging", or asks to advance a card from QA to Documentation. Also use when integrating a feature branch into the integration branch, or when checking what is currently in flight. This is the {{PROJECT_NAME}} project.
---

# Pipeline stage 4 — QA

Read `docs/pipeline-core.md` first for the Linear team and status reference, startup routine, git workflow, advance templates, and guardrails. This file covers only what's specific to QA.

## Work out what this touches, from paths not labels

**`git diff --name-only {{PROD_BRANCH}}...HEAD` is the input.** It names what the card actually touched, which is what tells you what to put in front of {{USER}} to test — a card that reached into a scheduled job needs that job exercised even if nothing about it looked like scheduler work.

## What QA is for

{{USER}} verifies real behavior on a real target and reports back. **Claude does not sign off on QA.** A green build is not QA; neither is your own reading of the diff.

## Opening checks

Before asking anyone to test anything:

1. **Confirm the build reflects the latest push.** A stale preview produces false passes, which are worse than failures because they close the card.
2. **Share the exact URL** — not "the preview", the URL.
3. **Run the pre-flight persona check** if the stage rules in `docs/pipeline-core.md` select one.

{{QA_TARGET_NOTE}}

## Tell {{USER}} exactly what to check

A vague "have a look" produces a vague pass. Give a list:

- The specific pages, screens, or commands the diff touched
- The interactions that changed, in the order to try them
- Mobile and responsive behavior, if anything visual changed
- **Every failure mode named in the card's spec** — these are the ones most likely to be skipped
- What "correct" looks like for each, so a wrong-but-plausible result gets caught

Then **wait.** Don't fill the silence by guessing at results.

## The loop

On a reported bug:

1. Post a finding on the issue — what broke, then what changes.
2. Fix in the **same branch** (`fix(scope): …`). Don't move the issue backward; QA is where bugs get fixed.
3. Push so the target rebuilds.
4. Say what to re-check, including whether anything previously passing needs re-testing.
5. Repeat until {{USER}} signs off.

## Hold candidates

If the startup routine's Project/Milestone read concluded this card is **incoherent when shipped partial**, say so now — before Documentation, while holding is still cheap. This is a flag for {{USER}}, not a decision you make.

## Done when

- {{USER}} has explicitly confirmed on the real target
- Every failure mode named in the spec was actually exercised
- Any bugs found were fixed in-branch and re-verified
- Nothing is merged to `{{PROD_BRANCH}}` yet — that is `pipeline-ship`
