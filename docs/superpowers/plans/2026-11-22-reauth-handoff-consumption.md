# One-time Password Reauthentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow only one successful credentials callback to use a password-change handoff, while preserving retry after an incorrect password.

**Architecture:** After the password update succeeds, remove the prior connection record containing the old password. On reauthentication, validate the submitted new password and connect first, then atomically consume the server-side handoff before returning the user to NextAuth. If consumption fails, close and remove the new session connection and reject sign-in. Keep the existing five-minute expiry and opportunistic expired-token cleanup; do not add a scheduler.

**Tech Stack:** TypeScript, NextAuth Credentials provider, existing token-storage `deleteToken()`, `node:test`, Playwright.

**Spec:** [2026-11-22-reauth-handoff-consumption.md](../specs/2026-11-22-reauth-handoff-consumption.md)

## Global Constraints

- The user signs in with the new FalkorDB password; the handoff does not store a password.
- Remove the prior connection record containing the old password immediately after `ACL SETUSER` succeeds; log storage errors without changing the user response.
- Invalid credentials must not consume the handoff.
- The handoff remains unusable after five minutes; do not add a background cleanup service.
- A missing handoff or storage error must fail closed; never issue a session.
- Follow the existing `node:test` and Playwright test conventions.

## Review Focus

- Wrong password followed by retry: handoff remains available; pin in the TLS E2E.
- Two simultaneous callbacks with one cookie: exactly one session; pin in the TLS E2E.
- A missing/failed deletion: reject sign-in and clean up its connection; pin in helper unit tests and the authorization path.
- Old connection record after password update: previous session authorization is invalidated even if new sign-in has not succeeded; pin in the TLS E2E.
- Expired handoff: reject it; retain coverage in `reauthentication-handoff.test.ts`.
- Ordinary TLS login and changing another user's password: unchanged; retain existing TLS and user-management tests.

---

### Task 1: Atomically consume the handoff during credentials authorization

**Files:**
- Modify: `lib/reauthentication-handoff.ts`
- Test: `lib/reauthentication-handoff.test.ts`
- Modify: `app/api/user/model.ts`
- Test: `app/api/user/model.test.ts`
- Modify: `app/api/user/[user]/route.ts`
- Modify: `app/api/auth/[...nextauth]/options.ts`
- Modify: `app/api/auth/[...nextauth]/route.ts`
- Test: `e2e/tests/tls.spec.ts`

**Interfaces:**
- Produce `consumeReauthenticationHandoff(reference: string, deleteToken: (tokenId: string) => Promise<boolean>, onFailure: () => Promise<void>): Promise<boolean>`. It prefixes the reference, returns `true` only when deletion succeeds, invokes `onFailure` when deletion returns `false` or throws, and rethrows deletion errors.
- Credentials authorization calls this helper only after `newClient` succeeds and the connection credential is persisted. A `false` result or error rejects sign-in. The failure callback deletes the new connection record and closes its connection, logging cleanup failures.
- After the user's password is changed successfully, the user route deletes `user.connectionId` from token storage. A storage exception is logged; it does not turn a completed password change into an apparent failure or change the response contract.
- The auth route continues clearing the browser cookie after successful sign-in but no longer deletes the server-side handoff.

- [ ] **Step 1: Add unit tests for the consumption helper**

Test that deletion uses the `reauth:` prefix, successful deletion returns `true` without cleanup, a missing token returns `false` and cleans up, a storage error triggers cleanup and propagates, and concurrent calls against a one-use fake store produce exactly one success.

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `node --test lib/reauthentication-handoff.test.ts`
Expected: FAIL because `consumeReauthenticationHandoff` is not implemented.

- [ ] **Step 3: Implement the helper and consume it in credentials authorization**

Track only the reference whose handoff was validated and used. Call the helper after connection persistence, before returning `User`; on failure remove the new connection token and close the live connection. Remove post-response server-side deletion from the auth route while retaining successful-response cookie clearing.

- [ ] **Step 4: Remove the stale password connection record**

After `connection.aclSetUser(username, finalRole)` succeeds, call `tokenStorage.deleteToken(user.connectionId)` when available. Log thrown storage errors and continue the successful password-change response. Do not change the PATCH response shape.

- [ ] **Step 5: Add the password retry, stale-session, and concurrency E2E assertions**

In the existing TLS password-change flow, verify the previous connection can no longer authorize, submit a wrong password with the handoff and assert there is no session, then use the same handoff for two concurrent correct-password callbacks and assert exactly one authenticated session. Keep the replay assertion.

- [ ] **Step 6: Run focused unit and static checks**

Run: `node --test lib/reauthentication-handoff.test.ts`
Expected: PASS.

Run: `npx eslint lib/reauthentication-handoff.ts lib/reauthentication-handoff.test.ts app/api/user/model.ts app/api/user/model.test.ts 'app/api/user/[user]/route.ts' 'app/api/auth/[...nextauth]/options.ts' 'app/api/auth/[...nextauth]/route.ts' e2e/tests/tls.spec.ts`
Expected: PASS with no errors.

Run: `npx tsc --noEmit`
Expected: PASS.

Run: `npm run lint`
Expected: PASS with no errors.

Run: `npm run test:coverage`
Expected: all tests pass and the 100% pure-module gates pass.

### Task 2: Commit and push the verified changes

**Files:**
- Modify: `.github/workflows/playwright.yml`

- [ ] **Step 1: Validate workflow YAML and whitespace**

Run: `ruby -e 'require "yaml"; YAML.load_file(".github/workflows/playwright.yml", aliases: true); puts "playwright.yml parsed"'`
Expected: `playwright.yml parsed`.

Run: `git diff --check`
Expected: no output.

- [ ] **Step 2: Review, commit, and push**

Review the complete diff, commit with a conventional message and the required Copilot co-author trailer, then push to the PR branch. Verify the remote head matches the local commit; do not merge.

### Task 3: Verify the PR checks

- [ ] **Step 1: Watch checks to completion**

Run: `gh pr checks 2337 --watch`
Expected: all required checks pass, including TLS readiness, ACL persistence, concurrent reauthentication, and coverage. If a check fails, diagnose and fix its root cause before declaring the PR ready.
