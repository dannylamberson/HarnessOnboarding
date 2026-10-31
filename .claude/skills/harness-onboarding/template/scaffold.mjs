// Copies the template into a project repo and fills the mechanical placeholders (kickoff step E2).
//
//   node scaffold.mjs --answers <answers.json> --target <repo> [--force]
//
// Paths: `dot-claude` becomes `.claude`, `dot-claude-plugin` becomes `.claude-plugin`, and a `.tmpl` suffix is dropped
// (the template is stored that way so Claude Code doesn't load its CLAUDE.md or skills while you work in this repo).
// `gitignore-stanza.txt` is appended to the target's `.gitignore`, once.
// Content: every `{{KEY}}` in `answers.values` is replaced. A block between `<!-- if:flag -->` (or `if:!flag`) and
// `<!-- endif -->` is kept only when the flag matches. `.claude/harness.json` is generated from the answers.
// Every placeholder left after that is prose for the session to write, or a section to delete (SETUP.md); they're
// listed by file and line. An existing file is never overwritten without --force; it's listed instead, for a hand merge.
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const template = dirname(fileURLToPath(import.meta.url))
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
const flags = { ui: true, database: true, delegation: true, integration: true, ...answers.flags }
const slug = values.SLUG
if (!slug || !/^[a-z0-9][a-z0-9-]{0,29}$/.test(slug)) {
  console.error('answers.values.SLUG must be kebab-case, 30 characters or fewer')
  process.exit(1)
}

// Files that exist only when a flag is on.
const NEEDS = [
  [/^dot-claude\/agents\//, 'delegation'],
  [/^dot-claude\/hooks\/(hooks\.json|agent-guard|builder-guard|qa-runner-guard|guard-config)/, 'delegation'],
  [/^docs\/delegation\.md$/, 'delegation'],
  [/^docs\/sketches\.md$/, 'ui'],
]
const TEMPLATE_ONLY = new Set(['scaffold.mjs', 'scaffold.test.mjs', 'answers.example.json', 'SETUP.md'])

const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) walk(path, out)
    else out.push(relative(template, path).replaceAll('\\', '/'))
  }
  return out
}
const mapPath = (p) =>
  p
    .split('/')
    .map((seg) => (seg === 'dot-claude' ? '.claude' : seg === 'dot-claude-plugin' ? '.claude-plugin' : seg))
    .map((seg) => seg.replace(/\.tmpl$/, ''))
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
    for (const [m] of line.matchAll(/\{\{[A-Z_]+\}\}/g)) leftovers.push({ file: rel, line: i + 1, key: m })
  })
}

for (const p of walk(template).sort()) {
  if (TEMPLATE_ONLY.has(p)) continue
  const need = NEEDS.find(([re]) => re.test(p))?.[1]
  if (need && !flags[need]) continue
  const text = fill(readFileSync(join(template, p), 'utf8').replace(/\r\n/g, '\n'))
  if (p === 'gitignore-stanza.txt') {
    const gi = join(target, '.gitignore')
    const have = existsSync(gi) ? readFileSync(gi, 'utf8').replace(/\r\n/g, '\n') : ''
    if (have.split('\n').includes('.claude/*')) {
      written.push('.gitignore (stanza already present)')
    } else {
      appendFileSync(gi, `${have && !have.endsWith('\n') ? '\n' : ''}${have ? '\n' : ''}${text}`)
      written.push('.gitignore (+ harness stanza)')
    }
    continue
  }
  write(mapPath(p), text)
}

const harness = {
  slug,
  prodBranch: values.PROD_BRANCH ?? 'main',
  qaBranch: flags.integration ? (values.INTEGRATION_BRANCH ?? 'staging') : null,
  offLimits: answers.offLimits ?? [],
  budgets: { root: 15000, claudeMd: 12000, skill: 12000, files: { 'docs/pipeline-core.md': 24000 }, ...answers.budgets },
  auditEvery: answers.auditEvery ?? 10,
}
write('.claude/harness.json', `${JSON.stringify(harness, null, 2)}\n`)

console.log(`Wrote ${written.length} file(s) into ${target}`)
if (skipped.length) console.log(`\nExists, not written (merge by hand, or --force):\n${skipped.map((s) => `  ${s}`).join('\n')}`)
const keys = [...new Set(leftovers.map((l) => l.key))].sort()
console.log(`\nLeft for the session to write, or to delete the section (SETUP.md): ${keys.length} placeholder(s)`)
for (const key of keys) {
  const where = leftovers.filter((l) => l.key === key).map((l) => `${l.file}:${l.line}`)
  console.log(`  ${key}  ${where.join(', ')}`)
}
