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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { BASE_SHA, HEAD_SHA, SKIP } = process.env;
  if (!BASE_SHA || !HEAD_SHA) throw new Error('BASE_SHA and HEAD_SHA are required');
  const files = execFileSync('git', ['diff', '--name-only', `${BASE_SHA}...${HEAD_SHA}`], { encoding: 'utf8' })
    .split('\n').filter(Boolean);
  const { ok, message } = check(files, SKIP === 'true');
  console.log(ok ? message : `::error::${message.replace(/\n/g, '%0A')}`);
  process.exit(ok ? 0 : 1);
}
