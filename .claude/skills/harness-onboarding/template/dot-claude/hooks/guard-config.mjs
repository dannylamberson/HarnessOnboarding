// Shared by the guards: reads `.claude/harness.json` (written at kickoff) for the commands no subagent may run.
// A missing or broken config blocks every Bash call, so a guard never fails open.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const PUSH = /\bgit\b(\s+-\S+(\s+\S+)?)*\s+push\b/

export function loadConfig(guardName) {
  const path = join(dirname(fileURLToPath(import.meta.url)), '..', 'harness.json')
  try {
    const config = JSON.parse(readFileSync(path, 'utf8'))
    const offLimits = (config.offLimits ?? []).map(({ pattern, label }) => [new RegExp(pattern), label])
    return { ...config, offLimits }
  } catch (error) {
    process.stderr.write(`${guardName}: can't read ${path} (${error.message}), so every command is blocked.\n`)
    process.exit(2)
  }
}

export function readCommand(callback) {
  let input = ''
  process.stdin.on('data', (chunk) => (input += chunk))
  process.stdin.on('end', () => callback(JSON.parse(input).tool_input?.command ?? ''))
}
