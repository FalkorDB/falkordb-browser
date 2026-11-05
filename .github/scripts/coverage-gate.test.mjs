import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  COVERAGE_WORKFLOWS, codecovSettled, failedUploads, followPages, gate, globToRegExp, postFailure, retry, statusPoster,
  transient, missingFlags, patchVerdict, pathFilters, runsFor, runsOf, unsuccessful,
  verdict, waitingFor,
} from './coverage-gate.mjs';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));

test('matches paths as GitHub path filters do', () => {
  const md = globToRegExp('**/*.md');
  assert.ok(md.test('README.md'));
  assert.ok(md.test('desktop/README.md'));
  assert.ok(!md.test('README.mdx'));
  const helm = globToRegExp('helm/**');
  assert.ok(helm.test('helm/chart/values.yaml'));
  assert.ok(!helm.test('helmet.ts'));
  const exact = globToRegExp('.github/dependabot.yml');
  assert.ok(exact.test('.github/dependabot.yml'));
  assert.ok(!exact.test('.github/dependabotXyml'));
  assert.ok(globToRegExp('lib/*.ts').test('lib/utils.ts'));
  assert.ok(!globToRegExp('lib/*.ts').test('lib/token-storage/index.ts'));
});

const WORKFLOW = `name: Example

# A comment before the triggers.
on:
  push:
    branches: ["main", "staging"]
    paths:
      - "desktop/**"
      # The web app it bundles.
      - "app/**"
# A comment at the margin, between two events.
  pull_request:
    paths-ignore:
      - '**/*.md'
      - 'helm/**'
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
`;

test('reads the path filters of each event', () => {
  assert.deepEqual(pathFilters(WORKFLOW, 'push'), { paths: ['desktop/**', 'app/**'] });
  assert.deepEqual(pathFilters(WORKFLOW, 'pull_request'), { 'paths-ignore': ['**/*.md', 'helm/**'] });
  assert.deepEqual(pathFilters('on:\n  pull_request:\n  push:\n    branches: [main]\n', 'pull_request'), {});
  assert.deepEqual(pathFilters('name: x\n', 'push'), {});
});

test('decides whether a workflow runs as GitHub does', () => {
  assert.ok(runsFor({}, ['README.md']));
  assert.ok(runsFor({ paths: ['desktop/**'] }, ['README.md', 'desktop/main.cjs']));
  assert.ok(!runsFor({ paths: ['desktop/**'] }, ['app/page.tsx']));
  assert.ok(!runsFor({ 'paths-ignore': ['**/*.md'] }, ['README.md', 'docs/x.md']));
  assert.ok(runsFor({ 'paths-ignore': ['**/*.md'] }, ['README.md', 'app/page.tsx']));
});

test('expects the coverage workflows their own path filters run', () => {
  const expected = (event, files) => Object.entries(COVERAGE_WORKFLOWS)
    .filter(([, { file }]) => runsFor(pathFilters(readFileSync(`${ROOT}${file}`, 'utf8'), event), files))
    .map(([name]) => name);
  assert.deepEqual(expected('pull_request', ['README.md']), ['Build']);
  assert.deepEqual(expected('pull_request', ['app/graph/page.tsx']), ['Build', 'Playwright Tests', 'Desktop app']);
  assert.deepEqual(expected('pull_request', ['mobile/capacitor.config.ts']), ['Build', 'Playwright Tests', 'Mobile app']);
  assert.deepEqual(expected('push', ['helm/values.yaml']), ['Build']);
});

test('waits for an expected workflow until its latest run has completed', () => {
  const expected = ['Build', 'Playwright Tests'];
  assert.deepEqual(waitingFor(expected, []), expected);
  assert.deepEqual(waitingFor(expected, [
    { id: 1, name: 'Build', status: 'completed', conclusion: 'success' },
    { id: 2, name: 'Playwright Tests', status: 'in_progress', conclusion: null },
  ]), ['Playwright Tests']);
  // Waiting for a maintainer to approve it is not finished.
  assert.deepEqual(waitingFor(['Build'], [{ id: 1, name: 'Build', status: 'completed', conclusion: 'action_required' }]), ['Build']);
  // A re-run is the run that counts.
  assert.deepEqual(waitingFor(['Build'], [
    { id: 1, name: 'Build', status: 'completed', conclusion: 'failure' },
    { id: 2, name: 'Build', status: 'queued', conclusion: null },
  ]), ['Build']);
  // A failed run has finished: its coverage is what there is.
  assert.deepEqual(waitingFor(['Build'], [{ id: 1, name: 'Build', status: 'completed', conclusion: 'failure' }]), []);
  // Other workflows do not count.
  assert.deepEqual(waitingFor(['Build'], [
    { id: 1, name: 'Build', status: 'completed', conclusion: 'success' },
    { id: 2, name: 'CodeQL', status: 'in_progress', conclusion: null },
  ]), []);
});

test("judges a trigger's own runs: a push run does not hide a pull request run", () => {
  // A staging commit at the head of a pull request into main.
  const runs = [
    { id: 1, name: 'Build', event: 'pull_request', status: 'in_progress', conclusion: null },
    { id: 2, name: 'Build', event: 'push', status: 'completed', conclusion: 'success' },
  ];
  assert.deepEqual(waitingFor(['Build'], runsOf('pull_request', runs)), ['Build']);
  assert.deepEqual(waitingFor(['Build'], runsOf('push', runs)), []);
  assert.deepEqual(unsuccessful(['Build'], runsOf('pull_request', [
    { id: 1, name: 'Build', event: 'pull_request', status: 'completed', conclusion: 'failure' },
    { id: 2, name: 'Build', event: 'push', status: 'completed', conclusion: 'success' },
  ])), ['Build']);
});

test('counts a finished workflow that did not succeed as incomplete coverage', () => {
  const runs = [
    { id: 1, name: 'Build', status: 'completed', conclusion: 'success' },
    { id: 2, name: 'Playwright Tests', status: 'completed', conclusion: 'cancelled' },
    { id: 3, name: 'Mobile app', status: 'completed', conclusion: 'failure' },
    { id: 4, name: 'Mobile app', status: 'completed', conclusion: 'success' },
  ];
  assert.deepEqual(unsuccessful(['Build', 'Playwright Tests', 'Mobile app'], runs), ['Playwright Tests']);
});

test("finds the flags a commit's workflows uploaded no coverage of", () => {
  const uploads = [
    { flags: ['unit'], upload_type: 'uploaded', state: 'merged' },
    { flags: ['smoke'], upload_type: 'uploaded', state: 'merged' },
    // An earlier commit's e2e, carried forward: not this commit's.
    { flags: ['e2e'], upload_type: 'carriedforward', state: 'complete' },
    { flags: ['mobile'], upload_type: 'uploaded', state: 'error' },
  ];
  assert.deepEqual(missingFlags(['Build'], uploads), []);
  assert.deepEqual(missingFlags(['Build', 'Playwright Tests', 'Mobile app'], uploads), ['e2e', 'mobile']);
});

test("finds the commit's uploads Codecov could not process", () => {
  const uploads = [
    { name: 'e2e-shard-1', flags: ['e2e'], upload_type: 'uploaded', state: 'merged' },
    { name: 'e2e-shard-2', flags: ['e2e'], upload_type: 'uploaded', state: 'error' },
    { name: 'CF[1]', flags: ['mobile'], upload_type: 'carriedforward', state: 'error' },
  ];
  assert.deepEqual(failedUploads(uploads).map((u) => u.name), ['e2e-shard-2']);
  // A re-run of that shard uploaded it again: the later upload counts.
  assert.deepEqual(failedUploads([
    { name: 'e2e-shard-2', flags: ['e2e'], upload_type: 'uploaded', state: 'error', created_at: '2026-11-05T12:00:00Z' },
    { name: 'e2e-shard-2', flags: ['e2e'], upload_type: 'uploaded', state: 'merged', created_at: '2026-11-05T12:30:00Z' },
  ]), []);
  // The flag still has another shard's upload: only failedUploads catches it.
  assert.deepEqual(missingFlags(['Playwright Tests'], uploads), []);
});

test('waits until Codecov has processed every upload', () => {
  const upload = (name, state) => ({ name, flags: ['unit'], upload_type: 'uploaded', state });
  assert.ok(codecovSettled([upload('unit', 'merged'), { name: 'CF[1]', flags: ['e2e'], upload_type: 'carriedforward', state: 'complete' }]));
  assert.ok(!codecovSettled([upload('unit', 'merged'), upload('smoke', 'uploaded')]));
  assert.ok(!codecovSettled([upload('unit', 'started')]));
  assert.ok(!codecovSettled([upload('unit', 'processed')]));
  // An earlier attempt's upload, stuck part way, gave way to a re-run's.
  assert.ok(codecovSettled([
    { name: 'e2e-shard-2', flags: ['e2e'], upload_type: 'uploaded', state: 'started', created_at: '2026-11-05T12:00:00Z' },
    { name: 'e2e-shard-2', flags: ['e2e'], upload_type: 'uploaded', state: 'merged', created_at: '2026-11-05T12:30:00Z' },
  ]));
});

test('passes coverage at the target or above, rounding down', () => {
  assert.deepEqual(verdict(95, 95), { state: 'success', description: '95.00% (target 95%)' });
  assert.deepEqual(verdict(94.999, 95), { state: 'failure', description: '94.99%, below the 95% target' });
  assert.deepEqual(verdict(36.67, 95), { state: 'failure', description: '36.67%, below the 95% target' });
});

test('passes a pull request that changes no measured line', () => {
  assert.deepEqual(patchVerdict({ hits: 0, misses: 0, partials: 0 }, 95), { state: 'success', description: 'No changed lines to cover' });
  assert.equal(patchVerdict({ hits: 19, misses: 1, partials: 0 }, 95).state, 'success');
  // A partially covered line is not covered.
  assert.equal(patchVerdict({ hits: 19, misses: 0, partials: 2 }, 95).state, 'failure');
});

test("follows Codecov's next links, over https, to the last page", async () => {
  const pages = {
    'https://codecov.test/uploads/?page_size=2': { results: [1, 2], next: 'http://codecov.test/uploads/?page=2&page_size=2' },
    'https://codecov.test/uploads/?page=2&page_size=2': { results: [3, 4], next: 'http://codecov.test/uploads/?page=3&page_size=2' },
    'https://codecov.test/uploads/?page=3&page_size=2': { results: [5], next: null },
  };
  const asked = [];
  const get = async (url) => {
    asked.push(url);
    if (!pages[url]) throw new Error(`unexpected ${url}`);
    return pages[url];
  };
  assert.deepEqual(await followPages('https://codecov.test/uploads/?page_size=2', get), [1, 2, 3, 4, 5]);
  assert.deepEqual(asked, Object.keys(pages));
  assert.deepEqual(await followPages('https://codecov.test/one', async () => ({ results: [], next: null })), []);
});

// gate() end to end, against fake GitHub and Codecov APIs that serve this
// repository's own workflow files.
const SHA = 'c0ffee';
const run = (name, conclusion = 'success', status = 'completed', event = 'pull_request') => ({ id: Math.random(), name, event, status, conclusion });
const fresh = (name, flags) => ({ name, flags, upload_type: 'uploaded', state: 'merged', created_at: '2026-11-05T12:00:00Z' });
const FRESH = [fresh('build', ['unit']), fresh('smoke', ['smoke']), fresh('e2e-shard-1', ['e2e']), fresh('desktop', ['desktop'])];

function world({
  pr = { number: 7 }, files = ['app/graph/page.tsx'], runs, uploads = [FRESH], coverage = 96,
  patch = { hits: 19, misses: 1, partials: 0 }, head = SHA, compareErrors = [], githubHead = SHA,
} = {}) {
  const posted = [];
  const sleeps = [];
  const pages = [...uploads];
  const heads = [head].flat();
  const gh = async (path) => {
    if (path === `pulls/${pr?.number}`) return { head: { sha: githubHead } };
    if (path.startsWith(`pulls/${pr?.number}/files`)) return path.includes('page=1') ? files.map((filename) => ({ filename })) : [];
    if (path.startsWith(`commits/${SHA}`)) return { files: path.includes('page=1') ? files.map((filename) => ({ filename })) : [] };
    if (path.startsWith('actions/runs')) return { workflow_runs: path.includes('page=1') ? runs : [] };
    if (path.startsWith('contents/')) {
      const file = path.slice('contents/'.length).split('?')[0];
      return { content: readFileSync(`${ROOT}${file}`).toString('base64') };
    }
    throw new Error(`unexpected GitHub call ${path}`);
  };
  const codecov = async (url) => {
    if (url.includes('/uploads/')) {
      const next = pages.length > 1 ? pages.shift() : pages[0];
      if (next instanceof Error) throw next;
      return { results: next, next: null };
    }
    if (url.endsWith(`/commits/${SHA}/`)) return { totals: coverage === null ? null : { coverage } };
    if (url.includes('/compare/')) {
      if (compareErrors.length) throw compareErrors.shift();
      return { head_commit: heads.length > 1 ? heads.shift() : heads[0], totals: { patch } };
    }
    throw new Error(`unexpected Codecov call ${url}`);
  };
  const args = {
    gh,
    codecov,
    sleep: async (ms) => { sleeps.push(ms); },
    post: async (context, { state, description }) => { posted.push(`${context} ${state}: ${description}`); },
    contexts: pr ? ['coverage/project', 'coverage/patch'] : ['coverage/project (push)'],
    pr: pr ?? undefined,
    sha: SHA,
    repo: 'FalkorDB/falkordb-browser',
    target: 95,
  };
  return { args, posted, sleeps };
}
const ALL_DONE = [run('Build'), run('Playwright Tests'), run('Desktop app')];

test('gate: pending while a workflow the change triggers is running or not started', async () => {
  const running = world({ runs: [run('Build'), run('Playwright Tests', null, 'in_progress')] });
  assert.equal(await gate(running.args), false);
  assert.deepEqual(running.posted, [
    'coverage/project pending: Waiting for Playwright Tests, Desktop app',
    'coverage/patch pending: Waiting for Playwright Tests, Desktop app',
  ]);
});

test('gate: passes or fails each status against the target once the coverage is complete', async () => {
  const good = world({ runs: ALL_DONE });
  assert.equal(await gate(good.args), true);
  assert.deepEqual(good.posted, [
    'coverage/project success: 96.00% (target 95%)',
    'coverage/patch success: 95.00% (target 95%)',
  ]);
  const low = world({ runs: ALL_DONE, coverage: 40, patch: { hits: 1, misses: 1, partials: 0 } });
  await gate(low.args);
  assert.deepEqual(low.posted, [
    'coverage/project failure: 40.00%, below the 95% target',
    'coverage/patch failure: 50.00%, below the 95% target',
  ]);
});

test('gate: a workflow that did not succeed fails both statuses', async () => {
  const cancelled = world({ runs: [run('Build'), run('Playwright Tests', 'cancelled'), run('Desktop app')] });
  assert.equal(await gate(cancelled.args), false);
  assert.deepEqual(cancelled.posted, [
    'coverage/project failure: Playwright Tests did not succeed: the coverage is incomplete',
    'coverage/patch failure: Playwright Tests did not succeed: the coverage is incomplete',
  ]);
});

test("gate: a flag with only an earlier commit's coverage fails", async () => {
  const carried = { name: 'CF[1]', flags: ['e2e'], upload_type: 'carriedforward', state: 'complete' };
  const stale = world({ runs: ALL_DONE, uploads: [[fresh('build', ['unit']), fresh('smoke', ['smoke']), carried, fresh('desktop', ['desktop'])]] });
  assert.equal(await gate(stale.args), false);
  assert.deepEqual(stale.posted, [
    'coverage/project failure: No e2e coverage was uploaded for this commit',
    'coverage/patch failure: No e2e coverage was uploaded for this commit',
  ]);
});

test('gate: waits out Codecov processing and its passing errors', async () => {
  const busy = Object.assign(new Error('503'), { status: 503 });
  const processing = [...FRESH.slice(0, 3), { ...fresh('desktop', ['desktop']), state: 'uploaded' }];
  const slow = world({ runs: ALL_DONE, uploads: [busy, processing, FRESH] });
  assert.equal(await gate(slow.args), true);
  assert.deepEqual(slow.sleeps, [20_000, 20_000]);
  assert.equal(slow.posted[0], 'coverage/project success: 96.00% (target 95%)');
});

test('gate: a missing total is an error, not a pass', async () => {
  await assert.rejects(gate(world({ runs: ALL_DONE, coverage: null }).args), /no coverage total/);
  await assert.rejects(gate(world({ runs: ALL_DONE, patch: null }).args), /no patch total/);
});

test('gate: leaves the patch to a newer head, and gates a push on the project only', async () => {
  const moved = world({ runs: ALL_DONE, head: 'newer', githubHead: 'newer' });
  assert.equal(await gate(moved.args), true);
  assert.deepEqual(moved.posted, ['coverage/project success: 96.00% (target 95%)']);
  const push = world({ pr: null, files: ['README.md'], runs: [run('Build', 'success', 'completed', 'push')], uploads: [FRESH.slice(0, 2)] });
  assert.equal(await gate(push.args), true);
  assert.deepEqual(push.posted, ['coverage/project (push) success: 96.00% (target 95%)']);
});

test('gate: retries a passing Codecov error on the compare call', async () => {
  const flaky = world({ runs: ALL_DONE, compareErrors: [Object.assign(new Error('503'), { status: 503 })] });
  assert.equal(await gate(flaky.args), true);
  assert.deepEqual(flaky.posted, [
    'coverage/project success: 96.00% (target 95%)',
    'coverage/patch success: 95.00% (target 95%)',
  ]);
  assert.deepEqual(flaky.sleeps, [20_000]);
});

test('retries only what may pass on its own, a bounded number of times', async () => {
  const errors = (status) => Object.assign(new Error(String(status)), { status });
  assert.ok(transient(errors(503)) && transient(errors(429)) && transient(new Error('fetch failed')));
  assert.ok(!transient(errors(404)) && !transient(errors(401)));
  let calls = 0;
  await assert.rejects(retry(async () => { calls += 1; throw errors(404); }, async () => {}), /404/);
  assert.equal(calls, 1);
  calls = 0;
  await assert.rejects(retry(async () => { calls += 1; throw errors(502); }, async () => {}, 3), /502/);
  assert.equal(calls, 3);
});

test('posts statuses, counting a verdict only once GitHub accepted it', async () => {
  const error = (status) => Object.assign(new Error(String(status)), { status });
  const sent = [];
  const answers = [error(503), undefined, error(403)];
  const gh = async (path, { body }) => {
    const answer = answers.shift();
    if (answer) throw answer;
    sent.push(`${path} ${body.context} ${body.state} ${body.target_url}`);
    return {};
  };
  const sleeps = [];
  const { post, decided } = statusPoster({ gh, sha: SHA, targetUrl: () => 'https://codecov.test/x', sleep: async (ms) => { sleeps.push(ms); } });

  // A passing error is retried, and the accepted verdict counts.
  await post('coverage/project', { state: 'success', description: 'ok' });
  assert.deepEqual(sent, [`statuses/${SHA} coverage/project success https://codecov.test/x`]);
  assert.deepEqual(sleeps, [20_000]);
  // A refused verdict does not count.
  await assert.rejects(post('coverage/patch', { state: 'failure', description: 'low' }), /403/);
  assert.deepEqual([...decided], ['coverage/project']);
  // Pending is not a verdict.
  await post('coverage/patch', { state: 'pending', description: 'waiting' });
  assert.deepEqual([...decided], ['coverage/project']);
});

test('marks error on the statuses a failed gate gave no verdict, keeping those it did', async () => {
  const posted = [];
  const post = async (context, { state, description }) => {
    posted.push(`${context} ${state}: ${description}`);
    if (context === 'coverage/patch') throw new Error('posting failed too');
  };
  await postFailure({
    post, decided: new Set(['coverage/project']), contexts: ['coverage/project', 'coverage/patch'], error: new Error('Codecov is down'),
  });
  assert.deepEqual(posted, ['coverage/patch error: The coverage gate failed: Codecov is down']);
});

test("gate: waits for Codecov's record of the pull request to catch up, then posts the patch", async () => {
  const lagging = world({ runs: ALL_DONE, head: ['older', 'older', SHA] });
  assert.equal(await gate(lagging.args), true);
  assert.deepEqual(lagging.posted, [
    'coverage/project success: 96.00% (target 95%)',
    'coverage/patch success: 95.00% (target 95%)',
  ]);
  assert.deepEqual(lagging.sleeps, [20_000, 20_000]);
  // Never catching up is an error, not a pending check left forever.
  await assert.rejects(gate(world({ runs: ALL_DONE, head: 'older' }).args), /still compares older/);
});
