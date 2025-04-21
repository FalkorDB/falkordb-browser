/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
import { Locator, Page } from "playwright";
import { readFileSync } from "fs";
import crypto from "crypto";

const adminAuthFile = 'playwright/.auth/admin.json'

export function delay(ms: number) {
    return new Promise(resolve => { setTimeout(resolve, ms) });
}

export const waitForElementToBeVisible = async (locator: Locator, time = 500, retry = 10): Promise<boolean> => {
    for (let i = 0; i < retry; i += 1) {
        try {
            if (await locator.count() > 0 && await locator.isVisible()) {
                return true;
            }
        } catch (error) {
            console.error(`Error checking element visibility: ${error}`);
        }
        await delay(time);
    }
    return false;
};

export const waitForElementToBeEnabled = async (locator: Locator, time = 500, retry = 10): Promise<boolean> => {
    for (let i = 0; i < retry; i += 1) {
        try {
            if (await locator.isEnabled()) {
                return true;
            }
        } catch (error) {
            console.error(`Error checking element visibility: ${error}`);
        }
        await delay(time);
    }
    return false;
};

export const waitForElementCount = async (locator: Locator, time = 500, retry = 10): Promise<number> => {
    for (let i = 0; i < retry; i += 1) {
        try {
            const count = await locator.count();
            if (count > 0) {
                return count;
            }
        } catch (error) {
            console.error(`Error checking element count: ${error}`);
        }
        await delay(time);
    }
    return 0;
};



export const waitForTimeOut = async (page: Page, time = 500) => {
    await page.waitForTimeout(time);
}

export async function waitForURL(page: Page, expectedURL: string, timeout: number = 30000, interval: number = 1000): Promise<void> {
    let elapsed = 0;

    while (elapsed < timeout) {
        const currentURL = page.url();
        if (currentURL === expectedURL) {
            return;
        }
        await new Promise(resolve => { setTimeout(resolve, interval) });
        elapsed += interval;
    }

    throw new Error(`Timed out waiting for URL to be ${expectedURL}. Current URL is ${page.url()}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function findNodeByName(nodes: { name: string }[], nodeName: string): any {
    return nodes.find((node) => node.name === nodeName);
}


export async function getAdminToken(): Promise<Record<string, string> | undefined> {
    try {
        const authState = JSON.parse(readFileSync(adminAuthFile, "utf-8"));

        if (!authState?.cookies || !Array.isArray(authState.cookies)) {
            console.error("Invalid auth state: No cookies found.");
            return undefined;
        }

        const requiredCookies = ["next-auth.callback-url", "next-auth.csrf-token", "next-auth.session-token"];
        const cookieString = authState.cookies
            .filter((cookie: { name: string }) => requiredCookies.includes(cookie.name))
            .map((cookie: { name: string; value: string }) => `${cookie.name}=${cookie.value}`)
            .join("; ");

        if (!cookieString) {
            console.error("Required auth cookies not found.");
            return undefined;
        }

        return {
            Cookie: cookieString
        };
    } catch (error) {
        console.error("Failed to retrieve admin cookies:", error);
        return undefined;
    }
}

export function getRandomString(prefix = '', delimiter = '_'): string {
    const uuid = crypto.randomUUID();
    const timestamp = Date.now();
    return `${prefix}${prefix ? delimiter : ''}${uuid}-${timestamp}`;
}

export async function waitForApiSuccess<T>(
    apiCall: () => Promise<T>,
    successCondition: (response: T) => boolean,
    timeout = 5000,
    interval = 250
): Promise<T> {
    const start = Date.now();

    while (Date.now() - start < timeout) {
        try {
            const response = await apiCall();
            if (successCondition(response)) {
                return response;
            }
        } catch {
            // ignore errors during polling
        }

        await new Promise(resolve => { setTimeout(resolve, interval) });
    }

    throw new Error('API condition was not met within timeout');
}

export async function interactWhenVisible<T>(element: Locator, action: (el: Locator) => Promise<T>, name: string): Promise<T> {
    const isVisible = await waitForElementToBeVisible(element);
    if (!isVisible) throw new Error(`${name} is not visible!`);
    return action(element);
}
