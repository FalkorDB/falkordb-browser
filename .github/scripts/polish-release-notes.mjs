// Rewrites a release's auto-generated notes into user-facing release notes,
// led by an optional "## What's New" section that the browser shows users
// after they upgrade; edit it on the release page if it needs work.
// Reads RELEASE_TAG and GITHUB_REPOSITORY from the environment, and needs
// GH_TOKEN (for the gh CLI) and OPENAI_API_KEY.
import { execFileSync } from "node:child_process";
import OpenAI from "openai";

const tag = process.env.RELEASE_TAG;
const repo = process.env.GITHUB_REPOSITORY;
const dryRun = process.env.DRY_RUN === "true";
const MARKER = "<!-- polished-release-notes -->";

const gh = (...args) => execFileSync("gh", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

const release = JSON.parse(gh("release", "view", tag, "--repo", repo, "--json", "body"));
const original = release.body ?? "";

// Re-running on already polished notes would rewrite the rewrite, so start
// again from the original notes kept in the collapsed section.
const generated = original.includes(MARKER)
  ? (original.split("<summary>Original generated notes</summary>")[1] ?? "").replace(/<\/details>\s*$/, "").trim()
  : original;

if (!generated) {
  console.error(`Release ${tag} has no notes to rewrite.`);
  process.exit(1);
}

// The generated lines only carry PR titles; the descriptions say what changed for users.
const prNumbers = [...new Set([...generated.matchAll(/\/pull\/(\d+)/g)].map((m) => m[1]))];
const prs = prNumbers.map((number) => {
  const pr = JSON.parse(gh("pr", "view", number, "--repo", repo, "--json", "number,title,author,labels,body"));
  return [
    `<pr number="${pr.number}" author="${pr.author.login}" labels="${pr.labels.map((l) => l.name).join(",")}">`,
    `<title>${pr.title}</title>`,
    `<description>\n${pr.body ?? ""}\n</description>`,
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

const client = new OpenAI();
const response = await client.responses.create({
  model: "gpt-5.4-mini",
  max_output_tokens: 16000,
  reasoning: { effort: "medium" },
  instructions: system,
  input: `Release ${tag}\n\n<generated_notes>\n${generated}\n</generated_notes>\n\n<pull_requests>\n${prs.join("\n\n")}\n</pull_requests>`,
});

// A cut-off or failed response would replace good notes with half of them.
if (response.status !== "completed") {
  console.error(`Model stopped with status ${response.status} (${response.incomplete_details?.reason ?? "no reason given"}); leaving the release notes unchanged.`);
  process.exit(1);
}

const polished = response.output_text.trim();
if (!polished) {
  console.error("Model returned no text; leaving the release notes unchanged.");
  process.exit(1);
}

const body = `${MARKER}\n${polished}\n\n<details>\n<summary>Original generated notes</summary>\n\n${generated}\n</details>\n`;

console.log(body);

if (!dryRun) {
  execFileSync("gh", ["release", "edit", tag, "--repo", repo, "--notes-file", "-"], { input: body, stdio: ["pipe", "inherit", "inherit"] });
}
