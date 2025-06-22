import test, { expect } from "@playwright/test";
import urls from '../config/urls.json'
import BrowserWrapper from "../infra/ui/browserWrapper";
import LoginPage from "../logic/POM/loginPage";

test.describe(`TLS Login tests`, () => {
    let browser: BrowserWrapper;

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
    });

    test.afterEach(async () => {
        await browser.closeBrowser();
    });

    test(`@readonly validate access is denied when using an invalid TLS certificate`, async () => {
        const login = await browser.createNewPage(LoginPage, urls.loginUrl);
        await browser.setPageToFullScreen();
        
        // Enable TLS first
        await login.clickEnableTLS();
        expect(await login.isTLSEnabled()).toBe(true);
        console.log('TLS enabled successfully');
        
        // Use path.join to ensure cross-platform compatibility
        const invalidCertPath = require('path').join(process.cwd(), 'tls', 'ca.key');
        console.log(`Using certificate path: ${invalidCertPath}`);

        // Upload certificate with error handling
        try {
            await login.uploadCertificate(invalidCertPath);
            console.log('Upload certificate completed, checking status...');
            
            // Check if certificate was uploaded
            const isUploaded = await login.isCertificateUploaded();
            console.log(`Certificate uploaded status: ${isUploaded}`);
            expect(isUploaded).toBe(true);
        } catch (error) {
            console.error('Certificate upload failed:', error);
            throw error;
        }
    
        await login.clickConnect();
        expect(login.getCurrentURL()).not.toBe(urls.graphUrl);
    });

    test(`@readonly validate successful login and redirection with a valid TLS certificate`, async () => {
        const login = await browser.createNewPage(LoginPage, urls.loginUrl);
        await browser.setPageToFullScreen();
        await login.clickEnableTLS();
        expect(await login.isTLSEnabled()).toBe(true);
        
        // Use path.join to ensure cross-platform compatibility
        const validCertPath = require('path').join(process.cwd(), 'tls', 'ca.crt');
        await login.uploadCertificate(validCertPath);
        expect(await login.isCertificateUploaded()).toBe(true);
        
        await login.clickConnect();
        await login.waitForSuccessfulLogin(urls.graphUrl);
        
        console.log('Current URL after connection attempt:', login.getCurrentURL());
        expect(login.getCurrentURL()).toBe(urls.graphUrl);
    });

    test(`@readonly validate remove certificate button functionality after uploading certificate`, async () => {
        const login = await browser.createNewPage(LoginPage, urls.loginUrl);
        await browser.setPageToFullScreen();
        await login.clickEnableTLS();
        expect(await login.isTLSEnabled()).toBe(true);
        
        // Use path.join to ensure cross-platform compatibility
        const validCertPath = require('path').join(process.cwd(), 'tls', 'ca.crt');
        await login.uploadCertificate(validCertPath);
        expect(await login.isCertificateUploaded()).toBe(true);
        await login.clickRemoveCertificateBtn();
        expect(await login.isCertificateRemoved()).toBe(true);
        await login.uploadCertificate(validCertPath);
        expect(await login.isCertificateUploaded()).toBe(true);
    });
});
