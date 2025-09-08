import { chromium, Browser, BrowserContext, Page, firefox } from 'playwright';
import { test } from '@playwright/test';
import BasePage from './basePage';
import { initializeLocalStorage } from '../utils';

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
            this.context = await this.browser.newContext();
        }
        if (!this.page) {
            this.page = await this.context.newPage();
            
            // Initialize localStorage before any navigation
            await this.page.addInitScript(initializeLocalStorage());
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