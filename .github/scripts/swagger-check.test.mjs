import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { changedFiles, check } from './swagger-check.mjs';

const SPEC = 'app/api/swagger/swagger-spec.ts';

test('passes when no route changed', () => {
  assert.equal(check(['lib/utils.ts', 'app/api/utils.ts', 'app/api/swagger/route.ts']).ok, true);
  assert.equal(check([]).ok, true);
});

test('fails when a route changed without the spec', () => {
  for (const route of [
    'app/api/graph/[graph]/route.ts',
    'app/api/status/route.ts',
    'app/api/chat/route.tsx',
    'app/api/route.ts',
  ]) {
    const result = check(['lib/utils.ts', route]);
    assert.equal(result.ok, false, route);
    assert.ok(result.message.includes(route), route);
  }
});

test('passes when the spec changed with the route', () => {
  assert.equal(check(['app/api/status/route.ts', SPEC]).ok, true);
});

test('passes when skipped', () => {
  assert.equal(check(['app/api/status/route.ts'], true).ok, true);
});

test('a renamed route still counts as a changed route', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'swagger-check-'));
  const git = (...args) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...args], { cwd: dir, encoding: 'utf8' }).trim();
  try {
    git('init', '-q');
    mkdirSync(path.join(dir, 'app/api/status'), { recursive: true });
    writeFileSync(path.join(dir, 'app/api/status/route.ts'), 'export const GET = 1;\n'.repeat(20));
    git('add', '.');
    git('commit', '-qm', 'base');
    const base = git('rev-parse', 'HEAD');
    renameSync(path.join(dir, 'app/api/status/route.ts'), path.join(dir, 'app/api/status/handler.ts'));
    git('add', '-A');
    git('commit', '-qm', 'rename');
    const files = changedFiles(base, git('rev-parse', 'HEAD'), dir);
    assert.ok(files.includes('app/api/status/route.ts'));
    assert.equal(check(files).ok, false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
