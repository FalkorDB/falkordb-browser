const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// Guards #2210: macOS release installers must be signed with a Developer ID,
// notarized and verified, or Gatekeeper blocks the app on launch.
const workflow = fs.readFileSync(path.join(__dirname, "../../.github/workflows/desktop.yml"), "utf8");
const builderConfig = fs.readFileSync(path.join(__dirname, "../electron-builder.yml"), "utf8");

const RELEASE_ON_MAC = "runner.os == 'macOS' && github.event_name == 'release'";

function step(name) {
    const start = workflow.indexOf(`- name: ${name}`);
    assert.notEqual(start, -1, `workflow step "${name}" is missing`);
    const next = workflow.indexOf("\n      - name:", start + 1);
    const nextJob = workflow.indexOf("\n  attach-to-release:", start + 1);
    const ends = [next, nextJob].filter((index) => index !== -1);
    return workflow.slice(start, ends.length ? Math.min(...ends) : undefined);
}

test("macOS release builds fail without signing and notarization secrets", () => {
    const check = step("Verify macOS signing credentials");
    assert.match(check, new RegExp(`if: ${RELEASE_ON_MAC.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
    for (const secret of ["MACOS_CERTIFICATE_P12", "MACOS_CERTIFICATE_PASSWORD", "APPLE_ID", "APPLE_APP_SPECIFIC_PASSWORD", "APPLE_TEAM_ID"]) {
        assert.match(check, new RegExp(`${secret}: \\$\\{\\{ secrets\\.${secret} \\}\\}`), secret);
        assert.match(check, new RegExp(`-z "\\$${secret}"`), secret);
    }
    assert.match(check, /exit 1/);
});

test("macOS release builds pass the certificate and Apple credentials to electron-builder", () => {
    const build = step("Build signed macOS installers");
    assert.ok(build.includes(`if: ${RELEASE_ON_MAC}`));
    for (const [env, secret] of [
        ["CSC_LINK", "MACOS_CERTIFICATE_P12"],
        ["CSC_KEY_PASSWORD", "MACOS_CERTIFICATE_PASSWORD"],
        ["APPLE_ID", "APPLE_ID"],
        ["APPLE_APP_SPECIFIC_PASSWORD", "APPLE_APP_SPECIFIC_PASSWORD"],
        ["APPLE_TEAM_ID", "APPLE_TEAM_ID"],
    ]) {
        assert.ok(build.includes(`${env}: \${{ secrets.${secret} }}`), env);
    }
    assert.ok(build.includes('CSC_IDENTITY_AUTO_DISCOVERY: "true"'));
});

test("macOS release builds force code signing; notarization is enforced by ticket validation", () => {
    const build = step("Build signed macOS installers");
    assert.match(build, /-c\.mac\.forceCodeSigning=true/);
    assert.doesNotMatch(build, /-c\.mac\.notarize/);
    assert.match(build, /run: npx --no-install electron-builder --publish never/);
});

test("non-release packaging leaves signing secrets absent rather than empty", () => {
    const build = step("Build unsigned installers");
    assert.ok(build.includes("if: runner.os != 'macOS' || github.event_name != 'release'"));
    assert.doesNotMatch(build, /(?:CSC_LINK|CSC_KEY_PASSWORD|APPLE_\w+|secrets\.)/);
    assert.match(build, /run: npx --no-install electron-builder --publish never/);
    // Job-level env must not accidentally reintroduce empty credentials.
    const jobHeader = workflow.slice(workflow.indexOf("\n  build:"), workflow.indexOf("\n    steps:"));
    assert.doesNotMatch(jobHeader, /(?:CSC_LINK|CSC_KEY_PASSWORD|APPLE_\w+|secrets\.)/);
    assert.match(jobHeader, /CSC_IDENTITY_AUTO_DISCOVERY: "false"/);
});

test("web build and server preparation run before packaging without signing secrets", () => {
    const build = step("Build bundled server");
    assert.match(build, /run: npm run build:web && npm run prepare:server/);
    assert.doesNotMatch(build, /env:|secrets\.|CSC_|APPLE_/);
    assert.ok(workflow.indexOf("- name: Build bundled server") < workflow.indexOf("- name: Build signed macOS installers"));
    assert.doesNotMatch(step("Build signed macOS installers"), /npm run (?:dist|build:web|prepare:server)/);
});

test("macOS release builds are verified with codesign, Gatekeeper and the stapled ticket", () => {
    const verify = step("Verify macOS signature and notarization");
    assert.ok(verify.includes(`if: ${RELEASE_ON_MAC}`));
    assert.match(verify, /codesign --verify --deep --strict/);
    assert.match(verify, /spctl --assess --type execute/);
    assert.match(verify, /xcrun stapler validate/);
});

test("electron-builder does not opt the macOS app out of signing or the hardened runtime", () => {
    assert.doesNotMatch(builderConfig, /^\s*identity:\s*(null|"-"|'-'|-)\s*$/m);
    assert.doesNotMatch(builderConfig, /^\s*hardenedRuntime:\s*false\s*$/m);
    assert.doesNotMatch(builderConfig, /^\s*notarize:\s*false\s*$/m);
});
