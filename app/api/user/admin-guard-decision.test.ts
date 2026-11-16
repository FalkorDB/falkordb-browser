import { describe, it } from "node:test";
import assert from "node:assert/strict";
import resolveAdminRejection, { ADMIN_ONLY_MESSAGE } from "./admin-guard-decision.ts";

describe("resolveAdminRejection", () => {
    it("lets an Admin through", () => {
        assert.equal(resolveAdminRejection("Admin"), null);
    });

    for (const role of ["Read-Write", "Read-Only"] as const) {
        it(`refuses a ${role} user with a 403`, () => {
            assert.deepEqual(resolveAdminRejection(role), {
                status: 403,
                message: ADMIN_ONLY_MESSAGE,
            });
        });
    }

    it("pins the message clients see", () => {
        assert.equal(ADMIN_ONLY_MESSAGE, "Forbidden: only Admin users can manage users");
    });
});
