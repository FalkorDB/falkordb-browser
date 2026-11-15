import test, { expect } from "@playwright/test";
import { writeFile } from 'fs/promises';
import path from 'path';
import urls from '../config/urls.json';
import BrowserWrapper from "../infra/ui/browserWrapper";
import LoginPage from "../logic/POM/loginPage";
import { urlPath } from "../infra/utils";

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
        const readError = login.readError(certificatePath);

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
            await expect(readError).toBeHidden();
            await page.evaluate(() => document.documentElement.getAttribute("data-file-read"));
            expect(retryFinished).toBe(false);
        } finally {
            await page.evaluate(() => window.dispatchEvent(new Event("complete-file-read")));
            await retryUpload;
        }

        expect(await login.isCertificateUploaded()).toBe(true);
    });

    test(`ignores an older certificate read error while its retry is pending`, async ({}, testInfo) => {
        const login = await browser.createNewPage(LoginPage);
        const page = await browser.getPage();
        const certificatePath = testInfo.outputPath('overlapping-certificate.crt');
        await writeFile(certificatePath, 'test certificate');
        const readError = login.readError(certificatePath);

        await page.addInitScript(() => {
            const readAsDataURL = FileReader.prototype.readAsDataURL;
            const reads: { reader: FileReader; file: Blob }[] = [];
            FileReader.prototype.readAsDataURL = function(file: Blob) {
                reads.push({ reader: this, file });
                document.documentElement.dataset.readCount = String(reads.length);
            };
            window.addEventListener("fail-first-read", () => reads[0].reader.dispatchEvent(new ProgressEvent("error")));
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
            await expect(readError).toBeHidden();
        } finally {
            await page.evaluate(() => window.dispatchEvent(new Event("complete-second-read")));
            await Promise.all([firstUpload, retryUpload]);
        }
        expect(await login.isCertificateUploaded()).toBe(true);
    });

    test(`waits for a retry that fails immediately`, async ({}, testInfo) => {
        const login = await browser.createNewPage(LoginPage);
        const page = await browser.getPage();
        const certificatePath = testInfo.outputPath('immediate-error.crt');
        await writeFile(certificatePath, 'test certificate');
        const readError = login.readError(certificatePath);

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
        expect(await page.evaluate(() => document.documentElement.dataset.readCount)).toBe("2");
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
        await page.evaluate(() => window.dispatchEvent(new Event("complete-second-read")));
        await keyUpload;
        await page.evaluate(() => window.dispatchEvent(new Event("complete-first-read")));
        await certificateUpload;

        expect(await login.isClientKeyUploaded()).toBe(true);
        expect(await login.isCertificateUploaded()).toBe(true);
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
            window.addEventListener("fail-first-read", () => reads[0].reader.dispatchEvent(new ProgressEvent("error")));
            window.addEventListener("complete-second-read", () => readAsDataURL.call(reads[1].reader, reads[1].file));
        });
        await browser.navigateTo(urls.loginUrl);
        await login.clickEnableTLS();
        const firstUpload = login.uploadCertificate(certificatePath);
        await page.waitForFunction(() => document.documentElement.dataset.readCount === "1");
        await login.clickEnableTLS();
        await page.evaluate(() => window.dispatchEvent(new Event("fail-first-read")));
        await expect(login.readError(certificatePath)).toBeHidden();
        await login.clickEnableTLS();
        const secondUpload = login.uploadCertificate(certificatePath);
        await page.waitForFunction(() => document.documentElement.dataset.readCount === "2");
        await page.evaluate(() => window.dispatchEvent(new Event("complete-second-read")));
        await Promise.all([firstUpload, secondUpload]);
        expect(await login.isCertificateUploaded()).toBe(true);
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
});
