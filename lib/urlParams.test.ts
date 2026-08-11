import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";

// `setUrlParam` reaches straight into `window.location` / `window.history`, so
// a minimal stub stands in for the browser. Imported dynamically so the module
// only ever sees the stub.
const location = { pathname: "/graph", search: "", hash: "" };
const replaceStateCalls: string[] = [];

Object.assign(globalThis, {
    window: {
        location,
        history: {
            replaceState: (_state: unknown, _title: string, url: string) => {
                replaceStateCalls.push(url);
                const [, search = ""] = url.split("?");
                location.search = search ? `?${search.split("#")[0]}` : "";
            },
        },
    },
});

const { buildGraphUrlParams, buildSettingsUrlParams, setUrlParam, syncRouteUrlParams } = await import("./urlParams.ts");

beforeEach(() => {
    location.pathname = "/graph";
    location.search = "";
    location.hash = "";
    replaceStateCalls.length = 0;
});

test("buildGraphUrlParams puts the active tab on the URL", () => {
    assert.deepEqual(buildGraphUrlParams({ tab: "abc-123" }), { tab: "abc-123" });
});

test("buildGraphUrlParams drops the param when there is no tab", () => {
    // The working context lives on the tab, so an empty id means nothing to
    // point at — the param is deleted rather than left blank.
    assert.deepEqual(buildGraphUrlParams({ tab: "" }), { tab: null });
});

test("setUrlParam adds a param to a bare URL", () => {
    setUrlParam({ tab: "abc" });
    assert.deepEqual(replaceStateCalls, ["/graph?tab=abc"]);
});

test("setUrlParam replaces an existing value instead of duplicating it", () => {
    location.search = "?tab=abc";
    setUrlParam({ tab: "def" });
    assert.deepEqual(replaceStateCalls, ["/graph?tab=def"]);
});

test("setUrlParam deletes a param for null and for the empty string", () => {
    location.search = "?tab=abc";
    setUrlParam({ tab: null });
    assert.deepEqual(replaceStateCalls, ["/graph"]);

    location.search = "?tab=abc";
    replaceStateCalls.length = 0;
    setUrlParam({ tab: "" });
    assert.deepEqual(replaceStateCalls, ["/graph"]);
});

test("setUrlParam leaves params it was not given untouched", () => {
    location.search = "?other=keep&tab=abc";
    setUrlParam({ tab: "def" });
    assert.deepEqual(replaceStateCalls, ["/graph?other=keep&tab=def"]);
});

test("setUrlParam preserves the pathname and hash", () => {
    location.pathname = "/graph";
    location.hash = "#section";
    setUrlParam({ tab: "abc" });
    assert.deepEqual(replaceStateCalls, ["/graph?tab=abc#section"]);
});

test("setUrlParam re-adds keys in the caller's order", () => {
    location.search = "?b=2&a=1";
    setUrlParam({ a: "1", b: "2" });
    assert.deepEqual(replaceStateCalls, ["/graph?a=1&b=2"]);
});

test("buildSettingsUrlParams mirrors the graph builder", () => {
    assert.deepEqual(buildSettingsUrlParams({ tab: "Query" }), { tab: "Query" });
    assert.deepEqual(buildSettingsUrlParams({ tab: "" }), { tab: null });
});

test("syncRouteUrlParams writes the params of the route it is given", () => {
    syncRouteUrlParams("/graph", { tab: "abc" });
    assert.deepEqual(replaceStateCalls, ["/graph?tab=abc"]);

    location.pathname = "/settings";
    location.search = "";
    replaceStateCalls.length = 0;
    syncRouteUrlParams("/settings", { tab: "Query" });
    assert.deepEqual(replaceStateCalls, ["/settings?tab=Query"]);
});

test("syncRouteUrlParams leaves unregistered routes alone", () => {
    syncRouteUrlParams("/schema", { tab: "abc" });
    assert.deepEqual(replaceStateCalls, []);
});
