# Worked example — a real filled-in harness

Excerpts from the project this harness was extracted from: a collaborative music-sharing automation, roughly 150 shipped cards, running this pipeline daily. Use it to calibrate **how specific** a filled-in placeholder should be.

The recurring lesson across all of it: **every rule that stuck carries its evidence.** Vague guidance gets reasoned away.

## `{{PATH_ROUTING_TABLE}}` — the one every stage reads

```markdown
| Changed path                | Context file        | Persona(s)                                      |
| --------------------------- | ------------------- | ----------------------------------------------- |
| `lib/**`                    | `lib/CLAUDE.md`     | `db-architect` if schema is involved             |
| `netlify/functions/**`      | `netlify/CLAUDE.md` | `security-reviewer`                             |
| `public/**`                 | `public/CLAUDE.md`  | `ux-web`                                        |
| `scripts/**`, `.github/**`  | `scripts/CLAUDE.md` | `infra`                                         |
| `docs/migrations/**`        | `lib/CLAUDE.md`     | `db-architect` + `security-reviewer` if new RLS |
| anything touching auth      | —                   | `security-reviewer`                             |
```

Note the last row: a *condition*, not a path. Some routing is content-triggered and can't be expressed as a glob — the version of this table that keyed database review off a label instead missed 5 of 9 migration-writing cards.

## `{{POC_TABLE}}` — tuned to project type

```markdown
| Task type                | POC looks like                                                    |
| ------------------------ | ----------------------------------------------------------------- |
| New page or UI section   | Static mock of the layout, reviewed locally; placeholder content   |
| Visual/styling change    | Apply to one representative component, eyeball the direction       |
| New API route / function | Write it, run locally, hit it once, confirm the response shape     |
| Schema change            | Apply locally first, query it back, then apply to the shared target |
| External API integration | A throwaway script that makes one real call and logs the result    |
| Scheduled job            | Run the entry point by hand with a fixed input                     |
```

Six rows, each naming a concrete action. "Build a small version" would have been useless.

## `{{BUILD_VERIFY_METHOD}}` — the one people skip

```markdown
Fetch `https://<prod-url>/build-meta.json` with a cache-buster and confirm its
`commitRef` matches the commit you pushed.

This exists because every production build from 2026-07-28 to 2026-08-01 failed
on the secrets scanner and two ships silently no-opped — the merge, CI run, and
push all looked healthy while nothing published.
```

The second paragraph is why the check survives. Without it, a future session reads a fiddly extra step and skips it.

## A `{{PROJECT_GOTCHAS}}` entry

```markdown
- **A bare-ownership RLS `UPDATE` policy only gates which row, never which
  column — column-level `GRANT`s do that.** `profiles.is_god_mode` was
  self-grantable by any signed-in user because `authenticated` held table-default
  `UPDATE` on every column while the policy only checked row ownership. Before
  adding a sensitive or role-ish column to any table with this ownership pattern,
  check its column grants, not just its RLS policy.
```

The shape: **what goes wrong → why it wasn't obvious → what to do instead.** Note it doesn't just describe the bug; it names the check to run next time. A gotcha that only describes a past incident teaches nothing.

## `{{ESTIMATE_RUBRIC}}`

```markdown
| Estimate | Means                                                           |
| -------- | --------------------------------------------------------------- |
| 1        | One file, no schema, no new surface. An hour                     |
| 2        | A few files in one folder, or one new small function             |
| 3        | Crosses folders, or adds a migration                             |
| 5        | New user-facing surface with backend work                        |
| 8        | Should probably be split — use it as a signal, not a size        |
```

The last row does real work: it turns the top of the scale into a prompt to reconsider.

## `{{UNIVERSAL_RULES}}` — two representative entries

```markdown
- Always `await` side effects before returning; the runtime kills unawaited promises
- **Rate-limit failures are not "no result" — never record them as one.** A quota
  or 429 failure means the lookup never ran; marking the row checked retires it
  from the retry pool permanently and the data is lost silently. Use a deferred
  marker that a scheduled job clears.
```

The first is one line because it needs one. The second is long because the failure is silent, and a short version wouldn't survive contact with someone who hasn't seen it happen. **Length should track how non-obvious the rule is**, not a house style.

## What a mature root `CLAUDE.md` looks like

At ~150 shipped cards, with active budget discipline:

| Section                     | Size                                                   |
| --------------------------- | ------------------------------------------------------ |
| Project + stack + layout    | ~2,000 chars                                            |
| Commands + env var names    | ~1,200                                                  |
| Universal rules             | ~4,000 — the largest section, and correctly so          |
| Pointers to sub-files/docs  | ~2,500                                                  |
| Shipped list (slugs only)   | ~2,000 for 150 features                                 |
| Project-wide gotchas        | ~6,000                                                  |

Two things to copy: the shipped list is **slugs only** — full descriptions live in `docs/feature-history.md`, which is never loaded by default — and rules plus gotchas are two-thirds of the file. That ratio is the sign of a healthy root context file. When history or reference material starts crowding them out, it's time for a split.

## What the stage skills settled at

| File                       | Size        |
| -------------------------- | ----------- |
| `docs/pipeline-core.md`    | ~13,700     |
| `pipeline-groom/SKILL.md`  | ~13,700     |
| `pipeline-poc/SKILL.md`    | ~8,400      |
| `pipeline-implement`       | ~5,900      |
| `pipeline-qa`              | ~6,000      |
| `pipeline-document`        | ~9,200      |
| `pipeline-ship`            | ~11,200     |

Compare with the monolith they replaced: **21,346 chars, reloaded in full on every invocation.** Now only core plus the one relevant stage loads.

Groom and ship are the largest because they carry genuinely stage-specific machinery — a selection rubric, a batch sequence. Implement and QA are small because most of what they need is shared and lives in core. **If a stage skill starts growing, check whether what's growing actually belongs in core.**
