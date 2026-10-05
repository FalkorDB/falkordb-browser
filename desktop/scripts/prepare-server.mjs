// Copies the Next.js standalone build into desktop/server, laid out the same
// way the Docker image lays it out (server.js + .next/static + public).
// Run `npm --prefix .. run build` first; this script never builds by itself.

import { cpSync, existsSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const desktopDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const rootDir = path.dirname(desktopDir);
const standalone = path.join(rootDir, ".next", "standalone");
const out = path.join(desktopDir, "server");

if (!existsSync(path.join(standalone, "server.js"))) {
    console.error(`No standalone build at ${standalone}. Run \`npm run build:web\` first.`);
    process.exit(1);
}

rmSync(out, { recursive: true, force: true });
cpSync(standalone, out, { recursive: true, verbatimSymlinks: true });
cpSync(path.join(rootDir, ".next", "static"), path.join(out, ".next", "static"), { recursive: true });
cpSync(path.join(rootDir, "public"), path.join(out, "public"), { recursive: true });

// Never ship a developer's env files or local state inside the app. The
// desktop shell supplies every setting the server needs at launch.
for (const name of readdirSync(out)) {
    if (name.startsWith(".env") || [".data", "uploads", "tls", "e2e", "falkordb-import"].includes(name)) {
        rmSync(path.join(out, name), { recursive: true, force: true });
    }
}

console.log(`Prepared server in ${out}`);
