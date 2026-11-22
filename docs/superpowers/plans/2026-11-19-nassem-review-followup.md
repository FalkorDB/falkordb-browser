# Naseem Review Follow-up Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the remaining PR #2337 review gaps for password-change notices and ACL persistence evidence.

**Architecture:** Store the non-secret password-change result as a one-time `sessionStorage` value and consume it on the login page; do not put notice flags in the URL. Add a dedicated ACL-file FalkorDB container on port 6381, test the real password-change route against it, reload ACLs from disk, and confirm the new password works.

**Tech Stack:** TypeScript, Node `node:test`, Playwright, NextAuth, `@redis/client`, GitHub Actions, FalkorDB Docker image.

**Spec:** `docs/superpowers/specs/2026-11-19-nassem-review-followup-design.md`

## Global Constraints

- Keep passwords and TLS material out of URLs and browser-readable state.
- The one-time notice contains only `AclSaveStatus`; supported values are `saved`, `failed`, and `unknown`.
- A malformed or absent notice must not show a password-change banner; consume and remove the notice after one read.
- Keep the ACL fixture isolated from the existing E2E databases; use port `6381` and a temporary writable copy of its seed ACL file.
- Do not commit or push without the user's explicit authorization.

## Review Focus

- **A forged login URL:** `passwordChanged` and `aclSaveStatus` query parameters alone must not show a notice.
- **Repeated page visits:** a valid notice must be removed after the login page consumes it.
- **Unavailable session storage:** sign-out must still proceed; log the storage failure and do not fall back to URL flags.
- **Saved ACL state:** a successful PATCH must report `saved`; `ACL LOAD` must reload the persisted password and a fresh sign-in must accept it.
- **Successful-save UI:** show the password-change message but no ACL persistence warning or persistence-failure sentence.

---

### Task 1: Add a one-time password-change notice helper

**Files:**
- Create: `lib/password-change-notice.ts`
- Test: `lib/password-change-notice.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `AclSaveStatus` from `app/api/user/model.ts`.
- Produces: `PASSWORD_CHANGE_NOTICE_KEY`, `writePasswordChangeNotice(storage, status)`, and `consumePasswordChangeNotice(storage)`.
- `writePasswordChangeNotice` stores the status string under one fixed key.
- `consumePasswordChangeNotice` removes that key and returns a supported status or `undefined`.

- [ ] **Step 1: Write unit tests for writing and consuming the one-time notice.** Cover all three statuses, one-time consumption, missing storage value, and an unsupported value.
- [ ] **Step 2: Run `node --test lib/password-change-notice.test.ts` and confirm it fails because the module is missing.**
- [ ] **Step 3: Implement the helper using `Pick<Storage, "setItem">` and `Pick<Storage, "getItem" | "removeItem">` parameters.**
- [ ] **Step 4: Run `node --test lib/password-change-notice.test.ts`; expect all cases to pass.**
- [ ] **Step 5: Add `lib/password-change-notice.ts` to `test:coverage` before the test globs and rerun the focused test with 100% line, branch, and function thresholds.**

### Task 2: Remove notice flags from the login URL

**Files:**
- Modify: `app/settings/users/Users.tsx`
- Modify: `app/login/LoginPage.tsx`
- Modify: `e2e/tests/settingsUsers.spec.ts`
- Modify: `e2e/logic/POM/loginPage.ts` only if a locator is needed

**Interfaces:**
- Consumes: Task 1's `writePasswordChangeNotice` and `consumePasswordChangeNotice`.
- Produces: password-change and ACL-save banners driven only by the consumed session notice.

- [ ] **Step 1: Extend the mocked settings E2E cases to assert that successful sign-out URLs contain no password-change or ACL status flags, but the resulting login page still displays the correct messages. Add a direct `/login?passwordChanged=true&aclSaveStatus=failed` case and assert both banners remain hidden. Simulate unavailable session storage and assert sign-out still proceeds without status flags.**
- [ ] **Step 2: Run the focused `Settings reports` Playwright tests and confirm they fail because the flags are still URL-driven.**
- [ ] **Step 3: Write the status to session storage before sign-out in `Users.tsx`; if storage access fails, log the error and continue sign-out without adding status flags to the URL.**
- [ ] **Step 4: Consume and remove the notice once in `LoginPage.tsx`; show the password-changed message for any valid status and the persistence warning only for `failed` or `unknown`.**
- [ ] **Step 5: Run the focused Chromium settings tests and verify URL flags are absent, URL-only spoofing shows no banner, stored notices are consumed once, and storage-access failures are logged without preventing sign-out.**

### Task 3: Verify ACL persistence against a dedicated fixture

**Files:**
- Create: `e2e/fixtures/acl-users.acl`
- Modify: `.github/workflows/playwright.yml`
- Modify: `e2e/tests/settingsUsers.spec.ts`
- Modify: `README.md` Testing section

**Interfaces:**
- Uses the dedicated container name `falkordb-reauth-acl`, host port `6381`, and the FalkorDB image's `REDIS_ARGS="--aclfile /var/lib/falkordb/data/users.acl"`.
- The fixture's seed ACL grants the default user full access without a password; the workflow copies it to a writable directory under `RUNNER_TEMP`.

- [ ] **Step 1: Add a real API E2E test that signs in to the fixture as `default`, changes its password through `PATCH /api/user/default`, and asserts `aclSaveStatus: "saved"`.**
- [ ] **Step 2: Avoid changing the shared database's `default` password; run the existing non-mutating admin `ACL SAVE` API test against port `6379` and confirm it reports the expected no-ACL-file failure.**
- [ ] **Step 3: Start the dedicated ACL-file container in the Playwright workflow on port `6381`, wait for `PING`, and remove that named container in an always-run cleanup step.**
- [ ] **Step 4: After the PATCH and sign-out, issue `ACL LOAD` through `@redis/client` against port `6381`; then assert a fresh sign-in with the new password succeeds.**
- [ ] **Step 5: Run the dedicated real API test against the fixture and verify `saved` plus successful sign-in after ACL reload.**
- [ ] **Step 6: Extend mocked UI scenarios for `saved` with and without sign-out failure; verify the password-change message appears and no persistence-failure text is shown. Keep `failed` and `unknown` coverage.**
- [ ] **Step 7: Document the fixture's local setup/port requirement in README Testing instructions.**

### Task 4: Integrated verification

**Files:**
- Verify: files listed in Tasks 1–3

- [ ] **Step 1: Run the focused unit tests and the `Settings reports` Chromium E2E selection serially.**
- [ ] **Step 2: Run `npm test`, `npm run test:coverage`, `npx tsc --noEmit`, and `npm run lint` serially; resolve any failures caused by this change.**
- [ ] **Step 3: Run `git diff --check` and inspect the final diff. Do not commit or push.**
