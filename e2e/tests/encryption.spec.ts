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
    let browser: BrowserWrapper;

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
    });

    test.afterEach(async () => {
        await browser.closeBrowser();
    });

    test(`plain text secretKey is migrated to server-side encryption on page load`, async () => {
        const login = await browser.createNewPage(LoginPage, urls.loginUrl);
        await login.Logout();
        await browser.setPageToFullScreen();

        const page = await browser.getPage();

        // Set a plain-text secret key directly into localStorage
        await page.evaluate(() => {
            localStorage.setItem("secretKey", "my-plain-api-key-12345");
        });

        // Log in so the app loads and the migration code in providers.tsx runs
        await login.clickOnConnect();
        // Wait for the app to stabilize and the migration effect to run
        await page.waitForTimeout(2000);

        // Read back the secretKey from localStorage
        const storedKey = await page.evaluate(() => localStorage.getItem("secretKey"));

        // It should now be server-encrypted (iv:authTag:ciphertext hex format)
        expect(storedKey).not.toBeNull();
        expect(storedKey).not.toBe("my-plain-api-key-12345");
        expect(storedKey!).toMatch(HEX_COLON_PATTERN);
    });

    test(`legacy enc: prefixed secretKey is detected on page load`, async () => {
        const login = await browser.createNewPage(LoginPage, urls.loginUrl);
        await login.Logout();
        await browser.setPageToFullScreen();

        const page = await browser.getPage();

        // Simulate a legacy encrypted value.
        // The old encryption used Web Crypto AES-GCM with a key stored under
        // 'falkordb-key'. We set a fake enc: value — the migration code should
        // detect the prefix and attempt legacy decryption.
        // Since we don't have a real old crypto key, the migration should fail
        // gracefully and clear the secret key.
        await page.evaluate(() => {
            localStorage.setItem("secretKey", "enc:AAAA/fake-legacy-base64-data==");
            // Do NOT set 'falkordb-key' so legacy decrypt returns empty → key is cleared
        });

        await login.clickOnConnect();
        await page.waitForTimeout(2000);

        // The legacy key should be cleared since there's no valid old crypto key
        const storedKey = await page.evaluate(() => localStorage.getItem("secretKey"));
        // Should either be removed or be empty (cleared by the migration)
        expect(storedKey === null || storedKey === "").toBe(true);
    });

    test(`legacy enc: prefixed secretKey with old key present triggers migration`, async () => {
        const login = await browser.createNewPage(LoginPage, urls.loginUrl);
        await login.Logout();
        await browser.setPageToFullScreen();

        const page = await browser.getPage();

        // Generate a real AES-GCM encrypted value using Web Crypto API
        // then store it with the enc: prefix + the key in localStorage.
        const migrationResult = await page.evaluate(async () => {
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
        const login = await browser.createNewPage(LoginPage, urls.loginUrl);
        await login.Logout();
        await browser.setPageToFullScreen();

        const page = await browser.getPage();

        // First, set a plain key and let the server encrypt it
        await page.evaluate(() => {
            localStorage.setItem("secretKey", "key-that-will-be-encrypted");
        });

        await login.clickOnConnect();
        await page.waitForTimeout(2000);

        // Read the now-encrypted value
        const encryptedValue = await page.evaluate(() => localStorage.getItem("secretKey"));
        expect(encryptedValue).not.toBeNull();
        expect(encryptedValue!).toMatch(HEX_COLON_PATTERN);

        // Reload the page — the encrypted value should stay the same
        // (should not be double-encrypted)
        await page.reload({ waitUntil: "networkidle" });
        await page.waitForTimeout(2000);

        const afterReload = await page.evaluate(() => localStorage.getItem("secretKey"));
        expect(afterReload).toBe(encryptedValue);
    });

    test(`empty secretKey remains empty after page load`, async () => {
        const login = await browser.createNewPage(LoginPage, urls.loginUrl);
        await login.Logout();
        await browser.setPageToFullScreen();

        const page = await browser.getPage();

        // Ensure no secretKey is stored
        await page.evaluate(() => {
            localStorage.removeItem("secretKey");
        });

        await login.clickOnConnect();
        await page.waitForTimeout(2000);

        const storedKey = await page.evaluate(() => localStorage.getItem("secretKey"));
        // Should still be absent
        expect(storedKey).toBeNull();
    });

    test(`server-encrypted value can be decrypted through the /api/encrypt endpoint`, async () => {
        const login = await browser.createNewPage(LoginPage, urls.loginUrl);
        await login.Logout();
        await browser.setPageToFullScreen();

        const page = await browser.getPage();

        // Log in first to get authenticated
        await login.clickOnConnect();
        await page.waitForTimeout(1000);

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
        await login.Logout();
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
