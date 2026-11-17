# Atomic Attribute Add

## Intent

Prevent Add Attribute from overwriting a property another writer added after the browser loaded its element. Preserve the existing behavior where Edit Attribute intentionally replaces a value.

## Approaches

- **Client-only duplicate check:** already catches keys present in the loaded snapshot, but cannot protect against stale data or concurrent writers.
- **Atomic add mode on the existing property endpoint (chosen):** the UI marks only Add Attribute requests as add-only; the server checks and writes in one Cypher operation, returning a conflict with the existing duplicate-key message when the key is already present. Normal edits remain unconditional. This reuses the current route and avoids a separate endpoint.

## Behavior and scope

- A duplicate key is rejected and its current value is preserved, including when another writer added it after the page loaded.
- The UI displays the duplicate-key error for the server conflict; existing local validation remains as a fast path.
- Add a regression test that makes the page's property snapshot stale before submitting Add Attribute, then verifies the duplicate error and preserved server value.
- Move the test graph cleanup to the suite's existing `afterEach` cleanup, which closes the browser before deletion and asserts deletion succeeded.
- Update the Swagger contract for the optional add-only request flag and conflict response.
- Do not change deliberate property edits or unrelated graph mutations.
