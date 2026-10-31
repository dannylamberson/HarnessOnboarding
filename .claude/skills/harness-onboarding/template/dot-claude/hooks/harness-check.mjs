// Step 0 of every session (the pipeline skill's startup routine): does this session have the harness? It checks that
// the project's plugin is installed from this clone, that the clone has the production branch's `.claude/` changes,
// and that the guard hooks can run here. It prints one line per check and a Result line, and changes nothing but a
// `git fetch`. Registered (the helpers in the session's agent list) only the session can see, so the script says what
// to look for. Names come from the plugin manifests and `.claude/harness.json`, so the script has no placeholders.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const configDir = process.env.CLAUDE_CONFIG_DIR ?? join(homedir(), '.claude')
const pluginsDir = process.env.CLAUDE_CODE_PLUGIN_CACHE_DIR ?? join(configDir, 'plugins')

const readJson = (path) => {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return null
  }
}
const samePath = (a, b) => !relative(resolve(a), resolve(b))
const inside = (child, parent) => {
  const rel = relative(resolve(parent), resolve(child))
  return !rel.startsWith('..') && !/^[a-z]:/i.test(rel)
}
const git = (...args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', timeout: 30000 }).trim()

const pluginName = readJson(join(root, '.claude/.claude-plugin/plugin.json'))?.name
const marketplaceName = readJson(join(root, '.claude-plugin/marketplace.json'))?.name
const prodBranch = readJson(join(root, '.claude/harness.json'))?.prodBranch ?? 'main'
const PLUGIN = `${pluginName}@${marketplaceName}`
const misses = []

// The plugin: installed, enabled, and its marketplace is this clone.
let plugin
if (!pluginName || !marketplaceName) plugin = 'MISS, the plugin manifests are missing (docs/harness-plugin.md)'
else {
  const installed = readJson(join(pluginsDir, 'installed_plugins.json'))?.plugins?.[PLUGIN]
  const enabled = readJson(join(configDir, 'settings.json'))?.enabledPlugins?.[PLUGIN] !== false
  const location = readJson(join(pluginsDir, 'known_marketplaces.json'))?.[marketplaceName]?.installLocation
  if (!installed) plugin = `${PLUGIN} not installed (docs/harness-plugin.md)`
  else if (!enabled) plugin = `${PLUGIN} installed but disabled`
  else if (!location || !samePath(location, root)) plugin = `${PLUGIN} installed from ${location ?? 'an unknown folder'}, not ${root}`
}
const pluginOk = !plugin
console.log(`Plugin: ${pluginOk ? `ok, ${PLUGIN} from ${root}` : plugin}`)

console.log(
  `Registered: check your Agent tool lists ${pluginName}:builder and ${pluginName}:qa-runner (or builder and qa-runner).`,
)

// Clone fresh: what the production branch changed in `.claude/` since this checkout's merge base.
let fresh
try {
  git('fetch', '--quiet', 'origin', prodBranch)
  const upstream = `origin/${prodBranch}`
  const behind = Number(git('rev-list', '--count', `HEAD..${upstream}`))
  const changed = git('diff', '--name-only', `HEAD...${upstream}`, '--', '.claude').split('\n').filter(Boolean)
  if (changed.length) {
    fresh = `MISS, ${upstream} changed ${changed.length} harness file(s) this clone lacks (${changed.slice(0, 3).join(', ')})`
    misses.push(`the clone is behind ${upstream}`)
  } else fresh = behind ? `ok, ${behind} commit(s) behind ${upstream}, none in .claude/` : `ok, up to date with ${upstream}`
} catch (error) {
  fresh = `MISS, couldn't compare with origin/${prodBranch}: ${String(error.message).split('\n')[0]}`
  misses.push("the clone couldn't be checked")
}
console.log(`Clone fresh: ${fresh}`)

// Guards live: cloud sessions run no hooks; otherwise the plugin's dispatcher, or the project agents' frontmatter
// hooks in a trusted repo folder.
const trusted = Object.entries(readJson(join(homedir(), '.claude.json'))?.projects ?? {}).some(
  ([path, project]) => project?.hasTrustDialogAccepted && inside(root, path),
)
let guards
if (process.env.CLAUDE_CODE_REMOTE === 'true') guards = 'MISS, a cloud session runs no hooks'
else if (pluginOk) guards = 'ok, the plugin dispatcher (hooks/agent-guard.mjs)'
else if (inside(process.cwd(), root) && trusted) guards = "ok, the project agents' frontmatter hooks"
else guards = `MISS, no plugin and ${inside(process.cwd(), root) ? 'an untrusted repo folder' : 'not started in the repo folder'}`
if (guards.startsWith('MISS')) misses.push('the guards are off')
console.log(`Guards live: ${guards}`)

if (!misses.length) console.log('Result: ok')
else {
  const offers = ['"Carry on without the guards"']
  if (misses.some((m) => m.startsWith('the clone is behind'))) offers.unshift('"Pull, then start a new session"')
  else if (process.env.CLAUDE_CODE_REMOTE !== 'true') offers.unshift('"Start in the repo folder"')
  console.log(`Result: MISS, ${misses.join('; ')}. Offer ${offers.join(' or ')}.`)
}
