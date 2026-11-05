import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  COVERAGE_WORKFLOWS, codecovSettled, failedUploads, globToRegExp, missingFlags, patchVerdict, pathFilters, runsFor, runsOf, unsuccessful,
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
  // The flag still has another shard's upload: only failedUploads catches it.
  assert.deepEqual(missingFlags(['Playwright Tests'], uploads), []);
});

test('waits until Codecov has processed every upload', () => {
  assert.ok(codecovSettled([{ state: 'merged' }, { state: 'complete' }]));
  assert.ok(!codecovSettled([{ state: 'merged' }, { state: 'uploaded' }]));
  assert.ok(!codecovSettled([{ state: 'started' }]));
  assert.ok(!codecovSettled([{ state: 'processed' }]));
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
