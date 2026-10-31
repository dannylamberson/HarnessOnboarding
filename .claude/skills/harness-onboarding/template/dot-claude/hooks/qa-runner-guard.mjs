// PreToolUse hook for the QA runner (.claude/agents/qa-runner.md). The only push it lets through is
// `git push [--force-with-lease] [--dry-run] origin <qaBranch>`, written exactly so. Every other push, and the commands
// in `.claude/harness.json` › offLimits, are refused. Exit 2 blocks the call and shows stderr to the agent.
import { PUSH, loadConfig, readCommand } from './guard-config.mjs'

const { offLimits, qaBranch } = loadConfig('qa-runner-guard')
const PUSH_FLAGS = new Set(['--force-with-lease', '--dry-run'])

// One shell command (split on ; & | newline, subshells and backticks) that pushes is allowed only as `git push`, then
// the allowed flags, then exactly `origin <qaBranch>`.
const allowedPush = (part) => {
  // A redirect such as `2>&1` reaches here as `2>` once the split has cut it at `&`.
  const words = part.trim().split(/\s+/).filter((w) => !/^\d*[<>]/.test(w))
  if (words[0] !== 'git' || words[1] !== 'push') return false
  const rest = words.slice(2)
  const flags = rest.filter((w) => w.startsWith('-'))
  const args = rest.filter((w) => !w.startsWith('-'))
  return Boolean(qaBranch) && flags.every((f) => PUSH_FLAGS.has(f)) && args.length === 2 && args[0] === 'origin' && args[1] === qaBranch
}

const refuse = (what) => {
  process.stderr.write(
    `qa-runner-guard: \`${what}\` is off limits to the QA runner. The only push allowed is ` +
      `\`git push origin ${qaBranch}\` (or \`git push --force-with-lease origin ${qaBranch}\` for a rebuild). ` +
      'Report BLOCKED and leave it to the main session.\n',
  )
  process.exit(2)
}

readCommand((command) => {
  const hit = offLimits.find(([pattern]) => pattern.test(command))
  if (hit) refuse(hit[1])
  for (const part of command.split(/[;&|\n()`]|\$\(/)) {
    if (PUSH.test(part) && !allowedPush(part)) refuse(part.trim())
  }
})
