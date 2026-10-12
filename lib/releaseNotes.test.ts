import test from "node:test";
import assert from "node:assert/strict";
import { compareVersions, parseVersion, publishedReleases, type ReleaseNote } from "./releaseNotes.ts";

const release = (version: string, overrides: Partial<ReleaseNote> = {}): ReleaseNote => ({
    version,
    date: "2026-10-12",
    items: [{ kind: "feature", title: `In ${version}` }],
    ...overrides,
});

test("parseVersion accepts plain and v-prefixed semver only", () => {
    assert.deepEqual(parseVersion("2.6.1"), [2, 6, 1]);
    assert.deepEqual(parseVersion(" v10.0.12 "), [10, 0, 12]);
    assert.equal(parseVersion("2.6"), null);
    assert.equal(parseVersion("v.1.4.4"), null);
    assert.equal(parseVersion("02.6.2"), null);
    assert.equal(parseVersion("2.06.2"), null);
    assert.deepEqual(parseVersion("2.0.10"), [2, 0, 10]);
    assert.equal(parseVersion(""), null);
    assert.equal(parseVersion(null), null);
    assert.equal(parseVersion(undefined), null);
});

test("compareVersions orders numerically, not lexically", () => {
    assert.ok(compareVersions("2.10.0", "2.9.9") > 0);
    assert.ok(compareVersions("2.6.1", "3.0.0") < 0);
    assert.ok(compareVersions("2.6.2", "2.6.10") < 0);
    assert.equal(compareVersions("v2.6.1", "2.6.1"), 0);
    assert.throws(() => compareVersions("nope", "2.6.1"), /Invalid version: nope/);
    assert.throws(() => compareVersions("2.6.1", "nope"), /Invalid version: nope/);
});

test("publishedReleases sorts newest first and drops empty, invalid and (outside dev) draft entries", () => {
    const releases = [
        release("2.6.0"),
        release("2.8.0", { draft: true }),
        release("2.7.0"),
        release("2.5.0", { items: [] }),
        release("bad"),
    ];
    assert.deepEqual(publishedReleases(releases, false).map((r) => r.version), ["2.7.0", "2.6.0"]);
    assert.deepEqual(publishedReleases(releases, true).map((r) => r.version), ["2.8.0", "2.7.0", "2.6.0"]);
});
