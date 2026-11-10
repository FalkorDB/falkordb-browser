---
applyTo: "{app,lib}/**/*.test.ts,.github/scripts/**/*.test.mjs"
---

# Unit tests

- `node:test` + `node:assert/strict`; no other framework. Tests sit beside the source.
- Import the module under test with its extension: `./thing.ts`.
- Cover every branch of what you changed (target 100% of touched lines, never below the 95%
  patch gate). Assert behavior and edge cases, not implementation details; one case written once.
- Prefer table-driven cases for pure functions. Mock only I/O (`mock` from `node:test`);
  keep tests deterministic: no real network, clocks or randomness without injection.
- A pure module that reaches 100% joins the `test:coverage` include list in `package.json`.
- Run: `node --test <file>`, then `npm run test:coverage`.
