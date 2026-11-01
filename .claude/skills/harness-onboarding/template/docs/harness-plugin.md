# The harness plugin: install and check

The repo's `.claude/` folder is a Claude Code plugin, `{{SLUG}}`, listed in the marketplace
`.claude-plugin/marketplace.json` (`{{SLUG}}-local`). Installed once per machine from that machine's own clone, it
registers the pipeline's agents, guard hooks and skills from any start folder, as `{{SLUG}}:builder`,
`{{SLUG}}:qa-runner` and so on. How the pipeline uses it: `docs/pipeline-core.md` › Startup routine.

## Install on a new machine

```
claude plugin marketplace add <clone>
claude plugin install {{SLUG}}@{{SLUG}}-local
```

- **Updates arrive with `git pull`.** A relative-path plugin in a local-path marketplace loads in place from the
  clone, with no reinstall or version bump. A new session picks up agent and hook changes; a running one keeps the
  agents it started with; skills hot-reload.
- **The plugin follows the clone's checked-out branch.** A branch's agent changes are live in that machine's new
  sessions.
- **The install copies `.claude/` into the plugin cache,** worktrees included, so it's slow when the clone has many.
  Sessions don't use that copy.

## Check it

1. `node <clone>/.claude/hooks/harness-check.mjs` from any folder ends `Result: ok`.
2. In a session started outside the clone, the Agent tool lists `{{SLUG}}:builder` and `{{SLUG}}:qa-runner`.
3. After editing either manifest: `claude plugin validate <clone>/.claude` and `claude plugin validate <clone>` pass.

## Remove

`claude plugin uninstall {{SLUG}}@{{SLUG}}-local`, then `claude plugin marketplace remove {{SLUG}}-local`.
