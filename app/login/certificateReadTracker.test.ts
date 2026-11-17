import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createCertificateReadTracker } from "./certificateReadTracker.ts";

describe("createCertificateReadTracker", () => {
    it("has no pending reads initially", () => {
        assert.equal(createCertificateReadTracker().hasPending(), false);
    });

    it("tracks a read until it finishes", () => {
        const tracker = createCertificateReadTracker();
        const version = tracker.start("ca");
        assert.equal(tracker.hasPending(), true);
        assert.equal(tracker.finish("ca", version), true);
        assert.equal(tracker.hasPending(), false);
    });

    it("ignores a superseded read and keeps the newer one pending", () => {
        const tracker = createCertificateReadTracker();
        const first = tracker.start("ca");
        const second = tracker.start("ca");
        assert.equal(tracker.finish("ca", first), false);
        assert.equal(tracker.hasPending(), true);
        assert.equal(tracker.finish("ca", second), true);
        assert.equal(tracker.hasPending(), false);
    });

    it("keeps slots independent", () => {
        const tracker = createCertificateReadTracker();
        const ca = tracker.start("ca");
        const key = tracker.start("key");
        assert.equal(tracker.finish("ca", ca), true);
        assert.equal(tracker.hasPending(), true);
        assert.equal(tracker.finish("key", key), true);
        assert.equal(tracker.hasPending(), false);
    });

    it("invalidates every in-flight read", () => {
        const tracker = createCertificateReadTracker();
        const ca = tracker.start("ca");
        const cert = tracker.start("cert");
        const key = tracker.start("key");
        tracker.invalidateAll();
        assert.equal(tracker.hasPending(), false);
        assert.equal(tracker.finish("ca", ca), false);
        assert.equal(tracker.finish("cert", cert), false);
        assert.equal(tracker.finish("key", key), false);
    });
});
