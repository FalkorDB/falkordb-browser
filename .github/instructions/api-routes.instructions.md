---
applyTo: "app/api/route.{ts,tsx},app/api/**/route.{ts,tsx}"
---

# API route handlers

- Handlers that touch FalkorDB: `const session = await getClient(request); if (session instanceof NextResponse) return session;`.
  Connection-management and auth routes use `getSessionFromRequest` instead; public routes
  (releases, app links, swagger) need neither.
- try/catch every handler and `console.error` the cause. Return JSON errors as
  `NextResponse.json({ error }, { status, headers: getCorsHeaders(request) })` (the dominant shape;
  match the sibling routes if they differ) with an accurate status (400 bad input, 401/403 auth,
  404, 500 unexpected). Never leak stack traces or credentials.
- Streaming (SSE) handlers keep the SSE error format (`writeGetClientErrorAsSSE`, `runQuery`);
  do not switch them to JSON.
- Validate bodies and params (`validate-body.ts`, zod). Pass literal user values to Cypher as parameters; identifiers (labels, property keys) cannot be parameters, so validate them and use `quoteCypherIdentifier`.
- Mutations reject read-only users with 403 before any query runs (`resolveReadOnly(request, session.user.role)` from `app/api/utils.ts`).
- Update `app/api/swagger/swagger-spec.ts` when the contract changes.
- Put reusable logic in a sibling `.ts` helper with a `.test.ts` (routes themselves are covered
  by Playwright API tests in `e2e/`); add an e2e API test for each new route or status code.
