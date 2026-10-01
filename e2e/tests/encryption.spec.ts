import test, { expect } from "@playwright/test";
import urls from '../config/urls.json';
import BrowserWrapper from "../infra/ui/browserWrapper";
import LoginPage from "../logic/POM/loginPage";
import { user } from '../config/user.json';

/**
 * Encryption migration e2e tests.
 *
 * These tests verify that the app correctly handles three scenarios for the
 * `secretKey` stored in localStorage:
 *
 * 1. Plain text (never encrypted) → migrated to server-side AES-256-GCM
 * 2. Legacy client-side `enc:` prefix → detected and migrated
 * 3. Already server-encrypted (v2:iv:authTag:ciphertext hex) → decrypted on load
 * 4. Saving via UI stores encrypted value
 */

// Owner-bound ciphertext: v2:iv(12B):authTag(16B):data
const HEX_COLON_PATTERN = /^v2:[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]+$/;
// Chat API keys live under a connection-scoped key (`<host>:<port>:<user>:chatApiKeys`)
// because each blob is encrypted against that same connection identity. Tests
// resolve the concrete key by suffix instead of hardcoding the connection.
const CHAT_API_KEYS_STORAGE_KEY = "chatApiKeys";
const CHAT_API_KEYS_SUFFIX = `:${CHAT_API_KEYS_STORAGE_KEY}`;

/** Reads the connection-scoped chat API keys entry from inside the page. */
async function readStoredChatApiKeys(
    page: Awaited<ReturnType<BrowserWrapper["getPage"]>>
): Promise<string | null> {
    return page.evaluate((suffix) => {
        for (let i = 0; i < localStorage.length; i += 1) {
            const key = localStorage.key(i);
            if (key && key.endsWith(suffix)) return localStorage.getItem(key);
        }
        return null;
    }, CHAT_API_KEYS_SUFFIX);
}

async function waitForMigratedChatApiKeys(page: Awaited<ReturnType<BrowserWrapper["getPage"]>>) {
    await expect.poll(async () => {
        const chatApiKeys = await readStoredChatApiKeys(page);
        const secretKey = await page.evaluate(() => localStorage.getItem("secretKey"));
        return secretKey === null && chatApiKeys !== null && HEX_COLON_PATTERN.test(chatApiKeys);
    }, { timeout: 15000 }).toBe(true);

    const encryptedKeys = await readStoredChatApiKeys(page);
    if (!encryptedKeys) return null;

    return page.evaluate(async (value) => {
        const response = await fetch('/api/encrypt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value, action: 'decrypt' }),
        });
        const payload = await response.json();

        return {
            encryptedKeys: value,
            decryptedKeys: payload.value as string,
            secretKey: localStorage.getItem("secretKey"),
        };
    }, encryptedKeys);
}

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

        const migrated = await waitForMigratedChatApiKeys(page);
        const migratedKeys = JSON.parse(migrated?.decryptedKeys ?? "[]") as Array<{ key?: string }>;

        expect(migrated?.secretKey).toBeNull();
        expect(migrated?.encryptedKeys).not.toBe("my-plain-api-key-12345");
        expect(migrated?.encryptedKeys).toMatch(HEX_COLON_PATTERN);
        expect(migratedKeys[0]?.key).toBe("my-plain-api-key-12345");
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

        const migrated = await waitForMigratedChatApiKeys(page);
        const migratedKeys = JSON.parse(migrated?.decryptedKeys ?? "[]") as Array<{ key?: string }>;
        const legacyKeyRemains = await page.evaluate(() =>
            localStorage.getItem("falkordb-key") !== null || sessionStorage.getItem("falkordb-key") !== null
        );

        expect(migrated?.secretKey).toBeNull();
        expect(migrated?.encryptedKeys).toMatch(HEX_COLON_PATTERN);
        expect(migratedKeys[0]?.key).toBe("test-api-key-for-migration");
        // The old key should be cleared
        expect(legacyKeyRemains).toBe(false);
    });

    test(`already server-encrypted chatApiKeys survives page reload`, async () => {
        await browser.createNewPage(LoginPage, urls.graphUrl);
        await browser.setPageToFullScreen();

        const page = await browser.getPage();

        // First, set a plain key and let the app migrate it to server encryption
        await page.evaluate(() => {
            localStorage.setItem("secretKey", "key-that-will-be-encrypted");
        });

        await page.reload({ waitUntil: "networkidle" });

        const migrated = await waitForMigratedChatApiKeys(page);
        const encryptedValue = migrated?.encryptedKeys;
        expect(encryptedValue).toMatch(HEX_COLON_PATTERN);

        // Reload the page — the encrypted value should stay the same
        // (should not be double-encrypted)
        await page.reload({ waitUntil: "networkidle" });
        await page.waitForTimeout(2000);

        const afterReload = await readStoredChatApiKeys(page);
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

    test(`/api/encrypt rejects a ciphertext that predates owner binding`, async () => {
        await browser.createNewPage(LoginPage, urls.graphUrl);
        await browser.setPageToFullScreen();

        const page = await browser.getPage();

        // Dropping the `v2:` prefix leaves the 3-part shape the endpoint used
        // to produce, which is no longer readable by design.
        const result = await page.evaluate(async () => {
            const encRes = await fetch('/api/encrypt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: "legacy-value", action: 'encrypt' }),
            });
            const { value } = await encRes.json();

            const decRes = await fetch('/api/encrypt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: value.replace(/^v2:/, ''), action: 'decrypt' }),
            });
            return { status: decRes.status, body: await decRes.json() };
        });

        expect(result.status).toBe(400);
        expect(result.body.error).toBe("Value predates owner binding and must be re-entered");
    });

    test(`/api/encrypt rejects a tampered ciphertext`, async () => {
        await browser.createNewPage(LoginPage, urls.graphUrl);
        await browser.setPageToFullScreen();

        const page = await browser.getPage();

        const result = await page.evaluate(async () => {
            const encRes = await fetch('/api/encrypt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: "value-belonging-to-someone-else", action: 'encrypt' }),
            });
            const { value } = await encRes.json();

            // Flip a ciphertext nibble so the auth tag no longer matches.
            const parts = value.split(':');
            const data = parts[3];
            const flipped = (data[0] === 'a' ? 'b' : 'a') + data.slice(1);
            const tampered = [parts[0], parts[1], parts[2], flipped].join(':');

            const decRes = await fetch('/api/encrypt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: tampered, action: 'decrypt' }),
            });
            return { status: decRes.status, body: await decRes.json() };
        });

        expect(result.status).toBe(403);
    });

    test(`/api/encrypt refuses a ciphertext minted by another connection`, async () => {
        // The binding is `username@host:port`, so signing in as a different
        // ACL user is a different owner even on the same server. This is the
        // attack the binding exists for: a blob lifted out of one user's
        // browser storage must not decrypt under another user's session.
        const login = await browser.createNewPage(LoginPage, urls.graphUrl);
        await browser.setPageToFullScreen();

        const page = await browser.getPage();
        const ciphertext = await page.evaluate(async () => {
            const res = await fetch('/api/encrypt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: "sk-admin-only", action: 'encrypt' }),
            });
            return (await res.json()).value as string;
        });
        expect(ciphertext).toMatch(HEX_COLON_PATTERN);

        // Same browser, different ACL user — so a different owner.
        await login.disconnectConnection();
        await login.connectWithCredentials("readwriteuser", user.password);
        await login.waitForUrl(urls.graphUrl);

        const result = await page.evaluate(async (value) => {
            const res = await fetch('/api/encrypt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value, action: 'decrypt' }),
            });
            return { status: res.status, body: await res.json() };
        }, ciphertext);

        expect(result.status).toBe(403);
        expect(result.body.error).toBe("Value does not belong to this connection");
    });
});
