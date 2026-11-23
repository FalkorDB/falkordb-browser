const test = require("node:test");
const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const Module = require("node:module");
const fs = require("node:fs");
const path = require("node:path");
const { isAppUrl, isExternalWebUrl } = require("../lib/shell.cjs");

const mainPath = require.resolve("../main.cjs");

function launch(t, { lock = true, entryExists = true, exitsBeforeListening = 0 } = {}) {
    const app = new EventEmitter();
    const errors = [];
    const externalUrls = [];
    const windows = [];
    const children = [];
    const privateDirs = [];
    let quitCalls = 0;
    app.isPackaged = false;
    app.getPath = () => "/test/user-data";
    app.requestSingleInstanceLock = () => lock;
    app.quit = () => { quitCalls += 1; };
    app.whenReady = () => Promise.resolve();

    class BrowserWindow extends EventEmitter {
        constructor(options) {
            super();
            this.options = options;
            this.webContents = new EventEmitter();
            this.webContents.setWindowOpenHandler = (handler) => { this.openHandler = handler; };
            this.shown = false;
            this.focused = false;
            this.minimized = false;
            windows.push(this);
        }

        static getAllWindows() { return windows.filter((window) => !window.closed); }
        loadURL(url) { this.url = url; }
        show() { this.shown = true; }
        isMinimized() { return this.minimized; }
        restore() { this.minimized = false; }
        focus() { this.focused = true; }
    }

    const electron = {
        app,
        BrowserWindow,
        shell: { openExternal: (url) => externalUrls.push(url) },
        dialog: { showErrorBox: (title, message) => errors.push({ title, message }) },
        utilityProcess: {
            fork: (entry, args, options) => {
                const child = new EventEmitter();
                child.entry = entry;
                child.args = args;
                child.options = options;
                child.kill = () => { child.killed = true; };
                children.push(child);
                queueMicrotask(() => {
                    if (children.length <= exitsBeforeListening) child.emit("exit", 1);
                    else child.emit("message", { type: "listening", port: 43210 });
                });
                return child;
            },
        },
    };
    const shell = {
        HOST: "127.0.0.1",
        buildServerEnv: (_env, options) => options,
        choosePort: async () => 43210,
        ensurePrivateDir: (dir) => privateDirs.push(dir),
        isAppUrl,
        isExternalWebUrl,
        loadSecrets: () => ({ authSecret: "test", encryptionKey: "test" }),
    };
    const originalLoad = Module._load;
    t.mock.method(Module, "_load", function (request, parent, isMain) {
        if (parent?.filename === mainPath && request === "electron") return electron;
        if (parent?.filename === mainPath && request === "./lib/shell.cjs") return shell;
        return originalLoad.call(this, request, parent, isMain);
    });
    const originalExists = fs.existsSync;
    t.mock.method(fs, "existsSync", (file) =>
        file === path.join(path.dirname(mainPath), "server", "desktop-entry.cjs")
            ? entryExists : originalExists(file));
    delete require.cache[mainPath];
    t.after(() => { delete require.cache[mainPath]; });
    require(mainPath);

    return { app, windows, children, privateDirs, errors, externalUrls, get quitCalls() { return quitCalls; } };
}

const nextTurn = () => new Promise((resolve) => setImmediate(resolve));

test("a second instance exits without starting a server", async (t) => {
    const session = launch(t, { lock: false });
    await nextTurn();
    assert.equal(session.quitCalls, 1);
    assert.equal(session.children.length, 0);
    assert.equal(session.windows.length, 0);
});

test("a missing server entry reports startup failure and quits", async (t) => {
    const session = launch(t, { entryExists: false });
    await nextTurn();
    assert.equal(session.quitCalls, 1);
    assert.equal(session.children.length, 0);
    assert.equal(session.windows.length, 0);
    assert.match(session.errors[0].message, /Missing .*desktop-entry\.cjs/);
});

test("startup isolates data and keeps untrusted navigation out of the app window", async (t) => {
    const session = launch(t);
    await nextTurn();
    assert.deepEqual(session.privateDirs, [
        path.join("/test/user-data", "data"),
        path.join("/test/user-data", "import"),
    ]);
    assert.equal(session.children.length, 1);
    assert.equal(session.children[0].options.env.port, 43210);
    assert.equal(session.windows.length, 1);
    const window = session.windows[0];
    assert.equal(window.url, "http://127.0.0.1:43210");
    assert.deepEqual(window.options.webPreferences, {
        contextIsolation: true, nodeIntegration: false, sandbox: true,
    });
    window.emit("ready-to-show");
    assert.equal(window.shown, true);
    assert.deepEqual(window.openHandler({ url: `${window.url}/graph` }), { action: "allow" });
    assert.deepEqual(window.openHandler({ url: "https://example.com/docs" }), { action: "deny" });
    assert.deepEqual(window.openHandler({ url: "file:///etc/passwd" }), { action: "deny" });
    let prevented = false;
    window.webContents.emit("will-navigate", { preventDefault: () => { prevented = true; } }, "https://example.com/help");
    assert.equal(prevented, true);
    assert.deepEqual(session.externalUrls, ["https://example.com/docs", "https://example.com/help"]);
    window.minimized = true;
    session.app.emit("second-instance");
    assert.equal(window.minimized, false);
    assert.equal(window.focused, true);
    session.app.emit("before-quit");
    assert.equal(session.children[0].killed, true);
});

test("startup retries a child exit before the server starts", async (t) => {
    const session = launch(t, { exitsBeforeListening: 2 });
    await nextTurn();
    assert.equal(session.children.length, 3);
    assert.equal(session.windows.length, 1);
    assert.equal(session.quitCalls, 0);
    session.app.emit("before-quit");
    assert.equal(session.children[2].killed, true);
});

test("startup reports a failure after the final child exit", async (t) => {
    const session = launch(t, { exitsBeforeListening: 3 });
    await nextTurn();
    assert.equal(session.children.length, 3);
    assert.equal(session.windows.length, 0);
    assert.equal(session.quitCalls, 1);
    assert.match(session.errors[0].message, /exited during startup \(code 1\)/);
});

test("a second instance recreates a closed window after the server is ready", async (t) => {
    const session = launch(t);
    await nextTurn();
    session.windows[0].closed = true;
    session.windows[0].emit("closed");
    session.app.emit("second-instance");
    assert.equal(session.windows.length, 2);
    assert.equal(session.windows[1].url, "http://127.0.0.1:43210");
    session.app.emit("before-quit");
});

test("an unexpected server exit reports the failure and quits", async (t) => {
    const session = launch(t);
    await nextTurn();
    session.children[0].emit("exit", 23);
    assert.equal(session.quitCalls, 1);
    assert.match(session.errors[0].message, /stopped unexpectedly \(code 23\)/);
});
