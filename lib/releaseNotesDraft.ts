// Turns merged PRs into a draft release-notes entry; `scripts/release-notes.mts`
// feeds it `git log` and writes the result into `releaseNotesEntries.ts`.

import { parseVersion, type ReleaseNoteItem, type ReleaseNoteKind } from "./releaseNotes.ts";

export interface MergedPr {
    number: number;
    title: string;
    /** Head branch, known only for merge commits. */
    branch?: string;
    author: string;
}

// PRs that never belong in an announcement. Each pattern is tried in order and
// the first match is reported as the reason it was skipped. Title patterns see
// the title both as written and with its prefixes stripped (see `cleanTitle`),
// so "fix: update version to 2.3.0" is caught by the version pattern.
export const SKIP_BRANCHES: RegExp[] = [/^dependabot\//, /^renovate\//, /^release-notes\//, /^staging$/, /^main$/];
export const SKIP_AUTHORS: RegExp[] = [/dependabot/i, /renovate/i];
export const SKIP_TITLES: RegExp[] = [
    /^(chore|ci|build|test|tests|docs|refactor|style|revert)(\([^)]*\))?!?:/i,
    /\bbump(s|ed)?\b/i,
    /^staging$/i,
    /^merge\b/i,
    // Housekeeping after a code review, not a feature that mentions reviews.
    /\b(address|apply|clear|resolve)\b.*\breview\b|\breview (comments|feedback|findings|fixes)\b/i,
    /^release v?\d/i,
    /^(update|set) version\b/i,
    /^wip\b/i,
    // "1790 revert changes": a bare PR number sometimes leads a revert's title.
    /^(\d+\s+)?revert\b/i,
    // Dependencies, tests, CI and docs: work users never see.
    /\b(deps|dependencies)\b/i,
    /\b(e2e|playwright|smoke tests?|unit tests?|flaky|pom)\b/i,
    /\b(workflows?|trivy|ci)\b/i,
    /\breadme\b/i,
];

const FIELD = "\x1f";
const RECORD = "\x1e";
/** The `git log --format` that `parseGitLog` reads. */
export const GIT_LOG_FORMAT = `%an${FIELD}%s${FIELD}%b${RECORD}`;

const MERGE_SUBJECT = /^Merge pull request #(\d+) from [^/\s]+\/(\S+)/;
const SQUASH_SUBJECT = /^(.*\S)\s+\(#(\d+)\)$/;

/**
 * Merged PRs in a `git log --format=GIT_LOG_FORMAT` dump, oldest first and one
 * per PR number. A merge commit carries the PR title as its body; a squash
 * commit carries it as its subject. Plain commits are not PRs and are dropped.
 */
export function parseGitLog(log: string): MergedPr[] {
    const byNumber = new Map<number, MergedPr>();
    log.split(RECORD).forEach((record) => {
        const [author = "", subject = "", body = ""] = record.replace(/^\n+/, "").split(FIELD);
        const merge = MERGE_SUBJECT.exec(subject);
        const squash = merge ? null : SQUASH_SUBJECT.exec(subject);
        let pr: MergedPr | undefined;
        if (merge) {
            const title = body.split("\n").map((l) => l.trim()).find(Boolean) ?? merge[2];
            pr = { number: Number(merge[1]), title, branch: merge[2], author };
        } else if (squash) {
            pr = { number: Number(squash[2]), title: squash[1], author };
        }
        if (pr && !byNumber.has(pr.number)) byNumber.set(pr.number, pr);
    });
    // git log lists newest first.
    return [...byNumber.values()].reverse();
}

const CONVENTIONAL = /^(\w+)(\([^)]*\))?!?:\s*/;
// "[codex] ", "Fix #1595 #1418 ", "Fix #12: ": noise in front of the real title.
const TITLE_NOISE = /^(\[[^\]]*\]\s*|(fix(es)?\s+)?(#\d+[\s,:–-]*)+)+/i;

/** The title without leading tags and issue references; any conventional prefix stays. */
export function cleanTitle(title: string): string {
    return title.replace(TITLE_NOISE, "").trim();
}

/**
 * A PR opened from a long commit message gets its title cut at "…" and the
 * rest moved to the start of the description, also behind "…". Puts the two
 * back together; any other title comes back unchanged.
 */
export function joinTruncatedTitle(title: string, body: string): string {
    const rest = body.split("\n")[0];
    if (!title.endsWith("…") || !rest.startsWith("…")) return title;
    return `${title.slice(0, -1)}${rest.slice(1)}`.replace(/\s+/g, " ").trim();
}

/** Why `pr` stays out of the announcement, or null if it belongs in it. */
export function skipReason(pr: MergedPr): string | null {
    const branch = pr.branch && SKIP_BRANCHES.find((p) => p.test(pr.branch!));
    if (branch) return `branch ${branch}`;
    const author = SKIP_AUTHORS.find((p) => p.test(pr.author));
    if (author) return `author ${author}`;
    const clean = cleanTitle(pr.title);
    const text = clean.replace(CONVENTIONAL, "").trim();
    // "Fix #1234" says nothing once the noise is gone.
    if (!text) return "empty title";
    const forms = [pr.title, clean, text];
    const title = SKIP_TITLES.find((p) => forms.some((form) => p.test(form)));
    if (title) return `title ${title}`;
    return null;
}

const KIND_BY_TYPE: Record<string, ReleaseNoteKind> = { feat: "feature", fix: "fix", perf: "improvement" };
const KIND_ORDER: ReleaseNoteKind[] = ["feature", "improvement", "fix"];

/** "Fix #12 feat(tabs): shareable links" → { kind: "feature", title: "Shareable links" }. */
export function toItem(pr: MergedPr): ReleaseNoteItem {
    const clean = cleanTitle(pr.title);
    const type = CONVENTIONAL.exec(clean)?.[1].toLowerCase() ?? "";
    const text = clean.replace(CONVENTIONAL, "").trim();
    return { kind: KIND_BY_TYPE[type] ?? "improvement", title: text.charAt(0).toUpperCase() + text.slice(1) };
}

export interface Draft {
    items: { item: ReleaseNoteItem; pr: number }[];
    skipped: { pr: MergedPr; reason: string }[];
}

/** Sorts the PRs into announcement items (features, then improvements, then fixes) and skipped ones. */
export function draftFromPrs(prs: MergedPr[]): Draft {
    const draft: Draft = { items: [], skipped: [] };
    prs.forEach((pr) => {
        const reason = skipReason(pr);
        if (reason) draft.skipped.push({ pr, reason });
        else draft.items.push({ item: toItem(pr), pr: pr.number });
    });
    draft.items.sort((a, b) => KIND_ORDER.indexOf(a.item.kind) - KIND_ORDER.indexOf(b.item.kind));
    return draft;
}

/** The TypeScript source of a draft entry, indented to sit inside `RELEASE_NOTES`. */
export function renderDraftEntry(version: string, date: string, items: Draft["items"]): string {
    const lines = items.map(({ item, pr }) => `            { kind: ${JSON.stringify(item.kind)}, title: ${JSON.stringify(item.title)} }, // #${pr}`);
    return [
        "    {",
        `        version: ${JSON.stringify(version)},`,
        `        date: ${JSON.stringify(date)},`,
        "        // Generated from merged PRs: rewrite for users, add descriptions, drop what",
        "        // doesn't belong, then remove `draft` so production shows it.",
        "        draft: true,",
        "        items: [",
        ...lines,
        "        ],",
        "    },",
    ].join("\n");
}

export const INSERT_MARKER = "// @release-notes:insert";

/** `source` with `entry` placed right after the insert marker (so newest stays first). */
export function insertEntry(source: string, version: string, entry: string): string {
    // Only the canonical form ("2.6.0", not "v2.6.0" or " 2.6.0 ") can be
    // compared as text, and it's the form the entry is written with.
    if (parseVersion(version)?.join(".") !== version) throw new Error(`Invalid version: ${version}`);
    // A valid version is digits and dots only, so a plain substring check is exact.
    if (source.includes(`version: "${version}"`)) {
        throw new Error(`An entry for ${version} already exists; edit or delete it first.`);
    }
    const at = source.indexOf(INSERT_MARKER);
    if (at === -1) throw new Error(`Insert marker "${INSERT_MARKER}" not found.`);
    const lineEnd = source.indexOf("\n", at);
    return `${source.slice(0, lineEnd + 1)}${entry}\n${source.slice(lineEnd + 1)}`;
}
