import { type Page, type Request } from "@playwright/test";
import { expect, test } from "../infra/coverage";
import urls from "../config/urls.json";
import LoginPage from "../logic/POM/loginPage";
import { initializeLocalStorage } from "../infra/utils";

const DISCOVERY_ROUTE = "**/api/connections/preconfigured";
// next-auth appends the authorization params to the callback, so the pattern
// has to survive the empty "?" it leaves behind on a plain credentials sign-in.
const SIGN_IN_ROUTE = "**/api/auth/callback/credentials*";

const signInFields = (request: Request) => {
    const body = request.postData();
    if (body === null) throw new Error("Sign-in request has no body");
    return new URLSearchParams(body);
};

// Only sign-in attempts count, not the session reads the page makes on its own.
const recordSignIns = (page: Page) => {
    const signIns: string[] = [];
    page.on("request", (request) => {
        if (request.method() !== "POST") return;
        if (new URL(request.url()).pathname.startsWith("/api/auth/callback/")) signIns.push(request.url());
    });
    return signIns;
};

// Keyed by the sign-in field each upload is sent in.
const tlsUploads = (login: LoginPage) => ({
    ca: {
        file: { name: "ca.crt", contents: "synthetic CA" },
        upload: login.uploadCertificate.bind(login), status: login.certificateStatus, dropzone: login.certificateDropzone,
    },
    cert: {
        file: { name: "client.crt", contents: "synthetic certificate" },
        upload: login.uploadClientCertificate.bind(login), status: login.clientCertificateStatus, dropzone: login.clientCertificateDropzone,
    },
    key: {
        file: { name: "client.key", contents: "synthetic key" },
        upload: login.uploadClientKey.bind(login), status: login.clientKeyStatus, dropzone: login.clientKeyDropzone,
    },
});

test.describe("@admin Login connection details", () => {
    // The login page only renders itself for a visitor without a session.
    test.use({ storageState: { cookies: [], origins: [] } });
    let login: LoginPage;

    test.beforeEach(async ({ page }) => {
        login = new LoginPage(page);
        await page.addInitScript(initializeLocalStorage());
        await page.route(DISCOVERY_ROUTE, route => route.fulfill({ json: { configured: false } }));
        // Exercise the real form/signIn client without needing a database or
        // creating sessions that could affect parallel login tests.
        await page.route(SIGN_IN_ROUTE, route =>
            route.fulfill({ json: { url: `${urls.loginUrl}?error=CredentialsSignin&code=invalid_credentials` } }));
        await page.goto(urls.loginUrl);
        await expect(login.portField).toBeVisible();
    });

    test("uses default connection settings and clears a rejected login after editing", async ({ page }) => {
        const request = page.waitForRequest(SIGN_IN_ROUTE);
        await login.clickConnect();
        const body = signInFields(await request);
        expect(body.get("host")).toBe("localhost");
        expect(body.get("port")).toBe("6379");
        expect(body.get("tls")).toBe("false");
        expect(body.has("username")).toBe(false);
        expect(body.has("password")).toBe(false);
        await expect(login.credentialsErrorMessage).toBeVisible();
        await login.fillHost("corrected.example");
        await expect(login.credentialsErrorMessage).toBeHidden();
    });

    test("round-trips escaped credentials and TLS between manual and URL modes", async () => {
        await login.fillHost("db.example");
        await login.fillPort("6380");
        await login.fillUsername("user:name%@");
        await login.fillPassword("p@ss:/%");
        await login.clickEnableTLS();
        await login.clickUrlMode();
        await expect(login.falkordbUrlField).toHaveValue("falkors://user%3Aname%25%40:p%40ss%3A%2F%25@db.example:6380");

        await login.fillFalkorDBUrl("rediss://other%25:next%40password@other.example:6381");
        await login.clickManualMode();
        await expect(login.hostField).toHaveValue("other.example");
        await expect(login.portField).toHaveValue("6381");
        await expect(login.usernameField).toHaveValue("other%");
        await expect(login.passwordField).toHaveValue("next@password");
        await expect(login.tlsToggle).toBeChecked();
        await login.clickEnableTLS();
        await expect(login.tlsToggle).not.toBeChecked();
        await login.clickUrlMode();
        await expect(login.falkordbUrlField).toHaveValue("falkor://other%25:next%40password@other.example:6381");
    });

    test("submits decoded URL credentials without a separate probe", async ({ page }) => {
        const url = "rediss://user%25:pass%40word@db.example:6380";
        const probes: string[] = [];
        page.on("request", request => {
            if (new URL(request.url()).pathname === "/api/validate-url") probes.push(request.url());
        });
        const signedIn = page.waitForRequest(SIGN_IN_ROUTE);
        await login.connectWithUrl(url);
        const body = signInFields(await signedIn);
        expect(Object.fromEntries(["host", "port", "username", "password", "tls"].map(key => [key, body.get(key)]))).toEqual({
            host: "db.example", port: "6380", username: "user%", password: "pass@word", tls: "true",
        });
        await expect(login.credentialsErrorMessage).toBeVisible();
        expect(probes).toEqual([]);
    });

    for (const { title, field, remove, missingPairError } of [
        {
            title: "client certificate", field: "cert",
            remove: (login: LoginPage) => login.clickRemoveClientCertificateBtn(),
            missingPairError: (login: LoginPage) => login.missingClientKeyError,
        },
        {
            title: "client key", field: "key",
            remove: (login: LoginPage) => login.clickRemoveClientKeyBtn(),
            missingPairError: (login: LoginPage) => login.missingClientCertificateError,
        },
    ] as const) {
        test(`blocks an incomplete mTLS pair with only a ${title}`, async ({ page }) => {
            const upload = tlsUploads(login)[field];
            await login.clickEnableTLS();
            await upload.upload(upload.file);
            await expect(upload.status).toContainText(upload.file.name);
            const signIns = recordSignIns(page);
            await login.clickConnect();
            await expect(missingPairError(login)).toBeVisible();
            await remove(login);
            await expect(upload.status).toBeHidden();
            await expect(missingPairError(login)).toBeHidden();
            await expect(upload.dropzone).toBeVisible();
            expect(signIns).toEqual([]);
        });
    }

    test("sends uploaded TLS bytes and clears every attachment when TLS is disabled", async ({ page }) => {
        const uploads = Object.entries(tlsUploads(login));
        await login.clickEnableTLS();
        for (const [, upload] of uploads) {
            await upload.upload(upload.file);
            await expect(upload.status).toContainText(upload.file.name);
        }
        const first = page.waitForRequest(SIGN_IN_ROUTE);
        await login.clickConnect();
        const body = signInFields(await first);
        for (const [field, upload] of uploads) {
            expect(body.get(field)).toBe(Buffer.from(upload.file.contents).toString("base64"));
        }
        await expect(login.credentialsErrorMessage).toBeVisible();
        await login.clickEnableTLS();
        await expect(login.tlsSection).toBeHidden();
        await expect(login.credentialsErrorMessage).toBeHidden();
        await login.clickEnableTLS();
        for (const [, upload] of uploads) {
            await expect(upload.status).toBeHidden();
            await expect(upload.dropzone).toBeVisible();
        }
        const second = page.waitForRequest(SIGN_IN_ROUTE);
        await login.clickConnect();
        const cleared = signInFields(await second);
        // NextAuth stringifies absent credentials; options.ts treats "undefined" as unset.
        for (const [field] of uploads) expect(cleared.get(field)).toBe("undefined");
        await expect(login.credentialsErrorMessage).toBeVisible();
    });

    test("reports an unreadable certificate and allows the upload to be retried", async () => {
        await login.failNextFileRead();
        await login.clickEnableTLS();
        await login.uploadCertificate({ name: "unreadable.crt", contents: "synthetic CA" });
        await expect(login.fileReadError("unreadable.crt")).toBeVisible();
        await expect(login.certificateStatus).toBeHidden();
        await login.uploadCertificate({ name: "readable.crt", contents: "synthetic CA" });
        await expect(login.certificateStatus).toContainText("readable.crt");
        await expect(login.fileReadError("unreadable.crt")).toBeHidden();
    });
});
