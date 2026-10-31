// Plugin-level PreToolUse hook (hooks.json). Plugin agents ignore frontmatter `hooks:`, so this one hook sees every
// Bash call and hands it to the guard of the agent making it, if that agent has one. `agent_type` is `<slug>:builder`
// for the plugin copy and `builder` for the project copy; the main session has none.
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const GUARDS = { builder: 'builder-guard.mjs', 'qa-runner': 'qa-runner-guard.mjs' }

let input = ''
process.stdin.on('data', (chunk) => (input += chunk))
process.stdin.on('end', () => {
  const agent = (JSON.parse(input).agent_type ?? '').replace(/^[^:]+:/, '')
  const guard = GUARDS[agent]
  if (!guard) process.exit(0)
  const result = spawnSync(process.execPath, [join(dirname(fileURLToPath(import.meta.url)), guard)], { input })
  process.stderr.write(result.stderr ?? '')
  // A guard that didn't run (status null) blocks rather than failing open.
  process.exit(result.status ?? 2)
})
