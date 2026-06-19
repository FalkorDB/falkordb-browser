
[![Dockerhub](https://img.shields.io/docker/pulls/falkordb/falkordb-browser?label=Docker)](https://hub.docker.com/r/falkordb/falkordb-browser/)
[![Discord](https://img.shields.io/discord/1146782921294884966?style=flat-square)](https://discord.gg/6M4QwDXn2w)
[![Workflow](https://github.com/FalkorDB/falkordb-browser/actions/workflows/nextjs.yml/badge.svg?branch=main)](https://github.com/FalkorDB/falkordb-browser/actions/workflows/nextjs.yml)

# FalkorDB Browser

[![Try Free](https://img.shields.io/badge/Try%20Free-FalkorDB%20Cloud-FF8101?labelColor=FDE900&style=for-the-badge&link=https://app.falkordb.cloud)](https://app.falkordb.cloud)

> 🎉 JUNE 2025 NEW UPDATE: Improved UI & Experience 

## Visualize, manipulate and manage FalkorDB graph data interactively to monitor and explore data changes. The latest version introcused the following improvements
![FalkorDB browser 06-25](https://github.com/user-attachments/assets/bc0060d0-1b55-484a-8e88-9c72b5085e55)

#### Faster Graph Creation & Querying  
Quickly create new graphs and run queries with fewer clicks. The UI now guides you through graph setup with smarter defaults and clearer feedback.

#### Simplified Node Editing  
Editing node properties is now faster and more intuitive. Fewer modal windows, inline property editing, and immediate updates make this flow significantly more usable.

#### Query History Panel  
A new history panel stores your recent queries. This makes it easier to iterate, profile, debug, or rerun past queries without leaving the editor.

#### Better Search  
The search bar now indexes schema, nodes, and metadata. Results are ranked more effectively and load with lower latency.

#### Expanded Settings & User Controls  
New options let you fine-tune database behavior, toggle visual preferences, and manage users without falling back to CLI tools.

#### Node Style Customization  
Customize the visual appearance of nodes per label. Select custom colors from a palette, adjust node sizes, and choose which property to display as the node caption. All customizations are saved per graph and persist across sessions.



| ![image (4)](https://github.com/user-attachments/assets/658fa59f-5316-475c-8bd7-b26651e9902c) | ![FalkorDB browser 06-25](https://github.com/user-attachments/assets/ee907fa6-038c-462b-9240-456a2d2c2a99) |
|---------------------------------------------------|---------------------------------------------------|


## Get Started & Demo

Access the Browser: (https://browser.falkordb.com)

### Quick start

#### Run the graph database and browser from one docker container

**Step 1:**
```
docker run -p 3000:3000 -p 6379:6379 -it --rm falkordb/falkordb:latest
```
**Step 2:**

Open [http://localhost:3000](http://localhost:3000) with your browser.

> Note: to run the application with a different URL, set the NEXTAUTH_URL environment variable.

```
docker run -p 3000:3000 -e "NEXTAUTH_URL=https://www.yoururl.com" -p 6379:6379 -it --rm falkordb/falkordb:latest
```

For reverse-proxy deployments using `NEXTAUTH_URL=auto`, set `TRUST_PROXY_HEADERS=true` only when the proxy strips or overwrites incoming `X-Forwarded-Host` and `X-Forwarded-Proto` headers.

> Note: Alternativly, you can run the browser from source and database using Docker

### Run the graph database from Docker container

```
docker run -p 6379:6379 -it --rm falkordb/falkordb:latest
```

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

### Build and run browser from source

**Prerequisites:**
- Node.js 20.19.0 or higher

**Steps:**
* Clone the git repository `git clone git@github.com:FalkorDB/falkordb-browser.git`
* Create .env.local in the clone directory `cp .env.local.template .env.local`
* Build the node project `npm -i`
* run the server `npm run dev`

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Error help

When a Cypher query fails, the browser shows the database's message together with an
actionable **💡 hint**. For a mistyped function or variable it offers a
**"Did you mean…?"** suggestion (e.g. `Unknown function 'lenght'` → *Did you mean
`length()`?*), computed from the built-in/UDF function list and the variables in your
query. The error is also surfaced **inline in the editor** as a red squiggle on the
offending token, with the hint on hover and a one-click **quick fix** to apply the
suggestion. As you type, unknown node labels that look like a typo of a known label are
flagged with a warning and a quick fix. When the static help isn't enough, a **"Fix with
AI"** button (shown only when a supported OpenAI-compatible model — OpenAI/Groq/xAI/Ollama/
LM Studio — is configured) sends the **query and its error** to your configured provider on an
explicit click and returns an explanation + a corrected query you can insert into the editor.
The full server message is always available — expand **"See more"** to read it and use **"Copy"**
for one-click copy into a bug report. Hints are currently English-only; localization is a
deliberate follow-up (it pairs with introducing stable structured error codes).
The logic lives in `lib/cypherSuggestions.ts`, `lib/cypherDiagnostics.ts`, and `lib/aiFix.ts`,
with the static hint catalog in `lib/cypherErrors.ts` and the clipboard helper in `lib/clipboard.ts`.

### Testing

* **Unit tests** (Node's built-in test runner, no extra tooling): `npm test`
  Runs the `*.test.ts` suites under `app/` and `lib/`. Gated in CI by the **Build**
  workflow.
* **Coverage**: `npm run test:coverage` — runs the unit tests and enforces **100%**
  line/branch/function coverage on `lib/cypherSuggestions.ts`, `lib/cypherDiagnostics.ts`,
  `lib/aiFix.ts`, `lib/cypherErrors.ts`, and `lib/clipboard.ts`.
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





