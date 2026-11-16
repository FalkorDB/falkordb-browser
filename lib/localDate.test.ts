import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { toLocalDateInputValue } from "./localDate.ts";

const originalTZ = process.env.TZ;

describe("toLocalDateInputValue", () => {
    afterEach(() => {
        if (originalTZ === undefined) delete process.env.TZ;
        else process.env.TZ = originalTZ;
    });

    const cases = [
        { tz: "Asia/Jerusalem", parts: [2026, 0, 1, 0, 30], expected: "2026-01-01" },
        { tz: "America/Los_Angeles", parts: [2026, 11, 31, 23, 30], expected: "2026-12-31" },
        { tz: "UTC", parts: [987, 2, 5, 12, 0], expected: "0987-03-05" },
    ];

    for (const { tz, parts, expected } of cases) {
        it(`uses the local calendar day in ${tz}`, () => {
            process.env.TZ = tz;
            const [year, month, day, hour, minute] = parts;
            assert.equal(toLocalDateInputValue(new Date(year, month, day, hour, minute)), expected);
        });
    }
});
