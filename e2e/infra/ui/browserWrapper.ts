import { chromium, Browser, BrowserContext, Page, firefox } from 'playwright';
import BasePage from './basePage';
import { test } from '@playwright/test';

export default class BrowserWrapper {

    private browser: Browser | null = null;

    private context: BrowserContext | null = null;

    private page: Page | null = null;

    async createNewPage<T extends BasePage>(PageClass: new (page: Page) => T, url?: string) {
        if (!this.browser) {
            const projectName = test.info().project.name;
            this.browser = await this.launchBrowser(projectName);
        }
        if (!this.context) {
            this.context = await this.browser.newContext();
        }
        if (!this.page) {
            this.page = await this.context.newPage();
        }
        if (url) {
            await this.navigateTo(url)
        }

        const pageInstance = new PageClass(this.page);
        return pageInstance;
    }

    private async launchBrowser(projectName: string): Promise<Browser> {
        if (projectName.toLowerCase().includes('firefox')) {
            return await firefox.launch();
        } else {
            return await chromium.launch();
        }
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
        } else {
            this.page = null;
        }
    }

    async closeBrowser() {
        if (this.browser) {
            await this.browser.close();
        }
    }

}

