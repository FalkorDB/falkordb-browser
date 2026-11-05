import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';
import {
  browserEntries, isFlagSource, isSourceFile, localSourceMap, mappedLines, toSourcePath, validateBrowserCoverage,
} from './coverage-report.mjs';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const SCRIPT = fileURLToPath(new URL('./coverage-report.mjs', import.meta.url));
const sha1 = (text) => createHash('sha1').update(text).digest('hex');

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

test('gives each flag only the code its workflow tests', () => {
  for (const flag of ['unit', 'smoke', 'e2e']) {
    assert.ok(isFlagSource(flag, 'app/graph/page.tsx'), flag);
    assert.ok(isFlagSource(flag, 'auth.ts'), flag);
    assert.ok(!isFlagSource(flag, 'desktop/main.cjs'), flag);
    assert.ok(!isFlagSource(flag, 'mobile/capacitor.config.ts'), flag);
  }
  assert.ok(isFlagSource('desktop', 'desktop/main.cjs'));
  assert.ok(!isFlagSource('desktop', 'app/graph/page.tsx'));
  assert.ok(!isFlagSource('desktop', 'mobile/capacitor.config.ts'));
  assert.ok(isFlagSource('mobile', 'mobile/capacitor.config.ts'));
  assert.ok(!isFlagSource('mobile', 'lib/urlParams.ts'));
  assert.ok(!isFlagSource('mobile', 'desktop/test/shell.test.cjs'));
});

test('names a file the same whether Node ran it or webpack bundled it', () => {
  const expected = 'app/graph/page.tsx';
  assert.equal(toSourcePath(path.join(ROOT, expected)), expected);
  assert.equal(toSourcePath(pathToFileURL(path.join(ROOT, expected)).href), expected);
  assert.equal(toSourcePath('webpack://falkordb-browser/./app/graph/page.tsx'), expected);
  assert.equal(toSourcePath('webpack://_N_E/./app/graph/page.tsx?1a2b'), expected);
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

test('gives each browser entry its saved source, and drops one saved without it', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'coverage-report-'));
  const saved = 'http://localhost:3000/_next/static/chunks/a.js';
  const unsaved = 'http://localhost:3000/_next/static/chunks/b.js';
  writeFileSync(path.join(dir, `browser-source-${sha1(saved)}.js`), 'run();');
  writeFileSync(path.join(dir, 'browser-1.json'), JSON.stringify([
    { url: saved, scriptId: '1', functions: [] },
    { url: unsaved, scriptId: '2', functions: [] },
  ]));
  assert.deepEqual(browserEntries(dir, 'browser-1.json'), [
    { url: saved, scriptId: '1', functions: [], source: 'run();' },
  ]);
  rmSync(dir, { recursive: true, force: true });
});

test('requires usable browser recordings only when explicitly requested', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'coverage-validation-'));
  try {
    assert.throws(() => validateBrowserCoverage([path.join(dir, 'missing')]), /No usable browser coverage/);
    writeFileSync(path.join(dir, 'coverage-1.json'), JSON.stringify({ result: [] }));
    assert.throws(() => validateBrowserCoverage([dir]), /No usable browser coverage/);
    writeFileSync(path.join(dir, 'browser-1.json'), JSON.stringify([{ url: 'http://localhost/_next/static/a.js' }]));
    assert.throws(() => validateBrowserCoverage([dir]), /No usable browser coverage/);
    writeFileSync(path.join(dir, 'browser-error-1.json'), JSON.stringify({ message: 'disk failure' }));
    assert.throws(() => validateBrowserCoverage([dir]), /disk failure/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// A scratch checkout the report runs on (COVERAGE_ROOT), with coverage of one
// file from Node and, separately, from a browser bundle.
const AREA = `import type { Unit } from "./units";

export interface Shape {
    size: number;
    unit?: Unit;
}

export function area(shape: Shape): number {
    if (shape.size > 10) {
        return shape.size * 2;
    }
    return shape.size;
}
`;

function scratchCheckout() {
  // Real path: Node names modules by it (macOS's /var is a link to /private/var).
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), 'coverage-root-')));
  const write = (rel, text) => {
    mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    writeFileSync(path.join(root, rel), text);
  };
  write('lib/area.ts', AREA);
  write('lib/unloaded.ts', 'export const unused = () => 1;\n');
  write('components/badge.tsx', 'export const Badge = ({ label }: { label: string }) => (\n    <span>{label}</span>\n);\n');
  write('lib/area.test.ts', 'export {};\n');
  write('desktop/main.cjs', 'module.exports = 1;\n');
  return root;
}

function report(root, flag, rawDir, options = {}) {
  const env = { ...process.env, COVERAGE_ROOT: root, ...options };
  delete env.NODE_V8_COVERAGE;
  delete env.GITHUB_STEP_SUMMARY;
  execFileSync(process.execPath, [SCRIPT, flag, rawDir], { cwd: root, env, stdio: 'pipe' });
  return JSON.parse(readFileSync(path.join(root, 'coverage', flag, 'codecov.json'), 'utf8')).coverage;
}

test('reports every source file of a flag, and a file the same from Node and from a bundle', () => {
  const root = scratchCheckout();
  try {
    // Node runs area() for a small shape: the `size > 10` branch never runs.
    const nodeRaw = path.join(root, 'raw-node');
    const env = { ...process.env, NODE_V8_COVERAGE: nodeRaw };
    execFileSync(process.execPath, [
      '--input-type=module', '-e',
      `const { area } = await import(${JSON.stringify(pathToFileURL(path.join(root, 'lib/area.ts')).href)}); area({ size: 1 });`,
    ], { env });

    // A browser ran a webpack chunk of the same file, mapped back to it.
    const browserRaw = path.join(root, 'raw-browser');
    mkdirSync(browserRaw);
    const out = ts.transpileModule(AREA, {
      fileName: 'area.ts',
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, sourceMap: true, inlineSources: true },
    });
    const map = { ...JSON.parse(out.sourceMapText), sources: ['webpack://_N_E/./lib/area.ts?1a2b'] };
    const source = `${out.outputText.replace(/\/\/# sourceMappingURL=.*$/m, '')}\n//# sourceMappingURL=data:application/json;base64,${Buffer.from(JSON.stringify(map)).toString('base64')}\n`;
    const url = 'http://localhost:3000/_next/static/chunks/area.js';
    writeFileSync(path.join(browserRaw, `browser-source-${sha1(url)}.js`), source);
    writeFileSync(path.join(browserRaw, 'browser-1.json'), JSON.stringify([{
      url,
      scriptId: '1',
      functions: [{ functionName: '', isBlockCoverage: true, ranges: [{ startOffset: 0, endOffset: source.length, count: 1 }] }],
    }]));

    const fromNode = report(root, 'unit', nodeRaw);
    const fromBrowser = report(root, 'e2e', browserRaw);

    // Every web source, loaded or not; never a test or another app's file.
    const webFiles = ['components/badge.tsx', 'lib/area.ts', 'lib/unloaded.ts'];
    assert.deepEqual(Object.keys(fromNode).sort(), webFiles);
    assert.deepEqual(Object.keys(fromBrowser).sort(), webFiles);
    // Files nothing loaded count, with every code line missed.
    for (const file of ['lib/unloaded.ts', 'components/badge.tsx']) {
      assert.ok(Object.keys(fromNode[file]).length > 0, file);
      assert.ok(Object.values(fromNode[file]).every((hits) => hits === 0), file);
    }
    // Only code lines count: not the type import (1), the interface (3-6),
    // or blank lines; and Node and the bundle count the same ones.
    const lines = Object.keys(fromNode['lib/area.ts']).map(Number);
    assert.deepEqual(lines, Object.keys(fromBrowser['lib/area.ts']).map(Number));
    for (const typeOnly of [1, 3, 4, 5, 6]) assert.ok(!lines.includes(typeOnly), `line ${typeOnly}`);
    assert.ok(lines.includes(8) && lines.includes(13), 'function lines');
    // Hits survive: area() ran, its `size > 10` branch did not.
    assert.ok(fromNode['lib/area.ts'][13] > 0);
    assert.equal(fromNode['lib/area.ts'][10], 0);
    assert.ok(fromBrowser['lib/area.ts'][13] > 0);
    assert.throws(() => report(root, 'e2e', nodeRaw, { REQUIRE_BROWSER_COVERAGE: '1' }), /No usable browser coverage/);
    assert.deepEqual(report(root, 'e2e', browserRaw, { REQUIRE_BROWSER_COVERAGE: '1' }), fromBrowser);

    // Docker server entries use /app paths; resolve them against the exact
    // artifacts copied to this reporting checkout, not a different build.
    const serverFile = '.next/server/chunks/area.js';
    mkdirSync(path.join(root, '.next/server/chunks'), { recursive: true });
    writeFileSync(path.join(root, serverFile), source);
    const dockerRaw = path.join(root, 'raw-docker');
    mkdirSync(dockerRaw);
    writeFileSync(path.join(dockerRaw, 'coverage-1.json'), JSON.stringify({
      result: [{
        url: `file:///app/${serverFile}`,
        scriptId: '1',
        functions: [{ functionName: '', isBlockCoverage: true, ranges: [{ startOffset: 0, endOffset: source.length, count: 1 }] }],
      }, { url: 'node:fs', functions: [] }],
    }));
    assert.deepEqual(report(root, 'e2e', dockerRaw, { COVERAGE_SERVER_ROOT: '/app' }), fromBrowser);

    // The desktop flag covers its own file only.
    assert.deepEqual(Object.keys(report(root, 'desktop', nodeRaw)), ['desktop/main.cjs']);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
