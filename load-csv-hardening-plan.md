# Follow-up PR plan: Harden & re-enable **Load CSV** upload (native `LOAD CSV` + streaming object storage)

## Context
PR #1911 ships **Cypher batch** upload and **gates Load CSV off** behind
`CSV_UPLOAD_ENABLED = false` (`lib/graphUpload.ts`) because a rubber-duck review
found several security/correctness issues in the new CSV temp-storage subsystem,
and it had **zero test coverage**. This follow-up PR fixes every issue, adds full
coverage, and re-enables the feature.

## Approach
Use FalkorDB's native **`LOAD CSV`** command. Because the DB fetches the CSV
itself (`file://` from a shared `IMPORT_FOLDER`, or `https://`) and the browser
may run **separately** from the DB (e.g. Vercel → remote FalkorDB), the upload is
**streamed** to a **pluggable object store** the DB can reach:
- **S3 / R2 / MinIO** (preferred, streaming multipart) → presigned HTTPS GET.
- **Vercel Blob** (streaming) → presigned/blob HTTPS URL.
- **local** (stream to disk) → `file://` (co-located) or signed-capability HTTPS serve.

**Prefer S3/Blob for large files** — cloud storage streams with no local-disk
limit; the local Docker temp dir may be too small. Uploads stream end-to-end
(constant memory), size-capped via `CSV_MAX_FILE_SIZE_MB` (413 on exceed).

## Scope (files)
- `app/api/graph/[graph]/load-csv/route.ts`
- `app/api/csv-temp/route.ts`, `app/api/csv-temp/[id]/route.ts`, `app/api/csv-temp/cleanup/route.ts`, `stream-csv.ts`, `csv-head.ts`
- `app/lib/csv-storage.ts`, `csv-storage-local.ts`, `csv-storage-s3.ts`, `csv-storage-vercel-blob.ts`, `csv-temp-config.ts`, `csv-key.ts`
- `app/components/graph/UploadGraph.tsx` (Load CSV tab)
- `lib/graphUpload.ts` (`CSV_UPLOAD_ENABLED`, `containsLoadCsv`)
- `.github/workflows/playwright.yml` (shared `IMPORT_FOLDER` volume for e2e), `.env.local.template` / `readme-browser.md` (final contract)
- New tests under each module + `e2e/tests/uploadGraph.spec.ts`

## Fixes (each maps to a rubber-duck finding)

### 1. SSRF + `key` is decorative → server owns the URL (High)
- Change the request contract of `POST /api/graph/[graph]/load-csv` from
  `{ key, query }` to `{ key, withHeaders: boolean, body: string }`.
- The server:
  1. validates/normalizes `key` (strict lowercase UUID-v4),
  2. verifies the object **exists and belongs to the caller** (see #8),
  3. resolves the canonical storage URL itself (presign / local path),
  4. builds the single `LOAD CSV [WITH HEADERS] FROM $csvUrl AS row` clause
     server-side using a **query parameter** (`$csvUrl`), never string
     interpolation of a quoted URL (FalkorDB v4.18.10 supports parameterized
     LOAD CSV URLs), then appends the user `body`,
  5. rejects any request whose `body` itself contains a `LOAD CSV` clause,
     detected with a **Cypher-aware tokenizer** (reuse the `splitCypherStatements`
     lexer state), not a regex — must be robust to casing, `LOAD/**/CSV`,
     whitespace, string/backtick literals, and comments.
- Client (`UploadGraph.tsx`) sends only `withHeaders` + the editable `body`
  (everything after `AS row`), never the `FROM` URL.

> ⚠️ **This only hardens the dedicated route.** See "System-wide SSRF policy"
> below — the general `/api/graph/[graph]` query endpoint can already run
> `LOAD CSV ... RETURN` (even Read-Only users via `roQuery`), so an app-layer
> allowlist alone does **not** close SSRF globally.

### 2. Cleanup deletes unrelated files from the shared `IMPORT_FOLDER` (High)
- Store temp files under a dedicated subdirectory/prefix (e.g.
  `<CSV_LOCAL_TEMP_DIR>/falkordb-browser-csv-temp/<owner>/`) that is never shared
  with user-managed `LOAD CSV` files.
- Local `cleanupExpired` deletes **only** files whose basename is exactly a
  UUID-v4 + `.csv` **and** live in that dedicated subdirectory.
- S3/Blob cleanup must match the **exact generated leaf pattern**
  (`<prefix>/<owner>/<uuid>.csv`), not merely "anything under the prefix".
- **File URI alignment:** the generated `file://` URI must include the dedicated
  subdirectory/owner path (e.g. `file://falkordb-browser-csv-temp/<owner>/<id>.csv`
  relative to `IMPORT_FOLDER`), not `file://<id>.csv`, or FalkorDB reads from the
  wrong location.

### 3. Size limit enforced only after buffering (High)
- Replace `request.formData()` in `POST /api/csv-temp` with **busboy streaming**
  (as `/api/upload` does), using busboy's built-in `limits.fileSize` and
  `limits.files:1, fields:0, parts:10` to bound the **entire multipart stream**
  (including unexpected parts), aborting with `413` before the whole body is
  buffered.
- Handle busboy `limit`/truncation, multiple-file and disconnect cases, and clean
  up any partially written object on abort.
- Test with a chunked request that has no `Content-Length` (oversize must still
  be rejected mid-stream).

### 4. Missing Read-Only guards (Medium)
- Add `resolveReadOnly(request, session.user.role)` → `403` immediately after
  auth in `POST /api/csv-temp` and `DELETE /api/csv-temp/[id]` (and confirm the
  execute route already guards, which it does).

### 5. Cleanup auth fails open (Medium)
- `POST/GET /api/csv-temp/cleanup`: **fail closed in every environment** unless an
  explicit insecure-dev override env is set (`NODE_ENV` is not a security
  boundary). A missing secret is a **configuration** error → `503`; a bad/absent
  caller credential → `401`.
- **Keep an authenticated `GET`**: Vercel Cron invokes routes with `GET`, so a
  `POST`-only entrypoint is incompatible with `vercel.json`. Require
  `CRON_SECRET`/`CSV_TEMP_CLEANUP_SECRET` on that `GET`.

### 6. HTTPS → HTTP silent downgrade (Medium)
- Remove `downgradeLoadCsvUrlToHttp` entirely. FalkorDB v4.18.10 supports only
  `file://` and `https://` for LOAD CSV — **do not add an HTTP mode** unless HTTP
  support is verified against the target DB version. If the DB cannot fetch the
  URL, fail with a clear error rather than leaking a signed URL over plaintext.

### 7. Uppercase-UUID key mismatch (Low)
- One shared `normalizeCsvKey()` (strict UUID-v4 → lowercase) used by every route
  and provider so store/serve/delete keys always match. Test that uppercase input
  is handled with a single consistent policy (reject **or** normalize, not both).

### 8. Per-user ownership of temp objects
- Scope objects by owner using a **non-sensitive** owner identifier (HMAC/hash of
  the user id, not the raw id). Provider APIs keyed by `(owner, key)` for
  exists/presign/delete, with atomic behavior and orphan cleanup.
- The unauthenticated local `GET /api/csv-temp/[id]` cannot verify a caller
  (FalkorDB sends no session): use a **signed capability URL** embedding
  `owner+key+expiry` (a leaked URL remains a bearer capability, so keep TTLs
  short). Authenticated execute/delete verify ownership and return `404`
  cross-user. Add cross-user execute/delete tests.

## System-wide SSRF policy (decision required)
The dedicated route fixes bind the URL to the stored object, but they do **not**
close SSRF globally: the general `/api/graph/[graph]` query endpoint already runs
arbitrary Cypher, and even Read-Only users can run `LOAD CSV ... RETURN` via
`roQuery`. An app-layer allowlist cannot constrain URLs fetched through that
endpoint (or redirects / DNS resolved by FalkorDB). Pick one explicit policy:

1. **Central block** — reject `LOAD CSV` in every general query entrypoint and
   permit it only through the hardened route (Cypher-aware detection, shared with
   fix #1); **or**
2. **Network egress control** — block private/loopback/link-local/metadata
   destinations where FalkorDB runs (network policy / proxy / firewall); **or**
3. **Accept the risk** — treat every query-capable user as trusted with DB-network
   fetch capability, and document it.

The follow-up PR must state which policy it implements; the plan does not claim to
resolve SSRF globally without one.

## Test coverage (node:test + Playwright)
- Put testable logic in **minimal-import sibling modules** (repo convention: route
  handlers use `@/` aliases and aren't unit-tested directly) **and** add real
  route/integration tests — do not repeat the "tested helper, unwired route"
  gap that produced these findings.
- **csv-storage-local**: path traversal rejection, key normalization, cleanup
  scope (only UUID `.csv` in the dedicated dir; leaves foreign files), URI mode.
- **csv-storage-s3 / -vercel-blob**: key prefixing/normalization, presign TTL,
  cleanup exact-leaf scoping, and a retry test proving a **fresh** presigned URL
  is generated at execution (SDK mocked with `mock.fn`).
- **csv-temp routes**: `403` when flag off, auth required, read-only `403`,
  streaming size `413` (incl. no-`Content-Length`), UUID validation, cleanup
  fail-closed (`401`/`503`) logic.
- **load-csv route**: URL is server-generated (client cannot inject `FROM`),
  second-`LOAD CSV` rejection (Cypher-aware), read-only `403`, temp deletion on
  success only, key normalization on delete, cross-user execute/delete `404`,
  signed-capability parser tests.
- **e2e** (`uploadGraph.spec.ts`): un-skip and rewrite the CSV suite for the
  `LOAD CSV` flow. Reachability strategy for CI (local storage only — S3/Blob not
  covered): run the app and FalkorDB sharing a mounted `IMPORT_FOLDER` volume and
  use `CSV_LOCAL_LOAD_URI_MODE=file`. The **workflow must be wired explicitly** in
  `.github/workflows/playwright.yml` (currently the app runs on the host while
  FalkorDB is a service container): create a writable host dir, bind-mount it into
  FalkorDB, set FalkorDB `IMPORT_FOLDER` (trailing slash), set app
  `CSV_STORAGE=local` + `CSV_LOCAL_TEMP_DIR` + `CSV_LOCAL_LOAD_URI_MODE=file`, and
  align the relative file URI with the dedicated/owner subdirectory. Assert
  nodes/edges created from a fixture CSV.

## Concurrency
- Cleanup must not delete a file during an active or long-delayed import: track
  in-use state or renew the object's lease/mtime while an import is running.

## Re-enable
- Flip `CSV_UPLOAD_ENABLED = true` in `lib/graphUpload.ts` (last step, after all
  fixes + tests are green).
- Update `readme-browser.md` / `.env.local.template` to document the final
  contract (`CSV_LOAD_ALLOWED_HOSTS`, dedicated temp subdir, fail-closed cleanup).

## Validation gates (must be green before review)
- `npm test`, `npm run lint`, `npm run build`.
- `npx playwright test e2e/tests/uploadGraph.spec.ts --project="[Admin] Chromium"`
  (Cypher batch **and** the new Load CSV suite).
- Re-run the rubber-duck review on the diff; zero blocking findings.

## Out of scope
- Dump restore (stays gated behind `DUMP_RESTORE_ENABLED`).
- Any change to the Cypher-batch path (already shipped in #1911).
