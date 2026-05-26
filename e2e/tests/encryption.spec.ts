import test, { expect } from "@playwright/test";
import urls from '../config/urls.json';
import BrowserWrapper from "../infra/ui/browserWrapper";
import LoginPage from "../logic/POM/loginPage";

/**
 * Encryption migration e2e tests.
 *
 * These tests verify that the app correctly handles three scenarios for the
 * `secretKey` stored in localStorage:
 *
 * 1. Plain text (never encrypted) → migrated to server-side AES-256-GCM
 * 2. Legacy client-side `enc:` prefix → detected and migrated
 * 3. Already server-encrypted (iv:authTag:ciphertext hex) → decrypted on load
 * 4. Saving via UI stores encrypted value
 */

const HEX_COLON_PATTERN = /^[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]+$/;

test.describe(`@admin Encryption migration tests`, () => {
    // Run serially: each test disconnects + re-authenticates which is resource-heavy;
    // parallel login attempts under CI load cause navigation timeouts.
    test.describe.configure({ mode: 'serial' });
    test.setTimeout(60_000);

    let browser: BrowserWrapper;

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
    });

    test.afterEach(async () => {
        await browser.closeBrowser();
    });

    test(`plain text secretKey is migrated to server-side encryption on page load`, async () => {
        await browser.createNewPage(LoginPage);
        await browser.setPageToFullScreen();

        const page = await browser.getPage();

        // Set a plain-text secret key directly into localStorage
        await page.addInitScript(() => {
            localStorage.setItem("secretKey", "my-plain-api-key-12345");
        });

        await page.goto(urls.graphUrl);
        await page.waitForLoadState("networkidle");

        await expect.poll(async () =>
            page.evaluate(() => localStorage.getItem("secretKey")),
            { timeout: 15000 }
        ).toMatch(HEX_COLON_PATTERN);

        const storedKey = await page.evaluate(() => localStorage.getItem("secretKey"));

        // It should now be server-encrypted (iv:authTag:ciphertext hex format)
        expect(storedKey).not.toBe("my-plain-api-key-12345");
        expect(storedKey).toMatch(HEX_COLON_PATTERN);
    });
    test(`legacy enc: prefixed secretKey is detected on page load`, async () => {
        await browser.createNewPage(LoginPage);
        await browser.setPageToFullScreen();

        const page = await browser.getPage();

        // Simulate a legacy encrypted value.
        // The old encryption used Web Crypto AES-GCM with a key stored under
        // 'falkordb-key'. We set a fake enc: value — the migration code should
        // detect the prefix and attempt legacy decryption.
        // Since we don't have a real old crypto key, the migration should fail
        // gracefully and clear the secret key.
        await page.addInitScript(() => {
            localStorage.setItem("secretKey", "enc:AAAA/fake-legacy-base64-data==");
            // Do NOT set 'falkordb-key' so legacy decrypt returns empty → key is cleared
        });

        await page.goto(urls.graphUrl);
        await page.waitForLoadState("networkidle");

        // The legacy key should be cleared since there's no valid old crypto key
        // Should either be removed or be empty (cleared by the migration)
        await expect.poll(async () => page.evaluate(() => {
            const secretKey = localStorage.getItem("secretKey");
            return secretKey === null || secretKey === "";
        }), { timeout: 15000 }).toBe(true);

        const storedKey = await page.evaluate(() => localStorage.getItem("secretKey"));
        expect(storedKey === null || storedKey === "").toBe(true);
    });

    test(`legacy enc: prefixed secretKey with old key present triggers migration`, async () => {
        const login = await browser.createNewPage(LoginPage, urls.loginUrl);
        await login.disconnectConnection();
        await browser.setPageToFullScreen();

        const page = await browser.getPage();

        // Generate a real AES-GCM encrypted value using Web Crypto API
        // then store it with the enc: prefix + the key in localStorage.
        await page.evaluate(async () => {
            // Create a real crypto key
            const key = await window.crypto.subtle.generateKey(
                { name: 'AES-GCM', length: 256 },
                true,
                ['encrypt', 'decrypt']
            );

            // Export key for storage
            const keyBuffer = await window.crypto.subtle.exportKey('raw', key);
            const keyBase64 = btoa(String.fromCharCode(...new Uint8Array(keyBuffer)));

            // Encrypt a test value
            const plainText = "test-api-key-for-migration";
            const encoded = new TextEncoder().encode(plainText);
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const encryptedBuffer = await window.crypto.subtle.encrypt(
                { name: 'AES-GCM', iv },
                key,
                encoded
            );

            // Combine IV + ciphertext (same as old encryption.ts did)
            const combined = new Uint8Array(iv.length + new Uint8Array(encryptedBuffer).length);
            combined.set(iv);
            combined.set(new Uint8Array(encryptedBuffer), iv.length);
            const encBase64 = btoa(String.fromCharCode(...combined));

            // Store in localStorage like the old code did
            localStorage.setItem("secretKey", `enc:${encBase64}`);
            localStorage.setItem("falkordb-key", keyBase64);

            return { plainText, encBase64, keyBase64 };
        });

        await login.clickOnConnect();
        // Wait for the migration effect to run
        await page.waitForTimeout(3000);

        // The legacy key should have been decrypted and re-encrypted server-side
        const storedKey = await page.evaluate(() => localStorage.getItem("secretKey"));
        const legacyKeyRemains = await page.evaluate(() =>
            localStorage.getItem("falkordb-key") !== null || sessionStorage.getItem("falkordb-key") !== null
        );

        // The key should now be in the new server-encrypted format
        expect(storedKey).not.toBeNull();
        expect(storedKey!.startsWith("enc:")).toBe(false);
        expect(storedKey!).toMatch(HEX_COLON_PATTERN);
        // The old key should be cleared
        expect(legacyKeyRemains).toBe(false);
    });

    test(`already server-encrypted secretKey survives page reload`, async () => {
        await browser.createNewPage(LoginPage, urls.graphUrl);
        await browser.setPageToFullScreen();

        const page = await browser.getPage();

        // First, set a plain key and let the app migrate it to server encryption
        await page.evaluate(() => {
            localStorage.setItem("secretKey", "key-that-will-be-encrypted");
        });

        await page.reload({ waitUntil: "networkidle" });

        await expect.poll(async () =>
            page.evaluate(() => localStorage.getItem("secretKey")),
            { timeout: 15000 }
        ).toMatch(HEX_COLON_PATTERN);

        const encryptedValue = await page.evaluate(() => localStorage.getItem("secretKey"));
        expect(encryptedValue).toMatch(HEX_COLON_PATTERN);

        // Reload the page — the encrypted value should stay the same
        // (should not be double-encrypted)
        await page.reload({ waitUntil: "networkidle" });
        await page.waitForTimeout(2000);

        const afterReload = await page.evaluate(() => localStorage.getItem("secretKey"));
        expect(afterReload).toBe(encryptedValue);
    });

    test(`empty secretKey remains empty after page load`, async () => {
        await browser.createNewPage(LoginPage);
        await browser.setPageToFullScreen();

        const page = await browser.getPage();

        // Ensure no secretKey is stored
        await page.addInitScript(() => {
            localStorage.removeItem("secretKey");
        });

        await page.goto(urls.graphUrl);
        await page.waitForLoadState("networkidle");

        const storedKey = await page.evaluate(() => localStorage.getItem("secretKey"));
        // Should still be absent
        expect(storedKey).toBeNull();
    });

    test(`server-encrypted value can be decrypted through the /api/encrypt endpoint`, async () => {
        await browser.createNewPage(LoginPage, urls.graphUrl);
        await browser.setPageToFullScreen();

        const page = await browser.getPage();

        // Call the encrypt API through the browser context (authenticated)
        const roundtripResult = await page.evaluate(async () => {
            const original = "roundtrip-test-value-xyz";

            // Encrypt
            const encRes = await fetch('/api/encrypt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: original, action: 'encrypt' }),
            });
            const encData = await encRes.json();

            // Decrypt
            const decRes = await fetch('/api/encrypt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: encData.value, action: 'decrypt' }),
            });
            const decData = await decRes.json();

            return {
                original,
                encrypted: encData.value,
                decrypted: decData.value,
                encryptStatus: encRes.status,
                decryptStatus: decRes.status,
            };
        });

        expect(roundtripResult.encryptStatus).toBe(200);
        expect(roundtripResult.decryptStatus).toBe(200);
        expect(roundtripResult.encrypted).toMatch(HEX_COLON_PATTERN);
        expect(roundtripResult.encrypted).not.toBe(roundtripResult.original);
        expect(roundtripResult.decrypted).toBe(roundtripResult.original);
    });

    test(`/api/encrypt rejects unauthenticated requests`, async () => {
        const login = await browser.createNewPage(LoginPage, urls.loginUrl);
        await login.disconnectConnection();
        await browser.setPageToFullScreen();

        const page = await browser.getPage();

        // Try to call encrypt API without logging in — should get 401
        const status = await page.evaluate(async () => {
            const res = await fetch('/api/encrypt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: "test", action: 'encrypt' }),
            });
            return res.status;
        });

        expect(status).toBe(401);
    });
});
