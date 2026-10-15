import test, { expect } from "@playwright/test";
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
