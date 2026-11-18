# Upgrading / breaking changes

This release hardens query and token handling. Check these before upgrading:

- **`GET /api/graph/{graph}` always runs read-only.** Send writes (`CREATE`,
  `MERGE`, …) with `POST /api/graph/{graph}` and a JSON body
  (`{"query": "…"}`).
- **Profiling moved to `POST /api/graph/{graph}/profile` with a JSON body.**
  `GET` returns 405, a non-JSON body 415, and read-only users get 403.
- **Admins list and revoke only the tokens of their own FalkorDB host:port.**
  Manage tokens issued for another endpoint by signing in to that endpoint.
- **`API_TOKEN_FALKORDB_URL` is parsed strictly.** `redis://` / `rediss://`
  URLs without a port use 6379; an invalid URL, a database other than 0, a query
  string or a fragment now throws instead of falling back to `PAT_FALKORDB_*`.
  Since every session is validated against token storage, fix the value before
  upgrading or logins fail.
- **Cookie-authenticated scripts must send a trusted `Origin`** for unsafe
  methods (see [Trusted origins](configuration.md#trusted-origins)). Use a personal access token
  (`Authorization: Bearer …`) for scripts instead.
- **Sessions need their stored connection record.** With file token storage (the
  default when neither `API_TOKEN_FALKORDB_URL` nor `PAT_FALKORDB_HOST` is set), a
  non-persistent `API_TOKEN_STORAGE_PATH` (e.g. `docker run` without a volume or Helm
  without `persistence.enabled`) makes users log in again after every restart. Sessions created before connection IDs existed
  must log in once.
