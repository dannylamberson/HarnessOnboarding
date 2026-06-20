# Example — a filled-in generated skill

A worked example so you can see the target. This is what the generator produced for a
fictional project after an interview. It is illustrative, not a fixed format — adapt to
the real answers.

## The interview answers (summary)

- Project: "Trailhead" — a hiking-route discovery web app. Goal: let local hikers find
  and save routes; eventually monetize with a pro tier.
- Type: web app (React/Next.js).
- Board: Linear (already connected). Repo: GitHub `casey/trailhead`, prod branch `main`.
- Hosting: Vercel (preview deploy per push). Backend: Supabase (routes + auth).
- Analytics: PostHog. Build gate: `npm run lint && npm run test && npm run build`.
- Context folders: `app/`, `components/`, `lib/`.
- Extra context: solo developer; keep the free tier; never expose the Supabase service
  key client-side; design must stay mobile-first.

## The generated `trailhead-pipeline/SKILL.md`

~~~markdown
---
name: trailhead-pipeline
description: "Workflow guide for building Trailhead (a hiking-route discovery web app) through a five-stage pipeline (Backlog, Scoping, POC, Implementation, QA, Documentation, Shipped) on Linear. Use whenever Casey wants to pick up a task, work on the next card, advance a phase, complete a subtask, asks what's next on Trailhead, mentions a card slug, wants a quick hotfix, or talks about the casey/trailhead repo, the Supabase data, the Vercel deploys, or Trailhead generally. Enforces one card per session, the hotfix shortcut, and how to update Linear and GitHub after each subtask."
---

# Trailhead pipeline

A hiking-route discovery web app. Goal: help local hikers find and save routes; later, a
pro tier.

This skill governs all work on Trailhead. Each idea is one issue on Linear; issues flow
through five fixed stages, one issue per session.

## Stack

- Type: web app (Next.js, TypeScript)
- Code: GitHub `casey/trailhead`, production branch `main`
- Hosting: Vercel — preview per push (vercel.app preview URLs), production at trailhead.app
- Backend/data: Supabase (Postgres + auth)
- Analytics: PostHog
- Build/test gate: `npm run lint && npm run test && npm run build`

## Project context

Solo developer; keep everything on free tiers where possible. The Supabase service key
must never reach the client — read it only server-side. Design is mobile-first; check
small screens before desktop.

## Core principles

- One issue = one feature = one session. Push back on bundling.
- Casey runs QA on the Vercel preview, then reports back. Never call it done off a build alone.
- Confirm before advancing an issue or doing anything bulk/destructive.
- Knowledge compounds: the Document stage writes findings back into CLAUDE.md.

## Pipeline stages

| Stage (Linear status) | Subtask | Meaning |
| --- | --- | --- |
| Backlog | (not started) | Captured idea |
| Scoping | 1. Scope | Spec the idea |
| POC | 2. POC | Smallest proof it works |
| Implementation | 3. Implement | Production build |
| QA | 4. QA | Casey reviews the preview |
| Documentation | 5. Document | Write knowledge back |
| Shipped | (done) | Live and documented |

Every issue has five sub-issues: 1. Scope, 2. POC, 3. Implement, 4. QA, 5. Document. The
issue's status tells you which to work on. Never skip stages.

## Startup routine — every session

1. Read `CLAUDE.md` and the sub-CLAUDE.md for the area you're touching (app/, components/, lib/).
2. Confirm the target issue. If asked "what's next," take the lowest non-Backlog status.
3. Read the issue (description, sub-issues, comments). Respect any "Blocked by:".
4. Restate the plan in one sentence and wait for Casey's OK.

## Per-subtask playbook

### 1. Scope
No code. Post a spec comment: problem, success criteria, dependencies, open questions.
Resolve questions with Casey. Done when posted and approved.

### 2. POC
Smallest testable proof for a web app:
| Task | POC |
| --- | --- |
| New page/section | Static mock reviewed at localhost; placeholder content |
| Supabase query/schema | Apply on a branch DB; confirm shape; service key stays server-side |
| Map/route UI | One route rendered on the map with no console errors |
| Auth flow | One round-trip sign-in against Supabase, confirmed locally |
Done when the core mechanic works in one real scenario Casey can see.

### 3. Implement
Production code to conventions in CLAUDE.md. Supabase service key server-side only. New
env vars in `.env.example` and Vercel (Preview + Production) and GitHub secrets if CI
needs them. Instrument meaningful actions with a PostHog `[object]_[verb]` event. Build on
a feature branch; Vercel makes the preview. Done when `npm run lint && npm run test &&
npm run build` passes, a PR is open and linked on the Linear issue, and the preview is live.

### 4. QA
Share the Vercel preview URL. Tell Casey what to check, mobile first. Fix bugs in the same
branch and re-push. After sign-off, rebase if `main` moved, merge, confirm trailhead.app.

### 5. Document
Update the most specific CLAUDE.md (app/, components/, lib/). Root CLAUDE.md only for
project-wide rules or the Shipped list.

## Hotfix path
For small, unambiguous fixes: a `[hotfix]` Linear issue (no sub-issues, skip Scope/POC),
fix on a branch, PR + Vercel preview + Casey's QA, then merge. Not for auth, the Supabase
schema, secrets, or deploy config — those run the full pipeline.

## Advancing an issue — confirm first
Preview the move (sub-issue complete, status change, flags like new Vercel env vars), get
an OK, then update Linear.

## Git workflow
Stage specific files only; commit `type(scope): ...` with scope = issue slug; push the
branch; open a PR linking the Linear issue; post the PR link on the issue; merge to `main`
after sign-off.

## Guardrails
One issue per session; don't skip stages; respect blockers; read CLAUDE.md first; Supabase
service key server-side; Vercel preview for QA, production after sign-off; confirm before
advancing; Casey runs QA; document in the right CLAUDE.md; capture findings as comments.
~~~

Notice what the generator did: kept the five-stage backbone and every guardrail, but
mapped them onto Linear's vocabulary (issues/sub-issues/status), wired in the real
commands and URLs, tailored the POC table to a web app with Supabase, and folded the
Phase-4 context (free tier, server-side key, mobile-first) into a project-context block
and the relevant stages.
