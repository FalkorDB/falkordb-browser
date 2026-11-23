import test, { expect } from "@playwright/test";
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { createClient } from "@redis/client";
import urls from '../config/urls.json';
import BrowserWrapper from "../infra/ui/browserWrapper";
import LoginPage from "../logic/POM/loginPage";
import { urlPath } from "../infra/utils";
import { REAUTHENTICATION_HANDOFF_COOKIE } from "../../lib/reauthentication-handoff.ts";

test.describe(`@tls TLS Login tests`, () => {
    let browser: BrowserWrapper;

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
    });

    test.afterEach(async () => {
        await browser.closeBrowser();
    });

    test(`validate access is denied when using an invalid TLS certificate`, async () => {
        const login = await browser.createNewPage(LoginPage, urls.loginUrl);
        await browser.setPageToFullScreen();
        
        await login.clickEnableTLS();
        expect(await login.isTLSEnabled()).toBe(true);

        const invalidCertPath = path.join(process.cwd(), 'tls', 'client.crt');
        await login.uploadCertificate(invalidCertPath);
        expect(await login.isCertificateUploaded()).toBe(true);

        await login.clickConnect();
        expect(urlPath(login.getCurrentURL())).not.toBe(urlPath(urls.graphUrl));
    });

    test(`validate successful login and redirection with a valid TLS certificate`, async () => {
        const login = await browser.createNewPage(LoginPage, urls.loginUrl);
        await browser.setPageToFullScreen();
        await login.clickEnableTLS();
        expect(await login.isTLSEnabled()).toBe(true);
        
        const validCertPath = path.join(process.cwd(), 'tls', 'ca.crt');
        await login.uploadCertificate(validCertPath);
        expect(await login.isCertificateUploaded()).toBe(true);
        
        await login.clickConnect();
        await login.waitForSuccessfulLogin(urls.graphUrl);
        
        expect(urlPath(login.getCurrentURL())).toBe(urlPath(urls.graphUrl));
    });

    test(`validate remove certificate button functionality after uploading certificate`, async () => {
        const login = await browser.createNewPage(LoginPage, urls.loginUrl);
        await browser.setPageToFullScreen();
        await login.clickEnableTLS();
        expect(await login.isTLSEnabled()).toBe(true);
        
        const validCertPath = path.join(process.cwd(), 'tls', 'ca.crt');
        await login.uploadCertificate(validCertPath);
        expect(await login.isCertificateUploaded()).toBe(true);
        await login.clickRemoveCertificateBtn();
        expect(await login.isCertificateRemoved()).toBe(true);
        await login.uploadCertificate(validCertPath);
        expect(await login.isCertificateUploaded()).toBe(true);
    });

    test(`clears a certificate read error while retrying the same file`, async ({}, testInfo) => {
        const login = await browser.createNewPage(LoginPage);
        const page = await browser.getPage();
        const certificatePath = testInfo.outputPath('retry-certificate.crt');
        await writeFile(certificatePath, 'test certificate');
        const readError = login.fileReadError(path.basename(certificatePath));

        await page.addInitScript(() => {
            const readAsDataURL = FileReader.prototype.readAsDataURL;
            let readCount = 0;

            FileReader.prototype.readAsDataURL = function(file: Blob) {
                readCount += 1;
                if (readCount === 1) {
                    this.dispatchEvent(new ProgressEvent("error"));
                    return;
                }
                if (readCount === 2) {
                    const reader = this;
                    window.addEventListener("complete-file-read", () => {
                        readAsDataURL.call(reader, file);
                    }, { once: true });
                    document.documentElement.dataset.retryReadStarted = "true";
                    return;
                }
                readAsDataURL.call(this, file);
            };
        });
        await browser.navigateTo(urls.loginUrl);
        await login.clickEnableTLS();

        await login.uploadCertificate(certificatePath);
        await expect(readError).toBeVisible();

        let retryFinished = false;
        const retryUpload = login.uploadCertificate(certificatePath).then(() => { retryFinished = true; });
        try {
            await page.waitForFunction(() => document.documentElement.dataset.retryReadStarted === "true");
            await expect(readError).toBeHidden();
            await expect(login.logInButton).toBeDisabled();
            expect(retryFinished).toBe(false);
        } finally {
            await page.evaluate(() => window.dispatchEvent(new Event("complete-file-read")));
            await retryUpload;
        }

        expect(await login.isCertificateUploaded()).toBe(true);
        await expect(login.logInButton).toBeEnabled();
    });

    test(`ignores an older certificate read error while its retry is pending`, async ({}, testInfo) => {
        const login = await browser.createNewPage(LoginPage);
        const page = await browser.getPage();
        const certificatePath = testInfo.outputPath('overlapping-certificate.crt');
        await writeFile(certificatePath, 'test certificate');
        const readError = login.fileReadError(path.basename(certificatePath));

        await page.addInitScript(() => {
            const readAsDataURL = FileReader.prototype.readAsDataURL;
            const reads: { reader: FileReader; file: Blob }[] = [];
            FileReader.prototype.readAsDataURL = function(file: Blob) {
                reads.push({ reader: this, file });
                document.documentElement.dataset.readCount = String(reads.length);
            };
            window.addEventListener("fail-first-read", () => {
                reads[0].reader.dispatchEvent(new ProgressEvent("error"));
                requestAnimationFrame(() => { document.documentElement.dataset.firstReadFailed = "true"; });
            });
            window.addEventListener("complete-second-read", () => readAsDataURL.call(reads[1].reader, reads[1].file));
        });
        await browser.navigateTo(urls.loginUrl);
        await login.clickEnableTLS();

        const firstUpload = login.uploadCertificate(certificatePath);
        await page.waitForFunction(() => document.documentElement.dataset.readCount === "1");
        const retryUpload = login.uploadCertificate(certificatePath);
        try {
            await page.waitForFunction(() => document.documentElement.dataset.readCount === "2");
            await page.evaluate(() => window.dispatchEvent(new Event("fail-first-read")));
            await page.waitForFunction(() => document.documentElement.dataset.firstReadFailed === "true");
            await expect(readError).toBeHidden();
        } finally {
            await page.evaluate(() => window.dispatchEvent(new Event("complete-second-read")));
            await Promise.all([firstUpload, retryUpload]);
        }
        expect(await login.isCertificateUploaded()).toBe(true);
    });

    test(`selects a replacement even if the older read fails while the chooser opens`, async ({}, testInfo) => {
        const login = await browser.createNewPage(LoginPage);
        const page = await browser.getPage();
        const certificatePath = testInfo.outputPath('chooser-retry.crt');
        await writeFile(certificatePath, 'certificate');
        await page.addInitScript(() => {
            const readAsDataURL = FileReader.prototype.readAsDataURL;
            let firstReader: FileReader | undefined;
            let count = 0;
            FileReader.prototype.readAsDataURL = function(file: Blob) {
                document.documentElement.dataset.readCount = String(++count);
                if (count === 1) {
                    firstReader = this;
                    return;
                }
                readAsDataURL.call(this, file);
            };
            document.addEventListener("click", event => {
                if (event.target instanceof HTMLInputElement && event.target.type === "file" && count === 1) {
                    firstReader?.dispatchEvent(new ProgressEvent("error"));
                    document.documentElement.dataset.failedDuringChooser = "true";
                }
            }, true);
        });
        await browser.navigateTo(urls.loginUrl);
        await login.clickEnableTLS();
        const firstUpload = login.uploadCertificate(certificatePath);
        await page.waitForFunction(() => document.documentElement.dataset.readCount === "1");
        await login.uploadCertificate(certificatePath);
        await firstUpload;
        await page.waitForFunction(() => document.documentElement.dataset.readCount === "2");
        expect(await page.evaluate(() => document.documentElement.dataset.failedDuringChooser)).toBe("true");
        expect(await login.isCertificateUploaded()).toBe(true);
    });

    test(`does not submit credentials until the current certificate read completes`, async ({}, testInfo) => {
        const login = await browser.createNewPage(LoginPage);
        const page = await browser.getPage();
        const certificatePath = testInfo.outputPath('pending-submit.crt');
        await writeFile(certificatePath, 'certificate');
        const submittedCertificates: (string | null)[] = [];
        await page.route("**/api/auth/providers", route => route.fulfill({
            json: {
                credentials: {
                    id: "credentials",
                    name: "Credentials",
                    type: "credentials",
                    signinUrl: new URL("/api/auth/signin/credentials", urls.loginUrl).href,
                    callbackUrl: new URL("/api/auth/callback/credentials", urls.loginUrl).href,
                },
            },
        }));
        await page.route("**/api/auth/csrf", route => route.fulfill({ json: { csrfToken: "test-csrf-token" } }));
        await page.route("**/api/auth/callback/credentials*", async route => {
            submittedCertificates.push(new URLSearchParams(route.request().postData() ?? "").get("ca"));
            await route.fulfill({
                status: 401,
                json: { url: new URL("/login?error=CredentialsSignin", urls.loginUrl).href },
            });
        });
        await page.addInitScript(() => {
            const readAsDataURL = FileReader.prototype.readAsDataURL;
            FileReader.prototype.readAsDataURL = function(file: Blob) {
                window.addEventListener("complete-file-read", () => readAsDataURL.call(this, file), { once: true });
                document.documentElement.dataset.readStarted = "true";
            };
        });
        await browser.navigateTo(urls.loginUrl);
        await login.fillHost("localhost");
        await login.fillPort("6381");
        await login.clickEnableTLS();
        const upload = login.uploadCertificate(certificatePath);
        try {
            await page.waitForFunction(() => document.documentElement.dataset.readStarted === "true");
            await login.submitForm();
            await expect(login.logInButton).toBeDisabled();
        } finally {
            await page.evaluate(() => window.dispatchEvent(new Event("complete-file-read")));
            await upload;
        }
        await expect(login.logInButton).toBeEnabled();
        await login.clickConnect();
        await expect.poll(() => submittedCertificates).toEqual(["Y2VydGlmaWNhdGU="]);
        await expect(login.logInButton).toBeDisabled();
    });

    test(`waits for a retry that fails immediately`, async ({}, testInfo) => {
        const login = await browser.createNewPage(LoginPage);
        const page = await browser.getPage();
        const certificatePath = testInfo.outputPath('immediate-error.crt');
        await writeFile(certificatePath, 'test certificate');
        const readError = login.fileReadError(path.basename(certificatePath));

        await page.addInitScript(() => {
            let count = 0;
            FileReader.prototype.readAsDataURL = function() {
                document.documentElement.dataset.readCount = String(++count);
                this.dispatchEvent(new ProgressEvent("error"));
            };
        });
        await browser.navigateTo(urls.loginUrl);
        await login.clickEnableTLS();
        await login.uploadCertificate(certificatePath);
        await expect(readError).toBeVisible();
        await login.uploadCertificate(certificatePath);
        await page.waitForFunction(() => document.documentElement.dataset.readCount === "2");
        await expect(readError).toBeVisible();
    });

    test(`ignores an older successful certificate read while its replacement is pending`, async ({}, testInfo) => {
        const login = await browser.createNewPage(LoginPage);
        const page = await browser.getPage();
        const firstPath = testInfo.outputPath('old-certificate.crt');
        const secondPath = testInfo.outputPath('new-certificate.crt');
        await Promise.all([writeFile(firstPath, 'old'), writeFile(secondPath, 'new')]);
        await page.addInitScript(() => {
            const readAsDataURL = FileReader.prototype.readAsDataURL;
            const reads: { reader: FileReader; file: Blob }[] = [];
            FileReader.prototype.readAsDataURL = function(file: Blob) {
                reads.push({ reader: this, file });
                document.documentElement.dataset.readCount = String(reads.length);
            };
            window.addEventListener("complete-first-read", () => {
                reads[0].reader.addEventListener("loadend", () => { document.documentElement.dataset.firstFinished = "true"; });
                readAsDataURL.call(reads[0].reader, reads[0].file);
            });
            window.addEventListener("complete-second-read", () => readAsDataURL.call(reads[1].reader, reads[1].file));
        });
        await browser.navigateTo(urls.loginUrl);
        await login.clickEnableTLS();
        const firstUpload = login.uploadCertificate(firstPath);
        await page.waitForFunction(() => document.documentElement.dataset.readCount === "1");
        const secondUpload = login.uploadCertificate(secondPath);
        try {
            await page.waitForFunction(() => document.documentElement.dataset.readCount === "2");
            await page.evaluate(() => window.dispatchEvent(new Event("complete-first-read")));
            await page.waitForFunction(() => document.documentElement.dataset.firstFinished === "true");
            expect(await login.isCertificateRemoved()).toBe(true);
        } finally {
            await page.evaluate(() => window.dispatchEvent(new Event("complete-second-read")));
            await Promise.all([firstUpload, secondUpload]);
        }
        expect(await login.isCertificateUploaded()).toBe(true);
    });

    test(`independent certificate and key reads can both complete`, async ({}, testInfo) => {
        const login = await browser.createNewPage(LoginPage);
        const page = await browser.getPage();
        const certificatePath = testInfo.outputPath('independent-certificate.crt');
        const keyPath = testInfo.outputPath('independent-key.pem');
        await Promise.all([writeFile(certificatePath, 'certificate'), writeFile(keyPath, 'key')]);
        await page.addInitScript(() => {
            const readAsDataURL = FileReader.prototype.readAsDataURL;
            const reads: { reader: FileReader; file: Blob }[] = [];
            FileReader.prototype.readAsDataURL = function(file: Blob) {
                reads.push({ reader: this, file });
                document.documentElement.dataset.readCount = String(reads.length);
            };
            window.addEventListener("complete-first-read", () => readAsDataURL.call(reads[0].reader, reads[0].file));
            window.addEventListener("complete-second-read", () => readAsDataURL.call(reads[1].reader, reads[1].file));
        });
        await browser.navigateTo(urls.loginUrl);
        await login.clickEnableTLS();

        const certificateUpload = login.uploadCertificate(certificatePath);
        await page.waitForFunction(() => document.documentElement.dataset.readCount === "1");
        const keyUpload = login.uploadClientKey(keyPath);
        await page.waitForFunction(() => document.documentElement.dataset.readCount === "2");
        await expect(login.logInButton).toBeDisabled();
        await page.evaluate(() => window.dispatchEvent(new Event("complete-second-read")));
        await keyUpload;
        await expect(login.logInButton).toBeDisabled();
        await page.evaluate(() => window.dispatchEvent(new Event("complete-first-read")));
        await certificateUpload;

        expect(await login.isClientKeyUploaded()).toBe(true);
        expect(await login.isCertificateUploaded()).toBe(true);
        await expect(login.logInButton).toBeEnabled();
    });

    test(`ignores a pending certificate read after TLS is disabled`, async ({}, testInfo) => {
        const login = await browser.createNewPage(LoginPage);
        const page = await browser.getPage();
        const certificatePath = testInfo.outputPath('disabled-tls.crt');
        await writeFile(certificatePath, 'certificate');
        await page.addInitScript(() => {
            const readAsDataURL = FileReader.prototype.readAsDataURL;
            const reads: { reader: FileReader; file: Blob }[] = [];
            FileReader.prototype.readAsDataURL = function(file: Blob) {
                reads.push({ reader: this, file });
                document.documentElement.dataset.readCount = String(reads.length);
            };
            window.addEventListener("fail-first-read", () => {
                reads[0].reader.dispatchEvent(new ProgressEvent("error"));
                requestAnimationFrame(() => { document.documentElement.dataset.firstReadFailed = "true"; });
            });
            window.addEventListener("complete-second-read", () => readAsDataURL.call(reads[1].reader, reads[1].file));
        });
        await browser.navigateTo(urls.loginUrl);
        await login.clickEnableTLS();
        await expect(login.logInButton).toBeEnabled();
        const firstUpload = login.uploadCertificate(certificatePath);
        await page.waitForFunction(() => document.documentElement.dataset.readCount === "1");
        await login.clickEnableTLS();
        await page.evaluate(() => window.dispatchEvent(new Event("fail-first-read")));
        await page.waitForFunction(() => document.documentElement.dataset.firstReadFailed === "true");
        await expect(login.logInButton).toBeEnabled();
        await expect(login.fileReadError(path.basename(certificatePath))).toBeHidden();
        await login.clickEnableTLS();
        const secondUpload = login.uploadCertificate(certificatePath);
        await page.waitForFunction(() => document.documentElement.dataset.readCount === "2");
        await page.evaluate(() => window.dispatchEvent(new Event("complete-second-read")));
        await Promise.all([firstUpload, secondUpload]);
        expect(await login.isCertificateUploaded()).toBe(true);
        await expect(login.logInButton).toBeEnabled();
    });

    test(`ignores a pending certificate read after a URL edit disables TLS`, async ({}, testInfo) => {
        const login = await browser.createNewPage(LoginPage);
        const page = await browser.getPage();
        const certificatePath = testInfo.outputPath('url-disabled-tls.crt');
        await writeFile(certificatePath, 'certificate');
        await page.addInitScript(() => {
            const readAsDataURL = FileReader.prototype.readAsDataURL;
            const reads: { reader: FileReader; file: Blob }[] = [];
            FileReader.prototype.readAsDataURL = function(file: Blob) {
                reads.push({ reader: this, file });
                document.documentElement.dataset.readCount = String(reads.length);
            };
            window.addEventListener("complete-first-read", () => {
                reads[0].reader.addEventListener("load", () => {
                    requestAnimationFrame(() => { document.documentElement.dataset.firstReadLoaded = "true"; });
                });
                readAsDataURL.call(reads[0].reader, reads[0].file);
            }, { once: true });
            window.addEventListener("complete-second-read", () => {
                if (reads[1]) readAsDataURL.call(reads[1].reader, reads[1].file);
            }, { once: true });
        });
        await browser.navigateTo(urls.loginUrl);
        await login.clickEnableTLS();
        const firstUpload = login.uploadCertificate(certificatePath);
        let secondUpload: Promise<void> | undefined;
        try {
            await page.waitForFunction(() => document.documentElement.dataset.readCount === "1");
            await expect(login.logInButton).toBeDisabled();
            await login.clickUrlMode();
            await login.fillFalkorDBUrl("falkor://localhost:6379");
            await expect(login.logInButton).toBeEnabled();
            await page.evaluate(() => window.dispatchEvent(new Event("complete-first-read")));
            await page.waitForFunction(() => document.documentElement.dataset.firstReadLoaded === "true");
            await expect(login.logInButton).toBeEnabled();
            await login.clickManualMode();
            expect(await login.isTLSEnabled()).toBe(false);
            await login.clickEnableTLS();
            expect(await login.isTLSEnabled()).toBe(true);
            expect(await login.isCertificateRemoved()).toBe(true);
            secondUpload = login.uploadCertificate(certificatePath);
            await page.waitForFunction(() => document.documentElement.dataset.readCount === "2");
        } finally {
            // Settle both reads even if an assertion failed; the once-listeners make repeats no-ops.
            await page.evaluate(() => {
                window.dispatchEvent(new Event("complete-first-read"));
                window.dispatchEvent(new Event("complete-second-read"));
            });
            await Promise.all([firstUpload, secondUpload]);
        }
        expect(await login.isCertificateUploaded()).toBe(true);
        await expect(login.logInButton).toBeEnabled();
    });

    // A FalkorDB with tls-auth-clients on is unreachable without these two
    // uploads, which is the whole reason the client certificate fields exist.
    test(`validate successful login with a client certificate and key`, async () => {
        const login = await browser.createNewPage(LoginPage, urls.loginUrl);
        await browser.setPageToFullScreen();
        await login.clickEnableTLS();
        expect(await login.isTLSEnabled()).toBe(true);

        await login.uploadCertificate(path.join(process.cwd(), 'tls', 'ca.crt'));
        expect(await login.isCertificateUploaded()).toBe(true);

        await login.uploadClientCertificate(path.join(process.cwd(), 'tls', 'client.crt'));
        expect(await login.isClientCertificateUploaded()).toBe(true);

        await login.uploadClientKey(path.join(process.cwd(), 'tls', 'client.key'));
        expect(await login.isClientKeyUploaded()).toBe(true);

        await login.clickConnect();
        await login.waitForSuccessfulLogin(urls.graphUrl);

        expect(urlPath(login.getCurrentURL())).toBe(urlPath(urls.graphUrl));
    });

    // The pair is only usable whole, so the form says which half is missing
    // instead of letting it fail in the TLS handshake.
    test(`validate connection is refused when the client key is missing`, async () => {
        const login = await browser.createNewPage(LoginPage, urls.loginUrl);
        await browser.setPageToFullScreen();
        await login.clickEnableTLS();
        expect(await login.isTLSEnabled()).toBe(true);

        await login.uploadCertificate(path.join(process.cwd(), 'tls', 'ca.crt'));
        await login.uploadClientCertificate(path.join(process.cwd(), 'tls', 'client.crt'));
        expect(await login.isClientCertificateUploaded()).toBe(true);

        await login.clickConnect();
        expect(urlPath(login.getCurrentURL())).not.toBe(urlPath(urls.graphUrl));
    });

    test(`reuses saved client TLS material after a password change`, async ({ playwright }) => {
        const origin = new URL(urls.loginUrl).origin;
        const username = `reauth_${crypto.randomUUID().replaceAll("-", "")}`;
        const initialPassword = `Initial!${crypto.randomUUID()}`;
        const endpoint = { host: "localhost", port: 6381, username, tls: true };
        const defaultEndpoint = { ...endpoint, username: "default" };
        const ca = (await readFile(path.join(process.cwd(), "tls", "ca.crt"))).toString("base64");
        const cert = (await readFile(path.join(process.cwd(), "tls", "client.crt"))).toString("base64");
        const key = (await readFile(path.join(process.cwd(), "tls", "client.key"))).toString("base64");
        const password = `New!${crypto.randomUUID()}`;
        const inspector = createClient({
            username: "default",
            socket: {
                host: "localhost",
                port: endpoint.port,
                tls: true,
                ca: await readFile(path.join(process.cwd(), "tls", "ca.crt")),
                cert: await readFile(path.join(process.cwd(), "tls", "client.crt")),
                key: await readFile(path.join(process.cwd(), "tls", "client.key")),
            },
        });
        const request = await playwright.request.newContext({
            baseURL: origin,
            storageState: { cookies: [], origins: [] },
            extraHTTPHeaders: { Origin: origin },
        });
        const csrfToken = async () => (await (await request.get("/api/auth/csrf")).json()).csrfToken;
        const signIn = async (
            passwordValue: string,
            includeTlsMaterial: boolean,
            signInEndpoint = endpoint,
        ) => {
            const form: Record<string, string | number | boolean> = {
                ...signInEndpoint,
                csrfToken: await csrfToken(),
                callbackUrl: origin,
                password: passwordValue,
            };
            if (includeTlsMaterial) Object.assign(form, { ca, cert, key });
            const response = await request.post("/api/auth/callback/credentials", {
                headers: { "X-Auth-Return-Redirect": "1" },
                form,
            });
            expect(response.ok()).toBe(true);
            return (await request.get("/api/auth/session")).json();
        };
        const signOut = async () => request.post("/api/auth/signout", {
            form: { csrfToken: await csrfToken() },
        });
        const countUserConnections = async () => {
            const clients = await inspector.clientList();
            return clients.filter(client => client.user === username).length;
        };

        let testError: unknown;
        try {
            await test.step("establish the temporary user's mTLS connection", async () => {
                await inspector.connect();
                expect(await signIn("", true, defaultEndpoint)).toMatchObject({ user: { username: "default" } });
                const createUser = await request.post("/api/user", {
                    data: { username, role: "Admin", password: initialPassword, keys: ["*"] },
                });
                expect(createUser.status()).toBe(201);
                expect((await signOut()).ok()).toBe(true);
                expect(await signIn(initialPassword, true)).toMatchObject({ user: { username } });
                await expect.poll(countUserConnections).toBeGreaterThan(0);
            });

            const handoffCookieValue = await test.step("change the password and preserve the handoff after a failed login", async () => {
                const update = await request.patch(`/api/user/${encodeURIComponent(username)}`, {
                    data: { role: "Admin", keys: ["*"], password },
                });
                expect(update.status()).toBe(200);
                expect(await update.json()).toMatchObject({
                    requiresReauthentication: true,
                    reauthenticationConnection: endpoint,
                });
                await expect.poll(countUserConnections).toBe(0);
                const previousConnectionsResponse = await request.get("/api/connections");
                expect(previousConnectionsResponse.ok()).toBe(true);
                expect(await previousConnectionsResponse.json()).toMatchObject({ connections: [] });
                const handoffCookie = (await request.storageState()).cookies.find(
                    cookie => cookie.name === REAUTHENTICATION_HANDOFF_COOKIE,
                );
                expect(handoffCookie?.httpOnly).toBe(true);
                if (!handoffCookie) throw new Error("Password reauthentication handoff cookie was not set");
                expect((await signOut()).ok()).toBe(true);
                expect((await signIn(`${password}-wrong`, false))?.user).toBeUndefined();
                expect((await request.storageState()).cookies.some(
                    cookie => cookie.name === REAUTHENTICATION_HANDOFF_COOKIE && cookie.value === handoffCookie.value,
                )).toBe(true);
                return handoffCookie.value;
            });

            await test.step("reuse saved TLS material without resubmitting it", async () => {
                expect(await signIn(password, false)).toMatchObject({ user: { username } });
                expect((await request.storageState()).cookies.some(
                    cookie => cookie.name === REAUTHENTICATION_HANDOFF_COOKIE && cookie.value === handoffCookieValue,
                )).toBe(false);
            });
        } catch (error) {
            testError = error;
            throw error;
        } finally {
            try {
                const response = await signOut();
                if (!response.ok()) console.warn(`mTLS reauthentication sign-out returned HTTP ${response.status()}`);
            } catch (error) {
                console.warn("mTLS reauthentication sign-out failed:", error);
            } finally {
                try {
                    const adminSession = await signIn("", true, defaultEndpoint);
                    expect(adminSession).toMatchObject({ user: { username: "default" } });
                    const deletion = await request.delete("/api/user", { data: { users: [{ username }] } });
                    expect(deletion.status()).toBe(200);
                    const save = await request.post("/api/user/save");
                    if (!save.ok()) console.warn(`mTLS test-user ACL cleanup could not be persisted: HTTP ${save.status()}`);
                    const adminSignOut = await signOut();
                    if (!adminSignOut.ok()) console.warn(`mTLS cleanup admin sign-out returned HTTP ${adminSignOut.status()}`);
                } catch (cleanupError) {
                    console.error(`Failed to remove temporary mTLS test user ${username}:`, cleanupError);
                    if (!testError) throw cleanupError;
                } finally {
                    try {
                        if (inspector.isOpen) await inspector.quit();
                    } finally {
                        await request.dispose();
                    }
                }
            }
        }
    });
});
