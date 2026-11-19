<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/icons/Browser-dark.svg">
    <img alt="FalkorDB Browser" src="public/icons/Browser-light.svg" width="420">
  </picture>
</p>

<p align="center">
  <b>Query, visualize and manage <a href="https://falkordb.com">FalkorDB</a> graphs from your browser.</b>
</p>

<p align="center">
  <a href="https://hub.docker.com/r/falkordb/falkordb-browser/"><img alt="Docker pulls" src="https://img.shields.io/docker/pulls/falkordb/falkordb-browser?label=Docker"></a>
  <a href="https://discord.gg/6M4QwDXn2w"><img alt="Discord" src="https://img.shields.io/discord/1146782921294884966?style=flat-square"></a>
  <a href="https://github.com/FalkorDB/falkordb-browser/actions/workflows/nextjs.yml"><img alt="Build" src="https://github.com/FalkorDB/falkordb-browser/actions/workflows/nextjs.yml/badge.svg?branch=main"></a>
  <a href="https://github.com/FalkorDB/falkordb-browser/actions/workflows/playwright.yml"><img alt="Playwright Tests" src="https://github.com/FalkorDB/falkordb-browser/actions/workflows/playwright.yml/badge.svg?branch=main"></a>
  <a href="https://app.codecov.io/gh/FalkorDB/falkordb-browser/tree/main"><img alt="Coverage (main)" src="https://img.shields.io/codecov/c/github/FalkorDB/falkordb-browser/main?label=coverage%20%28main%29"></a>
  <a href="https://app.codecov.io/gh/FalkorDB/falkordb-browser/tree/staging"><img alt="Coverage (staging)" src="https://img.shields.io/codecov/c/github/FalkorDB/falkordb-browser/staging?label=coverage%20%28staging%29"></a>
</p>

<p align="center">
  <img alt="Writing a Cypher query, running it and exploring 528 nodes and 1,561 relationships in 2D and 3D" src="docs/assets/falkordb-browser-demo.gif" width="900">
</p>

<p align="center">
  <a href="https://app.falkordb.cloud"><b>Try FalkorDB Cloud</b></a> ·
  <a href="https://browser.falkordb.com">Live browser</a> ·
  <a href="#documentation">Documentation</a> ·
  <a href="https://docs.falkordb.com">FalkorDB docs</a> ·
  <a href="https://discord.gg/6M4QwDXn2w">Discord</a>
</p>

---

FalkorDB Browser is the web interface for FalkorDB. Connect to a database, write Cypher,
see the result as an interactive graph or a table, edit data in place and administer the
server, all from one place. It runs as a Docker image, on Kubernetes, as a desktop app or
behind a mobile shell.

## Highlights

- **Cypher editor.** Syntax highlighting, autocomplete, inline diagnostics with
  "Did you mean…?" quick fixes, and a searchable query history.
- **Interactive graph canvas.** Explore results in 2D or 3D, search elements, filter by label
  and relationship type, and style nodes per label (color, size, caption).
- **Tables and query plans.** Switch to a table view, and read `EXPLAIN` and `PROFILE` output
  as a tree.
- **Edit in place.** Create, edit and delete nodes and relationships from the canvas.
- **Graph management.** Create, duplicate, export and delete graphs; import CSV through
  `LOAD CSV` or run Cypher batch files.
- **AI assistance (optional).** Chat (English to Cypher), **Fix with AI** and **Optimize**, with
  OpenAI, Groq, xAI, Ollama or LM Studio models.
- **Administration.** Users and roles, database configuration, personal access tokens, and an
  OpenAPI reference served at `/docs`.
  Changing your own database user's password signs you out and prefills the database connection for sign-in with the new password.

See the [feature overview](readme-browser.md) for every page, panel and workflow.

## Quick start

Run FalkorDB and the browser in one container:

```bash
docker run -p 3000:3000 -p 6379:6379 -it --rm falkordb/falkordb:latest
```

Open [http://localhost:3000](http://localhost:3000) and connect to `localhost:6379`.

> [!IMPORTANT]
> The image ships no default `AUTH_SECRET`, so sessions end whenever the container is
> recreated. For anything long-lived, or for more than one replica, set your own:
> `-e AUTH_SECRET="$(openssl rand -hex 32)"`. See
> [Configuration and operations](docs/configuration.md) for public URLs, reverse proxies,
> TLS and token storage.

## Installation

| Option | Use it for |
| --- | --- |
| [Docker, database + browser](#quick-start) | Trying it out and local development |
| [Browser-only Docker image](docs/configuration.md#browser-only-docker-image) | Pointing the browser at an existing FalkorDB |
| [Preconfigured connection](docs/configuration.md#start-already-connected-preconfigured-connection) | GitOps deployments that open straight onto the graph list |
| [Kubernetes with Helm](#deploy-to-kubernetes-with-helm) | Production clusters |
| [Desktop app](desktop/README.md) | Electron app for macOS, Windows and Linux |
| [Mobile app](mobile/README.md) | iOS and Android shell over an AWS-hosted browser |
| [From source](#build-and-run-from-source) | Contributing |

### Deploy to Kubernetes with Helm

Deploy the FalkorDB Browser to your Kubernetes cluster using Helm:

```bash
# Install the chart
helm install falkordb-browser oci://ghcr.io/falkordb/helm-charts/falkordb-browser

# Access via port-forward
kubectl port-forward svc/falkordb-browser 3000:3000
```

Or install from source:

```bash
# Clone the repository
git clone https://github.com/FalkorDB/falkordb-browser.git
cd falkordb-browser

# Install the chart
helm install falkordb-browser ./helm/falkordb-browser

# Access via port-forward
kubectl port-forward svc/falkordb-browser 3000:3000
```

For detailed configuration options and examples, see the [Helm chart documentation](./helm/falkordb-browser/README.md).

### Build and run from source

Requires Node.js 24 or later (`engines` in `package.json`) and a FalkorDB instance, for
example `docker run -p 6379:6379 -it --rm falkordb/falkordb:latest`.

```bash
git clone https://github.com/FalkorDB/falkordb-browser.git
cd falkordb-browser
cp .env.local.template .env.local
# Set ENCRYPTION_KEY in .env.local to the output of: openssl rand -hex 32
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Screenshots

| ![Query History panel listing recent Cypher queries next to an editable query](https://github.com/user-attachments/assets/658fa59f-5316-475c-8bd7-b26651e9902c) | ![Graph canvas with a node selected and its properties open for editing](https://github.com/user-attachments/assets/ee907fa6-038c-462b-9240-456a2d2c2a99) |
|---------------------------------------------------|---------------------------------------------------|

## Documentation

| Guide | What it covers |
| --- | --- |
| [Feature overview](readme-browser.md) | Every page, panel and common workflow |
| [User guide](docs/user-guide.md) | Query limits, error help, AI optimization, tab restore, tutorial samples, access tokens |
| [Large graphs in 3D](docs/large-graphs-3d.md) | Device and GPU budgets before rendering in 3D |
| [Configuration and operations](docs/configuration.md) | Environment, reverse proxies, trusted origins, sessions, token storage, CSV import storage |
| [Upgrading](docs/upgrading.md) | Breaking changes to check before upgrading |
| [Helm chart](helm/falkordb-browser/README.md) | Every chart value, with examples |
| API reference | Swagger UI at `/docs` on any running instance |
| [Design docs](docs/design/README.md) | Implementation plans for non-trivial features |

## Contributing

Issues and pull requests are welcome. Feature work targets the `staging` branch; `main` is
the release branch. Before opening a pull request, run `npm run lint`, `npx tsc --noEmit` and
`npm run test:coverage`.

### Contributing with AI agents

Agent rules (coverage bar, docs and design-doc upkeep, PR readiness including resolving every
review thread) live in [`.github/copilot-instructions.md`](./.github/copilot-instructions.md),
shared with Claude Code through [`CLAUDE.md`](./CLAUDE.md); path-specific rules are in
`.github/instructions/`. PR readiness needs the [superpowers](https://github.com/obra/superpowers)
plugin (install commands in the instructions). Design plans are in [`docs/design/`](./docs/design/README.md).

### Testing

* **Unit tests** (Node's built-in test runner, no extra tooling): `npm test`
  Runs the `*.test.ts` suites under `app/` and `lib/`. Gated in CI by the **Build**
  workflow. These execute TypeScript directly via `node --test`, which relies on native
  type-stripping, so they need the same **Node ≥ 24** as the app (CI runs Node 24).
* **Unit coverage gate**: `npm run test:coverage` — runs the unit tests and enforces **100%**
  line/branch/function coverage on the modules it lists (`lib/cypherSuggestions.ts`,
  `lib/cypherDiagnostics.ts`, `lib/aiFix.ts`, `lib/cypherErrors.ts`, `lib/clipboard.ts`, …).
* **Codebase coverage** (the Codecov badges): measured over **every source file** — `app/`,
  `lib/`, `components/`, `auth.ts`, `proxy.ts` and the desktop and mobile shells, without
  tests, type declarations or the generated grammar — by every kind of test: unit, smoke,
  e2e (browser and server side), desktop and mobile. A file no test loads counts as 0%.
  Each CI job records raw V8 coverage and turns it into a report with
  `.github/scripts/coverage-report.mjs`, and Codecov merges the reports per commit. The
  **Coverage status** workflow is the gate: once every coverage workflow a commit triggers
  has finished, and Codecov has processed their uploads, it requires **80%** of the whole
  codebase (`coverage/project` on PRs, `coverage/project (push)` on commits pushed to `main`
  and `staging`) and of the lines a PR changes (`coverage/patch`). A coverage job whose
  tests or report fail, are skipped or are cancelled fails the gate, since its coverage is
  incomplete; failures in jobs that produce no coverage (installers,
  the security scan) do not, and a Codecov upload error never fails a test job
  (`.github/scripts/coverage-gate.mjs`). Dependabot runs only get Dependabot secrets, so
  `CODECOV_TOKEN` must also be set as a Dependabot secret for their coverage to upload.
  Manual (`workflow_dispatch`) runs do not upload: the gate does not count them, and their
  uploads, named like the PR's or push's, would stand in for one that was lost.
  Each job keeps its report as a `coverage-*` workflow artifact for 3 days.
  Locally:
  ```bash
  rm -rf coverage
  NODE_V8_COVERAGE=coverage/raw/unit npm run test:coverage
  node .github/scripts/coverage-report.mjs unit coverage/raw/unit   # coverage/unit/index.html
  ```
  For e2e coverage, build with `COVERAGE=1 npm run build`, start the server with
  `NODE_V8_COVERAGE=coverage/raw/e2e npm start`, run Playwright with
  `E2E_COVERAGE_DIR=$PWD/coverage/raw/e2e`, stop the server (it writes its coverage on
  exit), then `node .github/scripts/coverage-report.mjs e2e coverage/raw/e2e`. Pages are
  recorded in Chromium only; a spec that uses Playwright's `page`, `context` or `browser`
  fixtures imports `test` from `e2e/infra/coverage.ts` so its pages are recorded too.
  Browser-running CI jobs use `REQUIRE_BROWSER_COVERAGE=1` when generating the report:
  missing recordings or recorder errors fail collection, even when server coverage exists.
  Original script responses are captured in case Chromium loses a source during
  navigation; a source missing from both the recording and its response fails collection.
  Server-only test jobs do not require or launch a browser. The gate waits for all six
  shard uploads plus the TLS, cluster and stateless uploads, and the Docker upload
  when the workflow declares it, not just an `e2e` flag from one job.
  It waits up to 15 minutes for required uploads to appear
  and finish processing before reporting missing names. Docker is required only
  when the measured commit's workflow declares Docker coverage; reruns of older
  workflows retain their original requirements.

  Docker smoke tests still check the normal production image first. They also run against
  a separate image built with `--build-arg COVERAGE=1`; its browser and server coverage
  is uploaded as `e2e-docker`. The report uses that container's exact `.next` artifacts
  and `COVERAGE_SERVER_ROOT=/app` to translate server paths into the reporting checkout.
  Server mappings use the V8 source-map cache or the container's copied external map;
  a missing referenced server map fails reporting rather than silently dropping hits.
  The default Docker build remains optimized and does not expose browser source maps.
  Stacked PR branches can validate the same jobs with
  `gh workflow run playwright.yml --ref <branch>` before their base reaches `staging`.
* **Smoke tests vs a real FalkorDB**: `npm run test:smoke` — runs every `lib/**/*.smoke.ts`
  suite against the actual server error wording. This covers the "Did you mean…?"
  suggestions and the **error-hint drift guard**: each entry in the hint catalog
  (`lib/cypherErrors.ts`) is paired with a query in `lib/cypherErrorDriftCases.ts`, and the
  smoke test asserts the live FalkorDB message still matches — so a server-side rewording is
  caught instead of silently dropping a hint. The smoke tests are gated: they **skip** unless
  `FALKORDB_SMOKE=1`, and **fail** (rather than skipping) if that is set but no server is
  reachable. Run locally with:
  ```bash
  docker run -d -p 6379:6379 falkordb/falkordb
  FALKORDB_SMOKE=1 npm run test:smoke   # optional: FALKORDB_URL=redis://host:port
  ```
  In CI the **Build** workflow runs these against a pinned FalkorDB release (deterministic for
  PRs), while the scheduled **Cypher error drift canary** workflow runs the same tests against
  `:latest` to surface drift early without blocking pull requests.
* **Lint**: `npm run lint`
* **End-to-end tests** (Playwright): `npm run test:e2e`
  The Firefox settings project depends on the Chromium settings project because both
  mutate server-wide configuration. Selecting Firefox also runs Chromium first; do not
  bypass this dependency when both projects share a server.
  The connection manager's server-switching test also needs a second FalkorDB on port 6380
  (CI runs one as the `falkordb-pat` service): `docker run -d -p 6380:6379 falkordb/falkordb`.

## Community and support

- [Discord](https://discord.gg/6M4QwDXn2w) for questions and discussion
- [GitHub issues](https://github.com/FalkorDB/falkordb-browser/issues) for bugs and feature requests
- [FalkorDB documentation](https://docs.falkordb.com)

## License

FalkorDB Browser is licensed under the [Server Side Public License v1](LICENSE.txt).
