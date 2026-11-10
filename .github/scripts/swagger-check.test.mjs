import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { changedFiles, check, main } from './swagger-check.mjs';

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

function withRepo(fn) {
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
    fn({ dir, base, head: git('rev-parse', 'HEAD') });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('a renamed route still counts as a changed route', () => {
  withRepo(({ dir, base, head }) => {
    const files = changedFiles(base, head, dir);
    assert.ok(files.includes('app/api/status/route.ts'));
    assert.equal(check(files).ok, false);
  });
});

test('main reports the verdict as an exit code and a CI annotation', () => {
  withRepo(({ dir, base, head }) => {
    const failed = main({ BASE_SHA: base, HEAD_SHA: head }, dir);
    assert.equal(failed.code, 1);
    assert.match(failed.output, /^::error::API route\(s\) changed.*%0A/);
    assert.deepEqual(main({ BASE_SHA: base, HEAD_SHA: head, SKIP: 'true' }, dir), { code: 0, output: 'Skipped by the no-api-docs label.' });
    assert.equal(main({ BASE_SHA: head, HEAD_SHA: head }, dir).code, 0);
  });
});

test('main fails with an annotation on missing input or an unknown ref', () => {
  assert.match(main({}).output, /^::error::BASE_SHA and HEAD_SHA are required/);
  withRepo(({ dir, head }) => {
    const bad = main({ BASE_SHA: 'deadbeef', HEAD_SHA: head }, dir);
    assert.equal(bad.code, 1);
    assert.match(bad.output, /^::error::Could not diff deadbeef\.\.\./);
  });
});
