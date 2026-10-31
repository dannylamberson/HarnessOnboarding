# POC by task type

The smallest proof that the approach works: enough to validate direction, not production-ready. If you're writing
edge-case handling or polishing copy, you've drifted into Implement.

| Task | POC looks like |
| --- | --- |
<!-- if:ui -->
| New screen or component | The approved sketch (`.claude/skills/{{SLUG}}-pipeline/references/sketches.md`; none and no waiver means sketch first), built with the real components at the target size, with placeholder data and POC-only switches for any variants. Viewable without sign-in when it can be. Delete the POC entry point at Implement |
| Visual change | Apply it to one representative component and look at it with {{OWNER}} |
<!-- endif -->
<!-- if:database -->
| Schema and access rules | Write the migration and apply it locally (`{{DB_LOCAL_CHECK}}`). Prove a user who should read and write can, and one who shouldn't gets nothing. A POC migration is the one that ships, so it's additive |
<!-- endif -->
| API route or function | Write it, run it locally, call it once, log the response shape |
| External API | A throwaway script that makes one real call and logs the result. Secrets stay in env |
| Infra or platform capability | Prove the mechanism on a non-production target, on the real device when it's device-specific |

{{FILL: add or tune rows for this project's own kinds of work, e.g. a bot message, a cron job, an offline mode}}
