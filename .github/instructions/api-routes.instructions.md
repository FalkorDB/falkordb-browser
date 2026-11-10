---
applyTo: "app/api/**/*.{ts,tsx}"
---

# API route handlers

- `const session = await getClient(request); if (session instanceof NextResponse) return session;`
- try/catch every handler; `console.error` the cause; return `NextResponse.json({ message }, { status, headers: getCorsHeaders(request) })`
  with an accurate status (400 bad input, 401/403 auth, 404, 500 unexpected). Never leak stack
  traces or credentials.
- Validate bodies and params (`validate-body.ts`, zod). Pass user values to Cypher as parameters.
- Mutations reject read-only users with 403 before any query runs.
- Update `app/api/swagger/swagger-spec.ts` when the contract changes.
- Put reusable logic in a sibling `.ts` helper with a `.test.ts` (routes themselves are covered
  by Playwright API tests in `e2e/`); add an e2e API test for each new route or status code.
