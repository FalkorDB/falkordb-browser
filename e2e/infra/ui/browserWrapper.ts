import { chromium, Browser, BrowserContext, Page, firefox } from 'playwright';
import { existsSync } from 'fs';
import { test } from '@playwright/test';
import BasePage from './basePage';
import { initializeLocalStorage } from '../utils';

// Map each Playwright project to its pre-created auth state file so that
// BrowserWrapper contexts are authenticated.  The 'setup' project and special
// projects (TLS, cluster) are intentionally omitted — they either create the
// files or require a clean session.
const AUTH_STATE_MAP: Record<string, string> = {
    '[Admin] Chromium': 'playwright/.auth/admin.json',
    '[Admin] Firefox': 'playwright/.auth/admin.json',
    '[Read-Write] - Chromium': 'playwright/.auth/readwriteuser.json',
    '[Read-Write] - Firefox': 'playwright/.auth/readwriteuser.json',
    '[Read-Only] - Chromium': 'playwright/.auth/readonlyuser.json',
    '[Read-Only] - Firefox': 'playwright/.auth/readonlyuser.json',
    '[Admin: Settings - Chromium]': 'playwright/.auth/admin.json',
    '[Admin: Settings - Firefox]': 'playwright/.auth/admin.json',
};

async function launchBrowser(projectName: string): Promise<Browser> {
    if (projectName.toLowerCase().includes('firefox')) {
        return firefox.launch();
    }

    return chromium.launch();
}

export default class BrowserWrapper {

    private browser: Browser | null = null;

    private context: BrowserContext | null = null;

    private page: Page | null = null;

    async createNewPage<T extends BasePage>(PageClass: new (page: Page) => T, url?: string) {
        if (!this.browser) {
            const projectName = test.info().project.name;
            this.browser = await launchBrowser(projectName);
        }
        if (!this.context) {
            const projectName = test.info().project.name;
            const isFirefox = projectName.toLowerCase().includes('firefox');

            // Prefer the storageState configured on the current Playwright
            // project itself. This keeps BrowserWrapper aligned with
            // playwright.config.ts and avoids project-name drift.
            const configuredStorageState = test.info().project.use.storageState;

            // Fall back to the explicit map for extra resilience in case the
            // project configuration changes shape in the future.
            const fallbackStorageStatePath = AUTH_STATE_MAP[projectName];
            const resolvedStorageState =
                typeof configuredStorageState === 'string'
                    ? (existsSync(configuredStorageState) ? configuredStorageState : undefined)
                    : configuredStorageState
                        ?? (fallbackStorageStatePath && existsSync(fallbackStorageStatePath)
                            ? fallbackStorageStatePath
                            : undefined);

            // Grant clipboard permissions only for Chromium-based browsers
            // Firefox doesn't support clipboard-read/clipboard-write permissions
            this.context = await this.browser.newContext({
                ...(isFirefox ? {} : { permissions: ['clipboard-read', 'clipboard-write'] }),
                ...(resolvedStorageState ? { storageState: resolvedStorageState } : {}),
            });
        }
        if (!this.page) {
            this.page = await this.context.newPage();
            
            // Initialize localStorage before any navigation.
            // Explicitly pass host/port so the scoped storage prefix
            // matches the runtime connection context used by the app.
            await this.page.addInitScript(initializeLocalStorage("localhost", 6379));
        }
        if (url) {
            await this.navigateTo(url)
        }

        const pageInstance = new PageClass(this.page);
        return pageInstance;
    }    

    getContext(): BrowserContext | null {
        return this.context;
    }

    async getPage() {
        if (!this.page) {
            throw new Error('Browser is not launched yet!');
        }
        return this.page;
    }

    async setPageToFullScreen() {
        if (!this.page) {
            throw new Error('Browser is not launched yet!');
        }
        
        await this.page.setViewportSize({ width: 1920, height: 1080 });
    }

    async navigateTo(url: string) {
        if (!this.page) {
            throw new Error('Browser is not launched yet!');
        }
        await this.page.goto(url);
        await this.page.waitForLoadState('networkidle');
    }

    async closePage() {
        if (this.page) {
            await this.page.close();
            this.page = null;
        }
    }

    async closeBrowser() {
        // Close the page first (which clears intervals) before closing the browser
        await this.closePage();
        
        if (this.browser) {
            await this.browser.close();
        }
    }

}