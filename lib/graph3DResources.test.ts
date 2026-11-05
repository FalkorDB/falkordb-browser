import test from "node:test";
import assert from "node:assert/strict";
import type { Data } from "@falkordb/canvas";
import { get3DBudget, needs3DWarning, register3DCheck, setCanvasGraphData, writeCanvasData } from "./graph3DResources.ts";

test("3D budgets use conservative defaults when resource hints are missing or invalid", () => {
    for (const resources of [{}, { deviceMemory: NaN, hardwareConcurrency: 0 }, { deviceMemory: Infinity }, { hardwareConcurrency: 32 }]) {
        assert.deepEqual(get3DBudget(resources), { nodes: 2000, links: 5000 });
    }
});

test("the weakest resource hint determines low and medium device budgets", () => {
    assert.deepEqual(get3DBudget({ deviceMemory: 2, hardwareConcurrency: 16 }), { nodes: 500, links: 1000 });
    assert.deepEqual(get3DBudget({ deviceMemory: 8, hardwareConcurrency: 2 }), { nodes: 500, links: 1000 });
    assert.deepEqual(get3DBudget({ deviceMemory: 4, hardwareConcurrency: 16 }), { nodes: 1000, links: 2500 });
    assert.deepEqual(get3DBudget({ deviceMemory: 8, hardwareConcurrency: 8 }), { nodes: 4000, links: 10000 });
});

test("GPU limits can lower but never raise CPU/RAM budgets", () => {
    const powerful = { deviceMemory: 8, hardwareConcurrency: 8 };
    assert.deepEqual(get3DBudget({ ...powerful, gpu: { webgl2: "available", softwareRendering: true } }), { nodes: 500, links: 1000 });
    assert.deepEqual(get3DBudget({ ...powerful, gpu: { webgl2: "available", maxTextureSize: 4096, maxRenderbufferSize: 16384 } }), { nodes: 500, links: 1000 });
    assert.deepEqual(get3DBudget({ ...powerful, gpu: { webgl2: "available", maxTextureSize: 16384, maxRenderbufferSize: 8192 } }), { nodes: 1000, links: 2500 });
    const gpu = { webgl2: "available" as const, maxTextureSize: 16384, maxRenderbufferSize: 16384 };
    assert.deepEqual(get3DBudget({ ...powerful, gpu }), { nodes: 4000, links: 10000 });
    assert.deepEqual(get3DBudget({ deviceMemory: 2, hardwareConcurrency: 8, gpu }), { nodes: 500, links: 1000 });
});

test("unknown or incomplete GPU information prevents the highest budget", () => {
    const powerful = { deviceMemory: 8, hardwareConcurrency: 8 };
    for (const gpu of [
        { webgl2: "unknown" as const },
        { webgl2: "available" as const },
        { webgl2: "available" as const, maxTextureSize: NaN, maxRenderbufferSize: Infinity },
    ]) {
        assert.deepEqual(get3DBudget({ ...powerful, gpu }), { nodes: 2000, links: 5000 });
    }
});

test("missing WebGL2 warns even for small graphs but preserves explicit approval", () => {
    const resources = { gpu: { webgl2: "unavailable" as const } };
    const size = { nodes: 1, links: 0 };
    assert.equal(needs3DWarning(size, resources), true);
    assert.equal(needs3DWarning(size, resources, size), false);
    assert.equal(needs3DWarning({ nodes: 0, links: 0 }, resources), false);
});

test("either nodes or links can trigger a warning, with exact budget boundaries", () => {
    assert.equal(needs3DWarning({ nodes: 2000, links: 5000 }, {}), false);
    assert.equal(needs3DWarning({ nodes: 2001, links: 0 }, {}), true);
    assert.equal(needs3DWarning({ nodes: 1, links: 5001 }, {}), true);
});

test("approval covers the chosen size but growing either dimension warns again", () => {
    const approved = { nodes: 3000, links: 6000 };
    assert.equal(needs3DWarning(approved, {}, approved), false);
    assert.equal(needs3DWarning({ nodes: 2500, links: 5500 }, {}, approved), false);
    assert.equal(needs3DWarning({ nodes: 3001, links: 5500 }, {}, approved), true);
    assert.equal(needs3DWarning({ nodes: 2500, links: 6001 }, {}, approved), true);
});

test("incremental writes gate the incoming size before passing it to the renderer", async () => {
    const calls: string[] = [];
    const data: Data = { nodes: [{ id: 1, labels: [], data: {}, color: "#fff", visible: true }], links: [] };
    const canvas = { setGraphData: (incoming: typeof data) => {
        assert.equal(incoming, data);
        calls.push("write");
    } };
    const cleanup = register3DCheck(canvas, size => {
        assert.deepEqual(size, { nodes: 1, links: 0 });
        calls.push("check");
        return false;
    });
    assert.equal(await setCanvasGraphData(canvas, data), false);
    assert.deepEqual(calls, ["check"]);
    cleanup();
    assert.equal(await setCanvasGraphData(canvas, data), true);
    assert.deepEqual(calls, ["check", "write"]);
});

test("cleanup of an older registration does not remove a replacement check", async () => {
    const canvas = { setGraphData: () => {} };
    const cleanup = register3DCheck(canvas, () => { throw new Error("stale check"); });
    let checked = false;
    const cleanupLatest = register3DCheck(canvas, () => { checked = true; return true; });
    cleanup();
    await setCanvasGraphData(canvas, { nodes: [], links: [] });
    assert.equal(checked, true);
    cleanupLatest();
});

test("query, restore and mutation writes await a delayed safe-renderer check", async () => {
    for (const kind of ["query", "restore", "mutation"]) {
        const calls: string[] = [];
        const canvas = { setGraphData: () => { calls.push("mutation"); } };
        const ready = Promise.withResolvers<boolean>();
        register3DCheck(canvas, () => ready.promise);
        const data = { nodes: [], links: [] };
        const pending = kind === "mutation"
            ? setCanvasGraphData(canvas, data)
            : writeCanvasData(canvas, data, () => { calls.push(kind); });
        assert.deepEqual(calls, []);
        ready.resolve(true);
        assert.equal(await pending, true);
        assert.deepEqual(calls, [kind]);
    }
});

test("a failed renderer fallback blocks data writes", async () => {
    let written = false;
    const canvas = { setGraphData: () => { written = true; } };
    register3DCheck(canvas, async () => false);
    assert.equal(await setCanvasGraphData(canvas, { nodes: [], links: [] }), false);
    assert.equal(written, false);
});

test("only the latest write survives a delayed fallback", async () => {
    const calls: string[] = [];
    const canvas = { setGraphData: () => {} };
    const ready = Promise.withResolvers<boolean>();
    register3DCheck(canvas, () => ready.promise);
    const data = { nodes: [], links: [] };
    const first = writeCanvasData(canvas, data, () => { calls.push("old"); });
    const latest = writeCanvasData(canvas, data, () => { calls.push("latest"); });
    ready.resolve(true);
    assert.equal(await first, false);
    assert.equal(await latest, true);
    assert.deepEqual(calls, ["latest"]);
});

test("cleanup and caller cancellation discard delayed writes", async () => {
    for (const cancel of ["cleanup", "caller"]) {
        let written = false;
        let current = true;
        const canvas = { setGraphData: () => { written = true; } };
        const ready = Promise.withResolvers<boolean>();
        const cleanup = register3DCheck(canvas, () => ready.promise);
        const pending = setCanvasGraphData(canvas, { nodes: [], links: [] }, () => current);
        if (cancel === "cleanup") cleanup();
        else current = false;
        ready.resolve(true);
        assert.equal(await pending, false);
        assert.equal(written, false);
    }
});
