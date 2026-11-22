# Password Reauthentication Handoff Design

## Intent

After an administrator changes their own database password, require a fresh sign-in while preserving the database connection details already stored for the current session. The user should only need to enter the new password, including when the connection uses custom TLS material.

## Goals and constraints

- Preserve the current endpoint and TLS configuration across sign-out without asking the user to upload files again.
- Keep CA certificates, client certificates, private keys, and passwords out of URLs and browser-readable state.
- Keep the TLS handoff server-side, short-lived, bound to the exact endpoint, and unusable as a substitute for the new password.
- Remove the handoff after successful sign-in; allow retry until expiry if sign-in fails.
- Report ACL persistence as `saved`, confirmed `failed`, or `unknown`; a transport failure cannot prove whether Redis wrote the ACL file.
- Do not widen unauthenticated preconfigured-connection lookup or alter other-user password changes.

## Approaches

1. **Server-side handoff with an HttpOnly reference cookie (selected).** The authenticated PATCH response copies the active connection's TLS material to a short-lived Token DB record and sets a short-lived HttpOnly cookie containing only an unpredictable record ID. The credentials provider consumes it only when the submitted endpoint matches, then deletes the record and cookie after successful sign-in. This reuses the already server-stored connection data without placing TLS material in the URL or JavaScript state.
2. **Ask the user to reattach TLS files.** Simpler server flow, but does not preserve the existing connection and makes reauthentication fail when the original files are unavailable.

## Design

The password-update route returns only non-secret connection fields and a three-state ACL save result. It creates a five-minute Token DB handoff record by copying the active connection's CA and client certificate and retaining the encrypted private key. The record is not a connection record, so normal sign-out cleanup removes the active session connections but leaves this temporary handoff. A random record ID is sent in an HttpOnly, SameSite=Lax cookie scoped to `/api/auth` and marked Secure for HTTPS. The existing login form uses query parameters to prefill the host, port, username, and TLS toggle; the user enters only the new password. Credentials sign-in looks up the cookie ID server-side, checks record activity, expiry, username, host, port, and TLS mode against the submitted credentials, and uses the stored TLS material only on an exact match. Delete the record and expire the cookie after successful authentication; failed sign-in may retry until expiry. Never expose TLS material or the ID to JavaScript or put either in the URL.

Treat Redis `ErrorReply` as a confirmed ACL-save failure. Other rejections are `unknown` because the command may have completed before transport failed. Use distinct login warnings for these outcomes and make the UI and API documentation match.

## Non-goals

- Changing session storage formats, general sign-out behavior, or preconfigured connection lookup.
- Persisting newly supplied credentials or extending existing session lifetime.
- Reusing the old database password during sign-in.

## Verification

Add focused unit tests for ACL result classification and handoff matching/expiry, plus Playwright coverage proving that the existing login form is prefilled, only the new password is entered, TLS material and handoff ID are not exposed to browser state or URLs, and the server reuses the stored TLS material. Cover successful and failed ACL saves and unknown transport outcomes.
