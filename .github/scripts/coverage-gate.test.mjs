import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  BUDGET_MS, COVERAGE_WORKFLOWS, changedLines, codecovSettled, failedUploads, followPages, gate, globToRegExp, postFailure, retry, statusPoster,
  transient, missingFlags, absentFlags, movedSince, notStarted, patchTotals, patchVerdict, pathFilters, runsFor, runsOf, unsuccessful,
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

test("judges a pull request's own runs: another pull request's on the same commit do not count", () => {
  const own = { id: 1, name: 'Build', event: 'pull_request', status: 'completed', conclusion: 'failure', pull_requests: [{ number: 7 }] };
  const other = { id: 2, name: 'Build', event: 'pull_request', status: 'completed', conclusion: 'success', pull_requests: [{ number: 8 }] };
  // A fork's run names no pull request: it is kept.
  const fork = { id: 3, name: 'Playwright Tests', event: 'pull_request', status: 'completed', conclusion: 'success', pull_requests: [] };
  assert.deepEqual(runsOf('pull_request', [own, other, fork], 7).map((r) => r.id), [1, 3]);
  assert.deepEqual(unsuccessful(['Build'], runsOf('pull_request', [own, other], 7)), ['Build']);
  // A push's gate has no pull request to keep to.
  assert.deepEqual(runsOf('push', [{ ...own, event: 'push' }, { ...other, event: 'push' }]).map((r) => r.id), [1, 2]);
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
const run = (name, conclusion = 'success', status = 'completed', event = 'pull_request', created_at = '2026-11-05T10:00:00Z') => ({
  id: Math.random(), name, event, status, conclusion, created_at,
});
const fresh = (name, flags) => ({ name, flags, upload_type: 'uploaded', state: 'merged', created_at: '2026-11-05T12:00:00Z' });
// Mobile is not triggered by these changes: its coverage is carried forward.
const carried = (flag) => ({ name: `CF[${flag}]`, flags: [flag], upload_type: 'carriedforward', state: 'complete' });
const MOBILE = carried('mobile');
const FRESH = [fresh('build', ['unit']), fresh('smoke', ['smoke']), fresh('e2e-shard-1', ['e2e']), fresh('desktop', ['desktop']), MOBILE];

function world({
  pr = { number: 7 }, files = ['app/graph/page.tsx'], runs, uploads = [FRESH], coverage = 96,
  patch = { hits: 19, misses: 1, partials: 0 }, reportErrors = [], githubHead = SHA, timeline = [],
} = {}) {
  const posted = [];
  const sleeps = [];
  let clock = 0;
  const pages = [...uploads];
  // The pull request changes lines 1..n of app/graph/page.tsx, which the
  // report covers as `patch` says; line 100, covered too, is not changed.
  const n = patch ? patch.hits + patch.misses + patch.partials : 0;
  const states = patch ? [...Array(patch.hits).fill(0), ...Array(patch.misses).fill(1), ...Array(patch.partials).fill(2)] : [];
  const diff = `@@ -1,0 +1,${n} @@\n${states.map((_, i) => `+line ${i + 1}`).join('\n')}`;
  const changes = files.map((filename) => (filename === 'app/graph/page.tsx' ? { filename, status: 'modified', patch: diff } : { filename, status: 'modified', patch: '' }));
  const reportFiles = [{ name: 'app/graph/page.tsx', line_coverage: [...states.map((state, i) => [i + 1, state]), [100, 0]] }];
  const gh = async (path) => {
    if (path === `pulls/${pr?.number}`) return { head: { sha: githubHead } };
    if (path.startsWith(`issues/${pr?.number}/timeline`)) return /[?&]page=1(&|$)/.test(path) ? timeline : [];
    if (path.startsWith(`pulls/${pr?.number}/files`)) return /[?&]page=1(&|$)/.test(path) ? changes : [];
    if (path.startsWith(`commits/${SHA}`)) return { files: /[?&]page=1(&|$)/.test(path) ? files.map((filename) => ({ filename })) : [] };
    if (path.startsWith('actions/runs')) return { workflow_runs: /[?&]page=1(&|$)/.test(path) ? runs : [] };
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
    if (url.includes('/report/')) {
      if (reportErrors.length) throw reportErrors.shift();
      return {
        totals: coverage === null ? null : { coverage },
        ...(patch === null ? {} : { files: reportFiles }),
      };
    }
    throw new Error(`unexpected Codecov call ${url}`);
  };
  const args = {
    gh,
    codecov,
    sleep: async (ms) => { sleeps.push(ms); clock += ms; },
    now: () => clock,
    post: async (context, { state, description }) => { posted.push(`${context} ${state}: ${description}`); },
    contexts: pr ? ['coverage/project', 'coverage/patch'] : ['coverage/project (push)'],
    pr: pr ? { base: { ref: 'staging' }, ...pr } : undefined,
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
  const carriedE2e = carried('e2e');
  const stale = world({ runs: ALL_DONE, uploads: [[fresh('build', ['unit']), fresh('smoke', ['smoke']), carriedE2e, fresh('desktop', ['desktop']), MOBILE]] });
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
  await assert.rejects(gate(world({ runs: ALL_DONE, patch: null }).args), /no report of the commit/);
});

test('gate: leaves the patch to a newer head, and gates a push on the project only', async () => {
  const moved = world({ runs: ALL_DONE, githubHead: 'newer' });
  assert.equal(await gate(moved.args), true);
  assert.deepEqual(moved.posted, ['coverage/project success: 96.00% (target 95%)']);
  const push = world({ pr: null, files: ['README.md'], runs: [run('Build', 'success', 'completed', 'push')], uploads: [[...FRESH.slice(0, 2), carried('e2e'), carried('desktop'), MOBILE]] });
  assert.equal(await gate(push.args), true);
  assert.deepEqual(push.posted, ['coverage/project (push) success: 96.00% (target 95%)']);
});

test('gate: retries a passing Codecov error on the report call', async () => {
  const flaky = world({ runs: ALL_DONE, reportErrors: [Object.assign(new Error('503'), { status: 503 })] });
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
  assert.ok(!transient(errors(404)) && !transient(errors(401)) && !transient(errors(403)));
  // Codecov's own GitHub quota, as its API reports it.
  const limited = Object.assign(new Error('GET https://api.codecov.io/x: 403 {"detail":"Github API rate limit error: Forbidden"}'), { status: 403 });
  assert.ok(transient(limited));
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

test('gate: every wait shares one deadline, inside the job timeout', async () => {
  assert.ok(BUDGET_MS < 30 * 60_000, 'the Coverage status job stops at 30 minutes');
  // Codecov failing every call: retries stop at the deadline, not after
  // each loop's own limit.
  const down = Object.assign(new Error('503'), { status: 503 });
  const outage = world({ runs: ALL_DONE, uploads: Array(200).fill(down) });
  await assert.rejects(gate({ ...outage.args, deadline: 3 * 60_000 }), /in time/);
  assert.ok(outage.sleeps.reduce((a, b) => a + b, 0) <= 3 * 60_000);
  // A retry gives up when the time left has no room for another wait.
  let left = 50_000;
  let calls = 0;
  await assert.rejects(retry(async () => { calls += 1; throw down; }, async (ms) => { left -= ms; }, 10, () => left), /503/);
  // 50s: fails, waits 20s; 30s: fails, waits; 10s: fails, no room to wait.
  assert.equal(calls, 3);
});

test('gate: past 300 changed files, trusts the runs GitHub started', async () => {
  // GitHub filters on the first 300 files only, so it may not have started
  // Playwright for this change: the gate must not wait for it forever.
  const files = [...Array(300).fill('docs/a.md').map((f, i) => `docs/${i}.md`), 'app/graph/page.tsx'];
  const big = world({ files, runs: [run('Build')], uploads: [[...FRESH.slice(0, 2), carried('e2e'), carried('desktop'), MOBILE]] });
  assert.equal(await gate(big.args), true);
  assert.equal(big.posted[0], 'coverage/project success: 96.00% (target 95%)');
});

test("reads the head's changed lines from a unified diff", () => {
  const patch = [
    '@@ -1,3 +1,4 @@',
    ' keep 1',
    '-gone',
    '+new 2',
    '+new 3',
    ' keep 4',
    '@@ -10,2 +11,3 @@ function x() {',
    ' keep 11',
    '-old last line',
    '\\ No newline at end of file',
    '+changed 12',
    '+added 13',
  ].join('\n');
  assert.deepEqual([...changedLines(patch)], [2, 3, 12, 13]);
  assert.deepEqual([...changedLines('')], []);
  // No diff (GitHub leaves out a too-large one): every line counts.
  assert.equal(changedLines(undefined), 'all');
});

test("totals the changed lines the commit's coverage counts", () => {
  const report = [
    { name: 'lib/a.ts', line_coverage: [[1, 0], [2, 1], [3, 2], [9, 1]] },
    { name: 'lib/big.ts', line_coverage: [[1, 0], [2, 1]] },
    { name: 'lib/gone.ts', line_coverage: [[1, 1]] },
  ];
  assert.deepEqual(patchTotals([
    // Changes lines 1-3 and a comment on 4 (which coverage does not count).
    { filename: 'lib/a.ts', status: 'modified', patch: '@@ -0,0 +1,4 @@\n+a\n+b\n+c\n+// d' },
    // A diff too large for GitHub to send: every coverable line.
    { filename: 'lib/big.ts', status: 'modified' },
    // Removed: GitHub may send no diff, which would otherwise mean every line.
    { filename: 'lib/gone.ts', status: 'removed' },
    // Not source the coverage counts.
    { filename: 'README.md', status: 'modified', patch: '@@ -1 +1 @@\n-a\n+b' },
  ], report), { hits: 2, misses: 2, partials: 1 });
});

test('gate: fails a workflow that never ran once every run has finished, rather than wait for it', async () => {
  // Every run of the trigger finished and Playwright never started (a pull
  // request moved to staging, say): no event will start it.
  // (CodeQL, still running, is not a coverage workflow: it does not count.)
  const done = world({ runs: [run('Build'), run('Desktop app'), run('CodeQL', null, 'in_progress')] });
  assert.equal(await gate(done.args), false);
  assert.deepEqual(done.posted, [
    'coverage/project failure: Playwright Tests never ran for this commit: push a commit or reopen the pull request',
    'coverage/patch failure: Playwright Tests never ran for this commit: push a commit or reopen the pull request',
  ]);
  // While a run is still going, the others may yet show up: wait.
  const early = world({ runs: [run('Build'), run('Desktop app', null, 'in_progress')] });
  await gate(early.args);
  assert.match(early.posted[0], /pending: Waiting for Desktop app, Playwright Tests/);
  assert.deepEqual(notStarted(['Build', 'Playwright Tests'], [run('Build'), run('Playwright Tests', null, 'in_progress')]), []);
});


test('gate: fails a pull request moved to another base until it is tested against it', async () => {
  const moved = { event: 'base_ref_changed', created_at: '2026-11-05T11:00:00Z' };
  // Every run finished and passed, but was made against the old base (a
  // re-run of it would be too).
  const stale = world({ runs: ALL_DONE, timeline: [{ event: 'labeled', created_at: '2026-11-05T12:00:00Z' }, moved] });
  assert.equal(await gate(stale.args), false);
  const description = 'Moved to staging: its coverage was measured against the old base. Push a commit or reopen the pull request';
  assert.deepEqual(stale.posted, [`coverage/project failure: ${description}`, `coverage/patch failure: ${description}`]);
  // A push (or reopen) since the move made new runs: gated as usual.
  const later = '2026-11-05T11:30:00Z';
  const retested = world({
    runs: [run('Build', 'success', 'completed', 'pull_request', later), run('Playwright Tests', 'success', 'completed', 'pull_request', later),
      run('Desktop app', 'success', 'completed', 'pull_request', later)],
    // A label added since is not a move.
    timeline: [moved, { event: 'labeled', created_at: '2026-11-05T12:00:00Z' }],
  });
  assert.equal(await gate(retested.args), true);
  assert.equal(retested.posted[0], 'coverage/project success: 96.00% (target 95%)');
});


test('finds a move to another base after the coverage runs were made', () => {
  const runs = [run('Build', 'success', 'completed', 'pull_request', '2026-11-05T10:00:00Z')];
  const moved = (at) => [{ event: 'base_ref_changed', created_at: at }];
  assert.equal(movedSince(moved('2026-11-05T11:00:00Z'), runs, ['Build']), '2026-11-05T11:00:00Z');
  assert.equal(movedSince(moved('2026-11-05T09:00:00Z'), runs, ['Build']), undefined);
  assert.equal(movedSince([], runs, ['Build']), undefined);
  // GitHub's own move, when the base branch was merged and deleted.
  assert.equal(movedSince([{ event: 'automatic_base_change_succeeded', created_at: '2026-11-05T11:00:00Z' }], runs, ['Build']), '2026-11-05T11:00:00Z');
  // Moved, then moved again after the runs: the last move counts.
  assert.equal(movedSince([...moved('2026-11-05T09:00:00Z'), ...moved('2026-11-05T11:00:00Z')], runs, ['Build']), '2026-11-05T11:00:00Z');
});

test("gate: fails a flag with no coverage at all, so its code is not left out of the total", async () => {
  // Mobile was not triggered, and no earlier commit has its coverage to carry.
  const none = world({ runs: ALL_DONE, uploads: [FRESH.filter((u) => u !== MOBILE)] });
  assert.equal(await gate(none.args), false);
  assert.deepEqual(none.posted, [
    'coverage/project failure: No mobile coverage for this commit, uploaded or carried forward',
    'coverage/patch failure: No mobile coverage for this commit, uploaded or carried forward',
  ]);
  assert.deepEqual(absentFlags(FRESH), []);
  // An upload Codecov could not process is no coverage.
  assert.deepEqual(absentFlags([...FRESH.slice(0, 4), { ...MOBILE, state: 'error' }]), ['mobile']);
});
