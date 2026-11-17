# Coverage to 95%: Design

## Intent

Raise the Codecov project coverage on staging from the current 82.78% to at
least 95%, without duplicating already-merged coverage work or making the E2E
suite harder to maintain.

## Goals and non-goals

- Add focused tests for one component or page per PR, then re-rank the remaining
  uncovered code from fresh reports until the project reaches 95%.
- Preserve the current Codecov and branch-protection configuration. The required
  project and patch checks currently target 80%; 95% is the requested coverage
  outcome, not a request to change that floor.
- Keep each test deterministic and aligned with the repository's existing
  `node:test` or Playwright/POM conventions.
- Do not change product behavior, weaken coverage accounting, or exclude
  uncovered source files merely to increase the percentage.
- Do not reproduce scenarios already covered by merged coverage PRs.

## Current evidence

- Staging commit `2a3028f23b54631fd61e1ee3f91b4936007382f7` has finalized
  Codecov statuses of 82.78% project and 90.00% patch, both above the configured
  80% required floor.
- The current source report ranks `app/lib/csv-storage-s3.ts` at 0/191 lines and
  `app/lib/csv-storage-vercel-blob.ts` at 0/121 lines. The existing
  `app/lib/csv-storage-local.test.ts` demonstrates the adjacent `node:test`
  style, but there are no tests for either cloud adapter.
- Naseem's merged #2309 covers upload UI/API scenarios, while #2311 covers the
  CSV-temp and LOAD CSV API routes. The cloud storage adapter implementations
  themselves are separate, untested behavior and are not duplicated by those
  PRs.
- `app/monitor/_page.tsx` is a private Next.js file, not a live page route; there
  is no Monitor E2E entry point. Do not create a route solely to exercise it.
  The `/api/monitor` route can be considered separately as an API slice.
- Other high-gap files overlap with already-merged work and must be checked
  against their existing scenarios before they are selected.

## Approaches

1. **One broad PR covering several pages and APIs.** This could move the
   percentage faster, but makes reviews noisy and increases duplication and
   conflict risk. Rejected.
2. **Only add pure-module unit tests.** These are deterministic, but do not
   address gaps in active browser flows and are not sufficient for the project
   goal. Rejected as the sole strategy.
3. **Add one coverage-ranked component per PR.** Use the current report to find
   uncovered behavior, confirm it is not already owned, add its tests using the
   closest existing test convention, and refresh reports before choosing the
   next slice. Selected because it matches the requested PR organization and
   balances reviewability with measurable progress.

## Design and sequence

1. Start with the S3 CSV storage adapter. Add deterministic tests at the storage
   SDK boundary; do not contact a real cloud service. Keep the tests beside the
   implementation and use the repository's Node test runner.
2. Test the Vercel Blob adapter in its own PR, separate from the S3 adapter.
3. After each slice, inspect the new Codecov report and re-rank uncovered files.
   Pick only one component/page per PR and verify its gaps against existing
   merged PRs before writing tests. Use E2E/POM coverage for active user flows
   and unit/API tests for isolated server-side behavior.
4. Do not target private or otherwise unreachable components as live pages.
   If such code remains in the coverage denominator, document the obstacle and
   prefer an existing direct component or module test seam over inventing a
   production route.
5. Continue until the finalized Codecov project status on the accumulated
   staging changes is at least 95%. The project's official Codecov status is the
   acceptance measure; local report aggregation is only for ranking files.

## Validation

- For Node tests, run the focused test file and `npm run test:coverage`, then
  verify the relevant coverage report.
- For UI changes, use the existing Playwright `coverage` fixture and POM
  conventions, unique test data, and condition-based waits; run the focused
  browser tests in the configured Chromium and Firefox coverage projects.
- Do not claim the 95% goal is met until Codecov reports at least 95% project
  coverage on the resulting staging commit. Keep the existing 80% required
  statuses intact throughout.
