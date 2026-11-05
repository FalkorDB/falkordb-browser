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

function context({ browser = 'chromium', startError, stopError } = {}) {
  const pages = [];
  const url = `http://localhost:3000/_next/static/chunks/${randomUUID()}.js`;
  let closed = false;
  const page = {
    coverage: {
      async startJSCoverage() { if (startError) throw startError; },
      async stopJSCoverage() {
        if (stopError) throw stopError;
        return [{
          url,
          scriptId: '1',
          source: 'window.proof = true;',
          functions: [],
        }];
      },
    },
    isClosed: () => closed,
    async close() { closed = true; },
  };
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
  return { context: result, page };
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
