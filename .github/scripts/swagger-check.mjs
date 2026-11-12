// Fails a pull request that changes an API route handler without touching the
// OpenAPI spec that /docs serves (app/api/swagger/swagger-spec.ts).
//
//   BASE_SHA=<base> HEAD_SHA=<head> [SKIP=true] node .github/scripts/swagger-check.mjs
//
// SKIP=true (the `no-api-docs` label) is for changes that leave the contract
// as it is, such as a refactor or an internal fix.

import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SPEC = 'app/api/swagger/swagger-spec.ts';
const ROUTE = /^app\/api\/(?!swagger\/).+\/route\.tsx?$|^app\/api\/route\.tsx?$/;

/** The verdict for the files a pull request changed: whether it is fine and why. */
export function check(files, skip = false) {
  const routes = files.filter((f) => ROUTE.test(f));
  if (routes.length === 0) return { ok: true, message: 'No API route changed.' };
  if (files.includes(SPEC)) return { ok: true, message: `${SPEC} updated alongside ${routes.length} route(s).` };
  if (skip) return { ok: true, message: 'Skipped by the no-api-docs label.' };
  return {
    ok: false,
    message: `API route(s) changed without ${SPEC}:\n${routes.map((r) => `  ${r}`).join('\n')}\n`
      + 'Update the spec, or add the `no-api-docs` label if the contract is unchanged.',
  };
}

/** The files changed from `base` to `head`; renames count as a delete plus an add, so a moved route stays visible. */
export function changedFiles(base, head, cwd) {
  return execFileSync('git', ['diff', '--no-renames', '--name-only', '-z', `${base}...${head}`], { encoding: 'utf8', cwd })
    .split('\0').filter(Boolean);
}

/** Runs the check for the CI environment and returns the exit code and the line to print. */
export function main({ BASE_SHA, HEAD_SHA, SKIP }, cwd) {
  const fail = (message) => ({ code: 1, output: `::error::${message.replace(/\n/g, '%0A')}` });
  if (!BASE_SHA || !HEAD_SHA) return fail('BASE_SHA and HEAD_SHA are required');
  try {
    const { ok, message } = check(changedFiles(BASE_SHA, HEAD_SHA, cwd), SKIP === 'true');
    return ok ? { code: 0, output: message } : fail(message);
  } catch (e) {
    return fail(`Could not diff ${BASE_SHA}...${HEAD_SHA}: ${e.stderr?.toString().trim() || e.message}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { code, output } = main(process.env);
  console.log(output);
  process.exit(code);
}
