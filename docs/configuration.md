# Configuration and operations

How to run FalkorDB Browser in production: public URLs, authentication, sessions, token storage, preconfigured connections and CSV import storage. Every environment variable is listed in [`.env.local.template`](../.env.local.template); Kubernetes users set the same values through the [Helm chart](../helm/falkordb-browser/README.md).

## Authentication secret

> Note: the image ships no default `AUTH_SECRET`. If you do not supply one, a
> random secret is generated per container, which means every session is
> invalidated when the container is recreated. For anything long-lived, set your
> own: `-e AUTH_SECRET="$(openssl rand -hex 32)"`.
>
> Supplying one is mandatory, not merely advisable, when more than one container
> serves the same site: each generates its own signing key, so a session minted
> by one replica is rejected by every other. Give all replicas the same
> `AUTH_SECRET`.

## Public URL and reverse proxies

> Note: to run the application with a different URL, set the NEXTAUTH_URL environment variable.

```
docker run -p 3000:3000 -e "NEXTAUTH_URL=https://www.yoururl.com" -p 6379:6379 -it --rm falkordb/falkordb:latest
```

For reverse-proxy deployments using `NEXTAUTH_URL=auto`, set `TRUST_PROXY_HEADERS=true` only when the proxy strips or overwrites incoming `X-Forwarded-Host` and `X-Forwarded-Proto` headers.

## Trusted origins

Browser requests that send an `Origin` header are accepted only from a trusted
origin: the configured `AUTH_URL` / `NEXTAUTH_URL` origin (unless `auto`), any
origin listed in the comma-separated `ALLOWED_ORIGINS`, and, while
`ALLOWED_ORIGINS` is unset, the request's own origin (so `localhost`,
`127.0.0.1` and LAN addresses keep working). `Origin: null`, non-http(s) and
malformed origins are always rejected. Other cross-origin callers (including
other localhost ports) must be listed in `ALLOWED_ORIGINS`; this is a
caller-origin list, not an API-host allowlist. Behind a proxy that rewrites the
`Host` header, set `AUTH_URL` / `NEXTAUTH_URL` to the public URL, or use `auto`
with `TRUST_PROXY_HEADERS=true` as above. Cookie-authenticated `POST`, `PUT`,
`PATCH` and `DELETE` requests without an `Origin` header are accepted only from
the same origin (`Sec-Fetch-Site: same-origin`); scripts should authenticate
with a personal access token (`Authorization: Bearer …`) instead of a session
cookie. Origin-less API reads remain supported. Protected reads still require
authentication; public endpoints remain public. The allowlist is not a
trusted-host list or a replacement for authorization.

## TLS connections

For TLS connections, upload a CA certificate and, if required, a client certificate
and key on the login form. Opening any file chooser clears the previous error, and
selecting a new file replaces an earlier unfinished upload for that input. Log in
stays disabled while files are being read; turning TLS off (the checkbox or a `falkor://` URL) discards uploads.

## Login and sessions

URL login uses the authentication attempt itself to detect missing or invalid
credentials and reveal the credential fields when needed. Connection failures
show a separate error; no preliminary database probe is made. The former
`/api/validate-url` endpoint and its `URL_VALIDATION_ALLOWED_DATABASES` setting
have been removed. Normal login still accepts user-supplied database addresses,
so deployments should restrict outbound network access as appropriate.

Session connections must have an active stored connection record. Removing the
last connection requires a fresh login; old sessions without a connection ID
must also sign in again instead of reconnecting from cookie fields.
The compatibility session-migration endpoint only returns an existing usable
active connection; it never reconstructs missing records or opens a client to
the user's database. Reading the record may open a token-store database client.
The UI signs out when no stored connections remain.

Legacy browser-storage migration leaves connection-shaped keys untouched rather
than guessing ownership, including hostnames beginning with `chat-` or another
legacy prefix. Desktop secret regeneration atomically replaces the secrets file
inside an owner-only directory, flushing the temporary file before renaming it
and flushing the parent directory afterward on POSIX. Windows sharing failures
are retried a bounded number of times without a non-atomic fallback.
Ambiguous legacy graph keys that could belong to another connection are left
untouched rather than copied across scopes; this can require manual recovery.

## Users and roles

Replacing a user's role also clears existing ACL selectors, so selectors cannot
retain permissions outside the replacement role and key patterns.

## Token storage

File-backed token storage uses atomic publication (including the initial empty
snapshot), atomic replacements, and an exclusive
`<token-file>.lock` directory (the full configured token path with `.lock`
appended; by default `.data/api_tokens.json.lock`) to serialize
writers. A writer waits up to 10 seconds for the lock, then fails explicitly.
Each acquisition is published atomically together with its own uniquely named
holder record, and a writer only ever removes the lock instance it observed, so
a delayed writer or a recovering one never removes another writer's lock. A lock
at least 30 seconds old whose holder process is gone on the same host is
recovered automatically. A lock whose holder cannot be checked (held from
another host, or with a missing or malformed holder record) is recovered once it
is 5 minutes old, far longer than any write holds it; a holder record that
cannot be read (for example, permission denied) keeps the lock and fails the
write. If releasing the lock fails, the same process retries the release before
its next write. Stop **all** writers before removing a lock by hand. Use FalkorDB-backed
token storage for distributed deployments rather than sharing files across
machines.

`API_TOKEN_FALKORDB_URL` accepts `falkor://`, the legacy `falkordb://` alias,
`redis://`, and the TLS schemes `falkors://` / `rediss://`. Only database 0 is
supported; query strings and fragments are rejected. For a private/self-signed
token-database certificate, mount the issuing CA PEM and set
`NODE_EXTRA_CA_CERTS=/path/to/ca.pem` **before starting Node**. This extends trust
for the token store and other Node TLS connections without disabling certificate
or hostname verification.

Redis URL schemes default to port 6379; the FalkorDB URL aliases and legacy
`PAT_FALKORDB_*` fallback retain their existing port 6380 default.

## Start already connected (preconfigured connection)

For GitOps-style deployments the connection can be baked into the environment,
so the browser opens straight onto the graph list instead of the login form:

```bash
docker run -p 3000:3000 --rm \
  -e FALKORDB_CONNECTION_URL=falkor://default:password@falkordb:6379 \
  falkordb/falkordb-browser:latest
```

or with discrete fields instead of a URL:

```bash
docker run -p 3000:3000 --rm \
  -e FALKORDB_HOST=falkordb \
  -e FALKORDB_PORT=6379 \
  -e FALKORDB_USERNAME=default \
  -e FALKORDB_PASSWORD=password \
  falkordb/falkordb-browser:latest
```

| Variable | Description | Default |
| --- | --- | --- |
| `FALKORDB_CONNECTION_URL` | `falkor://`, `falkors://`, `redis://` or `rediss://` URL; the `s` variants imply TLS | `""` |
| `FALKORDB_HOST` | Hostname. Required unless the URL is set | `""` |
| `FALKORDB_PORT` | Port | `6379` |
| `FALKORDB_USERNAME` | Username | `default` |
| `FALKORDB_PASSWORD` | Password | `""` |
| `FALKORDB_TLS` | `true`/`false`; overrides the URL scheme | from the URL |
| `FALKORDB_CA` | Base64-encoded CA certificate | `""` |
| `FALKORDB_AUTO_CONNECT` | Sign in automatically on load. `false` only prefills the login form | `true` |

Notes:

- The discrete fields override the URL field by field. An **empty**
  `FALKORDB_PASSWORD` also overrides it, so omit the variable entirely to keep
  the password from `FALKORDB_CONNECTION_URL`.
- The URL carries a host, a port and credentials and nothing else. A database
  selector other than `/0`, or any query string, is rejected at startup rather
  than dropped — the browser only ever talks to database 0.
- The password never reaches the browser: the client only asks to log in with
  "the preconfigured connection" and the server substitutes the credentials.
- `FALKORDB_AUTO_CONNECT=false` is enforced server-side, not just in the UI: the
  server refuses to substitute the credentials at all, so the prefilled form
  needs a password the user knows.
- Signing out explicitly returns to the login form and stays there; only a
  reload after an expired session reconnects automatically.
- **Security:** with `FALKORDB_AUTO_CONNECT=true`, anyone who can reach the
  browser reaches the database with these credentials. Enable it only where the
  browser itself is access-controlled, and prefer a read-only FalkorDB user.
  The server logs a warning on first use when auto-connect is on with a
  password, and limits these sign-ins to `PRECONFIGURED_SIGN_IN_MAX_REQUESTS`
  per minute per client IP (default `10`, `0` disables).
- The client IP is read from `X-Forwarded-For`, `TRUSTED_PROXY_HOPS` entries
  from the right (default `1`, one reverse proxy), because the entries further
  left are whatever the client sent. Set it to the number of proxies that
  append to the header; a browser exposed with no proxy in front cannot tell a
  spoofed address from a real one.
- The limiter keeps its counts in memory, so the budget is per instance: with
  several replicas a client gets each budget once per replica.

The Helm chart exposes the same settings under `connection.*` — see
[Deploy to Kubernetes with Helm](../README.md#deploy-to-kubernetes-with-helm).

## Browser-only Docker image

If you run the browser separately from FalkorDB, use the browser image and set
the same CSV temp defaults used by compose:

```bash
docker run -p 3000:3000 --rm \
  -e CSV_STORAGE=local \
  -e CSV_LOCAL_TEMP_DIR=/var/lib/FalkorDB/import \
  -e CSV_LOCAL_LOAD_URI_MODE=file \
  -v falkordb-import:/var/lib/FalkorDB/import \
  falkordb/falkordb-browser:latest
```

When FalkorDB runs in a different container, mount the same `falkordb-import`
volume to `/var/lib/FalkorDB/import` there as well and configure
`IMPORT_FOLDER /var/lib/FalkorDB/import` on the DB side.

## CSV import storage

HTTP CSV header validation inspects and retains at most 8 KiB, then cancels the
response. A stream chunk and the underlying network transfer may exceed 8 KiB
when storage ignores Range. The optional precheck has a 10-second deadline.
If Next.js cannot fetch the URL, it logs an unavailable precheck and lets
FalkorDB perform the authoritative fetch: the URL may target a network reachable
only by the database. A successfully inspected empty/binary header still rejects
the import; database fetch/query failures remain explicit import errors.
File-URI imports remain validated during upload.

### Use MinIO for CSV temp uploads (S3-compatible)

The CSV upload flow supports any S3-compatible backend, including MinIO. This
repo includes a local MinIO stack in [docker-compose.minio.yml](../docker-compose.minio.yml)
for exercising the **S3 storage provider** (streaming multipart upload + presigned
GET).

> **⚠️ `LOAD CSV` needs HTTPS.** FalkorDB fetches the CSV itself and only accepts
> `https://` or `file://` URIs — plain `http://` is rejected ("Unsupported URI").
> A plain‑http MinIO endpoint (`http://localhost:9000`) works for the browser→store
> upload, but the presigned URL handed to FalkorDB is `http://…`, so the import
> fails fast with a clear error. For a full end‑to‑end `LOAD CSV`, either:
> - point at an **HTTPS‑reachable** object store — real **S3 / Cloudflare R2**, or
>   MinIO behind a TLS proxy (set `S3_ENDPOINT=https://…`), or
> - use the **local** backend for local dev — `CSV_STORAGE=local` with
>   `CSV_LOCAL_LOAD_URI_MODE=file` and a shared `IMPORT_FOLDER` (see [Browser-only Docker image](#browser-only-docker-image)); no
>   HTTPS needed.

1. Start MinIO and create the private CSV temp bucket:

  ```bash
  docker compose -f docker-compose.minio.yml up -d
  ```

2. Set these values in `.env.local` (the endpoint is how the **browser server**
   reaches MinIO; for `LOAD CSV` to succeed it must resolve to an HTTPS URL the
   **database** can reach):

  ```env
  CSV_STORAGE=s3
  S3_ACCESS_KEY_ID=minioadmin
  S3_SECRET_ACCESS_KEY=minioadmin
  S3_REGION=us-east-1
  S3_BUCKET=falkordb-csv-temp
  S3_ENDPOINT=https://minio.example.com   # must be HTTPS-reachable by FalkorDB
  S3_FORCE_PATH_STYLE=true
  S3_KEY_PREFIX=csv-temp/
  S3_URL_EXPIRES_IN=3600
  ```

3. Restart the browser server and upload CSV from Manage Graph -> Upload Data.

Notes:
- Keep the bucket private (default in the init container).
- Signed URLs are generated automatically for LOAD CSV and must be HTTPS-reachable by FalkorDB.
- For local non-TLS MinIO (`http://localhost:9000`), prefer `CSV_STORAGE=local` with `CSV_LOCAL_LOAD_URI_MODE=file`.
- MinIO console is available at `http://localhost:9001` (user/password: `minioadmin`/`minioadmin`).

## Query execution

Aborting a graph-query request stops its SSE output, but does not cancel an
already-running database query: the current driver has no per-query cancellation
API. Existing query timeouts still apply; shared database connections are not
closed to cancel an individual request.

Query-stream infrastructure failures return a generic server-error message;
raw backend details remain in server logs. Query/input errors retain their
actionable messages.

Schema-discovery placement limits, timeouts, and limit-reached UI behavior are
tracked separately in [#2228](https://github.com/FalkorDB/falkordb-browser/issues/2228);
no schema limit or sampling change is introduced here.
