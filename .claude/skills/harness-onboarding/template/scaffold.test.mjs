// Scaffolds scratch repos from answers.example.json and checks the result:
//
//   node scaffold.test.mjs
//
// Every answered placeholder filled and none left in runtime files, the harness tracked by git, every script parses,
// the guards refuse and allow the right commands, agent-guard routes by agent, harness-check and context-size run,
// and the flags drop what they should.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { appendFileSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const template = dirname(fileURLToPath(import.meta.url))
const example = JSON.parse(readFileSync(join(template, 'answers.example.json'), 'utf8'))
const STAGES = ['groom', 'scope', 'poc', 'implement', 'qa', 'document', 'ship']
const AGENTS = ['pipeline-lead', 'builder', 'qa-runner', 'doc-writer', 'context-check', 'context-audit']
const results = []
const test = (name, fn) => {
  try {
    fn()
    results.push(`ok   ${name}`)
  } catch (error) {
    results.push(`FAIL ${name}\n     ${error.message.split('\n').join('\n     ')}`)
  }
}

const scaffold = (answers, dir = mkdtempSync(join(tmpdir(), 'harness-template-'))) => {
  execFileSync('git', ['init', '-q', '-b', 'main', dir])
  const file = join(tmpdir(), `answers-${process.pid}.json`)
  writeFileSync(file, JSON.stringify(answers))
  const run = spawnSync(process.execPath, [join(template, 'scaffold.mjs'), '--answers', file, '--target', dir], { encoding: 'utf8' })
  rmSync(file)
  return { dir, run }
}
const files = (dir, out = [], base = dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git') continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) files(path, out, base)
    else out.push(path.slice(base.length + 1).replaceAll('\\', '/'))
  }
  return out
}
const text = (dir, p) => readFileSync(join(dir, p), 'utf8')
const hook = (dir, script, input) =>
  spawnSync(process.execPath, [join(dir, '.claude/hooks', script)], { input: JSON.stringify(input), encoding: 'utf8' })
const bash = (command, agent_type) => ({ tool_name: 'Bash', tool_input: { command }, ...(agent_type && { agent_type }) })
const contextSize = (dir) => spawnSync(process.execPath, [join(dir, '.claude/scripts/context-size.mjs')], { encoding: 'utf8' })

const { dir, run } = scaffold(example)
const all = files(dir)

test('scaffold exits 0', () => assert.equal(run.status, 0, run.stdout + run.stderr))
test('paths are mapped', () => {
  const expected = [
    'CLAUDE.md',
    '.claude-plugin/marketplace.json',
    '.claude/.claude-plugin/plugin.json',
    '.claude/harness.json',
    '.claude/hooks/harness-check.mjs',
    '.claude/scripts/context-size.mjs',
    'docs/pipeline-core.md',
    'docs/harness-notes.md',
    'docs/delegation.md',
    'docs/sketches.md',
    'docs/harness-plugin.md',
    'docs/changes/README.md',
    'docs/feature-history.md',
    ...STAGES.map((s) => `.claude/skills/pipeline-${s}/SKILL.md`),
    ...AGENTS.map((a) => `.claude/agents/${a}.md`),
  ]
  for (const p of expected) assert.ok(all.includes(p), `missing ${p}`)
  assert.ok(!all.some((p) => /dot-claude|\.tmpl$|scaffold|answers\.example|SETUP\.md/.test(p)), 'template-only names leaked')
})
test('every answered placeholder is filled', () => {
  for (const p of all)
    for (const key of Object.keys(example.values)) assert.ok(!text(dir, p).includes(`{{${key}}}`), `${p}: {{${key}}}`)
})
test('runtime files (.mjs, .json) have no placeholders', () => {
  for (const p of all.filter((p) => /\.(mjs|json)$/.test(p))) assert.equal(text(dir, p).match(/\{\{[A-Z_]+\}\}/), null, p)
})
test('prose placeholders are left and listed for the session', () => {
  assert.match(run.stdout, /Left for the session to write/)
  assert.match(run.stdout, /\{\{PATH_ROUTING_TABLE\}\}/)
})
test('no conditional markers left', () => {
  for (const p of all) assert.ok(!/<!-- (if:|endif)/.test(text(dir, p)), p)
})
test('manifests are valid JSON with matching names', () => {
  const plugin = JSON.parse(text(dir, '.claude/.claude-plugin/plugin.json'))
  const market = JSON.parse(text(dir, '.claude-plugin/marketplace.json'))
  assert.equal(plugin.name, 'trailhead')
  assert.equal(market.name, 'trailhead-local')
  assert.equal(market.plugins[0].name, 'trailhead')
})
test('git tracks every harness file (the stanza negations work)', () => {
  const harness = all.filter((p) => p.startsWith('.claude/') || p.startsWith('.claude-plugin/'))
  const ignored = spawnSync('git', ['-C', dir, 'check-ignore', ...harness], { encoding: 'utf8' }).stdout.trim()
  assert.equal(ignored, '', `ignored:\n${ignored}`)
  for (const p of ['.claude/settings.local.json', '.claude/worktrees/qa/x', 'sketches/a/b.html'])
    assert.equal(spawnSync('git', ['-C', dir, 'check-ignore', '-q', p]).status, 0, `${p} should be ignored`)
})
test('every .mjs parses', () => {
  for (const p of all.filter((p) => p.endsWith('.mjs'))) execFileSync(process.execPath, ['--check', join(dir, p)])
})
test('builder-guard refuses pushes and offLimits, allows the rest', () => {
  for (const c of ['git push', 'git push origin trailhead', 'git -C x push', 'gh pr create', 'npx netlify deploy', 'supabase db push'])
    assert.equal(hook(dir, 'builder-guard.mjs', bash(c)).status, 2, c)
  for (const c of ['npm run check', 'git commit -m "feat(x): y"', 'supabase db reset', 'git status'])
    assert.equal(hook(dir, 'builder-guard.mjs', bash(c)).status, 0, c)
})
test('qa-runner-guard allows only pushes of the integration branch', () => {
  for (const c of ['git push origin staging', 'git push --force-with-lease origin staging', 'cd x && git push origin staging 2>&1'])
    assert.equal(hook(dir, 'qa-runner-guard.mjs', bash(c)).status, 0, c)
  for (const c of ['git push origin main', 'git push', 'git push origin feat:staging', 'git push -f origin staging', 'netlify deploy', 'gh pr view'])
    assert.equal(hook(dir, 'qa-runner-guard.mjs', bash(c)).status, 2, c)
})
test('agent-guard routes by agent type', () => {
  assert.equal(hook(dir, 'agent-guard.mjs', bash('git push', 'trailhead:builder')).status, 2)
  assert.equal(hook(dir, 'agent-guard.mjs', bash('git push', 'builder')).status, 2)
  assert.equal(hook(dir, 'agent-guard.mjs', bash('git push origin staging', 'trailhead:qa-runner')).status, 0)
  assert.equal(hook(dir, 'agent-guard.mjs', bash('git push origin main', 'trailhead:qa-runner')).status, 2)
  assert.equal(hook(dir, 'agent-guard.mjs', bash('git push')).status, 0, 'the main session passes')
})
test('a guard with no harness.json blocks', () => {
  const { dir: bare } = scaffold(example)
  rmSync(join(bare, '.claude/harness.json'))
  assert.equal(hook(bare, 'builder-guard.mjs', bash('npm test')).status, 2)
  rmSync(bare, { recursive: true, force: true })
})
test('harness-check runs and reports the plugin missing', () => {
  const out = spawnSync(process.execPath, [join(dir, '.claude/hooks/harness-check.mjs')], {
    encoding: 'utf8',
    env: { ...process.env, CLAUDE_CONFIG_DIR: join(dir, 'no-config'), CLAUDE_CODE_PLUGIN_CACHE_DIR: join(dir, 'no-plugins') },
  })
  assert.match(out.stdout, /^Plugin: trailhead@trailhead-local not installed/m, out.stdout + out.stderr)
  assert.match(out.stdout, /^Result: MISS/m)
})
test('context-size passes on a fresh scaffold', () => {
  const out = contextSize(dir)
  assert.equal(out.status, 0, out.stdout + out.stderr)
  assert.match(out.stdout, /Broken pointers: none/)
  assert.match(out.stdout, /Ships since the last audit: 0/)
})
test('context-size counts ships since the last audit', () => {
  const { dir: d } = scaffold(example)
  appendFileSync(join(d, 'docs/feature-history.md'), '\n## trip-create\n\n**Shipped:** 2026-11-02 · **Card:** TRL-2\n')
  assert.match(contextSize(d).stdout, /Ships since the last audit: 1/)
  rmSync(d, { recursive: true, force: true })
})
test('context-size flags a file over budget and a broken pointer', () => {
  const { dir: d } = scaffold(example)
  writeFileSync(join(d, 'docs/notes.md'), 'see `docs/missing.md`\n')
  appendFileSync(join(d, 'CLAUDE.md'), 'x'.repeat(16000))
  const out = contextSize(d)
  assert.equal(out.status, 1)
  assert.match(out.stdout, /^CLAUDE\.md .*OVER/m)
  assert.match(out.stdout, /docs\/notes\.md:1 docs\/missing\.md/)
  rmSync(d, { recursive: true, force: true })
})
test('a second run keeps existing files and adds the stanza once', () => {
  const again = scaffold(example, dir)
  assert.match(again.run.stdout, /Exists, not written/)
  assert.equal(text(dir, '.gitignore').split('\n').filter((l) => l === '.claude/*').length, 1)
})
test('flags off drop agents, guards, sketches and the integration push', () => {
  const { dir: d, run: r } = scaffold({ ...example, flags: { ui: false, database: false, delegation: false, integration: false } })
  assert.equal(r.status, 0, r.stdout)
  const fs = files(d)
  assert.ok(!fs.some((p) => p.startsWith('.claude/agents/')), 'agents')
  assert.ok(!fs.includes('.claude/hooks/builder-guard.mjs'), 'guards')
  assert.ok(!fs.includes('docs/delegation.md') && !fs.includes('docs/sketches.md'), 'docs')
  assert.ok(fs.includes('.claude/hooks/harness-check.mjs'), 'harness-check stays')
  for (const s of STAGES) assert.ok(!/sketches\.md|delegation\.md|Who does the work/.test(text(d, `.claude/skills/pipeline-${s}/SKILL.md`)), s)
  assert.equal(JSON.parse(text(d, '.claude/harness.json')).qaBranch, null)
  assert.equal(contextSize(d).status, 0, 'context-size passes without the optional docs')
  rmSync(d, { recursive: true, force: true })
})
test('no integration branch: the QA runner may push nothing', () => {
  const { dir: d } = scaffold({ ...example, flags: { ...example.flags, integration: false } })
  assert.equal(hook(d, 'qa-runner-guard.mjs', bash('git push origin staging')).status, 2)
  assert.ok(!text(d, '.claude/agents/qa-runner.md').includes('Put branches on QA'))
  rmSync(d, { recursive: true, force: true })
})
test('descriptions are under 1024 characters with no angle brackets', () => {
  const paths = [
    ...STAGES.map((s) => join(dir, `.claude/skills/pipeline-${s}/SKILL.md`)),
    ...AGENTS.map((a) => join(dir, `.claude/agents/${a}.md`)),
    join(template, '../SKILL.md'),
  ]
  for (const p of paths) {
    const description = readFileSync(p, 'utf8').match(/^description: "?(.*?)"?$/m)?.[1] ?? ''
    assert.ok(description.length > 0 && description.length < 1024, `${p}: ${description.length}`)
    assert.ok(!/[<>]/.test(description), `${p}: angle bracket`)
  }
})

rmSync(dir, { recursive: true, force: true })
console.log(results.join('\n'))
const failed = results.filter((r) => r.startsWith('FAIL')).length
console.log(`\n${results.length - failed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)
