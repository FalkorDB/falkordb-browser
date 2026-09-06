import test from "node:test";
import assert from "node:assert/strict";
import type { FalkorDBCanvas } from "@falkordb/canvas";
import { applyCanvasLayout, captureCanvasLayout, type CanvasLayout } from "./utils.ts";

// The canvas is a web component we cannot instantiate here, and only four of
// its methods matter to these helpers, so a stub stands in for it. `getData()`
// mirrors the real thing by stripping x/y — that omission is the whole reason
// `captureCanvasLayout` has to read coordinates off `getGraphData()`.
type StubNode = {
    id: number;
    x?: number;
    y?: number;
    fx?: number;
    fy?: number;
    vx?: number;
    vy?: number;
    initialPositionCalculated?: boolean;
};

const stubCanvas = (nodes: StubNode[]) => {
    const state = {
        nodes,
        setDataCalls: 0,
        refreshCalls: 0,
        lastSetData: undefined as unknown,
    };

    const canvas = {
        getData: () => ({ nodes: state.nodes.map(({ id }) => ({ id })), links: [] }),
        getGraphData: () => ({ nodes: state.nodes, links: [] }),
        setData: (data: unknown) => { state.setDataCalls += 1; state.lastSetData = data; },
        refresh: () => { state.refreshCalls += 1; },
    } as unknown as FalkorDBCanvas;

    return { canvas, state };
};

test("captureCanvasLayout returns nothing for an empty canvas", () => {
    const { canvas } = stubCanvas([]);
    assert.equal(captureCanvasLayout(canvas), undefined);
});

test("captureCanvasLayout keeps the structure and the settled coordinates", () => {
    const { canvas } = stubCanvas([
        { id: 1, x: 10, y: 20 },
        { id: 2, x: -5, y: 0 },
    ]);

    const layout = captureCanvasLayout(canvas);

    assert.deepEqual(layout?.data.nodes, [{ id: 1 }, { id: 2 }]);
    assert.deepEqual(layout?.positions, [
        { id: 1, x: 10, y: 20 },
        { id: 2, x: -5, y: 0 },
    ]);
});

test("captureCanvasLayout skips nodes the simulation has not placed yet", () => {
    const { canvas } = stubCanvas([
        { id: 1, x: 10, y: 20 },
        { id: 2 },
        { id: 3, x: 1 },
        { id: 4, y: 2 },
    ]);

    assert.deepEqual(captureCanvasLayout(canvas)?.positions, [{ id: 1, x: 10, y: 20 }]);
});

test("captureCanvasLayout copies coordinates out of the live nodes", () => {
    const nodes: StubNode[] = [{ id: 1, x: 10, y: 20 }];
    const { canvas } = stubCanvas(nodes);

    const layout = captureCanvasLayout(canvas);

    // The canvas reuses node objects between updates, so a later simulation
    // step must not be able to rewrite an already-taken snapshot.
    nodes[0].x = 999;
    nodes[0].y = 999;

    assert.deepEqual(layout?.positions, [{ id: 1, x: 10, y: 20 }]);
});

test("applyCanvasLayout writes the saved coordinates back and pins them", () => {
    const nodes: StubNode[] = [{ id: 1 }, { id: 2 }];
    const { canvas, state } = stubCanvas(nodes);

    const layout: CanvasLayout = {
        data: { nodes: [{ id: 1 }, { id: 2 }], links: [] } as unknown as CanvasLayout["data"],
        positions: [
            { id: 1, x: 10, y: 20 },
            { id: 2, x: -5, y: 0 },
        ],
    };

    applyCanvasLayout(canvas, layout);

    assert.equal(state.setDataCalls, 1);
    // The snapshot's own structure has to be what goes back in — not whatever
    // the canvas happened to be holding.
    assert.equal(state.lastSetData, layout.data);
    assert.equal(state.refreshCalls, 1);
    // fx/fy are what makes the restore stick through `setData`'s force warmup,
    // and the velocities are zeroed so nothing drifts before the engine stops.
    assert.deepEqual(nodes[0], {
        id: 1, x: 10, y: 20, fx: 10, fy: 20, vx: 0, vy: 0, initialPositionCalculated: true,
    });
    assert.deepEqual(nodes[1], {
        id: 2, x: -5, y: 0, fx: -5, fy: 0, vx: 0, vy: 0, initialPositionCalculated: true,
    });
});

test("applyCanvasLayout leaves nodes the snapshot does not know about alone", () => {
    const nodes: StubNode[] = [{ id: 1 }, { id: 7 }];
    const { canvas } = stubCanvas(nodes);

    applyCanvasLayout(canvas, {
        data: { nodes: [{ id: 1 }], links: [] } as unknown as CanvasLayout["data"],
        positions: [{ id: 1, x: 10, y: 20 }],
    });

    // A node added since the snapshot keeps its own (unplaced) state so the
    // canvas can lay it out normally.
    assert.deepEqual(nodes[1], { id: 7 });
});
