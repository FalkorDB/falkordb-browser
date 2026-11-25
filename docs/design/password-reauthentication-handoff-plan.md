# Password reauthentication after self password changes

> Implementation complete in PR #2337.

## Goal

After a user changes their own FalkorDB password, require a fresh sign-in while preserving the saved endpoint and TLS configuration. The user enters the new password; secrets must not be copied into URLs or browser-readable connection state.

## Problem today

The password change invalidates the password in the saved connection. A normal sign-out would also lose the endpoint and any uploaded TLS configuration, while an ACL persistence error cannot establish whether the file was already replaced.

## Mechanism

The self-password PATCH route rejects the literal `"undefined"` password sentinel, updates the ACL, and reports persistence as `saved`, `failed`, or `unknown`. It deletes the old credential record and closes the cached client after the change. Because a Redis error may follow a successful file rename, errors are treated as an unknown outcome and the UI does not claim the password is only in memory.

For reauthentication, the route stores the active connection's TLS material in a five-minute server-side handoff record and returns only its opaque reference in an HttpOnly cookie. The login URL carries only endpoint fields. Credentials authorization applies the handoff only on an exact host, port, username, and TLS match, and consumes it only after successful authentication; failed sign-in retains it for retry.

Newly supplied TLS files take precedence over the handoff: a CA can be replaced independently, while the client certificate and key must be supplied together. If neither member of the pair is supplied, the saved pair is reused.

Password-change notices live in one-time `sessionStorage`, not query parameters. If automatic sign-out fails, a validated local `/login` target preserves the endpoint for manual logout or deferred session invalidation. An in-memory copy retains the target when session storage is unavailable, until confirmed sign-out or a page reload. Sign-out confirmation compares the callback path and query, then navigates to the local target so a differing configured auth origin does not cause a false failure.

## Approaches

- **Server-side handoff with an HttpOnly reference cookie (chosen):** reuses stored TLS material without exposing it to the browser or URL.
- **Ask the user to upload TLS material again:** simpler, but loses the existing connection setup and can block reauthentication when the files are unavailable.

## Tests

Unit tests cover password validation, ACL result classification, endpoint matching, handoff consumption, notice storage, and callback URL handling. Playwright covers the password-change flow, ACL persistence through a dedicated ACL-file fixture on port 6381, retry behavior, stale-client closure, and manual logout. The fixture restores and persists its passwordless default user in cleanup.

## Risks and deferred

- ACL SAVE errors remain `unknown` unless the server can prove persistence failed.
- Expired handoff records remain unusable after five minutes and are cleaned up opportunistically; no background scheduler is added.
- Passwords, TLS data, and handoff references must remain out of URLs and JavaScript-visible state.
