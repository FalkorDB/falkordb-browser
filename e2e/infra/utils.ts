/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
import { Locator, Page } from "playwright";
import { readFileSync } from "fs";
import crypto from "crypto";

const adminAuthFile = "playwright/.auth/admin.json";

export const DEFAULT_CREATE_QUERY =
  "UNWIND range(1, 10) as x CREATE (n:n)-[e:e]->(m:m) RETURN *";
export const CREATE_TWO_NODES_QUERY =
  'CREATE (a:person1 {name: "a"}), (b:person2 {name: "b"}) RETURN *';
export const CREATE_NODE_QUERY = 'CREATE (a:person1 {name: "a"}) RETURN *';
export const CREATE_QUERY =
  'CREATE (a:person1 {name: "a"})-[c:KNOWS {name: "knows"}]->(b:person2) RETURN *';
export const CREATE_PERSON_RELATIONSHIP =
  'CREATE (a:person1 {name: "a", age: 30, gender: "male", occupation: "engineer"})-[c:KNOWS {name: "knows", since: 2020, strength: "strong"}]->(b:person2 {name: "b", age: 28, gender: "female", occupation: "designer"}) RETURN *';


/**
 * Normalize URL by removing trailing slash for comparison
 * @param url - The URL to normalize
 * @returns URL without trailing slash
 */
export function normalizeUrl(url: string | null | undefined): string {
  return url?.replace(/\/$/, '') || '';
}

/**
 * Initialize localStorage with default values required by the application
 * This prevents initialization errors in CI environments
 */
export const initializeLocalStorage = () => `
        if (!localStorage.getItem("timeout")) localStorage.setItem("timeout", "0");
        if (!localStorage.getItem("limit")) localStorage.setItem("limit", "300");
        if (!localStorage.getItem("defaultQuery")) localStorage.setItem("defaultQuery", "");
        if (!localStorage.getItem("runDefaultQuery")) localStorage.setItem("runDefaultQuery", "false");
        if (!localStorage.getItem("contentPersistence")) localStorage.setItem("contentPersistence", "false");
        if (!localStorage.getItem("query history")) localStorage.setItem("query history", "[]");
        if (!localStorage.getItem("refreshInterval")) localStorage.setItem("refreshInterval", "60");
    `;

export function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const waitForElementToBeVisible = async (
  locator: Locator,
  time = 500,
  retry = 10
): Promise<boolean> => {
  for (let i = 0; i < retry; i += 1) {
    try {
      if (await locator.isVisible()) {
        return true;
      }
    } catch (error) {
      console.error(`Error checking element visibility: ${error}`);
    }
    await delay(time);
  }
  return false;
};

export const waitForElementToNotBeVisible = async (
  locator: Locator,
  time = 500,
  retry = 10
): Promise<boolean> => {
  for (let i = 0; i < retry; i += 1) {
    try {
      if (!(await locator.isVisible())) {
        return true;
      }
    } catch (error) {
      console.error(`Error checking element visibility: ${error}`);
    }
    await delay(time);
  }
  return false;
};

export const waitForElementToBeEnabled = async (
  locator: Locator,
  time = 500,
  retry = 10
): Promise<boolean> => {
  for (let i = 0; i < retry; i += 1) {
    try {
      if (await locator.isEnabled()) {
        return true;
      }
    } catch (error) {
      console.error(`Error checking element enabled: ${error}`);
    }
    await delay(time);
  }
  return false;
};

export const waitForElementCount = async (
  locator: Locator,
  time = 500,
  retry = 10
): Promise<number> => {
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
};

export async function waitForURL(
  page: Page,
  expectedURL: string,
  timeout: number = 30000,
  interval: number = 1000
): Promise<void> {
  let elapsed = 0;

  while (elapsed < timeout) {
    const currentURL = page.url();
    if (currentURL === expectedURL) {
      return;
    }
    await new Promise((resolve) => {
      setTimeout(resolve, interval);
    });
    elapsed += interval;
  }

  throw new Error(
    `Timed out waiting for URL to be ${expectedURL}. Current URL is ${page.url()}`
  );
}

export function findNodeByName(
  nodes: { name: string }[],
  nodeName: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  return nodes.find((node) => node.name === nodeName);
}

export async function getAdminToken(): Promise<
  Record<string, string> | undefined
> {
  try {
    const authState = JSON.parse(readFileSync(adminAuthFile, "utf-8"));

    if (!authState?.cookies || !Array.isArray(authState.cookies)) {
      console.error("Invalid auth state: No cookies found.");
      return undefined;
    }

    const requiredCookies = [
      "next-auth.callback-url",
      "next-auth.csrf-token",
      "next-auth.session-token",
    ];
    const cookieString = authState.cookies
      .filter((cookie: { name: string }) =>
        requiredCookies.includes(cookie.name)
      )
      .map(
        (cookie: { name: string; value: string }) =>
          `${cookie.name}=${cookie.value}`
      )
      .join("; ");

    if (!cookieString) {
      console.error("Required auth cookies not found.");
      return undefined;
    }

    return {
      Cookie: cookieString,
    };
  } catch (error) {
    console.error("Failed to retrieve admin cookies:", error);
    return undefined;
  }
}

export function getRandomString(prefix = "", delimiter = "_"): string {
  const uuid = crypto.randomUUID();
  const timestamp = Date.now();
  return `${prefix}${prefix ? delimiter : ""}${uuid}-${timestamp}`;
}

export async function interactWhenVisible<T>(
  element: Locator,
  action: (el: Locator) => Promise<T>,
  name: string
): Promise<T> {
  const isVisible = await waitForElementToBeVisible(element);
  if (!isVisible) throw new Error(`${name} is not visible!`);
  return action(element);
}

export function inferLabelFromGraph(graph: string): string {
  if (graph.toLowerCase().includes("schema")) return "Schema";
  return "Graph";
}

export async function pollForElementContent(
  element: Locator,
  elementName: string,
  loader?: Locator,
  maxRetries: number = 10,
  retryDelay: number = 500
): Promise<string | null> {
  if (loader) {
    await waitForElementToNotBeVisible(loader);
  }
  
  const isVisible = await waitForElementToBeVisible(element);
  
  if (!isVisible) {
    throw new Error(`${elementName} element is not visible`);
  }

  for (let i = 0; i < maxRetries; i += 1) {
    try {
      const content = await element.textContent();
      if (content !== null && content.trim() !== "") {
        return content;
      }
    } catch (error) {
      console.error(`Error getting ${elementName} on attempt ${i + 1}:`, error);
    }

    if (i < maxRetries - 1) {
      await delay(retryDelay);
    }
  }

  console.warn(
    `Failed to get ${elementName} after all retries, returning null`
  );
  return null;
}
