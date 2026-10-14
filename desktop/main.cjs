// Electron shell for FalkorDB Browser.
//
// The browser is a server-rendered Next.js app (API routes, Auth.js, a
// server-side FalkorDB client), so it cannot be loaded from files. Instead the
// shell runs the same standalone server.js the Docker image runs, on loopback,
// in an Electron utility process, and points a window at it. Everything the
// Docker entrypoint does at start (secrets, data directories) happens here,
// with the state kept under the user's app-data directory.

const { app, BrowserWindow, shell, utilityProcess, dialog } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const { HOST, buildServerEnv, choosePort, ensurePrivateDir, isAppUrl, isExternalWebUrl, isPortFree, loadSecrets } = require("./lib/shell.cjs");

const STARTUP_TIMEOUT_MS = 60_000;
// Launches to try when another process takes the chosen port first.
const STARTUP_ATTEMPTS = 3;

let serverProcess = null;
let mainWindow = null;
let origin = null;
// Set once the server answers; until then startup opens the window itself.
let serverReady = false;
let quitting = false;

function serverDir() {
    return app.isPackaged
        ? path.join(process.resourcesPath, "server")
        : path.join(__dirname, "server");
}

// Resolves when the child reports that it holds the port itself (see
// lib/server-entry.cjs), not when something answers there.
function waitForServer(child, port) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("The server did not start in time.")), STARTUP_TIMEOUT_MS);
        child.on("message", (message) => {
            if (message?.type === "listening" && message.port === port) {
                clearTimeout(timer);
                resolve();
            }
        });
        child.once("exit", (code) => {
            clearTimeout(timer);
            reject(Object.assign(new Error(`The server exited during startup (code ${code}).`), { exited: true }));
        });
    });
}

async function startServer() {
    const userData = app.getPath("userData");
    const dataDir = path.join(userData, "data");
    const importDir = path.join(userData, "import");
    // Owner-only (POSIX modes; on Windows, the profile's own ACL): API tokens
    // and uploaded CSVs live here.
    ensurePrivateDir(dataDir);
    ensurePrivateDir(importDir);

    const secrets = loadSecrets(userData);
    const dir = serverDir();
    const entry = path.join(dir, "desktop-entry.cjs");
    if (!fs.existsSync(entry)) {
        throw new Error(`Missing ${entry}. Run \`npm run prepare:server\` in desktop/.`);
    }

    for (let attempt = 1; ; attempt += 1) {
        const port = await choosePort(userData);
        origin = `http://${HOST}:${port}`;
        const env = buildServerEnv(process.env, { host: HOST, port, secrets, dataDir, importDir });

        serverProcess = utilityProcess.fork(entry, [], {
            cwd: dir,
            env,
            stdio: "pipe",
            serviceName: "FalkorDB Browser server",
        });
        serverProcess.stdout?.on("data", (d) => process.stdout.write(d));
        serverProcess.stderr?.on("data", (d) => process.stderr.write(d));

        try {
            await waitForServer(serverProcess, port);
            break;
        } catch (err) {
            // Another process took the port between choosePort and the
            // server's own listen: pick again rather than fail the launch.
            if (!err.exited || attempt >= STARTUP_ATTEMPTS || await isPortFree(port)) throw err;
        }
    }
    serverReady = true;

    serverProcess.on("exit", (code) => {
        serverProcess = null;
        if (!quitting) {
            dialog.showErrorBox("FalkorDB Browser", `The browser server stopped unexpectedly (code ${code}).`);
            app.quit();
        }
    });
}

function openExternal(url) {
    if (isExternalWebUrl(url)) shell.openExternal(url);
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
        if (isAppUrl(url, origin)) return { action: "allow" };
        openExternal(url);
        return { action: "deny" };
    });
    mainWindow.webContents.on("will-navigate", (event, url) => {
        if (!isAppUrl(url, origin)) {
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
        } else if (serverReady) {
            // macOS keeps the app running with no window; a relaunch means "open it".
            createWindow();
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
