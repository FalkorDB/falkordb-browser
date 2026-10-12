// Release notes shown in the Help menu's "Releases" drawer.
//
// The notes themselves live in `releaseNotesEntries.ts`. `npm run release-notes`
// drafts an entry there from the merged PRs; a draft is only shown in
// development, so nothing reaches users until someone has rewritten it and
// removed its `draft` flag.

export type ReleaseNoteKind = "feature" | "improvement" | "fix";

export interface ReleaseNoteItem {
    kind: ReleaseNoteKind;
    title: string;
    description?: string;
    /** Optional "Learn more" target, e.g. a docs page. */
    link?: string;
}

export interface ReleaseNote {
    /** Plain semver, e.g. "2.7.0". */
    version: string;
    /** ISO date, e.g. "2026-10-12". */
    date: string;
    /** Generated and not yet reviewed: hidden outside development. */
    draft?: boolean;
    items: ReleaseNoteItem[];
}

/** "2.6.1" or "v2.6.1" → [2, 6, 1]; anything else → null. */
export function parseVersion(version: string | null | undefined): [number, number, number] | null {
    const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(version?.trim() ?? "");
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

/**
 * The releases to list, newest first: valid versions with at least one item,
 * and drafts only when `includeDrafts` (development).
 */
export function publishedReleases(releases: ReleaseNote[], includeDrafts: boolean): ReleaseNote[] {
    return releases
        .filter((r) => parseVersion(r.version) && r.items.length > 0 && (includeDrafts || !r.draft))
        .sort((a, b) => compareVersions(b.version, a.version));
}
