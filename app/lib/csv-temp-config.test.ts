import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
    getCsvMaxUploadBytes,
    getCsvTempCleanupCutoffMs,
    getCsvTempCleanupSecrets,
    getCsvTempTtlSeconds,
} from "./csv-temp-config.ts";

const ENV_KEYS = [
    "CSV_TEMP_TTL_SECONDS",
    "CSV_MAX_FILE_SIZE_MB",
    "CSV_TEMP_CLEANUP_SECRET",
    "CRON_SECRET",
] as const;

describe("CSV temporary storage configuration", () => {
    let previous: Record<string, string | undefined>;

    beforeEach(() => {
        previous = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
        for (const key of ENV_KEYS) delete process.env[key];
    });

    afterEach(() => {
        for (const key of ENV_KEYS) {
            if (previous[key] === undefined) delete process.env[key];
            else process.env[key] = previous[key];
        }
    });

    it("uses the default TTL for unset, empty and invalid values", () => {
        assert.equal(getCsvTempTtlSeconds(), 1800);
        for (const value of ["", "  ", "0", "-1", "NaN", "Infinity"]) {
            process.env.CSV_TEMP_TTL_SECONDS = value;
            assert.equal(getCsvTempTtlSeconds(), 1800, value);
        }
    });

    it("calculates cleanup cutoff from a configured TTL", () => {
        process.env.CSV_TEMP_TTL_SECONDS = " 2.5 ";
        assert.equal(getCsvTempTtlSeconds(), 2.5);
        assert.equal(getCsvTempCleanupCutoffMs(10_000), 7_500);
    });

    it("calculates the default cutoff from the current time", (t) => {
        t.mock.timers.enable({ apis: ["Date"], now: 2_000_000 });
        assert.equal(getCsvTempCleanupCutoffMs(), 200_000);
    });

    it("defaults invalid upload limits and converts valid megabytes to bytes", () => {
        assert.equal(getCsvMaxUploadBytes(), 104_857_600);
        for (const value of ["", "0", "-1", "invalid", "Infinity"]) {
            process.env.CSV_MAX_FILE_SIZE_MB = value;
            assert.equal(getCsvMaxUploadBytes(), 104_857_600, value);
        }
        process.env.CSV_MAX_FILE_SIZE_MB = "1.25";
        assert.equal(getCsvMaxUploadBytes(), 1_310_720);
        process.env.CSV_MAX_FILE_SIZE_MB = "0.000001";
        assert.equal(getCsvMaxUploadBytes(), 1);
    });

    it("returns only nonempty cleanup credentials with whitespace removed", () => {
        assert.deepEqual(getCsvTempCleanupSecrets(), []);
        process.env.CSV_TEMP_CLEANUP_SECRET = "  primary  ";
        process.env.CRON_SECRET = "  secondary ";
        assert.deepEqual(getCsvTempCleanupSecrets(), ["primary", "secondary"]);
        process.env.CSV_TEMP_CLEANUP_SECRET = "  ";
        assert.deepEqual(getCsvTempCleanupSecrets(), ["secondary"]);
    });
});
