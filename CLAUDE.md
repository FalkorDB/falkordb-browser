@.github/copilot-instructions.md

# Claude Code specifics

The imported file above is the shared source of truth for all agents. Do not copy its rules
here; add only what is specific to Claude Code.

- Prefer the dedicated search/read/edit tools over shell one-liners; report the real output of
  the checks you run.
- For a single file, `node --test path/to/file.test.ts` is the fastest loop; run
  `npm run test:coverage` before finishing to confirm the listed pure modules still meet their
  100% gate (the PR bar is ≥ 95%).
- Before declaring a PR ready, follow "A PR is ready only when" in the imported file.
- Path-specific rules live in `.github/instructions/*.instructions.md`; read the one matching
  the files you are editing (tests, API routes, e2e).
