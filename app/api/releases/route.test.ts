import assert from "node:assert/strict";
import test, { after } from "node:test";
import { registerHooks } from "node:module";

const routeUrl = new URL("./route.ts", import.meta.url).href;
const releaseNotesUrl = new URL("../../../lib/releaseNotes.ts", import.meta.url).href;

const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl && specifier === "@/lib/releaseNotes") {
            return nextResolve(releaseNotesUrl, context);
        }
        if (context.parentURL === routeUrl && specifier === "next/server") {
            return nextResolve("next/server.js", context);
        }
        return nextResolve(specifier, context);
    },
});

const { GET } = await import("./route.ts");

after(() => hooks.deregister());

type GithubRelease = {
    tag_name: string;
    name: string | null;
    published_at: string | null;
    body: string | null;
    html_url: string;
    draft: boolean;
    prerelease: boolean;
};

function githubRelease(overrides: Partial<GithubRelease> = {}): GithubRelease {
    const tag = overrides.tag_name ?? "v1.0.0";
    return {
        tag_name: tag,
        name: "Release",
        published_at: "2023-11-14T22:13:20Z",
        body: "Release notes",
        html_url: `https://github.com/FalkorDB/falkordb-browser/releases/tag/${tag}`,
        draft: false,
        prerelease: false,
        ...overrides,
    };
}

function githubResponse(releases: GithubRelease[], link?: string): Response {
    return new Response(JSON.stringify(releases), {
        status: 200,
        headers: link ? { link } : undefined,
    });
}

test("GET paginates, filters, maps and caches releases with stale fallback", async (t) => {
    t.mock.timers.enable({ apis: ["Date"], now: 1_700_000_000_000 });
    t.mock.method(console, "error", () => {});

    const fetchCalls: Array<{ url: string; init?: RequestInit }> = [];
    t.mock.method(globalThis, "fetch", async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        fetchCalls.push({ url, init });
        if (fetchCalls.length === 1) {
            return new Response("GitHub unavailable", { status: 503 });
        }
        if (fetchCalls.length === 12) return githubResponse([]);
        if (fetchCalls.length === 13) {
            return githubResponse([githubRelease({ tag_name: "v2.6.0", name: "v2.6.0" })]);
        }
        if (fetchCalls.length === 2) {
            return githubResponse([
                githubRelease({ tag_name: "v1.0.0", name: null, published_at: null, body: null }),
                githubRelease({ tag_name: "v2.0.0", name: "" }),
                githubRelease({ tag_name: "v4.0.0", draft: true }),
                githubRelease({ tag_name: "v3.0.0", prerelease: true }),
            ], `<https://api.github.com/repos/FalkorDB/falkordb-browser/releases?page=2>; rel="next"`);
        }
        const page = fetchCalls.length - 1;
        const releases = page === 2 ? [githubRelease({ tag_name: "v2.5.0", name: "v2.5.0" })] : [];
        return githubResponse(
            releases,
            `<https://api.github.com/repos/FalkorDB/falkordb-browser/releases?page=${page + 1}>; rel="next"`
        );
    });

    const coldResponse = await GET();
    assert.equal(coldResponse.status, 502);
    assert.deepEqual(await coldResponse.json(), {
        error: "Release notes are unavailable right now.",
    });
    assert.equal(fetchCalls.length, 1);

    const coolingDownResponse = await GET();
    assert.equal(coolingDownResponse.status, 502);
    assert.equal(fetchCalls.length, 1);

    t.mock.timers.tick(60_000);
    const refreshedResponse = await GET();
    assert.equal(refreshedResponse.status, 200);
    assert.deepEqual(await refreshedResponse.json(), {
        releases: [
            {
                tag: "v2.5.0",
                name: "v2.5.0",
                publishedAt: "2023-11-14T22:13:20Z",
                body: "Release notes",
                url: "https://github.com/FalkorDB/falkordb-browser/releases/tag/v2.5.0",
            },
            {
                tag: "v2.0.0",
                name: "v2.0.0",
                publishedAt: "2023-11-14T22:13:20Z",
                body: "Release notes",
                url: "https://github.com/FalkorDB/falkordb-browser/releases/tag/v2.0.0",
            },
            {
                tag: "v1.0.0",
                name: "v1.0.0",
                publishedAt: "",
                body: "",
                url: "https://github.com/FalkorDB/falkordb-browser/releases/tag/v1.0.0",
            },
        ],
    });
    assert.equal(fetchCalls.length, 11);
    assert.equal(fetchCalls[0].url, "https://api.github.com/repos/FalkorDB/falkordb-browser/releases?per_page=100");
    assert.equal(fetchCalls[1].url, "https://api.github.com/repos/FalkorDB/falkordb-browser/releases?per_page=100");
    assert.equal(fetchCalls[2].url, "https://api.github.com/repos/FalkorDB/falkordb-browser/releases?page=2");
    assert.equal(fetchCalls[10].url, "https://api.github.com/repos/FalkorDB/falkordb-browser/releases?page=10");
    assert.deepEqual(fetchCalls[2].init?.headers, {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    });
    assert.equal(fetchCalls[2].init?.cache, "no-store");

    const cachedResponse = await GET();
    assert.equal(cachedResponse.status, 200);
    assert.equal(fetchCalls.length, 11);

    t.mock.timers.tick(3_600_001);
    const staleResponse = await GET();
    assert.equal(staleResponse.status, 200);
    assert.deepEqual(await staleResponse.json(), await cachedResponse.json());
    assert.equal(fetchCalls.length, 12);

    const staleDuringCooldown = await GET();
    assert.equal(staleDuringCooldown.status, 200);
    assert.equal(fetchCalls.length, 12);

    t.mock.timers.tick(300_000);
    const retriedResponse = await GET();
    assert.equal(retriedResponse.status, 200);
    assert.deepEqual(await retriedResponse.json(), {
        releases: [{
            tag: "v2.6.0",
            name: "v2.6.0",
            publishedAt: "2023-11-14T22:13:20Z",
            body: "Release notes",
            url: "https://github.com/FalkorDB/falkordb-browser/releases/tag/v2.6.0",
        }],
    });
    assert.equal(fetchCalls.length, 13);
});
