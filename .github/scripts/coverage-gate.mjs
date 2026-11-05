// The coverage gate: posts coverage/project (the whole codebase) and
// coverage/patch (the lines a pull request changes) to a commit, each a pass
// at TARGET% or more, once every coverage workflow the commit triggers has
// finished and Codecov has processed every upload. Until then it posts them
// as pending. Branch protection requires both.
//
// Codecov's own statuses cannot be the gate: on a pull request they are
// posted as soon as the pull request changes, from whatever was uploaded by
// then plus flags carried forward from an earlier commit, and Codecov cannot
// see GitHub Actions jobs to wait for them.
//
// Run by the Coverage status workflow (workflow_run), from the default
// branch. Environment: GITHUB_REPOSITORY, GH_TOKEN, SHA, EVENT (push or
// pull_request), BRANCH (the pushed branch, or the pull request's head
// branch), HEAD_OWNER (the owner of the repository that branch is in), PR
// (the pull request's number, when GitHub gives it), TARGET (95 by default).
// DRY_RUN prints the statuses instead of posting them.

import { appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const GITHUB = 'https://api.github.com';
const CODECOV = 'https://api.codecov.io/api/v2/github';

// The workflows that upload coverage: the file that defines when each runs,
// and the Codecov flags it uploads.
export const COVERAGE_WORKFLOWS = {
  Build: { file: '.github/workflows/nextjs.yml', flags: ['unit', 'smoke'] },
  'Playwright Tests': { file: '.github/workflows/playwright.yml', flags: ['e2e'] },
  'Desktop app': { file: '.github/workflows/desktop.yml', flags: ['desktop'] },
  'Mobile app': { file: '.github/workflows/mobile.yml', flags: ['mobile'] },
};

// The branches the gate guards (branch protection requires it there).
const PROTECTED = ['main', 'staging'];

/** A GitHub path filter glob as a regular expression over a repository path. */
export function globToRegExp(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i += 1) {
    const c = glob[i];
    if (c === '*' && glob[i + 1] === '*') {
      // `**/` matches any number of directories, `**` anything.
      if (glob[i + 2] === '/') {
        re += '(?:.*/)?';
        i += 2;
      } else {
        re += '.*';
        i += 1;
      }
    } else if (c === '*') {
      re += '[^/]*';
    } else if (c === '?') {
      re += '[^/]';
    } else {
      re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
  }
  return new RegExp(`^${re}$`);
}

/**
 * The `paths` and `paths-ignore` filters of one event (`push` or
 * `pull_request`) in a workflow file. Reads the block layout these
 * workflows use, not YAML in general.
 */
export function pathFilters(workflow, event) {
  const lines = workflow.split('\n');
  const onAt = lines.findIndex((l) => /^on:\s*$/.test(l));
  if (onAt < 0) return {};
  let eventIndent;
  let list;
  let listIndent;
  const filters = {};
  for (const line of lines.slice(onAt + 1)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (/^\S/.test(line)) break; // the next top-level key
    const indent = line.length - line.trimStart().length;
    const key = /^(\s*)([\w-]+):/.exec(line);
    if (eventIndent === undefined) {
      if (key && key[2] === event) eventIndent = indent;
      continue;
    }
    if (indent <= eventIndent) break; // the next event
    const item = /^\s*-\s*['"]?([^'"#]+?)['"]?\s*(#.*)?$/.exec(line);
    if (list && item && indent > listIndent) {
      filters[list].push(item[1]);
    } else if (key) {
      list = key[2] === 'paths' || key[2] === 'paths-ignore' ? key[2] : undefined;
      listIndent = indent;
      if (list) filters[list] = [];
    }
  }
  return filters;
}

/** Whether a workflow with these filters runs for a change to `files`, as GitHub decides. */
export function runsFor(filters, files) {
  if (filters.paths) {
    const res = filters.paths.map(globToRegExp);
    return files.some((f) => res.some((re) => re.test(f)));
  }
  if (filters['paths-ignore']) {
    const res = filters['paths-ignore'].map(globToRegExp);
    return files.some((f) => !res.some((re) => re.test(f)));
  }
  return true;
}

/**
 * The runs a trigger made: a commit pushed to staging and at the head of a
 * pull request into main has both push and pull_request runs, and the gate
 * of each trigger judges its own.
 */
export function runsOf(event, runs) {
  return runs.filter((run) => run.event === event);
}

/** Each workflow's latest run (a re-run is the run that counts). */
function latestRuns(runs) {
  const latest = new Map();
  for (const run of runs) {
    const seen = latest.get(run.name);
    if (!seen || run.id > seen.id) latest.set(run.name, run);
  }
  return latest;
}

/**
 * The expected workflows still to finish: missing (not started yet), or
 * started and not completed. A run waiting for approval has not run.
 */
export function waitingFor(expected, runs) {
  const latest = latestRuns(runs);
  return expected.filter((name) => {
    const run = latest.get(name);
    return !run || run.status !== 'completed' || run.conclusion === 'action_required';
  });
}

/**
 * The finished workflows that did not succeed. Their coverage is missing or
 * partial, and Codecov would fill the gap with an earlier commit's.
 */
export function unsuccessful(expected, runs) {
  const latest = latestRuns(runs);
  return expected.filter((name) => latest.get(name)?.conclusion !== 'success');
}

/**
 * The uploads that count: of the commit's own, the latest of each job (a
 * re-run's upload, named after the same job, replaces an earlier attempt's);
 * and the carried-forward ones.
 */
export function currentUploads(uploads) {
  const latest = new Map();
  const carried = [];
  for (const upload of uploads) {
    if (upload.upload_type === 'carriedforward') {
      carried.push(upload);
      continue;
    }
    const job = upload.name || upload.flags.join(',');
    const seen = latest.get(job);
    if (!seen || upload.created_at > seen.created_at) latest.set(job, upload);
  }
  return [...latest.values(), ...carried];
}

/** The commit's own current uploads that Codecov could not process. */
export function failedUploads(uploads) {
  return currentUploads(uploads).filter((u) => u.upload_type !== 'carriedforward' && u.state === 'error');
}

/**
 * The flags the expected workflows upload that the commit has no upload of
 * its own for (a carried-forward one is an earlier commit's).
 */
export function missingFlags(expected, uploads) {
  const uploaded = new Set(uploads
    .filter((u) => u.upload_type !== 'carriedforward' && u.state !== 'error')
    .flatMap((u) => u.flags));
  return expected.flatMap((name) => COVERAGE_WORKFLOWS[name].flags).filter((flag) => !uploaded.has(flag));
}

/** Named E2E uploads in the commit's workflow, including its shard matrix. */
export function workflowUploads(workflow) {
  const names = [...workflow.matchAll(/^\s+name:\s+(e2e-[^\r\n]+)$/gm)].map((match) => match[1].trim());
  return names.flatMap((name) => {
    if (!name.includes('${{')) return [name];
    if (name !== 'e2e-shard-${{ matrix.shard }}') throw new Error(`Unknown coverage upload expression: ${name}`);
    const matrix = /^\s+shard:\s+\[([\d,\s]+)\]/m.exec(workflow);
    if (!matrix) throw new Error('No shard matrix for the E2E coverage uploads');
    return matrix[1].split(',').map((shard) => `e2e-shard-${Number(shard.trim())}`);
  });
}

export function missingUploads(expected, uploads) {
  const uploaded = new Set(currentUploads(uploads)
    .filter((u) => u.upload_type !== 'carriedforward' && u.state !== 'error')
    .map((u) => u.name));
  return expected.filter((name) => !uploaded.has(name));
}

/**
 * Whether Codecov has processed every current upload of the commit (an
 * earlier attempt's upload, stuck part way, does not hold the gate).
 */
export function codecovSettled(uploads) {
  return currentUploads(uploads).every((u) => ['merged', 'complete', 'error'].includes(u.state));
}

/** A coverage status for `pct` against `target`. */
export function verdict(pct, target) {
  const shown = `${(Math.floor(pct * 100) / 100).toFixed(2)}%`;
  return pct >= target
    ? { state: 'success', description: `${shown} (target ${target}%)` }
    : { state: 'failure', description: `${shown}, below the ${target}% target` };
}

/** The coverage/patch status from Codecov's patch totals for a pull request. */
export function patchVerdict(patch, target) {
  const lines = patch.hits + patch.misses + patch.partials;
  if (lines === 0) return { state: 'success', description: 'No changed lines to cover' };
  return verdict((100 * patch.hits) / lines, target);
}

/** Resolves after `ms` milliseconds. */
function wait(ms) {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

/** Whether an API error may pass on its own: a server error, rate limiting, or no response. */
export function transient(error) {
  return !error.status || error.status >= 500 || error.status === 429;
}

// How long a gate may take: its job stops at 30 minutes, which would leave
// its statuses pending; this leaves time to post an error instead.
export const BUDGET_MS = 25 * 60_000;

/**
 * `call`, tried again after a transient error, up to `attempts` times in
 * all, and only while `timeLeft()` has room for another wait.
 */
export async function retry(call, sleep, attempts = 5, timeLeft = () => Infinity) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await call();
    } catch (error) {
      if (!transient(error) || attempt >= attempts || timeLeft() < 20_000) throw error;
      console.log(`Retrying after: ${error.message}`);
      await sleep(20_000);
    }
  }
}

/** A JSON API call. The token goes to GitHub's API only, whatever the caller passes. */
async function api(url, { token, method = 'GET', body } = {}) {
  const github = new URL(url).origin === GITHUB;
  const res = await fetch(url, {
    method,
    headers: {
      accept: github ? 'application/vnd.github+json' : 'application/json',
      ...(github && token && { authorization: `Bearer ${token}` }),
      ...(body && { 'content-type': 'application/json' }),
    },
    body: body && JSON.stringify(body),
  });
  if (!res.ok) {
    throw Object.assign(new Error(`${method} ${url}: ${res.status} ${await res.text()}`), { status: res.status });
  }
  return res.json();
}

/**
 * Every result of a Codecov list, following each page's `next` link (which
 * Codecov gives over http) until there is none. `get` fetches one page.
 */
export async function followPages(url, get) {
  const results = [];
  for (let next = url; next;) {
    const page = await get(next);
    results.push(...page.results);
    next = page.next?.replace(/^http:/, 'https:');
  }
  return results;
}

/** Every page of a GitHub list, `pick` taking the items out of each response. GitHub pages by number. */
async function allPages(fetchPage, pick = (page) => page) {
  const items = [];
  for (let page = 1; ; page += 1) {
    const batch = pick(await fetchPage(page));
    items.push(...batch);
    if (batch.length < 100) return items;
  }
}

/**
 * Posts statuses to `sha`, retrying GitHub's passing errors, and remembers in
 * `decided` the contexts given a verdict (not pending) that GitHub accepted.
 */
export function statusPoster({ gh, sha, targetUrl, dryRun = false, sleep = wait }) {
  const decided = new Set();
  const post = async (context, { state, description }) => {
    if (dryRun) {
      console.log(`would post ${context}: ${state}, ${description}`);
    } else {
      await retry(() => gh(`statuses/${sha}`, {
        method: 'POST',
        body: { context, state, description, target_url: targetUrl() },
      }), sleep);
    }
    // Only a verdict GitHub accepted: else the failure handler still marks it.
    if (state !== 'pending') decided.add(context);
  };
  return { post, decided };
}

/**
 * After the gate failed: marks `error` on each status this run gave no
 * verdict, rather than leave an earlier run's pending; a verdict it posted
 * stays.
 */
export async function postFailure({ post, decided, contexts, error }) {
  const description = `The coverage gate failed: ${error.message}`.slice(0, 140);
  for (const context of contexts.filter((c) => !decided.has(c))) {
    await post(context, { state: 'error', description }).catch(() => {});
  }
}

async function main() {
  const { GITHUB_REPOSITORY: repo, GH_TOKEN: token, SHA: sha, EVENT: event, BRANCH: branch } = process.env;
  const target = Number(process.env.TARGET ?? 95);
  const gh = (path, options) => api(`${GITHUB}/repos/${repo}/${path}`, { token, ...options });

  // A pull request's gate posts coverage/project and coverage/patch (which
  // branch protection requires); a push's posts its project verdict under a
  // name of its own, so that on a commit both pushed to staging and at the
  // head of a pull request into main it cannot overwrite the pull request's.
  const contexts = event === 'pull_request' ? ['coverage/project', 'coverage/patch'] : ['coverage/project (push)'];
  let pr;
  const { post, decided } = statusPoster({
    gh,
    sha,
    targetUrl: () => `https://app.codecov.io/gh/${repo}/${pr ? `pull/${pr.number}` : `commit/${sha}`}`,
    dryRun: Boolean(process.env.DRY_RUN),
  });

  try {
    // The pull request, for a pull_request run: one whose head is still this
    // commit (else a newer commit's gate decides) and that targets a
    // protected branch. GitHub names it only for one from this repository,
    // so look one from a fork up by its head branch.
    if (event === 'pull_request') {
      const candidates = process.env.PR
        ? [await gh(`pulls/${process.env.PR}`)]
        : await gh(`pulls?state=open&per_page=100&head=${encodeURIComponent(`${process.env.HEAD_OWNER}:${branch}`)}`);
      pr = candidates.find((p) => p.head.sha === sha && PROTECTED.includes(p.base.ref));
      if (!pr) {
        console.log(`No open pull request into ${PROTECTED.join(' or ')} has ${sha} as its head`);
        return;
      }
    } else if (!PROTECTED.includes(branch)) {
      console.log(`${branch} is not a protected branch: no gate`);
      return;
    }
    const done = await gate({ gh, post, contexts, pr, sha, repo, target });
    // The workflow tells Codecov to post its comment once the gate decided.
    if (done && process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, 'decided=true\n');
  } catch (error) {
    await postFailure({ post, decided, contexts, error });
    throw error;
  }
}

/**
 * Decides the gate of `sha` and posts it, or posts it as pending. `gh` and
 * `codecov` fetch from GitHub's and Codecov's APIs, `sleep` waits between
 * polls of Codecov. Resolves to whether coverage/project was decided.
 */
export async function gate({
  gh, codecov = (url) => api(url), sleep = wait, now = Date.now, deadline = now() + BUDGET_MS,
  post, contexts, pr, sha, repo, target,
}) {
  // Every wait below shares one deadline, so the gate decides, or fails and
  // says so, before its job is stopped.
  const timeLeft = () => deadline - now();
  const again = (call) => retry(call, sleep, 5, timeLeft);
  // The workflows this commit triggers, as their path filters decide.
  // The files the trigger changed: a pull request's whole diff, or the pushed
  // commit's own changes (for a merge commit, all that the merge brought).
  const files = (pr
    ? await allPages((page) => gh(`pulls/${pr.number}/files?per_page=100&page=${page}`))
    : await allPages((page) => gh(`commits/${sha}?per_page=100&page=${page}`), (page) => page.files ?? [])
  ).map((f) => f.filename);

  const trigger = pr ? 'pull_request' : 'push';
  const runs = runsOf(trigger, await allPages(
    (page) => gh(`actions/runs?head_sha=${sha}&per_page=100&page=${page}`),
    (page) => page.workflow_runs,
  ));
  // Expected: every coverage workflow the trigger started, and every one
  // whose path filters take these files. GitHub starts all of a trigger's
  // runs at once, so a push of several commits, whose earlier commits the
  // files above leave out, still has a run of each workflow it triggered;
  // and a workflow its files call for is waited for even before it shows.
  const expected = [...new Set(runs.map((run) => run.name).filter((name) => name in COVERAGE_WORKFLOWS))];
  const requiredUploads = [];
  for (const [name, { file }] of Object.entries(COVERAGE_WORKFLOWS)) {
    let content;
    try {
      content = await gh(`contents/${file}?ref=${sha}`);
    } catch (error) {
      // A commit without the workflow does not run it; any other failure
      // stops the gate rather than leave the workflow out.
      if (error.status === 404) continue;
      throw error;
    }
    const workflow = Buffer.from(content.content, 'base64').toString('utf8');
    if (!expected.includes(name) && runsFor(pathFilters(workflow, trigger), files)) expected.push(name);
    if (expected.includes(name)) requiredUploads.push(...workflowUploads(workflow));
  }
  const waiting = waitingFor(expected, runs);
  if (waiting.length) {
    console.log(`Waiting for ${waiting.join(', ')}`);
    for (const context of contexts) await post(context, { state: 'pending', description: `Waiting for ${waiting.join(', ')}` });
    return false;
  }

  const failed = unsuccessful(expected, runs);
  if (failed.length) {
    console.log(`Did not succeed: ${failed.join(', ')}`);
    for (const context of contexts) await post(context, { state: 'failure', description: `${failed.join(', ')} did not succeed: the coverage is incomplete` });
    return false;
  }

  // Every upload is in once its workflow finished; wait for Codecov to
  // process them (up to 15 minutes), riding out its passing errors.
  const base = `${CODECOV}/${repo.split('/')[0]}/repos/${repo.split('/')[1]}`;
  let uploads;
  for (let attempt = 0; ; attempt += 1) {
    try {
      uploads = await followPages(`${base}/commits/${sha}/uploads/?page_size=100`, codecov);
      if (failedUploads(uploads).length) break;
      if (uploads.length && codecovSettled(uploads)
        && !missingFlags(expected, uploads).length && !missingUploads(requiredUploads, uploads).length) break;
    } catch (error) {
      if (!transient(error)) throw error;
      console.log(`Codecov: ${error.message}`);
    }
    if (attempt >= 45 || timeLeft() < 20_000) {
      const missing = [...missingFlags(expected, uploads ?? []), ...missingUploads(requiredUploads, uploads ?? [])];
      throw new Error(`Codecov did not process every expected upload in time${missing.length ? `; missing: ${missing.join(', ')}` : ''}`);
    }
    await sleep(20_000);
  }

  // One shard's lost upload would leave its flag looking complete.
  const broken = failedUploads(uploads);
  if (broken.length) {
    const names = broken.map((u) => u.name || u.flags.join(',')).join(', ');
    console.log(`Codecov could not process: ${names}`);
    for (const context of contexts) await post(context, { state: 'failure', description: `Codecov could not process ${broken.length} upload(s): ${names}`.slice(0, 140) });
    return false;
  }

  const commit = await again(() => codecov(`${base}/commits/${sha}/`));
  if (typeof commit.totals?.coverage !== 'number') throw new Error('Codecov has no coverage total for the commit');
  const project = verdict(commit.totals.coverage, target);
  console.log(`${contexts[0]}: ${project.description}`);
  await post(contexts[0], project);
  if (pr) {
    // Codecov's record of the pull request can lag behind GitHub's: wait
    // until it compares this commit, unless the pull request did move on.
    let compare;
    for (let attempt = 0; ; attempt += 1) {
      compare = await again(() => codecov(`${base}/compare/?pullid=${pr.number}`));
      if (compare.head_commit === sha) break;
      const { head } = await again(() => gh(`pulls/${pr.number}`));
      if (head.sha !== sha) {
        console.log(`The pull request moved on to ${head.sha}: its own gate will post`);
        return true;
      }
      if (attempt >= 15 || timeLeft() < 20_000) throw new Error(`Codecov still compares ${compare.head_commit}, not this commit`);
      console.log(`Codecov compares ${compare.head_commit} still; waiting for it to catch up`);
      await sleep(20_000);
    }
    // No patch total is not a pass.
    if (!compare.totals?.patch) throw new Error('Codecov has no patch total for the pull request');
    const patch = patchVerdict(compare.totals.patch, target);
    console.log(`${contexts[1]}: ${patch.description}`);
    await post(contexts[1], patch);
  }
  return true;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
