// Electron shell for FalkorDB Browser.
//
// The browser is a server-rendered Next.js app (API routes, Auth.js, a
// server-side FalkorDB client), so it cannot be loaded from files. Instead the
// shell runs the same standalone server.js the Docker image runs, on loopback,
// in an Electron utility process, and points a window at it. Everything the
// Docker entrypoint does at start (secrets, data directories) happens here,
// with the state kept under the user's app-data directory.

const { app, BrowserWindow, shell, utilityProcess, dialog } = require("electron");
const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const path = require("node:path");

const HOST = "127.0.0.1";
const DEFAULT_PORT = 3210;
const STARTUP_TIMEOUT_MS = 60_000;

let serverProcess = null;
let mainWindow = null;
let origin = null;
let quitting = false;

function serverDir() {
    return app.isPackaged
        ? path.join(process.resourcesPath, "server")
        : path.join(__dirname, "server");
}

function readJson(file) {
    try {
        return JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {
        return null;
    }
}

function writeJson(file, value) {
    fs.writeFileSync(file, JSON.stringify(value, null, 2), { mode: 0o600 });
}

// Generated once and kept: a new AUTH_SECRET would sign every user out, and a
// new ENCRYPTION_KEY would make stored credentials unreadable.
function loadSecrets(dir) {
    const file = path.join(dir, "secrets.json");
    const stored = readJson(file);
    if (stored && /^[0-9a-f]{64}$/.test(stored.authSecret) && /^[0-9a-f]{64}$/.test(stored.encryptionKey)) {
        return stored;
    }
    const secrets = {
        authSecret: crypto.randomBytes(32).toString("hex"),
        encryptionKey: crypto.randomBytes(32).toString("hex"),
    };
    writeJson(file, secrets);
    return secrets;
}

function isPortFree(port) {
    return new Promise((resolve) => {
        const probe = net.createServer();
        probe.once("error", () => resolve(false));
        probe.listen(port, HOST, () => probe.close(() => resolve(true)));
    });
}

function anyFreePort() {
    return new Promise((resolve, reject) => {
        const probe = net.createServer();
        probe.once("error", reject);
        probe.listen(0, HOST, () => {
            const { port } = probe.address();
            probe.close(() => resolve(port));
        });
    });
}

// The port is part of the page's origin, and the browser keeps settings and
// its client-side key in localStorage, so reuse the same port across launches
// and only move when something else has taken it.
async function choosePort(dir) {
    const file = path.join(dir, "settings.json");
    const settings = readJson(file) || {};
    const preferred = Number.isInteger(settings.port) ? settings.port : DEFAULT_PORT;
    if (await isPortFree(preferred)) return preferred;
    const port = await anyFreePort();
    writeJson(file, { ...settings, port });
    return port;
}

function waitForServer(url, child) {
    const deadline = Date.now() + STARTUP_TIMEOUT_MS;
    return new Promise((resolve, reject) => {
        let exited = false;
        child.once("exit", (code) => {
            exited = true;
            reject(new Error(`The server exited during startup (code ${code}).`));
        });
        const attempt = () => {
            if (exited) return;
            const req = http.get(url, (res) => {
                res.resume();
                resolve();
            });
            req.on("error", () => {
                if (Date.now() > deadline) reject(new Error("The server did not start in time."));
                else setTimeout(attempt, 250);
            });
        };
        attempt();
    });
}

async function startServer() {
    const userData = app.getPath("userData");
    const dataDir = path.join(userData, "data");
    const importDir = path.join(userData, "import");
    fs.mkdirSync(dataDir, { recursive: true });
    fs.mkdirSync(importDir, { recursive: true });

    const { authSecret, encryptionKey } = loadSecrets(userData);
    const port = await choosePort(userData);
    origin = `http://${HOST}:${port}`;

    const env = {
        // Inherit the user's environment so FALKORDB_* preconfigured
        // connections and other documented settings keep working.
        ...process.env,
        NODE_ENV: "production",
        NEXT_TELEMETRY_DISABLED: "1",
        PORT: String(port),
        HOSTNAME: HOST,
        AUTH_URL: origin,
        AUTH_TRUST_HOST: "true",
        AUTH_SECRET: authSecret,
        ENCRYPTION_KEY: encryptionKey,
        ALLOWED_ORIGINS: origin,
        API_TOKEN_STORAGE_PATH: path.join(dataDir, "api_tokens.json"),
        CSV_STORAGE: process.env.CSV_STORAGE || "local",
        CSV_LOCAL_TEMP_DIR: process.env.CSV_LOCAL_TEMP_DIR || importDir,
    };
    delete env.NEXTAUTH_SECRET;
    delete env.NEXTAUTH_URL;

    const dir = serverDir();
    const entry = path.join(dir, "server.js");
    if (!fs.existsSync(entry)) {
        throw new Error(`Missing ${entry}. Run \`npm run prepare:server\` in desktop/.`);
    }

    serverProcess = utilityProcess.fork(entry, [], {
        cwd: dir,
        env,
        stdio: "pipe",
        serviceName: "FalkorDB Browser server",
    });
    serverProcess.stdout?.on("data", (d) => process.stdout.write(d));
    serverProcess.stderr?.on("data", (d) => process.stderr.write(d));

    await waitForServer(`${origin}/`, serverProcess);

    serverProcess.on("exit", (code) => {
        serverProcess = null;
        if (!quitting) {
            dialog.showErrorBox("FalkorDB Browser", `The browser server stopped unexpectedly (code ${code}).`);
            app.quit();
        }
    });
}

// The server's own redirects can name the host "localhost" even though the
// window loads 127.0.0.1, so treat both as the app on its port.
function isAppUrl(url) {
    try {
        const target = new URL(url);
        const app = new URL(origin);
        return target.protocol === app.protocol
            && target.port === app.port
            && (target.hostname === "127.0.0.1" || target.hostname === "localhost");
    } catch {
        return false;
    }
}

function openExternal(url) {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1440,
        height: 900,
        minWidth: 960,
        minHeight: 600,
        title: "FalkorDB Browser",
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
        },
    });

    // Keep the window on the app; everything else (docs, Discord, GitHub)
    // opens in the user's real browser.
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (isAppUrl(url)) return { action: "allow" };
        openExternal(url);
        return { action: "deny" };
    });
    mainWindow.webContents.on("will-navigate", (event, url) => {
        if (!isAppUrl(url)) {
            event.preventDefault();
            openExternal(url);
        }
    });

    mainWindow.once("ready-to-show", () => mainWindow.show());
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
    mainWindow.loadURL(origin);
}

function stopServer() {
    quitting = true;
    if (serverProcess) {
        serverProcess.kill();
        serverProcess = null;
    }
}

if (!app.requestSingleInstanceLock()) {
    app.quit();
} else {
    app.on("second-instance", () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });

    app.whenReady().then(async () => {
        try {
            await startServer();
        } catch (err) {
            dialog.showErrorBox("FalkorDB Browser", `Could not start the browser server.\n\n${err.message}`);
            stopServer();
            app.quit();
            return;
        }
        createWindow();
        app.on("activate", () => {
            if (BrowserWindow.getAllWindows().length === 0) createWindow();
        });
    });

    app.on("window-all-closed", () => {
        if (process.platform !== "darwin") app.quit();
    });
    app.on("before-quit", stopServer);
}
