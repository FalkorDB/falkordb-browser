import test from "node:test";
import assert from "node:assert/strict";
import {
    isMobileWidth,
    splitBounds,
    splitOrientation,
    MOBILE_BREAKPOINT,
    MOBILE_MEDIA_QUERY,
    MOBILE_MIN_SPLIT,
} from "./responsive.ts";

test("isMobileWidth treats the breakpoint itself as desktop", () => {
    assert.equal(isMobileWidth(MOBILE_BREAKPOINT - 1), true);
    assert.equal(isMobileWidth(MOBILE_BREAKPOINT), false);
    assert.equal(isMobileWidth(MOBILE_BREAKPOINT + 1), false);
});

test("isMobileWidth covers common phone and desktop widths", () => {
    assert.equal(isMobileWidth(320), true);
    assert.equal(isMobileWidth(375), true);
    assert.equal(isMobileWidth(1280), false);
});

test("isMobileWidth rejects widths that are not real numbers", () => {
    assert.equal(isMobileWidth(Number.NaN), false);
    assert.equal(isMobileWidth(Number.POSITIVE_INFINITY), false);
    assert.equal(isMobileWidth(Number.NEGATIVE_INFINITY), false);
});

test("MOBILE_MEDIA_QUERY stops just short of the breakpoint", () => {
    assert.equal(MOBILE_MEDIA_QUERY, "(max-width: 767.98px)");
});

test("splitOrientation stacks the split only on mobile", () => {
    assert.equal(splitOrientation(true), "vertical");
    assert.equal(splitOrientation(false), "horizontal");
});

test("splitBounds keeps the desktop bounds on wide viewports", () => {
    const desktop = { minSize: "15%", maxSize: "30%" };
    assert.equal(splitBounds(false, desktop), desktop);
});

test("splitBounds lets a stacked pane take anything from the floor to the whole split", () => {
    const expected = { minSize: MOBILE_MIN_SPLIT, maxSize: "100%" };
    assert.deepEqual(splitBounds(true, { minSize: "15%", maxSize: "30%" }), expected);
    assert.deepEqual(splitBounds(true, { minSize: "70%", maxSize: "100%" }), expected);
    assert.deepEqual(splitBounds(true, {}), expected);
});
