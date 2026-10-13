import { NextResponse } from "next/server";
import { sortReleases, type Release } from "@/lib/releaseNotes";

const RELEASES_URL = "https://api.github.com/repos/FalkorDB/falkordb-browser/releases?per_page=100";
// GitHub allows 60 unauthenticated requests an hour per server; one an hour is plenty.
const CACHE_MS = 60 * 60 * 1000;

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

async function fetchReleases(): Promise<Release[]> {
    const res = await fetch(RELEASES_URL, {
        headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
        cache: "no-store",
    });
    if (!res.ok) throw new Error(`GitHub releases request failed: ${res.status}`);
    const releases = (await res.json()) as GithubRelease[];
    return releases
        .filter((r) => !r.draft && !r.prerelease)
        .map((r) => ({
            tag: r.tag_name,
            name: r.name || r.tag_name,
            publishedAt: r.published_at ?? "",
            body: r.body ?? "",
            url: r.html_url,
        }));
}

export async function GET() {
    try {
        if (!cache || Date.now() - cache.fetchedAt > CACHE_MS) {
            cache = { releases: await fetchReleases(), fetchedAt: Date.now() };
        }
    } catch (err) {
        console.error(err);
        // A stale list beats none; only a cold start with GitHub unreachable fails.
        if (!cache) return NextResponse.json({ error: "Release notes are unavailable right now." }, { status: 502 });
    }
    return NextResponse.json({ releases: sortReleases(cache.releases) });
}
