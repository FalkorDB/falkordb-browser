---
applyTo: "e2e/**/*.ts"
---

# Playwright e2e

- Selectors and actions belong in page objects under `e2e/logic/POM/`; specs read like scenarios.
- Specs using `page`/`context`/`browser` fixtures import `test` from `e2e/infra/coverage.ts`.
- Tests run `fullyParallel` in Chromium and Firefox: use unique graph/user names per test (or
  serialize) and clean up what you create.
- Zero dangling tests: no unconditional `test.skip`/`test.describe.skip`/`fixme` and no `only` (environment-gated
  skips with a stated reason, e.g. missing API key, are fine), and a test that fails or passes only on retry is
  fixed at the root (`--repeat-each=10` to reproduce), never by raising retries/timeouts.
- Wait on conditions (`expect(...).toBeVisible()`, responses), never fixed sleeps.
- Contexts made through `BrowserWrapper` inherit the active project's viewport/touch/storageState.
- Coerce Cypher count values with `Number()` before exact comparisons.
