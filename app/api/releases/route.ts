import { NextResponse } from "next/server";
import { sortReleases, type Release } from "@/lib/releaseNotes";

const RELEASES_URL = "https://api.github.com/repos/FalkorDB/falkordb-browser/releases?per_page=100";
// GitHub allows 60 unauthenticated requests an hour per server, so a fresh
// list is kept for an hour and a failed refresh waits before trying again.
const CACHE_MS = 60 * 60 * 1000;
const RETRY_MS = 5 * 60 * 1000;
// With nothing cached every request is failing, so try again sooner.
const COLD_RETRY_MS = 60 * 1000;
const TIMEOUT_MS = 10_000;
// Enough pages for 1000 releases; a bound in case the Link header ever loops.
const MAX_PAGES = 10;

type GithubRelease = {
    tag_name: string;
    name: string | null;
    published_at: string | null;
    body: string | null;
    html_url: string;
    draft: boolean;
    prerelease: boolean;
};

let cache: { releases: Release[]; fetchedAt: number } | undefined;
let retryAt = 0;
// Requests that arrive while a refresh is running share it.
let refreshing: Promise<void> | undefined;

const nextPage = (link: string | null) => /<([^>]+)>;\s*rel="next"/.exec(link ?? "")?.[1];

async function fetchReleases(): Promise<Release[]> {
    const releases: GithubRelease[] = [];
    let url: string | undefined = RELEASES_URL;
    for (let page = 0; url && page < MAX_PAGES; page += 1) {
        const res: Response = await fetch(url, {
            headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
            cache: "no-store",
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        if (!res.ok) throw new Error(`GitHub releases request failed: ${res.status}`);
        releases.push(...((await res.json()) as GithubRelease[]));
        url = nextPage(res.headers.get("link"));
    }
    // GitHub sometimes answers 200 with an empty list; this repository always
    // has releases, so treat that as a failure rather than cache it for an hour.
    const published = releases.filter((r) => !r.draft && !r.prerelease);
    if (published.length === 0) throw new Error("GitHub releases request returned no published releases");
    return published
        .map((r) => ({
            tag: r.tag_name,
            name: r.name || r.tag_name,
            publishedAt: r.published_at ?? "",
            body: r.body ?? "",
            url: r.html_url,
        }));
}

async function refresh(): Promise<void> {
    try {
        cache = { releases: await fetchReleases(), fetchedAt: Date.now() };
    } catch (err) {
        console.error(err);
        retryAt = Date.now() + (cache ? RETRY_MS : COLD_RETRY_MS);
    }
}

export async function GET() {
    const stale = !cache || Date.now() - cache.fetchedAt > CACHE_MS;
    if (stale && Date.now() >= retryAt) {
        refreshing ??= refresh().finally(() => { refreshing = undefined; });
        await refreshing;
    }
    // A stale list beats none; only GitHub being unreachable from a cold start fails.
    if (!cache) return NextResponse.json({ error: "Release notes are unavailable right now." }, { status: 502 });
    return NextResponse.json({ releases: sortReleases(cache.releases) });
}
