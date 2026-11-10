# FalkorDB Browser — instructions for AI coding agents

This file is the single source of truth for GitHub Copilot, Claude Code (`CLAUDE.md`
imports it) and any other agent. Keep it short and factual: if a fact is cheap to
rediscover from the code, leave it out. Update it in the same PR that makes it stale.

## What this repo is

A Next.js (App Router, webpack build) web UI for [FalkorDB](https://falkordb.com) graph
databases: connect, run Cypher, visualize graphs (`@falkordb/canvas`), manage users,
config and tokens, plus AI helpers (Chat, Fix with AI, Optimize). It also ships as a
Docker image, a Helm chart (`helm/`), an Electron app (`desktop/`) and a Capacitor
mobile shell (`mobile/`, each with its own `package.json`, lint and tests).

Stack: TypeScript (strict), React 19, Next.js 16, Tailwind 4, Radix UI, `falkordb` /
`@redis/client` driver, next-auth v5, Monaco editor, ANTLR Cypher grammar. Node ≥ 24.

## Layout

| Path | What lives there |
| --- | --- |
| `app/` | Routes and UI. `app/providers.tsx` is the large global state provider; `app/api/**` are route handlers; `app/graph`, `app/settings`, `app/login`, `app/monitor`, `app/udf` are pages; `app/components` shared UI; `app/lib` server-side CSV storage helpers |
| `lib/` | Framework-free logic (Cypher errors/suggestions/diagnostics, URL/tab state, connection storage, token storage, rate limiting, …) and `lib/falkordb-cypher/` (grammar tooling; `generated/` is ANTLR output — never hand-edit) |
| `components/ui/` | shadcn-style primitives (excluded from lint) |
| `proxy.ts`, `auth.ts` | Next.js proxy (CSP, rate limiting) and auth entry |
| `e2e/` | Playwright: `tests/` specs, `logic/POM/` page objects, `infra/` helpers, `config/` data |
| `.github/scripts/` | Coverage report and gate scripts (with their own tests) |
| `docs/design/` | Design/implementation plans (see "Documentation") |
| `helm/`, `docker/`, `Dockerfile` | Deployment |

## Commands

```bash
npm ci                    # install
npm run dev               # dev server on :3000 (cp .env.local.template .env.local first)
npm run lint              # ESLint (no errors; do not add warnings)
npx tsc --noEmit          # type-check; `npm run build` (webpack) also type-checks
npm test                  # unit tests: node --test, native TS type-stripping
npm run test:coverage     # unit tests + 100% gate on the listed pure modules
FALKORDB_SMOKE=1 npm run test:smoke   # needs `docker run -d -p 6379:6379 falkordb/falkordb`
npm run test:e2e          # Playwright; needs a running build + FalkorDB (see README "Testing")
npm run generate:grammar  # regenerate the parser from lib/falkordb-cypher/generated/.grammar-src/Cypher.g4
```

Desktop / mobile: `cd desktop && npm test` / `cd mobile && npm test` (also `npm run lint`).
Before opening a PR run at least `npm run lint`, `npx tsc --noEmit` and `npm run test:coverage`.

## Testing and coverage — the bar is ≥ 95%

CI measures coverage over **every source file** (`app/`, `lib/`, `components/`, `auth.ts`,
`proxy.ts`, desktop and mobile shells; not tests, `.d.ts` or `lib/falkordb-cypher/generated/`)
across unit, smoke, e2e, desktop and mobile tests, merged by Codecov. Branch protection
requires **95%** for the whole codebase (`coverage/project`) **and** for the lines a PR
changes (`coverage/patch`). Details: README "Testing", `.github/scripts/coverage-gate.mjs`.

Rules for every change:

1. **Every behavior change ships with tests** that fail without it. Target 100% of the
   lines you touch; never let the patch drop below 95%. Do not game coverage (no assertion-free
   tests, no `/* c8 ignore */`/`istanbul ignore` to dodge real logic).
2. **Put logic where it is testable.** Extract decisions out of `.tsx` components and
   `providers.tsx` into framework-free modules in `lib/` (or `app/**/<name>.ts`) and unit-test
   them with `node:test` + `node:assert/strict`. Components themselves are covered by Playwright.
3. **New pure module → add it to the 100% gate**: append a
   `--test-coverage-include="<path>"` to `test:coverage` in `package.json` (as the existing
   modules do) once it reaches 100% lines/branches/functions.
4. **Unit tests** live next to the source as `<name>.test.ts`; relative imports of TS files
   include the `.ts` extension (`import { x } from "./graphTabs.ts"`) because `node --test`
   runs the TS directly. Use `describe/it` or `test`, `mock` from `node:test`; no extra test
   framework. Files must not import anything that needs the bundler (`@/` aliases, CSS, `next/*`)
   unless the existing tests show how it is handled.
5. **Server-behavior against a real FalkorDB** → `<name>.smoke.ts`, gated by `FALKORDB_SMOKE=1`.
6. **UI flows** → Playwright specs in `e2e/tests/` using page objects from `e2e/logic/POM/`.
   Specs that use the `page`/`context`/`browser` fixtures import `test` from
   `e2e/infra/coverage.ts` so Chromium coverage is recorded. Playwright runs `fullyParallel`
   in Chromium **and** Firefox, so tests sharing a fixed graph name need unique names or
   serialization. Coerce Cypher counts with `Number()` before exact comparisons.
7. Run the relevant tests and lint locally and report the results; do not claim a fix is
   verified without running them.
8. **Zero dangling tests.** Never leave a test failing, flaky, hanging, skipped (`skip`, `only`,
   `fixme`, `test.skip`), commented out or retried into passing. Find the root cause and fix it,
   whether the bug is in the test or the code, even if it looks unrelated to your change or
   fails only in CI. Never "fix" it by deleting it, loosening its assertions, adding sleeps or
   raising retries/timeouts. A flaky test counts as failing: reproduce it (run it repeatedly,
   e.g. `npx playwright test <file> --repeat-each=10`), then fix it. If it truly cannot be fixed
   in the PR, stop and ask the user; do not park it.

## Code conventions

- **Be a pedantic developer.** When you notice something wrong or sloppy that you can fix, fix
  it now instead of leaving it: a typo, a stale or wrong comment or doc, a broken link, a lint or
  type warning, dead or duplicated code, an unclear name, a missing test or doc for what you
  touch, an inconsistency with sibling code. Check your own diff the same way before pushing.
  Pedantry has limits: keep unrelated fixes small and in their own commit; if one is large or
  risky, say so and ask or open an issue instead of silently skipping it or growing the PR.

- TypeScript strict; no `any` without a reason. 4-space indentation in most existing files —
  match the file you are editing. Code that unit tests import directly uses relative `.ts` imports;
  bundler-only code (components, routes) uses the `@/` alias.
- **Concise, efficient, clear.** Prefer the smallest change that fully solves the problem:
  reuse existing helpers, delete dead code you replace, no speculative abstractions, flags or
  options, no duplicated logic. Names say what things are; early returns over deep nesting.
  Avoid needless work (redundant renders/fetches/effects, repeated O(n²) scans, unbounded
  caches or listeners; memoize only where it measurably helps). Do not reformat or refactor
  unrelated code.
- Comment only what needs clarification (why, not what).
- Follow existing patterns before inventing new ones; reuse helpers in `lib/utils.ts`,
  `app/api/utils.ts`, `app/api/validate-body.ts`.
- Conventional-commit PR titles / commit messages: `feat:`, `fix:`, `docs:`, `refactor:`,
  `test:`, `chore:`, `ci:` (optionally scoped, e.g. `fix(navigation): …`).

### API routes (`app/api/**`)

- Obtain the connection with `getClient(request)`; if it returns a `NextResponse`, return it.
  Wrap handlers in try/catch, log with `console.error`, return JSON errors with correct status
  codes and `getCorsHeaders(request)` headers; export `OPTIONS = corsPreflight` where siblings do.
- Validate input with `validate-body.ts` / zod; never build Cypher by string-concatenating
  user input (see `e2e/tests/cypherInjection.spec.ts`).
- Honor read-only users (`resolveReadOnly`) the way the route's siblings do: most mutating graph
  routes return 403 **before** running any query; some (e.g. `POST app/api/graph/[graph]/route.ts`)
  run the work through `roQuery` / `runQuery(…, isReadOnly)` instead. Do not switch one to the other.
- Browser requests carry `X-Connection-Id` so `getClient` pins the intended connection;
  `getClient` validates an identified connection against an active token record and fails closed. The one
  exception is the legacy session fallback (no connection ID, Token DB lookup failed), which can still return a
  client without such a record; do not rely on the guarantee there.
- **Changing an endpoint's shape updates `app/api/swagger/swagger-spec.ts`** (served at `/docs`); the **API docs** CI check fails a PR that changes a `route.ts` without it (add the `no-api-docs` label only when the contract is unchanged).
- Keep `falkordb` (server-only, BigInt) and `@falkordb/text-to-cypher` (native binaries) in
  `serverExternalPackages` in `next.config.js`; never import them from client code.

### Client code

- `securedFetch` (`lib/utils.ts`) **resolves** on HTTP errors — always check `response.ok`.
- Async effects in `app/providers.tsx` need a `cancelled` guard + cleanup. React StrictMode is on:
  effects must tolerate setup → cleanup → setup.
- Stale-result protection (connection / graph / query ownership tokens, connection epoch) is
  specified in `docs/design/idea-6-connection-epoch-pinning-plan.md`; capture ownership at
  operation start and re-check before every state write.
- Per-connection `localStorage` keys must go through `lib/connection-storage.ts`
  (`buildConnectionPrefix`); never hand-build the prefix.
- Responsive breakpoint is 1100px: CSS `mobile:` variant and `useIsMobile` share it.
- Cypher editor/error features: `lib/cypherErrors.ts` (hint catalog) is paired with
  `lib/cypherErrorDriftCases.ts`; adding a catalog entry requires a drift case, a unit test
  and a passing `npm run test:smoke`.

### Security

Never commit secrets, real credentials or `.env*.local`. Do not log connection passwords,
tokens or API keys. Chat API keys are stored encrypted under the active connection's prefix
(`lib/chat-api-key-storage.ts`). The CSP and rate limiting live in `proxy.ts`; changes there
need tests (`lib/rateLimitKey.test.ts` pattern) and a README/Helm note if they add config.

## Documentation — keep it current (part of "done")

A change is not done until the docs that describe it are updated **in the same PR**:

| If you change… | Update… |
| --- | --- |
| User-visible behavior or a feature | `README.md` and, for features, `readme-browser.md` (the feature overview) |
| An API route's request/response | `app/api/swagger/swagger-spec.ts` (`.github/workflows/swagger-check.yml` fails a `route.ts(x)` change without it; contract changes made only in helpers such as `validate-body.ts` are not caught) |
| Env vars / config | `.env.local.template`, `README.md`, `helm/falkordb-browser/values.yaml` + its `README.md`, and the Helm templates if the value must reach the pod |
| The Cypher grammar | `lib/falkordb-cypher/generated/.grammar-src/Cypher.g4`, run `npm run generate:grammar`, commit the artifacts |
| Desktop / mobile shell | `desktop/README.md` / `mobile/README.md` |
| Test/coverage tooling or the gate | `README.md` "Testing", this file, `codecov.yml` comments |
| Architecture, state ownership, data flow, a non-trivial new subsystem | the matching doc in `docs/design/` (or a new one) |
| Any rule in this file | this file (`CLAUDE.md` imports it, so nothing else to sync) |

### Design docs (`docs/design/`)

Non-trivial features start with a short plan: goal, problem today, mechanism (with real file
references), test plan, risks/deferred items — see `docs/design/README.md`. When code diverges
from its plan, **edit the plan** (do not leave it describing a design that no longer exists);
when a plan's work ships, say so at its top. Line numbers in plans are approximate — prefer
symbol names.

## Branches and PRs

Feature work targets `staging`; `main` is release. Dependabot PRs target `staging`. CI
workflows pin actions by commit SHA — keep that when editing `.github/workflows/` (the one exception is
`release-notes.yml`, which calls FalkorDB's shared reusable workflow at `@main` on purpose).

### A PR is ready only when

1. CI is green, including `coverage/project` and `coverage/patch` (≥ 95%) and build, with
   **no dangling tests**: none failing, flaky, skipped or retried into passing (rule 8 above).
2. **Every AI review comment is resolved and answered** (CodeRabbit, Copilot code review,
   Codecov, etc. — see `.coderabbit.yaml`). For each thread either fix it and reply with what
   changed (commit SHA), or reply with a concrete reason it does not apply; then resolve the
   thread. Never resolve silently, never dismiss without an answer, and re-check for new
   comments after every push, since each push can trigger a fresh review round.
   Verify a suggestion before applying it — AI reviewers are sometimes wrong; do not
   blindly add code that makes the change bigger or less clear.
3. **At least 3 AI review rounds are done.** A round is: a batch of AI review comments arrives,
   you fix or answer every thread, push, and the reviewers re-review the new commit. Do not
   declare the PR ready after fewer than 3 rounds. If the reviewers go quiet earlier, say so
   and ask the user rather than declaring it ready.
4. **A superpowers code review of the full PR diff is done.** Use the
   [superpowers](https://github.com/obra/superpowers) `requesting-code-review` skill: dispatch a
   reviewer subagent on `git merge-base origin/staging HEAD`..`HEAD`. Then handle the findings
   with `receiving-code-review`: verify each against the code, fix every Critical and Important
   one (or answer with a concrete reason it does not apply), and re-run the review if the fixes
   are non-trivial. Summarize the verdict and what you changed in the PR. If your agent cannot
   load the superpowers skills, say so and ask the user; do not skip this step silently.
5. **In the last round, watch CI to the end.** After the final push, wait for every check to
   finish (`gh pr checks <PR> --watch`) and confirm they all pass, then re-check the threads one
   more time: a late review or a red check starts another round.
6. Human review requests are addressed the same way.
7. The PR template checklist is complete (tests, docs, design docs, superpowers review).

List review threads (act on those with `isResolved: false`) with:
`gh api graphql -f query='query($o:String!,$r:String!,$n:Int!){repository(owner:$o,name:$r){pullRequest(number:$n){reviewThreads(first:100){nodes{id isResolved comments(first:1){nodes{databaseId author{login} body path}}}}}}}' -f o=FalkorDB -f r=falkordb-browser -F n=<PR>`
(Reply with `gh api repos/FalkorDB/falkordb-browser/pulls/<PR>/comments/<databaseId>/replies -f body=…`,
using the first comment's `databaseId`; resolve with the `resolveReviewThread` GraphQL mutation
and the thread `id`.)

## When unsure

Ask rather than guess on: auth/connection handling, persistence formats (localStorage keys,
token storage), anything that changes a public endpoint, and Helm/Docker defaults.
