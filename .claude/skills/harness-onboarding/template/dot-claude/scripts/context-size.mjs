// The context check (`node .claude/scripts/context-size.mjs`): every budgeted context file against its budget, every
// backticked `.md` path that doesn't resolve, and how many cards shipped since the last harness audit. Budgets come
// from `.claude/harness.json` › budgets, the numbers `docs/harness-notes.md` › Token budget targets states:
//   root       root CLAUDE.md                       loaded every session
//   claudeMd   every other CLAUDE.md                loaded with its folder
//   skill      .claude/skills/*/SKILL.md and agents  loaded when their stage or agent runs
//   files      per-path overrides, e.g. docs/pipeline-core.md
// Other docs are on-demand and unbudgeted. Sizes are LF bytes, as git stores them. Exits 1 on a file over budget or
// a broken pointer. `--sections` breaks an over-budget file down by heading.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const config = JSON.parse(readFileSync(join(root, '.claude/harness.json'), 'utf8'))
const budgets = { root: 15000, claudeMd: 12000, skill: 12000, files: {}, ...config.budgets }
const SKIP = new Set(['node_modules', '.git', 'worktrees', 'sketches', 'dist', 'build', '.netlify', '.vercel'])

const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue
    const path = join(dir, name)
    if (statSync(path).isDirectory()) walk(path, out)
    else if (name.endsWith('.md')) out.push(path)
  }
  return out
}
const rel = (path) => relative(root, path).replaceAll('\\', '/')
const isContext = (p) => p.endsWith('CLAUDE.md') || p.startsWith('docs/') || /^\.claude\/(skills|agents)\//.test(p)
const files = walk(root).map(rel).filter(isContext).sort()
const read = (p) => readFileSync(join(root, p), 'utf8').replace(/\r\n/g, '\n')
const budgetFor = (p) => {
  if (p in budgets.files) return budgets.files[p]
  if (p === 'CLAUDE.md') return budgets.root
  if (p.endsWith('CLAUDE.md')) return budgets.claudeMd
  if (/^\.claude\/(skills\/[^/]+\/SKILL|agents\/[^/]+)\.md$/.test(p)) return budgets.skill
  return null
}

let failed = false
console.log('File'.padEnd(56), 'Bytes'.padStart(7), 'Budget'.padStart(7))
for (const p of files) {
  const bytes = Buffer.byteLength(read(p))
  const budget = budgetFor(p)
  const over = budget !== null && bytes > budget
  if (over) failed = true
  console.log(p.padEnd(56), String(bytes).padStart(7), String(budget ?? '-').padStart(7), over ? ' OVER' : '')
  if (over && process.argv.includes('--sections')) {
    for (const section of read(p).split(/\n(?=## )/)) {
      console.log('   ', section.split('\n')[0].slice(0, 52).padEnd(52), String(Buffer.byteLength(section)).padStart(7))
    }
  }
}

// Pointers: a backticked path ending in `.md` must exist, from the repo root or from the file's own folder.
const broken = []
for (const p of files) {
  read(p)
    .split('\n')
    .forEach((line, i) => {
      for (const [, target] of line.matchAll(/`([\w./-]+\.md)`/g)) {
        if (!target.includes('/') || /[<>{}*]/.test(target)) continue
        if (!existsSync(join(root, target)) && !existsSync(join(root, dirname(p), target))) broken.push(`${p}:${i + 1} ${target}`)
      }
    })
}
if (broken.length) {
  failed = true
  console.log(`\nBroken pointers:\n${broken.map((b) => `  ${b}`).join('\n')}`)
} else console.log('\nBroken pointers: none')

// Ships since the last audit: `**Shipped:** <date>` entries in feature-history after harness-notes' last audit date.
const dates = (p, re) => (existsSync(join(root, p)) ? [...read(p).matchAll(re)].map((m) => m[1]) : [])
const lastAudit = dates('docs/harness-notes.md', /\*\*Last full audit:\*\* (\d{4}-\d{2}-\d{2})/g).sort().at(-1) ?? '0000-00-00'
const ships = dates('docs/feature-history.md', /\*\*Shipped:\*\* (\d{4}-\d{2}-\d{2})/g).filter((d) => d > lastAudit)
const every = config.auditEvery ?? 10
console.log(`Ships since the last audit: ${ships.length} (audit due at ${every})${ships.length >= every ? ' — AUDIT DUE' : ''}`)

process.exit(failed ? 1 : 0)
