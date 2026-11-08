import { after, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, readFileSync, readdirSync, rmSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { validateBrowserCoverage } from './coverage-report.mjs';

const dir = mkdtempSync(path.join(tmpdir(), 'browser-coverage-'));
const previous = process.env.E2E_COVERAGE_DIR;
process.env.E2E_COVERAGE_DIR = dir;
const { trackContext } = await import('../../e2e/infra/coverage.ts');
if (previous === undefined) delete process.env.E2E_COVERAGE_DIR;
else process.env.E2E_COVERAGE_DIR = previous;

after(() => rmSync(dir, { recursive: true, force: true }));
beforeEach(() => {
  for (const name of readdirSync(dir)) unlinkSync(path.join(dir, name));
});

function context({ browser = 'chromium', startError, stopError, missingSource = false } = {}) {
  const pages = [];
  const url = `http://localhost:3000/_next/static/chunks/${randomUUID()}.js`;
  let closed = false;
  const page = Object.assign(new EventEmitter(), {
    coverage: {
      async startJSCoverage() { if (startError) throw startError; },
      async stopJSCoverage() {
        if (stopError) throw stopError;
        return [{
          url,
          scriptId: '1',
          source: missingSource ? undefined : 'window.proof = true;',
          functions: [],
        }];
      },
    },
    isClosed: () => closed,
    async close() { closed = true; },
  });
  const result = Object.assign(new EventEmitter(), {
    browser: () => ({ browserType: () => ({ name: () => browser }) }),
    pages: () => pages,
    async newPage() {
      pages.push(page);
      result.emit('page', page);
      return page;
    },
    async close() { closed = true; },
  });
  return { context: result, page, url };
}

test('records once when a context is tracked twice and closes its page', async () => {
  const fixture = context();
  trackContext(trackContext(fixture.context));
  const page = await fixture.context.newPage();
  await page.close();
  await fixture.context.close();
  assert.ok(page.isClosed());
  assert.equal(readdirSync(dir).filter((name) => /^browser-[^.]+\.json$/.test(name)).length, 1);
  validateBrowserCoverage([dir]);
});

test('saves pages on context close without a separate page close', async () => {
  const fixture = context();
  trackContext(fixture.context);
  await fixture.context.newPage();
  await fixture.context.close();
  assert.ok(fixture.page.isClosed());
  validateBrowserCoverage([dir]);
});

test('preserves the original script response when Chromium omits a recorded source', async () => {
  const fixture = context({ missingSource: true });
  trackContext(fixture.context);
  const page = await fixture.context.newPage();
  let complete;
  const body = new Promise((resolve) => { complete = resolve; });
  page.emit('response', {
    url: () => fixture.url,
    ok: () => true,
    request: () => ({ resourceType: () => 'script' }),
    text: () => body,
  });
  const closing = page.close();
  complete('window.originalResponse = true;');
  await closing;
  await fixture.context.close();
  validateBrowserCoverage([dir]);
  const source = readdirSync(dir).find((name) => name.startsWith('browser-source-'));
  assert.equal(readFileSync(path.join(dir, source), 'utf8'), 'window.originalResponse = true;');
});

test('missing source without a captured response fails explicitly and still closes the page', async (t) => {
  t.mock.method(console, 'error', () => {});
  const fixture = context({ missingSource: true });
  trackContext(fixture.context);
  const page = await fixture.context.newPage();
  await page.close();
  assert.ok(page.isClosed());
  assert.throws(() => validateBrowserCoverage([dir]), /Browser coverage collection failed.*source/);
});

test('a failed response-body capture does not discard a source Chromium supplied', async () => {
  const fixture = context();
  trackContext(fixture.context);
  const page = await fixture.context.newPage();
  page.emit('response', {
    url: () => fixture.url,
    ok: () => true,
    request: () => ({ resourceType: () => 'script' }),
    text: async () => { throw new Error('response was evicted'); },
  });
  await page.close();
  validateBrowserCoverage([dir]);
});

for (const stage of ['startError', 'stopError']) {
  test(`persists ${stage} and rejects the report while still closing the context`, async (t) => {
    const log = t.mock.method(console, 'error', () => {});
    const fixture = context({ [stage]: new Error(`cannot ${stage}`) });
    trackContext(fixture.context);
    await fixture.context.newPage();
    await fixture.context.close();
    assert.ok(fixture.page.isClosed());
    assert.ok(log.mock.callCount() > 0);
    const errors = readdirSync(dir).filter((name) => name.startsWith('browser-error-'));
    assert.ok(errors.length > 0);
    assert.match(readFileSync(path.join(dir, errors[0]), 'utf8'), /cannot/);
    assert.throws(() => validateBrowserCoverage([dir]), /Browser coverage collection failed/);
  });
}

test('does not instrument Firefox', async () => {
  const fixture = context({ browser: 'firefox', startError: new Error('must not start') });
  trackContext(fixture.context);
  await fixture.context.newPage();
  await fixture.context.close();
  assert.deepEqual(readdirSync(dir), []);
});
