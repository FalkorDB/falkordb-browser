import test from 'node:test';
import assert from 'node:assert/strict';
import { check } from './swagger-check.mjs';

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
    assert.match(result.message, new RegExp(route.replace(/[[\]]/g, '\\$&')));
  }
});

test('passes when the spec changed with the route', () => {
  assert.equal(check(['app/api/status/route.ts', SPEC]).ok, true);
});

test('passes when skipped', () => {
  assert.equal(check(['app/api/status/route.ts'], true).ok, true);
});
