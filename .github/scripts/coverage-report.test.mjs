import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isSourceFile, localSourceMap, mappedLines, toSourcePath } from './coverage-report.mjs';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));

test('counts the app, its libraries and components, and the desktop and mobile shells', () => {
  for (const file of [
    'app/graph/page.tsx',
    'app/api/graph/route.ts',
    'lib/urlParams.ts',
    'components/ui/button.tsx',
    'auth.ts',
    'proxy.ts',
    'desktop/main.cjs',
    'desktop/lib/shell.cjs',
    'desktop/scripts/prepare-server.mjs',
    'mobile/capacitor.config.ts',
  ]) assert.ok(isSourceFile(file), file);
});

test('leaves out tests, type declarations, generated code, config and tooling', () => {
  for (const file of [
    'lib/urlParams.test.ts',
    'lib/cypherErrors.smoke.ts',
    'e2e/tests/graph.spec.ts',
    'types/next-auth.d.ts',
    'lib/falkordb-cypher/generated/CypherParser.ts',
    'desktop/test/shell.test.cjs',
    'mobile/test/mobile.test.ts',
    'next.config.js',
    'playwright.config.ts',
    '.github/scripts/coverage-report.mjs',
    'node_modules/next/dist/server/next.js',
    'app/globals.css',
  ]) assert.ok(!isSourceFile(file), file);
});

test('names a file the same whether Node ran it or webpack bundled it', () => {
  const expected = 'app/graph/page.tsx';
  assert.equal(toSourcePath(path.join(ROOT, expected)), expected);
  assert.equal(toSourcePath(pathToFileURL(path.join(ROOT, expected)).href), expected);
  assert.equal(toSourcePath('webpack://falkordb-browser/./app/graph/page.tsx'), expected);
  assert.equal(toSourcePath('webpack://_N_E/./app/graph/page.tsx?1a2b'), expected);
  // As Monocart passes webpack sources on, without the scheme.
  assert.equal(toSourcePath('_N_E/app/graph/page.tsx'), expected);
  assert.equal(toSourcePath('falkordb-browser/app/graph/page.tsx'), expected);
});

test('finds a browser source map in the local build', () => {
  assert.equal(
    localSourceMap('http://localhost:3000/_next/static/chunks/app/page-1a2b.js.map'),
    path.join(ROOT, '.next', 'static/chunks/app/page-1a2b.js.map'),
  );
  assert.equal(localSourceMap('http://localhost:3000/api/graph'), undefined);
  assert.equal(localSourceMap('file:///tmp/x.js.map'), undefined);
});

test('reads the source lines a source map points into', () => {
  // Generated line 1 -> source line 1; line 2 -> line 3 (line 2 is a type);
  // line 3 -> line 3 again and line 5.
  assert.deepEqual([...mappedLines('AAAA;AAEA;AAAA,EAEE')], [1, 3, 5]);
  assert.deepEqual([...mappedLines('')], []);
  // Multi-digit VLQ values: 16 lines down.
  assert.deepEqual([...mappedLines('AAgBA')], [17]);
});
