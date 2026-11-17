import { expect, test } from "../infra/coverage";
import ApiCalls from "../logic/api/apiCalls";
import urls from "../config/urls.json";

test.describe("@admin Migrate session API Tests", () => {
    // Use cookie-less contexts so no shared storageState session is inspected or invalidated.
    test("Unauthenticated request is rejected as an invalid session", async ({ playwright }) => {
        const apiCall = new ApiCalls();
        const anonymous = await playwright.request.newContext({
            storageState: { cookies: [], origins: [] },
        });

        try {
            const { status, headers, body } = await apiCall.migrateSession(anonymous);

            expect(status).toBe(401);
            expect(headers["x-session-invalid"]).toBe("1");
            expect(body).toEqual({ message: "No active connection. Please sign in again.", code: "SESSION_INVALID" });
        } finally {
            await anonymous.dispose();
        }
    });

    test("Request without a trusted origin is rejected before the session is read", async ({ playwright }) => {
        const anonymous = await playwright.request.newContext({
            storageState: { cookies: [], origins: [] },
        });

        try {
            const response = await anonymous.post(urls.api.migrateSessionUrl);

            expect(response.status()).toBe(400);
            expect(await response.json()).toEqual({ message: "Untrusted request origin" });
        } finally {
            await anonymous.dispose();
        }
    });
});
