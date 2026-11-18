# S3 CSV Storage Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add deterministic behavioral coverage for the S3 CSV storage adapter as the first isolated coverage PR toward 95% project coverage.

**Architecture:** Test the existing `S3CsvStorage` methods through the AWS SDK command boundary using `node:test` mocks and fake credentials. Keep production behavior unchanged, make no real network calls, and keep this adapter's tests separate from the Vercel Blob adapter.

**Tech Stack:** Node.js 24, TypeScript, `node:test`, `node:assert/strict`, AWS SDK for JavaScript v3.

**Spec:** [2026-11-17-coverage-to-95-design.md](../specs/2026-11-17-coverage-to-95-design.md)

## Global Constraints

- The project coverage goal is at least 95%.
- Preserve the configured 80% required project and patch checks.
- Add one component, page, or isolated module per PR; this PR covers only `S3CsvStorage`.
- Do not duplicate the merged upload and CSV API scenarios in #2309 and #2311.
- Do not change production behavior, coverage source selection, or thresholds.
- Use deterministic tests with no real cloud calls.

## Review Focus

1. Invalid owners or keys must fail before an AWS command is sent.
2. Missing `S3_BUCKET` must fail explicitly rather than issue a request.
3. Optional object-existence verification must map 404 responses to the stable not-found error and rethrow other failures.
4. Cleanup must delete only old, exact owner/UUID CSV objects directly under
   the configured prefix, including across paginated listings. The current
   suffix-only filter also accepts extra nested directories; fix and regression
   coverage are tracked separately in #2339, outside this test-only PR.
5. Delete remains best-effort: an AWS delete failure is logged and does not reject the call.

---

### Task 1: Cover the S3 CSV storage adapter

**Files:**
- Create: `app/lib/csv-storage-s3.test.ts`
- Read-only implementation under test: `app/lib/csv-storage-s3.ts`

**Interfaces:**
- Consumes: `S3CsvStorage.store(owner: string, key: string, body: Readable): Promise<void>`
- Consumes: `S3CsvStorage.resolveReadUrl(owner: string, key: string): Promise<string>`
- Consumes: `S3CsvStorage.delete(owner: string, key: string): Promise<void>`
- Consumes: `S3CsvStorage.cleanupExpired(olderThanMs: number): Promise<number>`
- Consumes: `S3CsvStorage.createDirectUploadTarget(owner: string, key: string, request: CsvDirectUploadRequest): Promise<CsvDirectUploadTarget | null>`
- Produces: a test-only verification of the existing adapter; no new runtime API.

- [ ] **Step 1: Add focused `node:test` cases in `app/lib/csv-storage-s3.test.ts`.**

  Set fake S3 bucket, credentials, endpoint, and signing TTL environment values
  before dynamically importing `./csv-storage-s3.ts`; the signing TTL constants
  are read at module import time. Use `t.mock.method(S3Client.prototype, "send",
  ...)` to capture SDK commands and return deterministic responses. Assert:

  - `store` sends a `PutObjectCommand` with the configured bucket, the
    `<prefix>/<owner>/<uuid>.csv` key, `text/csv; charset=utf-8`, and the
    supplied stream contents.
  - Invalid owner, invalid key, and missing bucket reject without sending a
    command.
  - `resolveReadUrl` produces a signed GET URL for the owner-scoped key. With
    `S3_VERIFY_OBJECT_EXISTS=true`, a missing object maps to
    `CSV temp object not found.`; a non-404 error propagates unchanged.
  - `delete` sends a `DeleteObjectCommand`; when that command fails, the method
    logs the failure and resolves.
  - `cleanupExpired` follows a continuation token, deletes expired objects
    with an owner/UUID CSV suffix, ignores fresh and malformed objects, and
    returns the number reported as deleted.
  - `createDirectUploadTarget` returns a `PUT` target with the signed URL,
    configured owner-scoped key in the URL path, and either the supplied
    content type or the default `text/csv; charset=utf-8`. The existing target
    type does not expose content length; do not assert a nonexistent response
    field or use a brittle signature assertion to infer it.
  - Read endpoint overrides and configured signing expiration are reflected in
    the generated URL without making a network request. Exercise Docker gateway
    rewrites, individual read overrides, the default AWS endpoint, and an
    invalid endpoint.

- [ ] **Step 2: Run the focused test file.**

  Check `node --version` is at least 24 before running:

  ```bash
  node --test app/lib/csv-storage-s3.test.ts
  ```

  Expected: every new test passes; no real S3 request occurs. These tests cover
  already-implemented behavior, so a first-pass failure is investigated as a
  product defect rather than hidden with a weaker assertion.

- [ ] **Step 3: Run the complete unit coverage suite and generate its report.**

  ```bash
  mkdir -p coverage/raw
  RAW_COVERAGE="$(mktemp -d coverage/raw/unit-XXXXXXXX)"
  NODE_V8_COVERAGE="$RAW_COVERAGE" npm run test:coverage &&
    node .github/scripts/coverage-report.mjs unit "$RAW_COVERAGE"
  ```

  Expected: the existing 100% pure-module gates remain green and
  `coverage/unit/codecov.json` reports executed lines for
  `app/lib/csv-storage-s3.ts`. Do not add the provider to the pure-module
  threshold list.

- [ ] **Step 4: Run type and lint checks.**

  ```bash
  npx eslint app/lib/csv-storage-s3.test.ts
  npx tsc --noEmit
  ```

  Expected: both commands exit successfully.

- [ ] **Step 5: Review the patch and commit this slice.**

  Confirm the PR changes only the S3 adapter test and the coverage design/plan
  documents; do not edit the adapter or package coverage configuration unless a
  separately approved defect requires it.

  ```bash
  git add app/lib/csv-storage-s3.test.ts docs/superpowers/specs/2026-11-17-coverage-to-95-design.md docs/superpowers/plans/2026-11-17-s3-csv-storage-coverage.md
  git commit -m "test(csv): cover S3 CSV storage provider" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
  ```

- [ ] **Step 6: Open the single-component PR against `staging`.**

  The PR must include only this S3 coverage slice and its planning documents.
  Wait for CI and Codecov to report; record the official project percentage and
  use fresh reports before selecting the next component. Do not merge the PR.
