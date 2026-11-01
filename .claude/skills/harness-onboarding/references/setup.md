# Setup: the tools, in order (kickoff step E), and the app skeleton (step F1)

One step at a time. Before each, say in a line what it will create and where, and get an OK: every step here creates
something outside this computer. The user creates any new account and signs in themselves; never enter a password or
card number. Anything that costs money is the user's call, asked first. A step the user defers goes on the wrap-up
checklist, not a silent skip.

Prefer a connected MCP tool or a signed-in CLI, then fall back to walking the user through the web UI with exact
clicks. The commands below are for the common stack (Linear, GitHub, Netlify, Supabase). For another tool, do the same
thing with its own CLI or UI. **For an existing project, each step shrinks to checking what's already there** and
recording it in the answers file.

## 1. Linear

Linear comes first, so the idea has somewhere to be broken down before code exists.

1. **The team.** The user creates it (Settings → Teams → Create), named after the project, with a short key: the
   `{{TEAM_KEY}}`, e.g. `TRL`. In a shared workspace, a team per project keeps statuses and labels apart.
2. **Workflow statuses,** in this order: Backlog · Scoping · POC · Implementation · QA · Documentation · Shipped ·
   Dropped. Set Shipped's type to `completed` and Dropped's to `canceled`. Team settings → Workflow; the connector
   can't add or rename statuses, so the user does it. Check with the connector's list-statuses operation.
3. **Labels,** from the session where the connector allows it:
   - a `type` label **group, exclusive**: `feature`, `bug`, `chore`, `polish`, `spike`
   - `area-*` labels **ungrouped** (flat, multi-select), one per meaningful folder: start with a few (`area-ui`,
     `area-db`, `area-infra`, `area-harness`) and add more as the code grows
   - **no persona labels:** personas route from paths and stage rules (`pipeline-spec.md`)
4. Record `LINEAR_WORKSPACE`, `TEAM_NAME`, `TEAM_KEY`, `TYPE_LABELS`, `AREA_LABELS` in the answers file.

## 2. The repo

1. `gh auth status` must show the user signed in.
2. **From scratch:** `gh repo create <owner>/<slug> --private --clone`, from the folder they want it in. Private by
   default; public only if they say so.
3. **Existing:** confirm the remote (`git remote -v`) and the production branch name.
4. The integration branch, if the QA shape needs one, comes after the first commit (step F6):
   `git switch -c staging && git push -u origin staging`, then back to the production branch.

## 3. Hosting and the QA target

The QA target is the load-bearing piece. Either shape works; the interview picked one.

- **A long-lived integration branch** (the shape household and mixtape use). For Netlify: a production site from the
  repo on `main`, and a second site from the same repo with its production branch set to `staging`, named
  `<slug>-qa`. Deploy previews on, so each PR runs the gate.
- **Preview per branch.** The host's PR or branch previews are the QA target; no integration branch, and the QA
  runner pushes nothing (`flags.integration: false`).

Then:

1. **A way to read the deployed SHA.** The skeleton's build writes `build-meta.json` with the commit (`COMMIT_REF` on
   Netlify, `VERCEL_GIT_COMMIT_SHA` on Vercel, `CF_PAGES_COMMIT_SHA` on Cloudflare). That gives `BUILD_VERIFY_METHOD`
   (production) and `QA_BUILD_CHECK` (the QA target), both fetched with a cache-buster.
2. **Does pushing the production branch deploy production?** On most hosts it does: record it as `DEPLOY_NOTE` and
   `DEPLOY_MODEL_NOTE`, and it's why the builder guard refuses every push.
3. **Env vars:** client-safe ones on every site; secrets in server-side env only.
4. **The first deploy:** every site green, and the production URL loads the skeleton. A custom domain can wait for
   the checklist.

## 4. The database (if any)

For Supabase:

1. **Cost first.** The free tier caps active projects per organization (two, at the time of writing). Check with the
   connector's cost tool, tell the user, and confirm before creating the project. Or the user creates it in the
   dashboard.
2. **The local stack:** `supabase init` in the repo, `supabase start` (needs Docker), `supabase link --project-ref <ref>`.
3. **Auth,** if the app signs people in: sign-ups off for an invite-only app, and the production and QA origins in the
   redirect allow-list. A new origin missing from it breaks sign-in there.
4. **Env:** the public URL and publishable key into `.env.example` (names only) and every hosting site. The service
   key stays server-side only.
5. **No tables.** Each card adds its own migration, with access rules. Record `DB_LOCAL_CHECK` (`supabase db reset &&
   supabase test db`) and `DB_PUSH_CMD` (`supabase db push`), and add the push to the guards' `offLimits`.

When previews, QA and production share one database (the free-tier norm), migrations are additive only. Say so in root
`CLAUDE.md` › Universal rules.

## Skeleton (from scratch, before step F2)

The smallest app that builds and deploys in the chosen stack. Nothing feature-shaped: features are cards.

- **Init** with the framework's own starter, into the clone.
- **The gate:** one command that runs lint, typecheck, test and build and fails on any of them (`BUILD_TEST_CMD`),
  plus one trivial test so the test step has something to run.
- **`build-meta.json`:** a build step that writes the deployed commit SHA into the output.
- **`.env.example`,** names only.
- **Design tokens,** when there's UI: one CSS file of custom properties (colors for light and dark, spacing, radius,
  type sizes) at `TOKENS_PATH`, used by the app's base styles. Sketches link it.
- Run the gate locally and confirm it passes before installing the harness.
