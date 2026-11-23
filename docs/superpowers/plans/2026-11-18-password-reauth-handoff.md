# Password Reauthentication Handoff Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** After a user changes their own password, require a fresh sign-in that reuses the saved connection and TLS settings, while accurately reporting ACL persistence.

**Architecture:** The PATCH route returns only non-secret connection fields and an ACL save status. It copies TLS material into a five-minute server-side Token DB record and sets a short-lived HttpOnly cookie containing an opaque reference; the existing login URL parameters prefill the ordinary fields, and the credentials provider consumes matching TLS material server-side.

**Tech Stack:** Next.js 16 Route Handlers, NextAuth credentials provider, FalkorDB Token DB storage, TypeScript, node:test, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-18-password-reauth-handoff-design.md`

## Global Constraints

- The user should only need to enter the new password, including when the connection uses custom TLS material.
- Keep CA certificates, client certificates, private keys, and passwords out of URLs and browser-readable state.
- Keep the TLS handoff server-side, short-lived, bound to the exact endpoint, and unusable as a substitute for the new password.
- Remove the handoff after successful sign-in; allow retry until expiry if sign-in fails.
- Report ACL persistence as `saved`, confirmed `failed`, or `unknown`; a transport failure cannot prove whether Redis wrote the ACL file.
- Do not widen unauthenticated preconfigured-connection lookup or alter other-user password changes.

## Review Focus

- Redis may write the ACL file before an error is returned; the user must see `unknown`, not a confirmed memory-only result.
- A handoff cookie can be stale, expired, inactive, or point to another endpoint; never apply its TLS data unless every endpoint field matches.
- A handoff record must survive session sign-out but must not be listed or accepted as a connection or personal access token.
- The opaque reference must be HttpOnly, short-lived, Secure on HTTPS, and absent from the URL and JavaScript-visible responses.
- A failed credentials attempt must retain the handoff for retry; a successful sign-in must invalidate both the record and cookie.

---

### Task 1: Make ACL persistence outcomes accurate

**Files:**
- Modify: `app/api/user/model.ts`
- Test: `app/api/user/model.test.ts`
- Modify: `app/api/user/[user]/route.ts`
- Modify: `app/settings/users/Users.tsx`
- Modify: `app/login/LoginPage.tsx`
- Modify: `app/api/swagger/swagger-spec.ts`
- Test: `app/api/swagger/swagger-spec.test.ts`
- Modify: `e2e/tests/settingsUsers.spec.ts`
- Modify: `readme-browser.md`

**Interfaces:**
- Produces `AclSaveStatus = "saved" | "failed" | "unknown"` in `app/api/user/model.ts`.
- A self-password PATCH response uses `aclSaveStatus` and does not use the ambiguous `aclSaved` boolean.
- Non-self password updates continue to return `requiresReauthentication: false`.

- [x] **Step 1: Write tests for ACL result classification.** Verify success returns `"saved"`, server and transport errors return `"unknown"` when persistence cannot be disproved, and failures are reported.
- [x] **Step 2: Run `node --test app/api/user/model.test.ts` and confirm the new cases fail because classification does not yet exist.**
- [x] **Step 3: Implement typed ACL status classification in `model.ts`; errors that cannot prove persistence failed report `unknown`.**
- [x] **Step 4: Run `node --test app/api/user/model.test.ts` and confirm all model tests pass.**
- [x] **Step 5: Update the real PATCH test and mocked UI tests to assert distinct `failed` and `unknown` login messages and response values.**
- [ ] **Step 6: Run the focused API/UI Playwright tests and confirm they fail because the route does not return the status and the UI has only the prior binary message.**
- [x] **Step 7: Update PATCH response, login warning copy, settings UI query parameter, OpenAPI response schema, and user documentation to distinguish successful persistence from an unknown outcome.**
- [ ] **Step 8: Run `node --test app/api/user/model.test.ts app/api/swagger/swagger-spec.test.ts`, focused Playwright tests, then `npx tsc --noEmit` and focused ESLint.**

### Task 2: Reuse saved TLS settings for the next sign-in

**Files:**
- Create: `lib/reauthentication-handoff.ts`
- Test: `lib/reauthentication-handoff.test.ts`
- Modify: `app/api/user/[user]/route.ts`
- Modify: `app/api/auth/[...nextauth]/options.ts`
- Modify: `app/api/auth/[...nextauth]/route.ts`
- Modify: `app/login/LoginPage.tsx`
- Modify: `app/api/swagger/swagger-spec.ts`
- Test: `app/api/swagger/swagger-spec.test.ts`
- Modify: `e2e/tests/settingsUsers.spec.ts`

**Interfaces:**
- `createReauthenticationHandoffId(): string` generates a cryptographically random opaque reference.
- `matchesReauthenticationEndpoint(record, credentials): boolean` matches host, numeric port, username, and TLS mode.
- The temporary Token DB row uses `kind: "session"`, a `reauth:` name rather than a `connection:` name, and a five-minute expiry. Store the client private key only in the existing encrypted-key field.
- Query parameters prefill only host, port, username, TLS, and the existing password-change/status flags.

- [x] **Step 1: Add unit tests for endpoint matching and expiry/activity validation, including a mismatch in each endpoint field.**
- [x] **Step 2: Run `node --test lib/reauthentication-handoff.test.ts` and confirm the test fails because the module does not exist.**
- [x] **Step 3: Implement the pure handoff validation helpers and cryptographically random ID generation.**
- [x] **Step 4: Run `node --test lib/reauthentication-handoff.test.ts` and confirm all cases pass.**
- [x] **Step 5: Add Playwright tests proving ordinary fields are prefilled, only the new password is entered, TLS values/reference are absent from URL and page state, endpoint mismatch does not consume TLS material, failed sign-in permits retry, and successful sign-in consumes the handoff.**
- [ ] **Step 6: Run the focused Playwright tests and confirm they fail because the handoff is not created or consumed.**
- [x] **Step 7: In the self-password PATCH path, create the temporary Token DB record from the active connection's saved TLS fields and set a five-minute HttpOnly, SameSite=Lax cookie scoped to `/api/auth`, Secure when the request uses HTTPS. Return no TLS material or handoff ID in JSON.**
- [x] **Step 8: In credentials authorization, read the HttpOnly reference, fetch and validate the active unexpired handoff row and exact endpoint match, and use its TLS material only for that connection attempt. On successful sign-in, delete the row and expire the cookie; leave it usable after failed sign-in until expiry.**
- [x] **Step 9: Keep the login form's existing query-parameter prefill for host, port, username, and TLS, and ensure the new password is still entered manually.**
- [ ] **Step 10: Run the focused Playwright test in Chromium and Firefox, then `npm test`, `npm run test:coverage`, `npx tsc --noEmit`, and focused ESLint.**

### Task 3: Verify the integrated PR change

**Files:**
- Test: `e2e/tests/settingsUsers.spec.ts`
- Verify: all files listed in Tasks 1 and 2

**Interfaces:**
- Consumes the `aclSaveStatus` response and the server-side handoff created by Tasks 1 and 2.

- [ ] **Step 1: Run `git diff --check` and verify the full password-update flow in both browser engines with a temporary admin, without modifying the shared admin fixture.**
- [x] **Step 2: Run `npm run lint`, `npx tsc --noEmit`, `npm test`, and `npm run test:coverage` serially.**
- [ ] **Step 3: Update the PR description with the final behavior and exact validation results.**
