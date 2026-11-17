# Atomic Attribute Add Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reject Add Attribute requests when another writer has already created that property, without changing intentional edits.

**Architecture:** Add an optional `addOnly` flag to the existing property POST. When true, the route performs a single conditional Cypher mutation and returns HTTP 409 with the existing duplicate-key message if the key already exists; the UI opts into this mode only for Add Attribute. Existing error formatting already displays “already exists” messages.

**Tech Stack:** Next.js route handlers, Zod, FalkorDB Cypher, Playwright, Node test runner.

**Spec:** `docs/superpowers/specs/2026-11-17-atomic-attribute-add-design.md`

## Global Constraints

- The API add-only check and write must happen atomically.
- A duplicate must preserve the existing property value and return “An attribute with this key already exists”.
- Normal Edit Attribute requests must remain unconditional updates.
- The test graph must be deleted only after the browser is closed, with deletion failure surfaced.
- Update the Swagger contract when the API contract changes.

## Review Focus

- **A key added after the UI snapshot was loaded:** exercise the add-only conflict response and verify the stored value remains unchanged.
- **A duplicate already present in the UI snapshot:** retain the current client-side rejection and existing-value assertion.
- **A previously absent key:** retain successful Add Attribute coverage.
- **An intentional edit to an existing key:** retain coverage that Edit Attribute still changes the stored value.
- **An older API caller omitting `addOnly`:** validate that the field remains optional and the request retains update behavior.

---

### Task 1: Enforce Atomic Add-Only Property Writes

**Files:**
- Modify: `app/api/validate-body.ts`
- Test: `app/api/validate-body.test.ts`
- Modify: `app/api/graph/[graph]/[element]/[key]/route.ts`
- Modify: `app/api/swagger/swagger-spec.ts`
- Modify: `app/graph/DataTable.tsx`
- Modify: `e2e/logic/POM/dataPanelComponent.ts`
- Test: `e2e/tests/dataPanel.spec.ts`

**Interfaces:**
- Consumes: the existing property POST body (`type`, `value`, and optional `valueType`) and existing `securedFetch` error handling.
- Produces: optional `addOnly: boolean`; when true, the property POST either adds the absent key and returns 200, or returns 409 with `{ message: "An attribute with this key already exists" }`. When omitted or false, existing set behavior remains.

- [x] **Step 1: Add schema tests for the optional flag**

Add a test to `updateGraphElementAttribute` asserting that `addOnly: true` is retained in parsed data, an omitted `addOnly` is accepted, and a non-boolean `addOnly` is rejected.

- [x] **Step 2: Run the schema test to verify the new case fails**

Run: `node --test app/api/validate-body.test.ts`
Expected: FAIL because `addOnly: true` is stripped from parsed data and the invalid type is not rejected.

- [x] **Step 3: Add the stale-snapshot E2E regression before production changes**

Add a test that loads an element while a key is absent, adds that key through a separate graph query, then submits Add Attribute for the same key. Assert the duplicate toast appears through a locator exposed by the `DataPanel` page object and the separately written value is still stored. Register its graph with `graphToRemove`; remove the inline `finally` deletion from the existing duplicate test and use the same `afterEach` cleanup.

- [x] **Step 4: Run the stale-snapshot test to verify it fails**

Run: `npm run test:e2e -- e2e/tests/dataPanel.spec.ts --grep "stale snapshot"`
Expected: FAIL because the API currently overwrites the value instead of returning a conflict.

- [x] **Step 5: Implement the optional add-only API behavior**

Add optional `addOnly` validation. In the property route, retain the current unconditional query when the flag is false or omitted. When true, use a single conditional Cypher mutation for both node and relationship branches, returning whether the property already existed; respond with HTTP 409 and the exact duplicate-key message on conflict. Document `addOnly` and the 409 response in Swagger.

- [x] **Step 6: Send add-only mode only from Add Attribute**

In `DataTable.setProperty`, include `addOnly: actionType === "added"` in the request body. Keep the existing local duplicate check and rely on `securedFetch` to display the route's duplicate message.

- [x] **Step 7: Run focused and full verification**

Run: `node --test app/api/validate-body.test.ts`
Expected: PASS.

Run: `npm run test:e2e -- e2e/tests/dataPanel.spec.ts --grep "stale snapshot"`
Expected: PASS; the existing value remains stored.

Run: `npm test`
Expected: PASS.

Run: `npm run lint`
Expected: PASS with no new errors.

Run: `npx tsc --noEmit`
Expected: PASS.

- [x] **Step 8: Commit the PR update**

Commit the implementation and regression tests as one follow-up commit on the existing PR branch.
