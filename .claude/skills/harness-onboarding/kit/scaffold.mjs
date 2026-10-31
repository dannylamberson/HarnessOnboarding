// Copies the harness kit into a project repo, filled from an answers file (kickoff step 6).
//
//   node scaffold.mjs --answers <answers.json> --target <repo> [--force]
//
// Paths: `dot-claude` becomes `.claude`, `dot-claude-plugin` becomes `.claude-plugin`, `SLUG` in a path becomes the
// slug, a `.tmpl` suffix is dropped, and `gitignore-append.txt` is appended to the target's `.gitignore`.
// Content: every `{{KEY}}` in `answers.values` is replaced. A block between `<!-- if:flag -->` (or `if:!flag`) and
// `<!-- endif -->` is kept only when the flag matches. `{{FILL: ...}}` markers are left for the session to write by
// hand, and listed. `.claude/harness.json` is generated from the answers. An existing file is never overwritten
// without --force; it's listed instead, for a hand merge.
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const kit = dirname(fileURLToPath(import.meta.url))
const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`)
  return i > 0 ? process.argv[i + 1] : undefined
}
const answersPath = arg('answers')
const target = arg('target') && resolve(arg('target'))
const force = process.argv.includes('--force')
if (!answersPath || !target) {
  console.error('Usage: node scaffold.mjs --answers <answers.json> --target <repo> [--force]')
  process.exit(1)
}

const answers = JSON.parse(readFileSync(answersPath, 'utf8'))
const values = answers.values ?? {}
const flags = { ui: true, database: true, delegation: true, ...answers.flags }
const slug = values.SLUG
if (!slug || !/^[a-z0-9][a-z0-9-]{0,29}$/.test(slug)) {
  console.error('answers.values.SLUG must be kebab-case, 30 characters or fewer')
  process.exit(1)
}

// Files that exist only when a flag is on.
const NEEDS = [
  [/^dot-claude\/agents\//, 'delegation'],
  [/^dot-claude\/hooks\/(hooks\.json|agent-guard|builder-guard|qa-runner-guard|guard-config)/, 'delegation'],
  [/^dot-claude\/skills\/SLUG-pipeline\/references\/delegation\.md$/, 'delegation'],
  [/^dot-claude\/skills\/SLUG-pipeline\/references\/sketches\.md$/, 'ui'],
  [/^docs\/personas\/ux\.md$/, 'ui'],
  [/^docs\/personas\/db\.md$/, 'database'],
]
const KIT_ONLY = new Set(['scaffold.mjs', 'scaffold.test.mjs', 'answers.example.json'])

const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) walk(path, out)
    else out.push(relative(kit, path).replaceAll('\\', '/'))
  }
  return out
}
const mapPath = (p) =>
  p
    .split('/')
    .map((seg) => (seg === 'dot-claude' ? '.claude' : seg === 'dot-claude-plugin' ? '.claude-plugin' : seg))
    .map((seg) => seg.replaceAll('SLUG', slug).replace(/\.tmpl$/, ''))
    .join('/')

const fill = (text) =>
  text
    .replace(/<!-- if:(!?)(\w+) -->\n?([\s\S]*?)<!-- endif -->\n?/g, (_, not, flag, body) =>
      Boolean(flags[flag]) !== Boolean(not) ? body : '',
    )
    .replace(/\{\{([A-Z_]+)\}\}/g, (match, key) => (key in values ? String(values[key]) : match))

const written = []
const skipped = []
const leftovers = []
const write = (rel, text) => {
  const out = join(target, rel)
  if (existsSync(out) && !force) return skipped.push(rel)
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, text)
  written.push(rel)
  text.split('\n').forEach((line, i) => {
    for (const [m] of line.matchAll(/\{\{[^}]*\}\}/g)) leftovers.push(`${rel}:${i + 1} ${m}`)
  })
}

for (const p of walk(kit).sort()) {
  if (KIT_ONLY.has(p)) continue
  const need = NEEDS.find(([re]) => re.test(p))?.[1]
  if (need && !flags[need]) continue
  const text = fill(readFileSync(join(kit, p), 'utf8').replace(/\r\n/g, '\n'))
  if (p === 'gitignore-append.txt') {
    const gi = join(target, '.gitignore')
    const have = existsSync(gi) ? readFileSync(gi, 'utf8') : ''
    const add = text.split('\n').filter((l) => l && !have.split(/\r?\n/).includes(l))
    if (add.length) appendFileSync(gi, `${have && !have.endsWith('\n') ? '\n' : ''}${add.join('\n')}\n`)
    written.push(`.gitignore (+${add.length} lines)`)
    continue
  }
  write(mapPath(p), text)
}

const harness = {
  slug,
  prodBranch: values.PROD_BRANCH ?? 'main',
  qaBranch: values.QA_BRANCH ?? 'staging',
  offLimits: answers.offLimits ?? [],
  budgets: { root: 8192, pipelineSkill: 16384, default: 12288, none: ['docs/shipped-archive.md'], ...answers.budgets },
  auditEvery: answers.auditEvery ?? 10,
}
write('.claude/harness.json', `${JSON.stringify(harness, null, 2)}\n`)

console.log(`Wrote ${written.length} file(s) into ${target}`)
if (skipped.length) console.log(`\nExists, not written (merge by hand, or --force):\n${skipped.map((s) => `  ${s}`).join('\n')}`)
const unfilled = leftovers.filter((l) => !l.includes('{{FILL:'))
const toFill = leftovers.filter((l) => l.includes('{{FILL:'))
if (unfilled.length) console.log(`\nPlaceholders with no answer:\n${unfilled.map((l) => `  ${l}`).join('\n')}`)
console.log(`\nFILL markers to write by hand: ${toFill.length}`)
for (const l of toFill) console.log(`  ${l}`)
process.exit(unfilled.length ? 2 : 0)
