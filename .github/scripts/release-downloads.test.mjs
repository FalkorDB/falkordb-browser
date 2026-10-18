import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { END, START, downloadsSection, stripDownloads, withDownloads } from "./release-downloads.mjs";

const REPO = "FalkorDB/falkordb-browser";
const url = (tag, file) => `https://github.com/${REPO}/releases/download/${tag}/${file}`;
const ALL = [
    "FalkorDB-Browser-mac-arm64.dmg",
    "FalkorDB-Browser-mac-x64.dmg",
    "FalkorDB-Browser-mac-arm64.zip",
    "FalkorDB-Browser-win-x64.exe",
    "FalkorDB-Browser-linux-x86_64.AppImage",
    "FalkorDB-Browser-android.apk",
];
const DETAILS = "<details>\n<summary>Original generated notes</summary>\n\nraw notes\n</details>\n";
// What the polish step saves: its marker, the notes, the collapsed originals.
const polishedNotes = (text = "notes") => `<!-- polished-release-notes -->\n${text}\n\n${DETAILS}`;

test("every attached installer gets a link to this release's own file", () => {
    const section = downloadsSection(REPO, "v2.7.0", ALL);
    assert.ok(section.startsWith(START) && section.endsWith(END));
    assert.match(section, /^## Download$/m);
    assert.ok(section.includes(`- **macOS:** [Apple silicon](${url("v2.7.0", "FalkorDB-Browser-mac-arm64.dmg")}) · [Intel](${url("v2.7.0", "FalkorDB-Browser-mac-x64.dmg")})`));
    assert.ok(section.includes(`- **Windows:** [Installer](${url("v2.7.0", "FalkorDB-Browser-win-x64.exe")})`));
    assert.ok(section.includes(`- **Linux:** [AppImage](${url("v2.7.0", "FalkorDB-Browser-linux-x86_64.AppImage")})`));
    assert.ok(section.includes(`- **Android:** [APK](${url("v2.7.0", "FalkorDB-Browser-android.apk")})`));
    // The zip is for updaters, not people.
    assert.ok(!section.includes(".zip"));
    assert.match(section, /not code-signed/);
});

test("only files that are attached are listed, so there is never a dead link", () => {
    const section = downloadsSection(REPO, "v2.7.0", ["FalkorDB-Browser-linux-x86_64.AppImage", "FalkorDB-Browser-android.apk"]);
    assert.ok(section.includes("**Linux:**") && section.includes("**Android:**"));
    assert.ok(!section.includes("**macOS:**") && !section.includes("**Windows:**"));
    // Neither file is a macOS or Windows app, so there is nothing unsigned to warn about.
    assert.doesNotMatch(section, /not code-signed/);
    assert.ok(!downloadsSection(REPO, "v2.7.0", ["FalkorDB-Browser-mac-x64.dmg"]).includes("Apple silicon"));
});

test("a release with no installers gets no section", () => {
    assert.equal(downloadsSection(REPO, "v2.6.2", []), "");
    assert.equal(downloadsSection(REPO, "v2.6.2", ["notes.txt", "FalkorDB-Browser-mac-arm64.zip"]), "");
});

test("the tag and file names are encoded in the links", () => {
    const section = downloadsSection(REPO, "v3.0.0+build 1", ["FalkorDB-Browser-linux-x86_64.AppImage"]);
    assert.ok(section.includes("/download/v3.0.0%2Bbuild%201/"));
});

test("the section goes just before the collapsed original notes", () => {
    const polished = `<!-- polished-release-notes -->\n### 🐛 Bug fixes\n- Fixed it.\n\n${DETAILS}`;
    const section = downloadsSection(REPO, "v2.7.0", ALL);
    const body = withDownloads(polished, section);
    assert.ok(body.indexOf(section) < body.indexOf("<details>"));
    assert.ok(body.indexOf("- Fixed it.") < body.indexOf(section));
    // The polish step finds its stored notes at the very end; that must still hold.
    assert.match(body, /\n<\/details>\s*$/);
});

test("without stored original notes, the section goes at the end", () => {
    const body = withDownloads("## What's Changed\n* A change\n", downloadsSection(REPO, "v2.7.0", ALL));
    assert.ok(body.startsWith("## What's Changed\n* A change\n\n" + START));
    assert.ok(body.trimEnd().endsWith(END));
});

test("updating replaces the old section instead of adding another", () => {
    const first = withDownloads(polishedNotes(), downloadsSection(REPO, "v2.7.0", ["FalkorDB-Browser-linux-x86_64.AppImage"]));
    const second = withDownloads(first, downloadsSection(REPO, "v2.7.0", ALL));
    assert.equal(second.split(START).length - 1, 1);
    assert.ok(second.includes("**Android:**"));
    // Running again with the same files changes nothing.
    assert.equal(withDownloads(second, downloadsSection(REPO, "v2.7.0", ALL)), second);
});

test("stripDownloads gives back the notes without the section", () => {
    const notes = polishedNotes();
    assert.equal(stripDownloads(withDownloads(notes, downloadsSection(REPO, "v2.7.0", ALL))), notes);
    assert.equal(stripDownloads("no section here"), "no section here");
    // An empty section removes an old one.
    assert.equal(withDownloads(withDownloads(notes, downloadsSection(REPO, "v2.7.0", ALL)), ""), notes);
});

test("unpolished notes get the section at their very end, and lose only that", () => {
    const raw = "## What's Changed\n* A change\n";
    const body = withDownloads(raw, downloadsSection(REPO, "v2.7.0", ALL));
    assert.ok(body.trimEnd().endsWith(END));
    assert.equal(stripDownloads(body), raw.trimEnd());
});

test("marker text that is not this script's section is never deleted", () => {
    // A PR title quoting the markers, in GitHub's raw notes.
    const quoted = `* Docs: explain ${START} and ${END} in https://github.com/${REPO}/pull/9`;
    const raw = `## What's Changed\n${quoted}\n* Another change\n`;
    assert.equal(stripDownloads(raw), raw, "a quote in the middle is not a section");
    const body = withDownloads(raw, downloadsSection(REPO, "v2.7.0", ALL));
    assert.ok(body.includes(quoted) && body.includes("* Another change"));
    assert.equal(stripDownloads(body), raw.trimEnd());

    // The same quote inside the collapsed original notes of polished notes.
    const polished = `<!-- polished-release-notes -->\nnotes\n\n<details>\n<summary>Original generated notes</summary>\n\n${quoted}\n</details>\n`;
    assert.equal(stripDownloads(polished), polished);
    const updated = withDownloads(polished, downloadsSection(REPO, "v2.7.0", ALL));
    assert.ok(updated.includes(quoted));
    assert.equal(updated.split(START).length - 1, 2, "the quote plus one real section");
    assert.ok(updated.indexOf("## Download") < updated.indexOf("<details>"));
    assert.equal(stripDownloads(updated), polished);
});

test("a final line quoting the markers is not taken for the section", () => {
    const raw = `## What's Changed\n* Docs: explain ${START} ... ${END}`;
    assert.equal(stripDownloads(raw), raw);
    const body = withDownloads(raw, downloadsSection(REPO, "v2.7.0", ALL));
    assert.ok(body.includes(`* Docs: explain ${START} ... ${END}`), "the quoted line survives");
    assert.equal(stripDownloads(body), raw);
});

test("text written below the section stays, and the section is updated where it is", () => {
    const linux = downloadsSection(REPO, "v2.7.0", ["FalkorDB-Browser-linux-x86_64.AppImage"]);
    const edited = `${withDownloads(polishedNotes(), linux).replace("\n\n<details>", "\n\nThanks to everyone who tested this release.\n\n<details>")}`;
    const updated = withDownloads(edited, downloadsSection(REPO, "v2.7.0", ALL));
    assert.equal(updated.split(START).length - 1, 1, "no second section");
    assert.ok(updated.includes("**Android:**"));
    const thanks = updated.indexOf("Thanks to everyone");
    assert.ok(updated.indexOf("## Download") < thanks && thanks < updated.indexOf("<details>"), "the section kept its place above the note");
    assert.ok(!stripDownloads(updated).includes("## Download") && stripDownloads(updated).includes("Thanks to everyone"));
});

test("two generated sections settle into one, on update and on strip", () => {
    const linux = downloadsSection(REPO, "v2.7.0", ["FalkorDB-Browser-linux-x86_64.AppImage"]);
    const twice = `notes\n\n${linux}\n\nmiddle text\n\n${linux}\n`;
    const updated = withDownloads(twice, downloadsSection(REPO, "v2.7.0", ALL));
    assert.equal(updated.split(START).length - 1, 1, "one section left");
    assert.ok(updated.includes("**Android:**") && updated.includes("middle text"));
    assert.equal(withDownloads(updated, downloadsSection(REPO, "v2.7.0", ALL)), updated, "and it stays settled");
    assert.equal(stripDownloads(twice), "notes\n\nmiddle text");
});

test("\\r\\n line endings still match, so no second section is added", () => {
    const linux = downloadsSection(REPO, "v2.7.0", ["FalkorDB-Browser-linux-x86_64.AppImage"]);
    const crlf = `notes\n\n${linux}\n`.replaceAll("\n", "\r\n");
    assert.equal(stripDownloads(crlf), "notes");
    const updated = withDownloads(crlf, downloadsSection(REPO, "v2.7.0", ALL));
    assert.equal(updated, `notes\n\n${downloadsSection(REPO, "v2.7.0", ALL)}\n`);
});

test("syncDownloads catches up when another workflow attaches a file meanwhile", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "release-downloads-"));
    try {
        // A stand-in gh: `release view` returns the stored body and files; the
        // first `release edit` also "attaches" the APK, as a concurrent job would.
        const state = path.join(dir, "state.json");
        writeFileSync(state, JSON.stringify({ body: polishedNotes(), assets: [{ name: "FalkorDB-Browser-linux-x86_64.AppImage" }], edits: 0 }));
        const gh = path.join(dir, "gh");
        writeFileSync(gh, `#!/usr/bin/env node
const fs = require("fs");
const s = JSON.parse(fs.readFileSync(${JSON.stringify(state)}, "utf8"));
const args = process.argv.slice(2);
if (args[0] === "release" && args[1] === "view") { process.stdout.write(JSON.stringify({ body: s.body, assets: s.assets })); process.exit(0); }
if (args[0] === "release" && args[1] === "edit") {
  s.body = fs.readFileSync(0, "utf8"); s.edits += 1;
  if (s.edits === 1) s.assets.push({ name: "FalkorDB-Browser-android.apk" });
  fs.writeFileSync(${JSON.stringify(state)}, JSON.stringify(s)); process.exit(0);
}
process.exit(1);
`);
        chmodSync(gh, 0o755);
        const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "release-downloads.mjs");
        execFileSync(process.execPath, [script], {
            env: { ...process.env, PATH: `${dir}${path.delimiter}${process.env.PATH}`, RELEASE_TAG: "v2.7.0", GITHUB_REPOSITORY: REPO },
            stdio: "pipe",
        });
        const final = JSON.parse(readFileSync(state, "utf8"));
        assert.equal(final.edits, 2, "one write, then one more for the file that arrived");
        assert.ok(final.body.includes("**Linux:**") && final.body.includes("**Android:**"));
        assert.match(final.body, /\n<\/details>\s*$/);
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});
