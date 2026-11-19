## What and why

<!-- One or two sentences. Link the issue. Use a conventional-commit title (feat:, fix:, docs:, …). -->

## Checklist

- [ ] Tests added/updated; `npm run lint`, `npx tsc --noEmit`, `npm run test:coverage` pass; patch coverage ≥ 95%
- [ ] Docs updated (README / swagger spec (enforced for API routes) / `.env.local.template` / Helm) — or not needed
- [ ] Design doc in `docs/design/` created/updated — or not needed
- [ ] Code is concise, efficient and clear (no dead code, duplication or speculative options)
- [ ] **All AI and human review threads are answered and resolved**, after at least 3 AI review rounds
- [ ] Superpowers code review (`requesting-code-review`) run on the full diff; every Critical/Important finding fixed or answered
- [ ] CI is green on the final commit (watched to the end) with zero dangling tests (none failing, flaky or newly skipped)
