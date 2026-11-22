# Naseem Review Follow-up Design

## Intent

Close the remaining PR #2337 review gaps: prevent a crafted URL from displaying a password-change notice, prove ACL persistence through a real ACL-file fixture, and cover the successful-save UI state.

## Approaches

- **Notice state:** put the non-secret password-change and ACL outcome in one-time `sessionStorage` (selected) rather than the URL. A server-side status endpoint would keep state out of browser storage but adds a route for display-only data.
- **ACL persistence:** use a dedicated ACL-file FalkorDB fixture (selected) rather than treating the existing no-ACL-file server’s confirmed `ACL SAVE` error as sufficient. The fixture should exercise the route, assert `saved`, and verify the updated password is present in persisted ACL state after reload or restart.

## Design and constraints

- Keep endpoint prefill parameters in the login URL as currently required, but remove password-change and ACL-status flags from it.
- `Users` writes a one-time notice payload to `sessionStorage` before sign-out. `LoginPage` reads and removes it, and renders messages only from that payload. It contains no credentials or TLS material.
- Add a dedicated database fixture with an ACL file, isolated from the existing E2E services; use it for the self-password API flow and persistence assertion.
- Extend the mocked settings UI scenarios for `saved` so they assert the success path has no ACL persistence warning. Retain the `failed` and `unknown` warning coverage.
- Do not alter the already implemented sign-out result handling or conditional Swagger schema.

## Verification

Add focused unit/E2E coverage first; run the targeted UI and real API flows against both the existing database and ACL-file fixture, then type-check, lint, and run unit/coverage suites serially.
