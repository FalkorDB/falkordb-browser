# One-time password reauthentication

When users change their own FalkorDB password, the saved connection record containing the old password must be removed immediately after the password change succeeds. They then return to the same endpoint and sign in with the **new** password. A separate five-minute handoff preserves connection/TLS material, not the password; it stays available after an incorrect password so the user can retry.

## Design

After `ACL SETUSER` succeeds, delete the prior connection record. If storage deletion throws, log the error without changing the already-successful password-change response. Authenticate the new password first, then atomically delete the handoff before returning the user to NextAuth. Only the request that successfully deletes it may sign in. Invalid passwords leave it available for retry. Handoff deletion failure aborts sign-in and cleans up the new connection and connection record. The route still clears the browser cookie after a successful callback.

Consuming before authentication was rejected because a mistyped password would burn the handoff.

Expired handoffs remain unusable after five minutes; existing opportunistic cleanup removes expired records on a later successful login. Do not add a background scheduler. The login fields, password semantics, handoff contents, endpoint matching, and behavior when changing another user's password remain unchanged.

## Verification

Test successful and concurrent handoff consumption, failed consumption cleanup, and retry after invalid credentials. In E2E, verify the prior connection is invalidated after the password changes. Keep the concurrent-callback regression; run focused tests, lint/type checks, and CI TLS/ACL tests.
