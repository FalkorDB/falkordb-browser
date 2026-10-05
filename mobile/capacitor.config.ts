import type { CapacitorConfig } from "@capacitor/cli";

// The browser is a server-rendered Next.js app, so the phone cannot run it
// locally. The app is a native shell around a deployment of the browser
// (see aws/), whose HTTPS URL is baked in at `cap sync` time.
const serverUrl = process.env.FALKORDB_BROWSER_URL?.trim();

function parseServerUrl(value: string): URL {
    const url = new URL(value);
    if (url.protocol !== "https:") {
        throw new Error(`FALKORDB_BROWSER_URL must be https:// (got ${url.protocol}). iOS and Android block cleartext by default, and the session cookie is Secure.`);
    }
    return url;
}

const url = serverUrl ? parseServerUrl(serverUrl) : undefined;

const config: CapacitorConfig = {
    appId: "com.falkordb.browser",
    appName: "FalkorDB Browser",
    // Shown only when no server URL was configured (www/index.html).
    webDir: "www",
    server: url
        ? {
              url: url.toString(),
              // Keep navigation to the browser's own host inside the app;
              // every other link opens in the system browser.
              allowNavigation: [url.hostname],
              cleartext: false,
          }
        : undefined,
};

export default config;
