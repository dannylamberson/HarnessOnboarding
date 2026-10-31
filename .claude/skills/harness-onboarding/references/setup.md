# Setup: provisioning each role, in order (kickoff steps 4–9)

One step at a time. Before each, say in a line what it will create and where, and get an OK: every step here creates
something outside this computer. The user creates any new account and signs in themselves; never enter a password or
card number. Anything that costs money is the user's call, asked first. A step the user defers goes on the step 11
checklist.

Prefer a connected MCP tool or a signed-in CLI, then fall back to walking the user through the web UI with exact
clicks. The commands below are for the default stack (Linear, GitHub, Netlify, Supabase). For another tool, do the
same thing with its own CLI or UI.

## 4. Board

The board comes first, so the idea has somewhere to be broken down before code exists.

1. **The team or project.** In Linear, the user creates a team (Settings → Teams → Create), naming it after the
   project with a short identifier (the `ISSUE_PREFIX`, e.g. `TRL`). In a shared workspace, a team per project keeps
   statuses and labels apart.
2. **Statuses,** in this order: Backlog, Scoping, POC, Implementation, QA, Documentation, Shipped, Dropped. In Linear
   that's team settings → Workflow. Add or rename statuses there, since the connector can't. Check the result with
   `list_issue_statuses`.
3. **Labels,** created from the session (`create_issue_label`, team-scoped):
   - `area-*` for the parts of the codebase (start with `area-ui`, `area-db`, `area-functions`, `area-infra`,
     `area-harness`; add more as the code grows)
   - one `persona-*` per scaffolded persona (`persona-ux`, `persona-db`)
   - `type-feature`, `type-bug`, `type-spike` if the user wants types
4. Record the team name, the prefix and the board URL in the answers file (`BOARD`, `ISSUE_PREFIX`).

## 5. Repo

1. `gh auth status` must show the user signed in.
2. **From scratch:** `gh repo create <owner>/<slug> --private --clone`, from the folder the user wants it in. Private by
   default; public only if they say so.
3. **Existing:** confirm the remote (`git remote -v`) and the production branch name.
4. The QA branch comes after the first commit (step 6): `git switch -c staging && git push -u origin staging`, then
   back to `main`.
5. Record `REPO`, `PROD_BRANCH`, `QA_BRANCH`.

## 6. Scaffold

`references/scaffold.md`. The app skeleton and its gate, then the harness from `kit/`, then the first commit on
`main` and a push. Then cut the QA branch (step 5.4).

## 7. Install and check

From the new clone:

```
claude plugin validate .claude
claude plugin validate .
claude plugin marketplace add <absolute path to the clone>
claude plugin install <slug>@<slug>-local
node .claude/hooks/harness-check.mjs
```

The check should print `Plugin: ok` and end `Result: ok`. "Clone fresh" needs the push from step 6. "Registered"
can't be seen from here: the first real session confirms it by listing `<slug>:builder`. If `claude` isn't on PATH,
give the user the commands to run in a terminal. Remind them that a session already running won't see the new agents;
the next one will.

## 8. Hosting

The QA site is the load-bearing piece. For Netlify (the household pattern):

1. **Production site:** import the repo (Add new site → Import an existing project → GitHub → the repo), production
   branch `main`, the build command and publish folder from the scaffold. Deploy previews on, so each PR runs the gate.
2. **QA site:** a second site from the same repo with its production branch set to `staging`, named `<slug>-qa`. Its
   URL is `QA_URL`.
3. **The build SHA.** The scaffold's build writes `build-meta.json` with the commit (`COMMIT_REF` on Netlify,
   `VERCEL_GIT_COMMIT_SHA` on Vercel, `CF_PAGES_COMMIT_SHA` on Cloudflare). Check `<QA_URL>/build-meta.json` shows the
   pushed SHA. That's the `QA_BUILD_CHECK`.
4. **Env vars:** set the client-safe ones on both sites. Secrets go in server-side env only.
5. **The first deploy:** both sites green, and the production URL loads the skeleton. A custom domain is optional and
   can wait for the checklist.

Other hosts: production from `main`, a QA target from `staging` (a branch deploy or a second project), and a way to
read the deployed SHA.

## 9. Database (if any)

For Supabase:

1. **Cost first.** The free tier caps active projects per organization (two, at the time of writing). Check with the connector (`get_cost`), tell
   the user the result, and confirm (`confirm_cost`) before `create_project`. Or the user creates it in the dashboard.
2. **Local stack:** `supabase init` in the repo, then `supabase start` (needs Docker), then `supabase link
   --project-ref <ref>`.
3. **Auth** (if the app signs people in): sign-ups off for an invite-only app, and the production and QA origins in
   the redirect allow-list. A new origin missing from it breaks sign-in there.
4. **Env:** the public URL and anon or publishable key into `.env.example` (names only) and both hosting sites. The
   service key stays server-side only.
5. **No tables.** Each card adds its own migration, with access rules. Record `BACKEND`, `DB_LOCAL_CHECK` (`supabase db
   reset && supabase test db`) and `DB_PUSH_CMD` (`supabase db push`).

Shared database note: on a free tier, previews, QA and production share this one project, which makes additive-only
migrations a hard rule. Say so in root `CLAUDE.md` › Project rules.
