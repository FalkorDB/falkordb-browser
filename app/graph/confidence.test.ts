import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizeConfidence, migrateLegacyConfidence, getConfidenceStyle } from "./confidence.ts";

describe("normalizeConfidence", () => {
    it("rounds and passes through valid 0-100 values", () => {
        assert.equal(normalizeConfidence(0), 0);
        assert.equal(normalizeConfidence(70), 70);
        assert.equal(normalizeConfidence(90), 90);
        assert.equal(normalizeConfidence(100), 100);
        assert.equal(normalizeConfidence(89.6), 90);
        assert.equal(normalizeConfidence(70.4), 70);
    });

    it("clamps out-of-range values into [0, 100]", () => {
        assert.equal(normalizeConfidence(150), 100);
        assert.equal(normalizeConfidence(-10), 0);
    });

    it("returns undefined for non-finite or non-numeric input", () => {
        assert.equal(normalizeConfidence(NaN), undefined);
        assert.equal(normalizeConfidence(Infinity), undefined);
        assert.equal(normalizeConfidence(-Infinity), undefined);
        assert.equal(normalizeConfidence(undefined), undefined);
        assert.equal(normalizeConfidence(null), undefined);
        assert.equal(normalizeConfidence("90"), undefined);
    });
});

describe("migrateLegacyConfidence", () => {
    it("rescales 0-1 fractions onto the 0-100 scale", () => {
        assert.equal(migrateLegacyConfidence(0.9), 90);
        assert.equal(migrateLegacyConfidence(0.7), 70);
        assert.equal(migrateLegacyConfidence(0), 0);
        assert.equal(migrateLegacyConfidence(0.856), 86);
    });

    it("treats a stored 1 as 100% (legacy payloads are wholly 0-1)", () => {
        assert.equal(migrateLegacyConfidence(1), 100);
    });

    it("returns undefined for non-finite or non-numeric input", () => {
        assert.equal(migrateLegacyConfidence(NaN), undefined);
        assert.equal(migrateLegacyConfidence(undefined), undefined);
        assert.equal(migrateLegacyConfidence(null), undefined);
    });
});

describe("getConfidenceStyle", () => {
    it("returns the high tier at 90 and above", () => {
        assert.equal(getConfidenceStyle(90).label, "High confidence");
        assert.equal(getConfidenceStyle(100).label, "High confidence");
    });

    it("returns the medium tier in [70, 90)", () => {
        assert.equal(getConfidenceStyle(70).label, "Medium confidence");
        assert.equal(getConfidenceStyle(89).label, "Medium confidence");
    });

    it("returns the low tier below 70", () => {
        assert.equal(getConfidenceStyle(69).label, "Low confidence");
        assert.equal(getConfidenceStyle(0).label, "Low confidence");
    });
});
