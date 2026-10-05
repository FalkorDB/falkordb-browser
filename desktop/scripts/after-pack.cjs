// electron-builder strips node_modules from extraResources whatever the
// filter says, and the standalone server cannot run without its traced
// node_modules. Copy the prepared server into the app's resources ourselves.
// afterPack runs before code signing, so the copied files are signed too.

const fs = require("node:fs");
const path = require("node:path");

exports.default = async function afterPack(context) {
    const source = path.join(__dirname, "..", "server");
    if (!fs.existsSync(path.join(source, "server.js"))) {
        throw new Error("desktop/server is missing. Run `npm run prepare:server` first.");
    }

    const resources = context.electronPlatformName === "darwin"
        ? path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`, "Contents", "Resources")
        : path.join(context.appOutDir, "resources");
    const target = path.join(resources, "server");

    fs.rmSync(target, { recursive: true, force: true });
    fs.cpSync(source, target, { recursive: true, verbatimSymlinks: true });
};
