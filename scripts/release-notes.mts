// Drafts a release-notes entry from the PRs merged since the previous release.
//
//   npm run release-notes                  # version from package.json, since the previous tag
//   npm run release-notes -- 2.7.0         # an explicit version
//   npm run release-notes -- --from v2.6.0 # an explicit starting ref
//   npm run release-notes -- --dry-run     # print the entry without writing it
//
// Run it on staging (or a branch off it): PRs land there first.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { compareVersions, parseVersion } from "../lib/releaseNotes.ts";
import { GIT_LOG_FORMAT, draftFromPrs, insertEntry, joinTruncatedTitle, parseGitLog, renderDraftEntry } from "../lib/releaseNotesDraft.ts";

const RELEASES_FILE = new URL("../lib/releaseNotesEntries.ts", import.meta.url);
const PACKAGE_FILE = new URL("../package.json", import.meta.url);

const git = (...args: string[]) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
        from: { type: "string" },
        to: { type: "string", default: "HEAD" },
        "dry-run": { type: "boolean", default: false },
    },
});

const version = (positionals[0] ?? JSON.parse(readFileSync(PACKAGE_FILE, "utf8")).version).trim().replace(/^v/, "");
if (!parseVersion(version)) throw new Error(`Invalid version: ${version}`);

// The newest release tag older than the one being drafted, among those already
// in this branch's history: a tag cut elsewhere (a hotfix on main, say) would
// pull the previous release's PRs back into this draft.
const from = values.from ?? git("tag", "--list", "v*", "--merged", values.to).split("\n")
    .filter((tag) => parseVersion(tag) && compareVersions(tag, version) < 0)
    .sort(compareVersions)
    .at(-1);
if (!from) throw new Error("No earlier release tag found; pass --from <ref>.");

const prs = parseGitLog(git("log", `--format=${GIT_LOG_FORMAT}`, `${from}..${values.to}`));

// A title cut short at "…" continues in the PR description; fetch it when the
// gh CLI is signed in, and keep the short title otherwise.
prs.filter((pr) => pr.title.endsWith("…")).forEach((pr) => {
    try {
        const body = execFileSync("gh", ["pr", "view", String(pr.number), "--json", "body", "--jq", ".body"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
        pr.title = joinTruncatedTitle(pr.title, body);
    } catch {
        // No gh, not signed in, or offline.
    }
});
const { items, skipped } = draftFromPrs(prs);

console.log(`Release notes ${version}: ${prs.length} PRs merged since ${from}\n`);
skipped.forEach(({ pr, reason }) => console.log(`  skip  #${pr.number} ${pr.title}  (${reason})`));
items.forEach(({ item, pr }) => console.log(`  keep  #${pr} [${item.kind}] ${item.title}`));

if (items.length === 0) {
    console.log("\nNothing to announce; no entry written.");
} else {
    // The release date is the day its last commit landed, so backfilled entries keep theirs.
    const date = git("log", "-1", "--format=%cs", values.to).trim();
    const entry = renderDraftEntry(version, date, items);
    if (values["dry-run"]) {
        console.log(`\n${entry}`);
    } else {
        writeFileSync(RELEASES_FILE, insertEntry(readFileSync(RELEASES_FILE, "utf8"), version, entry));
        console.log(`\nDraft written to lib/releaseNotesEntries.ts; edit it, then remove \`draft: true\`.`);
    }
}
