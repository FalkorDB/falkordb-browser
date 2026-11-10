@.github/copilot-instructions.md

# Claude Code specifics

The imported file above is the shared source of truth for all agents. Do not copy its rules
here; add only what is specific to Claude Code.

- Prefer the dedicated search/read/edit tools over shell one-liners; run `npm run lint`,
  `npx tsc --noEmit` and the relevant `node --test <file>` after edits, and report the real output.
- For a single file, `node --test path/to/file.test.ts` is the fastest loop; use
  `npm run test:coverage` before finishing to confirm the 100% gate still holds.
- Before declaring a PR ready, list its review threads with the `gh` command in
  "A PR is ready only when" and confirm none are unresolved or unanswered.
- Path-specific rules live in `.github/instructions/*.instructions.md`; read the one matching
  the files you are editing (tests, API routes, e2e).
