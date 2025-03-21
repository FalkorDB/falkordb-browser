/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
import { Locator, Page } from "playwright";
import { readFileSync } from "fs";
const adminAuthFile = 'playwright/.auth/admin.json'

export function delay(ms: number) {
    return new Promise(resolve => { setTimeout(resolve, ms) });
}

export const waitForElementToBeVisible = async (locator: Locator, time = 500, retry = 10): Promise<boolean> => {
    for (let i = 0; i < retry; i++) {
        try {
            if (await locator.count() > 0 && await locator.isVisible()) {
                return true;
            }
        } catch (error) {
            console.error(`Error checking element visibility: ${error}`);
        }
        await new Promise(resolve => setTimeout(resolve, time));
    }
    return false;
};

export const waitForElementCount = async (locator: Locator, time = 500, retry = 10): Promise<number> => {
    for (let i = 0; i < retry; i++) {
        try {
            const count = await locator.count();
            if (count > 0) {
                return count;
            }
        } catch (error) {
            console.error(`Error checking element count: ${error}`);
        }
        await new Promise(resolve => setTimeout(resolve, time));
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

