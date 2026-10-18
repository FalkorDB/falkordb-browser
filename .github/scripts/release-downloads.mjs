// Keeps a "## Download" section in a release's notes, linking each installer
// attached to that release. It lists only files that are actually there, so a
// build that failed never leaves a dead link, and it is rebuilt from the
// release's current files on every run, so the order the workflows finish in
// does not matter. It runs:
//   - from polish-release-notes.mjs, right before the polished notes are saved;
//   - after desktop.yml attaches the installers and mobile.yml the APK, as
//     `node .github/scripts/release-downloads.mjs` with RELEASE_TAG,
//     GITHUB_REPOSITORY and GH_TOKEN set.
// No dependencies: only node and the gh CLI.
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export const START = "<!-- release-downloads:start -->";
export const END = "<!-- release-downloads:end -->";
// The polish step's wrapper (see polish-release-notes.mjs): its marker first,
// then the notes, then GitHub's original notes collapsed at the end.
const POLISHED = "<!-- polished-release-notes -->";
const ORIGINAL_NOTES = "<details>\n<summary>Original generated notes</summary>";

// The files desktop.yml and mobile.yml attach (see desktop/electron-builder.yml
// and lib/appDownload.ts for the names), grouped by platform.
const PLATFORMS = [
    { name: "macOS", files: [["FalkorDB-Browser-mac-arm64.dmg", "Apple silicon"], ["FalkorDB-Browser-mac-x64.dmg", "Intel"]] },
    { name: "Windows", files: [["FalkorDB-Browser-win-x64.exe", "Installer"]] },
    { name: "Linux", files: [["FalkorDB-Browser-linux-x86_64.AppImage", "AppImage"]] },
    { name: "Android", files: [["FalkorDB-Browser-android.apk", "APK"]] },
];

/** The section for these attached files, or "" when none of them is an installer. */
export function downloadsSection(repo, tag, assetNames) {
    const present = new Set(assetNames);
    const lines = [];
    for (const platform of PLATFORMS) {
        const links = platform.files
            .filter(([file]) => present.has(file))
            .map(([file, label]) => `[${label}](https://github.com/${repo}/releases/download/${encodeURIComponent(tag)}/${encodeURIComponent(file)})`);
        if (links.length) lines.push(`- **${platform.name}:** ${links.join(" · ")}`);
    }
    if (!lines.length) return "";
    const unsigned = PLATFORMS.slice(0, 2).some((p) => p.files.some(([file]) => present.has(file)));
    return [
        START,
        "## Download",
        "",
        ...lines,
        ...(unsigned ? ["", "The desktop apps are not code-signed yet, so macOS and Windows warn the first time you open them."] : []),
        END,
    ].join("\n");
}

/**
 * Where the visible notes end: before the collapsed original notes of polished
 * notes (whose first summary line is the wrapper's, as polish-release-notes.mjs
 * relies on too), or at the end of anything else.
 */
function visibleEnd(body) {
    if (!body.startsWith(POLISHED)) return body.length;
    const at = body.indexOf(ORIGINAL_NOTES);
    return at === -1 ? body.length : at;
}

// The exact shape downloadsSection writes: each marker on a line of its own,
// the heading right after the first. A marker quoted inside a line (a PR title,
// say) never matches, so updating or stripping can't delete anyone's text.
const SECTION = new RegExp(`(?:^|\\n)(${escapeRegExp(START)}\\n## Download\\n[\\s\\S]*?\\n${escapeRegExp(END)})(?=\\n|$)`, "g");

function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Every section this script wrote, wherever it sits in the visible notes
 * (someone may have written below it), but never inside the collapsed original
 * notes. Normally there is one; should there ever be more, an update or strip
 * deals with all of them, so the notes always settle on a single section.
 */
function findSections(body) {
    const visible = body.slice(0, visibleEnd(body));
    return [...visible.matchAll(SECTION)].map((match) => {
        const start = match.index + match[0].indexOf(START);
        return { start, end: start + match[1].length };
    });
}

function cut(body, { start, end }) {
    const before = body.slice(0, start).replace(/\s+$/, "");
    const after = body.slice(end).replace(/^\s+/, "");
    return before && after ? `${before}\n\n${after}` : before || after;
}

// Text from an editor or a model may come with \r\n line endings.
const normalize = (body) => body.replace(/\r\n?/g, "\n");

/** The body without this script's downloads section(s). */
export function stripDownloads(text) {
    const body = normalize(text);
    // Last first, so the earlier positions still hold.
    return findSections(body).reverse().reduce(cut, body);
}

/**
 * The body with `section` in place of any old one: the last existing section
 * is replaced where it stands (any others are removed); a new one goes last in
 * the visible notes, so just before the collapsed original notes of polished
 * notes.
 */
export function withDownloads(text, section) {
    const body = normalize(text);
    const found = findSections(body);
    if (found.length && section) {
        const last = found[found.length - 1];
        const replaced = body.slice(0, last.start) + section + body.slice(last.end);
        // The others all come before the replaced one, so their positions hold.
        return found.slice(0, -1).reverse().reduce(cut, replaced);
    }
    const rest = stripDownloads(body);
    if (!section) return rest;
    const end = visibleEnd(rest);
    const before = rest.slice(0, end).replace(/\s+$/, "");
    const after = rest.slice(end);
    return after ? `${before}\n\n${section}\n\n${after}` : `${before}\n\n${section}\n`;
}

const gh = (...args) => execFileSync("gh", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

export function readRelease(repo, tag) {
    const release = JSON.parse(gh("release", "view", tag, "--repo", repo, "--json", "body,assets"));
    return { body: release.body ?? "", assets: release.assets.map((a) => a.name) };
}

export function writeBody(repo, tag, body) {
    execFileSync("gh", ["release", "edit", tag, "--repo", repo, "--notes-file", "-"], { input: body, stdio: ["pipe", "inherit", "inherit"] });
}

/**
 * Brings the release's section up to date with its files. It rewrites the
 * whole body, so every job that runs it shares the polish job's
 * release-notes-<tag> concurrency group: no two can edit the notes at once.
 * A file can still be attached meanwhile, so it checks again after writing
 * and catches up, a few times at most.
 */
export function syncDownloads(repo, tag) {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
        const { body, assets } = readRelease(repo, tag);
        const next = withDownloads(body, downloadsSection(repo, tag, assets));
        // withDownloads returns \n line endings, so \r\n alone is no change.
        if (next === normalize(body)) {
            console.log(`Release ${tag}: download links are up to date (${assets.length} files).`);
            return;
        }
        writeBody(repo, tag, next);
        console.log(`Release ${tag}: updated the download links (attempt ${attempt}).`);
    }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const tag = process.env.RELEASE_TAG;
    const repo = process.env.GITHUB_REPOSITORY;
    if (!tag || !repo) {
        console.error("Set RELEASE_TAG and GITHUB_REPOSITORY.");
        process.exit(1);
    }
    syncDownloads(repo, tag);
}
