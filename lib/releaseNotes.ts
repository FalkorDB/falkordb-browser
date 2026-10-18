// Release notes come from the repository's GitHub releases (see
// `app/api/releases/route.ts`). The release workflow writes an optional
// "## What's New" section at the top of each body; the browser shows that
// section in a popup for the release the user is running.

export interface Release {
    /** The git tag, e.g. "v2.6.2". */
    tag: string;
    name: string;
    /** ISO timestamp. */
    publishedAt: string;
    /** Markdown, as written on GitHub. */
    body: string;
    url: string;
}

/** "2.6.1" or "v2.6.1" → [2, 6, 1]; anything else (including leading zeros) → null. */
export function parseVersion(version: string | null | undefined): [number, number, number] | null {
    const match = /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(version?.trim() ?? "");
    if (!match) return null;
    return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/** Negative when `a` is older than `b`, positive when newer, 0 when equal. Both must parse. */
export function compareVersions(a: string, b: string): number {
    const pa = parseVersion(a);
    const pb = parseVersion(b);
    if (!pa || !pb) throw new Error(`Invalid version: ${!pa ? a : b}`);
    return pa[0] - pb[0] || pa[1] - pb[1] || pa[2] - pb[2];
}

/** Releases with a version tag, newest first. */
export function sortReleases(releases: Release[]): Release[] {
    return releases
        .filter((r) => parseVersion(r.tag))
        .sort((a, b) => compareVersions(b.tag, a.tag));
}

/**
 * The newest release the running version includes: its own release, or the
 * one before it when that hasn't been published yet. A newer release isn't
 * news to someone who doesn't have it.
 */
export function releaseForVersion(releases: Release[], version: string): Release | undefined {
    if (!parseVersion(version)) return undefined;
    return sortReleases(releases).find((r) => compareVersions(r.tag, version) <= 0);
}

const POLISHED_MARKER = /<!--\s*polished-release-notes\s*-->\s*/g;
const ORIGINAL_NOTES = /<details>\s*<summary>Original generated notes<\/summary>[\s\S]*?<\/details>\s*/g;

/** The body as users should read it: without the workflow's marker and its copy of GitHub's raw notes. */
export function displayBody(body: string): string {
    return body.replace(POLISHED_MARKER, "").replace(ORIGINAL_NOTES, "").trim();
}

/** The bullets under "## What's New", without the heading, or null when the release has none. */
export function extractWhatsNew(body: string): string | null {
    const lines = displayBody(body).split(/\r?\n/);
    const start = lines.findIndex((line) => /^##\s+What['’]s New\s*$/i.test(line.trim()));
    if (start === -1) return null;
    const rest = lines.slice(start + 1);
    // The section runs until the next heading or collapsed block.
    const end = rest.findIndex((line) => /^#{1,6}\s/.test(line.trim()) || /^<details>/i.test(line.trim()));
    const section = (end === -1 ? rest : rest.slice(0, end)).join("\n").trim();
    return section || null;
}

/**
 * Whether a browser that last saw `seen`'s What's New is done with `tag`'s:
 * the same release or an older one. Anything unreadable counts as unseen.
 */
export function seenCovers(seen: string | null, tag: string): boolean {
    return !!parseVersion(seen) && !!parseVersion(tag) && compareVersions(seen!, tag) >= 0;
}
