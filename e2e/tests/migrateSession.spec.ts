import { expect, test } from "../infra/coverage";
import ApiCalls from "../logic/api/apiCalls";

test.describe("@admin Migrate session API Tests", () => {
    // migrate-session deletes every connection record of the signed-in user, so it
    // is only ever called from a cookie-less context, never with a shared storageState.
    test("Unauthenticated request is rejected with 401", async ({ playwright }) => {
        const apiCall = new ApiCalls();
        const anonymous = await playwright.request.newContext({
            storageState: { cookies: [], origins: [] },
        });

        try {
            const { status, body } = await apiCall.migrateSession(anonymous);

            expect(status).toBe(401);
            expect(body).toEqual({ message: "Not authenticated" });
        } finally {
            await anonymous.dispose();
        }
    });
});
