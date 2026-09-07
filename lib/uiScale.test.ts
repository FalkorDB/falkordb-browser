import assert from "node:assert";
import test, { describe } from "node:test";

import {
    clampUiFontScale,
    DEFAULT_UI_FONT_SCALE,
    MAX_UI_FONT_SCALE,
    MIN_UI_FONT_SCALE,
    uiFontScaleMultiplier,
} from "./uiScale.ts";

describe("clampUiFontScale", () => {
    test("keeps a supported value", () => {
        assert.strictEqual(clampUiFontScale(120), 120);
    });

    test("clamps out-of-range values", () => {
        assert.strictEqual(clampUiFontScale(10), MIN_UI_FONT_SCALE);
        assert.strictEqual(clampUiFontScale(1000), MAX_UI_FONT_SCALE);
    });

    test("rounds fractional values", () => {
        assert.strictEqual(clampUiFontScale(112.4), 112);
    });

    test("falls back to the default for non-numbers", () => {
        assert.strictEqual(clampUiFontScale(NaN), DEFAULT_UI_FONT_SCALE);
        assert.strictEqual(clampUiFontScale(Infinity), DEFAULT_UI_FONT_SCALE);
    });
});

describe("uiFontScaleMultiplier", () => {
    test("turns a percentage into a multiplier", () => {
        assert.strictEqual(uiFontScaleMultiplier(DEFAULT_UI_FONT_SCALE), 1);
        assert.strictEqual(uiFontScaleMultiplier(150), 1.5);
    });

    test("clamps before converting", () => {
        assert.strictEqual(uiFontScaleMultiplier(500), MAX_UI_FONT_SCALE / 100);
    });
});
