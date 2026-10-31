# Delegation: who runs what

Which model runs each stage, what it hands to a cheaper subagent, and how the work comes back. The split: Opus at
high effort scopes, plans, decides and reviews; Sonnet and Haiku write and check. Like a tech lead with two
engineers, the lead keeps the judgment and hands off work that a written plan fully describes.

## Starting a session

`claude --agent pipeline-lead --effort high` starts the main session on Opus at high effort
(`.claude/agents/pipeline-lead.md`). In the desktop app, pick Opus and high effort by hand.

- **Pass `--effort high`.** An agent file's `effort:` doesn't always reach a session launched from another process,
  and the flag does. `CLAUDE_CODE_EFFORT_LEVEL`, if set, overrides both, so leave it unset.
- **The lead loads the pipeline skill itself.** A `skills:` line in an agent file doesn't preload it.
- **Subagents inherit the lead's effort** unless the agent file sets one. `builder` and `qa-runner` set `medium`.
- **Check a run:** `claude -p "..." --output-format json` reports `modelUsage` per model.

## The harness check (step 0)

The agents, guards and skills are the `{{SLUG}}` plugin, loaded in place from this machine's clone, so they load from
any start folder (`docs/harness-plugin.md`). `.claude/hooks/harness-check.mjs` prints **Plugin**, **Registered**,
**Clone fresh** and **Guards live**, then `Result: ok` or `Result: MISS, ...` with the offers.

- **On a MISS,** or helpers missing from the Agent tool's list, ask {{OWNER}} with buttons: the offers it names.
  Carrying on without the guards means the no-push rule rests on the prompts and the review.
- **A running session keeps the agents it started with;** skills hot-reload. After pulling an agent or hook change,
  start a new session.

## By stage

| Stage | Main session (Opus, high) | Delegated to | Opus reviews |
| --- | --- | --- | --- |
| Scope | Paths, labels, personas, sketches, spec, {{OWNER}}'s questions | Nothing. A wide read-only search may go to `Explore` | n/a |
| POC | The POC plan, running it with {{OWNER}} | The build: `builder` (Sonnet) | The checklist below, then the POC with {{OWNER}} |
| Implement | The plan, posted on the card | The build: `builder` | The checklist, then the PR |
| QA | Migration push, what goes on `{{QA_BRANCH}}`, browser checks, the test script, {{OWNER}}'s reports | Fixes: `builder` with a fix plan. `{{QA_BRANCH}}` merges and pushes, the build wait, the gate and shell checks: `qa-runner` (Haiku) | The checklist on each fix; `qa-runner`'s report before writing the script |
| Document | The brief, reading the doc diff | `doc-writer` (Sonnet) writes, `context-check` (Haiku) checks | The doc diff before committing |
| Hotfix, maintenance | The whole change | Nothing (docs moves may go to `doc-writer`) | n/a |

A helper's name is `{{SLUG}}:<agent>` when the Agent tool lists it that way, else `<agent>`.

## The guards

- **Plugin agents ignore frontmatter `hooks:`,** so the plugin's `hooks/hooks.json` runs `agent-guard.mjs` on every
  Bash call. It routes by the hook input's `agent_type` to that agent's guard and lets the main session through. The
  frontmatter hooks stay for a machine without the plugin.
- **`builder-guard.mjs`** refuses every `git push` and the commands in `.claude/harness.json` › offLimits.
  **`qa-runner-guard.mjs`** refuses the same list and allows only `git push [--force-with-lease] origin {{QA_BRANCH}}`.
- **A hook whose script is missing fails open.** That's why `{{QA_BRANCH}}` lives in a worktree, never in the main
  checkout.
- **A cloud session runs no hooks,** so the rules stay in the prompts as well, and the review checks them.

## Not worth delegating

Keep it in the main session when it's a hotfix or maintenance, or the change is about **3 files or fewer and 50
changed lines or fewer**, or writing the plan would take longer than writing the change.

## The plan

A cold subagent knows only its prompt. The plan names:

- The card ({{ISSUE_PREFIX}}-n, slug), the branch, and the stage.
- Each file to create or change, and what it does. The exact user-facing wording.
- The approved sketch, when there is one (`sketches/<slug>/<file>.html`, option picked).
- The tests to add, and the gate: `{{GATE_CMD}}` passes.
- The decisions already made, with who made them, so the agent doesn't re-open them.
- What is out of scope.
- The selected personas, or "Personas: none". The builder reads each one's Build defaults itself.

## The kick-back rule

`builder.md` and `qa-runner.md` carry this, and the three copies stay word for word the same. Paste it into any
other delegated prompt that writes:

```
If you reach a decision this plan doesn't settle (a name, a behavior, wording, a file or dependency the
plan doesn't list, a test you'd skip), stop. Don't guess and don't work around it. Leave that part
undone, and end your reply with exactly:

BLOCKED
Decision: <the one question>
Options: <each option you see, with its trade-off>
Done so far: <files changed, commits made, what passes>
```

## Answering BLOCKED

1. Settle it from the spec, the plan or a `CLAUDE.md` if they answer it.
2. Anything touching **scope, data, cost, auth or access rules** goes to {{OWNER}} (AskUserQuestion), even when the
   spec seems to lean one way.
3. Resume the **same** agent: SendMessage to the agent ID the Agent call returned, with the answer and "carry on with
   the plan". It keeps its context and its work; a new Agent call starts cold.
4. Add the answer to the plan on the card, so a later stage sees it.

## Review checklist

Run on every delegated result before committing, pushing or reporting:

1. **The full diff against the plan** (`git diff {{PROD_BRANCH}}...HEAD`): every planned file, nothing unplanned,
   the wording exact.
2. **Re-run `{{GATE_CMD}}`** yourself. The agent's "it passes" isn't evidence.
3. **Persona Build defaults** of each selected persona, against the diff.
4. **Labels from the diff:** `git diff --name-only {{PROD_BRANCH}}...HEAD` against the card's `area-*` labels; fix
   them and say so in the stage comment.
5. **Anything the agent decided** that the plan didn't: undo it or take it to {{OWNER}}. The report's Deviations line
   is where to start.
6. **Nothing pushed:** the builder's commits still show in `git log @{u}..` (on a new branch with no upstream,
   `git ls-remote --heads origin <branch>` is empty).
