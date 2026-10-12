import test from "node:test";
import assert from "node:assert/strict";
import {
    INSERT_MARKER,
    cleanTitle,
    joinTruncatedTitle,
    draftFromPrs,
    insertEntry,
    parseGitLog,
    renderDraftEntry,
    skipReason,
    toItem,
    type MergedPr,
} from "./releaseNotesDraft.ts";

const commit = (author: string, subject: string, body = "") => `${author}\x1f${subject}\x1f${body}\x1e\n`;
const pr = (overrides: Partial<MergedPr> = {}): MergedPr => ({ number: 1, title: "feat: thing", author: "dev", ...overrides });

test("parseGitLog reads merge and squash commits, oldest first, one per PR", () => {
    const log = [
        commit("dev", "Merge pull request #30 from FalkorDB/feat/search", "\nfeat: search anywhere\n\nmore detail"),
        commit("dependabot[bot]", "chore(deps): bump x from 1 to 2 (#29)", "Bumps x."),
        commit("dev", "fix: a branch commit, not a PR"),
        commit("dev", "Merge branch 'main' into staging"),
        commit("dev", "Merge pull request #28 from FalkorDB/no-body"),
        commit("dev", "Merge pull request #30 from FalkorDB/feat/search", "feat: duplicate"),
    ].join("");
    assert.deepEqual(parseGitLog(log), [
        { number: 28, title: "no-body", branch: "no-body", author: "dev" },
        { number: 29, title: "chore(deps): bump x from 1 to 2", author: "dependabot[bot]" },
        { number: 30, title: "feat: search anywhere", branch: "feat/search", author: "dev" },
    ]);
    assert.deepEqual(parseGitLog(""), []);
});

test("skipReason filters bots, release plumbing and housekeeping", () => {
    assert.match(skipReason(pr({ branch: "dependabot/npm/x" }))!, /^branch/);
    assert.match(skipReason(pr({ branch: "staging", title: "Staging" }))!, /^branch/);
    assert.match(skipReason(pr({ branch: "release-notes/v2.7.0" }))!, /^branch/);
    assert.match(skipReason(pr({ author: "dependabot[bot]" }))!, /^author/);
    assert.match(skipReason(pr({ title: "chore(version): update version to 2.6.0" }))!, /^title/);
    assert.match(skipReason(pr({ title: "fix(deps): bump sharp to 0.35.5" }))!, /^title/);
    assert.match(skipReason(pr({ title: "fix: address review comments on the staging PR" }))!, /^title/);
    assert.match(skipReason(pr({ title: "docs: readme" }))!, /^title/);
    assert.match(skipReason(pr({ title: "fix: Update version to 2.3.0 in package.json" }))!, /^title/);
    assert.match(skipReason(pr({ title: "Fix #1983 fix/helm workflow duplicate with" }))!, /^title/);
    assert.match(skipReason(pr({ title: "Update Deps" }))!, /^title/);
    assert.match(skipReason(pr({ title: "Stabilize chat e2e tests" }))!, /^title/);
    assert.match(skipReason(pr({ title: "Add Playwright smoke tests against docker images" }))!, /^title/);
    assert.match(skipReason(pr({ title: "fix: Handle confirmation dialog in deleteChatApiKey POM method" }))!, /^title/);
    assert.match(skipReason(pr({ title: "Add dedicated daily Trivy security scan workflow" }))!, /^title/);
    assert.match(skipReason(pr({ title: "README - Fixes a typo" }))!, /^title/);
    assert.match(skipReason(pr({ title: "[codex] docs: align Helm chart install instructions" }))!, /^title/);
    assert.match(skipReason(pr({ title: "1790 revert changes - allow a sub path" }))!, /^title/);
    assert.equal(skipReason(pr({ branch: "feat/x", title: "feat: real work" })), null);
    assert.equal(skipReason(pr({ title: "Add support for serving the browser under a sub-path" })), null);
    assert.equal(skipReason(pr({ title: "feat: add a query review mode" })), null);
    assert.equal(skipReason(pr({ title: "2026 roadmap for graph viz" })), null);
    assert.equal(skipReason(pr({ title: "Fix #1234" })), "empty title");
    assert.equal(skipReason(pr({ title: "fix:" })), "empty title");
    assert.equal(skipReason(pr({ title: "Add a configurable graph list order" })), null);
});

test("cleanTitle drops leading tags, issue references and bare numbers", () => {
    assert.equal(cleanTitle("Fix #1595 #1418 Fix connection details"), "Fix connection details");
    assert.equal(cleanTitle("Fix #1186 feat(settings): enhance settings"), "feat(settings): enhance settings");
    assert.equal(cleanTitle("[codex] docs: align"), "docs: align");
    assert.equal(cleanTitle("1790 revert changes"), "1790 revert changes");
    assert.equal(cleanTitle("2026 roadmap"), "2026 roadmap");
    assert.equal(cleanTitle("#12, #13 Add layouts"), "Add layouts");
    assert.equal(cleanTitle("Fix login"), "Fix login");
    assert.equal(cleanTitle("Add 3 layouts"), "Add 3 layouts");
});

test("joinTruncatedTitle restores a title GitHub moved into the description", () => {
    assert.equal(joinTruncatedTitle("feat: edge customization and tab…", "… management\n\nmore"), "feat: edge customization and tab management");
    assert.equal(joinTruncatedTitle("fix: only on …", "…layout changes"), "fix: only on layout changes");
    assert.equal(joinTruncatedTitle("fix: whole title", "… stray"), "fix: whole title");
    assert.equal(joinTruncatedTitle("fix: cut…", "A normal description"), "fix: cut…");
});

test("toItem maps the conventional type to a kind and tidies the title", () => {
    assert.deepEqual(toItem(pr({ title: "feat(tabs): shareable links" })), { kind: "feature", title: "Shareable links" });
    assert.deepEqual(toItem(pr({ title: "fix!: crash" })), { kind: "fix", title: "Crash" });
    assert.deepEqual(toItem(pr({ title: "PERF: faster" })), { kind: "improvement", title: "Faster" });
    assert.deepEqual(toItem(pr({ title: "Add a toggle" })), { kind: "improvement", title: "Add a toggle" });
    assert.deepEqual(toItem(pr({ title: "Fix #1186 feat(settings): enhance settings" })), { kind: "feature", title: "Enhance settings" });
});

test("draftFromPrs keeps features, then improvements, then fixes, and lists what it skipped", () => {
    const draft = draftFromPrs([
        pr({ number: 1, title: "fix: one" }),
        pr({ number: 2, title: "chore: two" }),
        pr({ number: 3, title: "Three" }),
        pr({ number: 4, title: "feat: four" }),
    ]);
    assert.deepEqual(draft.items.map((i) => i.pr), [4, 3, 1]);
    assert.deepEqual(draft.skipped.map((s) => s.pr.number), [2]);
});

test("renderDraftEntry produces a draft entry that insertEntry places after the marker", () => {
    const entry = renderDraftEntry("2.7.0", "2026-10-12", [{ item: { kind: "feature", title: 'Say "hi"' }, pr: 7 }]);
    assert.match(entry, /version: "2\.7\.0",/);
    assert.match(entry, /draft: true,/);
    assert.match(entry, /\{ kind: "feature", title: "Say \\"hi\\"" \}, \/\/ #7/);

    const source = `export const X = [\n    ${INSERT_MARKER}\n    {\n        version: "2.6.0",\n    },\n];\n`;
    const updated = insertEntry(source, "2.7.0", entry);
    assert.ok(updated.indexOf("2.7.0") > updated.indexOf(INSERT_MARKER));
    assert.ok(updated.indexOf("2.7.0") < updated.indexOf("2.6.0"));
    assert.throws(() => insertEntry(updated, "2.7.0", entry), /already exists/);
    assert.throws(() => insertEntry("[]", "2.7.0", entry), /marker/);
    assert.throws(() => insertEntry(source, "2.7.0[", entry), /Invalid version/);
    assert.throws(() => insertEntry(source, "2.6.0", entry), /already exists/);
    assert.ok(insertEntry(source, "2.6.1", entry).includes(INSERT_MARKER));
});
