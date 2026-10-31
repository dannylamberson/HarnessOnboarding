// PreToolUse hook for the builder agent (.claude/agents/builder.md): refuses every `git push`, plus the commands in
// `.claude/harness.json` › offLimits (deploys, the hosted database, the code host and board CLIs). Exit 2 blocks the
// call and shows stderr to the agent.
import { PUSH, loadConfig, readCommand } from './guard-config.mjs'

const { offLimits } = loadConfig('builder-guard')

readCommand((command) => {
  const hit = [[PUSH, 'git push'], ...offLimits].find(([pattern]) => pattern.test(command))
  if (hit) {
    process.stderr.write(
      `builder-guard: \`${hit[1]}\` is off limits to the builder. Leave it to the main session and note it in your report.\n`,
    )
    process.exit(2)
  }
})
