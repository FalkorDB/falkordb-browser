// Rewrites a release's auto-generated notes into user-facing release notes,
// led by an optional "## What's New" section that the browser shows users
// after they upgrade; edit it on the release page if it needs work.
// Reads RELEASE_TAG and GITHUB_REPOSITORY from the environment, and needs
// GH_TOKEN (for the gh CLI), plus the Azure OpenAI resource: OPENAI_API_KEY,
// AZURE_OPENAI_ENDPOINT (e.g. https://my-resource.openai.azure.com) and
// AZURE_OPENAI_DEPLOYMENT (the deployment name; defaults to gpt-5.4-mini).
import { execFileSync } from "node:child_process";
import OpenAI from "openai";

const tag = process.env.RELEASE_TAG;
const repo = process.env.GITHUB_REPOSITORY;
const dryRun = process.env.DRY_RUN === "true";
const MARKER = "<!-- polished-release-notes -->";
const SUMMARY = "<summary>Original generated notes</summary>";

const gh = (...args) => execFileSync("gh", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

const release = JSON.parse(gh("release", "view", tag, "--repo", repo, "--json", "body"));
const original = release.body ?? "";

// Re-running on already polished notes would rewrite the rewrite, so start
// again from the original notes kept in the collapsed section. The wrapper is
// only trusted at the body's edges (marker first, closing tag last), since PR
// text inside the notes can contain the same strings; the polished part never
// holds the summary line (it is stripped below), so its first occurrence opens
// the stored notes. They are sliced out as written, whitespace and all.
const unwrap = (body) => {
  if (!body.startsWith(MARKER)) return body;
  const start = body.indexOf(SUMMARY);
  const end = body.search(/\r?\n<\/details>\s*$/);
  if (start === -1 || end === -1) {
    throw new Error(`Release ${tag} is marked as polished but its stored original notes are incomplete; restore them by hand.`);
  }
  return body.slice(start + SUMMARY.length, end).replace(/^\r?\n\r?\n/, "");
};
const generated = unwrap(original);

if (!generated) {
  console.error(`Release ${tag} has no notes to rewrite.`);
  process.exit(1);
}

// PR text is untrusted and unbounded: cap it, and strip the tags that frame
// it so a description can't close its own block and pose as something else.
// GitHub's generated notes carry PR titles too, so they get the same stripping.
const MAX_DESCRIPTION = 4000;
const FRAMING_TAGS = /<\/?\s*(?:pr|title|description|generated_notes|pull_requests)\b[^>]*>/gi;
const quote = (text, max = Infinity) => String(text ?? "").replace(FRAMING_TAGS, "").slice(0, max);

// The generated lines only carry PR titles; the descriptions say what changed for users.
const prNumbers = [...new Set([...generated.matchAll(/\/pull\/(\d+)/g)].map((m) => m[1]))];
const prs = prNumbers.map((number) => {
  const pr = JSON.parse(gh("pr", "view", number, "--repo", repo, "--json", "number,title,author,labels,body"));
  return [
    // A deleted account leaves the author null; GitHub shows it as "ghost".
    `<pr number="${pr.number}" author="${quote(pr.author?.login ?? "ghost").replace(/"/g, "")}" labels="${quote(pr.labels.map((l) => l.name).join(",")).replace(/"/g, "")}">`,
    `<title>${quote(pr.title)}</title>`,
    `<description>\n${quote(pr.body, MAX_DESCRIPTION)}\n</description>`,
    `</pr>`,
  ].join("\n");
});

const system = `You write release notes for FalkorDB Browser, a web UI for exploring and querying FalkorDB graph databases. Readers are users and operators upgrading the browser, not the developers who wrote the code.

You get GitHub's auto-generated notes for a release and the description of each PR they list. Rewrite them into release notes:

- Drop entries with no effect on users: dependency bumps (unless they fix a security issue, then list it once under Security), version bumps, CI and workflow changes, test-only changes, refactors, fixes to review comments, merges of staging/main branches, and changes to code that is not released.
- For each remaining change, write one plain sentence saying what changed for the user, using the PR description to understand it. Describe behavior, not files or functions. Merge entries that describe the same change.
- Group under these headings, in this order, and leave out any that would be empty: "### ✨ New features", "### 🛠 Improvements", "### 🐛 Bug fixes", "### 🔒 Security", "### ⚙️ Deployment" (Docker, Helm chart, configuration). Mention breaking changes or required upgrade steps first, under "### ⚠️ Breaking changes".
- End each bullet with the PR link in the form ([#123](https://github.com/${repo}/pull/123)).
- Keep the "New Contributors" section if present, and the "**Full Changelog**" line exactly as given.
- If nothing user-facing remains, write a single line saying this release contains maintenance updates only, followed by the Full Changelog line.

Before the grouped notes, add a "## What's New" section when the release has something a user would want pointed out on upgrade: a new feature, a noticeably better workflow, or a change they must act on. The browser shows this section to users after they upgrade, so it is a short highlight reel, not a summary of the release:
- 1 to 4 bullets, most important first, each in the form "- **Short name of the change** — one sentence on what the user can now do or must do." No PR links here.
- Leave out bug fixes, security patches, and deployment changes unless one changes what users see or do.
- When nothing qualifies, leave the section out entirely: no heading, no placeholder. Most patch releases have nothing to highlight.
- Use exactly the heading "## What's New"; the browser looks for it.

Output only the Markdown for the release body. No title, no preamble.`;

// Only the resource matters: a full request URL copied from the portal
// (".../openai/responses?api-version=...") works as well as the bare one.
let endpoint;
try {
  const url = new URL(process.env.AZURE_OPENAI_ENDPOINT?.trim() ?? "");
  // The key travels in a header, so never over plain http.
  if (url.protocol !== "https:") throw new Error("not https");
  endpoint = url.origin;
} catch {
  console.error("AZURE_OPENAI_ENDPOINT must be an https:// URL.");
  process.exit(1);
}

// Azure's /openai/v1/ endpoint speaks the OpenAI API, with the deployment as the model.
const apiKey = process.env.OPENAI_API_KEY;
const client = new OpenAI({ apiKey, baseURL: `${endpoint}/openai/v1/`, defaultHeaders: { "api-key": apiKey } });
const response = await client.responses.create({
  model: process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-5.4-mini",
  max_output_tokens: 16000,
  reasoning: { effort: "medium" },
  instructions: system,
  input: `Release ${tag}\n\n<generated_notes>\n${quote(generated)}\n</generated_notes>\n\n<pull_requests>\n${prs.join("\n\n")}\n</pull_requests>`,
});

// A cut-off or failed response would replace good notes with half of them.
if (response.status !== "completed") {
  console.error(`Model stopped with status ${response.status} (${response.incomplete_details?.reason ?? "no reason given"}); leaving the release notes unchanged.`);
  process.exit(1);
}

// The summary line marks where the original notes start on a rerun, so the
// model's output must not contain it.
const polished = response.output_text.replaceAll(SUMMARY, "").trim();
if (!polished) {
  console.error("Model returned no text; leaving the release notes unchanged.");
  process.exit(1);
}

const body = `${MARKER}\n${polished}\n\n<details>\n<summary>Original generated notes</summary>\n\n${generated}\n</details>\n`;

console.log(body);

if (!dryRun) {
  execFileSync("gh", ["release", "edit", tag, "--repo", repo, "--notes-file", "-"], { input: body, stdio: ["pipe", "inherit", "inherit"] });
}
