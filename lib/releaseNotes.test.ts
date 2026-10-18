import test from "node:test";
import assert from "node:assert/strict";
import {
    compareVersions,
    displayBody,
    extractWhatsNew,
    parseVersion,
    releaseForVersion,
    seenCovers,
    sortReleases,
    type Release,
} from "./releaseNotes.ts";

const release = (tag: string, body = ""): Release => ({
    tag,
    name: tag,
    publishedAt: "2026-10-12T00:00:00Z",
    body,
    url: `https://github.com/FalkorDB/falkordb-browser/releases/tag/${tag}`,
});

const POLISHED = `<!-- polished-release-notes -->
## What's New
- **Shareable links** — copy the address bar to share a graph.
- **Mobile layout** — works on small screens.

### ✨ New features
- Something. ([#1](https://github.com/x/y/pull/1))

**Full Changelog**: https://github.com/x/y/compare/v1.0.0...v1.1.0

<details>
<summary>Original generated notes</summary>

## What's Changed
* feat: something by @dev in https://github.com/x/y/pull/1
</details>
`;

test("parseVersion accepts plain and v-prefixed semver only", () => {
    assert.deepEqual(parseVersion("2.6.1"), [2, 6, 1]);
    assert.deepEqual(parseVersion(" v10.0.12 "), [10, 0, 12]);
    assert.equal(parseVersion("2.6"), null);
    assert.equal(parseVersion("v.1.4.4"), null);
    assert.equal(parseVersion("02.6.2"), null);
    assert.equal(parseVersion(""), null);
    assert.equal(parseVersion(null), null);
    assert.equal(parseVersion(undefined), null);
});

test("compareVersions orders numerically, not lexically", () => {
    assert.ok(compareVersions("2.10.0", "2.9.9") > 0);
    assert.ok(compareVersions("v2.6.2", "2.6.10") < 0);
    assert.equal(compareVersions("v2.6.1", "2.6.1"), 0);
    assert.throws(() => compareVersions("nope", "2.6.1"), /Invalid version: nope/);
    assert.throws(() => compareVersions("2.6.1", "nope"), /Invalid version: nope/);
});

test("sortReleases keeps version tags, newest first", () => {
    const sorted = sortReleases([release("v2.5.3"), release("v.1.4.4"), release("v2.10.0"), release("v2.6.0")]);
    assert.deepEqual(sorted.map((r) => r.tag), ["v2.10.0", "v2.6.0", "v2.5.3"]);
});

test("releaseForVersion picks the running release, or the newest one before it", () => {
    const releases = [release("v2.6.0"), release("v2.6.2"), release("v2.7.0")];
    assert.equal(releaseForVersion(releases, "2.6.2")?.tag, "v2.6.2");
    assert.equal(releaseForVersion(releases, "2.6.5")?.tag, "v2.6.2");
    assert.equal(releaseForVersion(releases, "2.5.0"), undefined);
    assert.equal(releaseForVersion(releases, "dev"), undefined);
});

test("displayBody drops the workflow marker and the original generated notes", () => {
    const shown = displayBody(POLISHED);
    assert.ok(shown.startsWith("## What's New"));
    assert.ok(!shown.includes("polished-release-notes"));
    assert.ok(!shown.includes("Original generated notes"));
    assert.ok(shown.endsWith("compare/v1.0.0...v1.1.0"));
    assert.equal(displayBody("## What's Changed\n* a"), "## What's Changed\n* a");
});

test("extractWhatsNew returns the section's bullets up to the next heading", () => {
    assert.equal(
        extractWhatsNew(POLISHED),
        "- **Shareable links** — copy the address bar to share a graph.\n- **Mobile layout** — works on small screens.",
    );
    assert.equal(extractWhatsNew("## What’s new\n- a\n<details>\nx\n</details>"), "- a");
    assert.equal(extractWhatsNew("## What's New\n- only section"), "- only section");
});

test("extractWhatsNew returns null without a section or with an empty one", () => {
    assert.equal(extractWhatsNew("## What's Changed\n* feat: x"), null);
    assert.equal(extractWhatsNew("## What's New\n\n### ✨ New features\n- x"), null);
    assert.equal(extractWhatsNew(""), null);
});

test("seenCovers treats the seen release and older ones as done", () => {
    assert.equal(seenCovers("v2.7.0", "v2.7.0"), true);
    assert.equal(seenCovers("v2.7.0", "v2.6.2"), true);
    assert.equal(seenCovers("v999.0.0", "v2.7.0"), true);
    assert.equal(seenCovers("v2.6.2", "v2.7.0"), false);
    assert.equal(seenCovers(null, "v2.7.0"), false);
    assert.equal(seenCovers("garbage", "v2.7.0"), false);
    assert.equal(seenCovers("v2.7.0", "garbage"), false);
});
