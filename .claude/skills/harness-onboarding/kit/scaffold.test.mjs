// Scaffolds scratch repos from answers.example.json and checks the result:
//
//   node scaffold.test.mjs
//
// Every placeholder filled (FILL markers aside), every script parses, the guards refuse and allow the right
// commands, agent-guard routes by agent, harness-check and context-size run, and the flags drop what they should.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const kit = dirname(fileURLToPath(import.meta.url))
const example = JSON.parse(readFileSync(join(kit, 'answers.example.json'), 'utf8'))
const results = []
const test = (name, fn) => {
  try {
    fn()
    results.push(`ok   ${name}`)
  } catch (error) {
    results.push(`FAIL ${name}\n     ${error.message.split('\n').join('\n     ')}`)
  }
}

const scaffold = (answers) => {
  const dir = mkdtempSync(join(tmpdir(), 'harness-kit-'))
  execFileSync('git', ['init', '-q', '-b', 'main', dir])
  const file = join(dir, 'answers.json')
  writeFileSync(file, JSON.stringify(answers))
  const run = spawnSync(process.execPath, [join(kit, 'scaffold.mjs'), '--answers', file, '--target', dir], { encoding: 'utf8' })
  rmSync(file)
  return { dir, run }
}
const files = (dir, out = [], base = dir) => {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    if (name.name === '.git') continue
    const path = join(dir, name.name)
    if (name.isDirectory()) files(path, out, base)
    else out.push(path.slice(base.length + 1).replaceAll('\\', '/'))
  }
  return out
}
const hook = (dir, script, input) =>
  spawnSync(process.execPath, [join(dir, '.claude/hooks', script)], { input: JSON.stringify(input), encoding: 'utf8' })
const bash = (command, agent_type) => ({ tool_name: 'Bash', tool_input: { command }, ...(agent_type && { agent_type }) })

const { dir, run } = scaffold(example)
const all = files(dir)

test('scaffold exits 0 with no unanswered placeholders', () => assert.equal(run.status, 0, run.stdout + run.stderr))
test('paths are mapped', () => {
  for (const p of [
    'CLAUDE.md',
    'README.md',
    '.claude-plugin/marketplace.json',
    '.claude/.claude-plugin/plugin.json',
    '.claude/harness.json',
    '.claude/skills/trailhead-pipeline/SKILL.md',
    '.claude/skills/trailhead-pipeline/references/delegation.md',
    '.claude/skills/trailhead-pipeline/references/sketches.md',
    '.claude/intake/trailhead-scope-intake/SKILL.md',
    '.claude/agents/builder.md',
    'docs/personas/ux.md',
    'docs/personas/db.md',
  ])
    assert.ok(all.includes(p), `missing ${p}`)
  assert.ok(!all.some((p) => /dot-claude|SLUG|\.tmpl$|scaffold|answers\.example/.test(p)), 'kit-only names leaked')
})
test('no {{KEY}} left outside FILL markers', () => {
  for (const p of all) {
    const left = readFileSync(join(dir, p), 'utf8').match(/\{\{(?!FILL:)[^}]*\}\}/g)
    assert.equal(left, null, `${p}: ${left}`)
  }
})
test('no conditional markers left', () => {
  for (const p of all) assert.ok(!/<!-- (if:|endif)/.test(readFileSync(join(dir, p), 'utf8')), p)
})
test('manifests are valid JSON with matching names', () => {
  const plugin = JSON.parse(readFileSync(join(dir, '.claude/.claude-plugin/plugin.json'), 'utf8'))
  const market = JSON.parse(readFileSync(join(dir, '.claude-plugin/marketplace.json'), 'utf8'))
  assert.equal(plugin.name, 'trailhead')
  assert.equal(market.name, 'trailhead-local')
  assert.equal(market.plugins[0].name, 'trailhead')
})
test('.gitignore gets the harness lines', () => {
  const gi = readFileSync(join(dir, '.gitignore'), 'utf8')
  for (const line of ['sketches/', '.claude/worktrees/']) assert.ok(gi.includes(line), line)
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
test('qa-runner-guard allows only pushes of the QA branch', () => {
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
test('context-size runs and passes on a fresh scaffold', () => {
  const out = spawnSync(process.execPath, [join(dir, '.claude/scripts/context-size.mjs')], { encoding: 'utf8' })
  assert.equal(out.status, 0, out.stdout + out.stderr)
  assert.match(out.stdout, /Broken pointers: none/)
  assert.match(out.stdout, /Ships since the last audit: 0/)
})
test('context-size flags a file over budget and a broken pointer', () => {
  const { dir: d } = scaffold(example)
  writeFileSync(join(d, 'docs/big.md'), `see \`docs/missing.md\`\n${'x'.repeat(13000)}\n`)
  const out = spawnSync(process.execPath, [join(d, '.claude/scripts/context-size.mjs')], { encoding: 'utf8' })
  assert.equal(out.status, 1)
  assert.match(out.stdout, /docs\/big\.md.*OVER/)
  assert.match(out.stdout, /docs\/big\.md:1 docs\/missing\.md/)
  rmSync(d, { recursive: true, force: true })
})
test('existing files are kept without --force', () => {
  const again = spawnSync(process.execPath, [join(kit, 'scaffold.mjs'), '--answers', join(kit, 'answers.example.json'), '--target', dir], {
    encoding: 'utf8',
  })
  assert.match(again.stdout, /Exists, not written/)
})
test('flags off drop agents, sketches and personas', () => {
  const { dir: d, run: r } = scaffold({ ...example, flags: { ui: false, database: false, delegation: false } })
  assert.equal(r.status, 0, r.stdout)
  const fs = files(d)
  assert.ok(!fs.some((p) => p.startsWith('.claude/agents/')), 'agents')
  assert.ok(!fs.includes('.claude/skills/trailhead-pipeline/references/sketches.md'), 'sketches')
  assert.ok(!fs.includes('docs/personas/ux.md') && !fs.includes('docs/personas/db.md'), 'personas')
  assert.ok(fs.includes('.claude/hooks/harness-check.mjs'), 'harness-check stays')
  const skill = readFileSync(join(d, '.claude/skills/trailhead-pipeline/SKILL.md'), 'utf8')
  assert.ok(!/delegation\.md|sketches\.md|Migrations are additive/.test(skill), 'skill still mentions dropped parts')
  rmSync(d, { recursive: true, force: true })
})
test('skill descriptions are under 1024 characters with no angle brackets', () => {
  for (const p of [
    join(dir, '.claude/skills/trailhead-pipeline/SKILL.md'),
    join(dir, '.claude/intake/trailhead-scope-intake/SKILL.md'),
    join(kit, '../SKILL.md'),
  ]) {
    const description = readFileSync(p, 'utf8').match(/^description: "?(.*?)"?$/m)?.[1] ?? ''
    assert.ok(description.length > 0 && description.length < 1024, `${p}: ${description.length}`)
    assert.ok(!/[<>]/.test(description), `${p}: angle bracket`)
  }
})
test('the pipeline SKILL.md fits its 16 KB budget', () => {
  const size = Buffer.byteLength(readFileSync(join(dir, '.claude/skills/trailhead-pipeline/SKILL.md'), 'utf8'))
  assert.ok(size <= 16384, `${size} bytes`)
})

rmSync(dir, { recursive: true, force: true })
console.log(results.join('\n'))
const failed = results.filter((r) => r.startsWith('FAIL')).length
console.log(`\n${results.length - failed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)
