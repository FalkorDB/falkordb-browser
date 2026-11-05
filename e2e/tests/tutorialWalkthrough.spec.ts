import { expect, test, type Page } from "@playwright/test";
import type { Session, SessionConnection } from "next-auth";
import urls from "../config/urls.json";
import BrowserWrapper from "../infra/ui/browserWrapper";
import TutorialPanel from "../logic/POM/tutorialPanelComponent";
import AppDownloadComponent from "../logic/POM/appDownloadComponent";
import ApiCalls from "../logic/api/apiCalls";
import { delay, getRandomString } from "../infra/utils";
import { parseTutorialDemoOwnership, tutorialDemoOwnershipKey } from "../../lib/tutorialDemoGraphs";
import { createTab, forStorage, TABS_STORAGE_KEY } from "../../lib/graphTabs";
import { GRAPH_OFFLOAD_VERSION_THRESHOLD } from "../../app/utils";

async function mockTutorialConnectionSwitches(page: Page) {
    const sessionResponse = await page.request.get(`${urls.localHost}/api/auth/session`);
    const connectionsResponse = await page.request.get(`${urls.localHost}/api/connections`);
    expect(sessionResponse.ok()).toBe(true);
    expect(connectionsResponse.ok()).toBe(true);
    const session = await sessionResponse.json() as Session;
    const { connections } = await connectionsResponse.json() as { connections: SessionConnection[] };
    const first = connections[0];
    if (!first) throw new Error("Tutorial switch fixture needs an authenticated connection");
    const second = { ...first, id: getRandomString("tutorial-connection"), host: "tutorial-secondary.invalid" };
    let active = first;
    let synced!: () => void;
    const sessionSynced = new Promise<void>(resolve => { synced = resolve; });
    await page.route("**/api/**", route => {
        const headers = route.request().headers();
        return route.continue(headers["x-connection-id"] === second.id
            ? { headers: { ...headers, "x-connection-id": first.id } }
            : undefined);
    });
    await page.route("**/api/connections", route => route.fulfill({ json: { connections: [first, second] } }));
    await page.route("**/api/auth/csrf", route => route.fulfill({ json: { csrfToken: "tutorial-test-csrf" } }));
    await page.route("**/api/auth/session", async route => {
        if (route.request().method() === "POST") {
            const body = route.request().postDataJSON() as { data?: { activeConnectionId?: string } };
            const requested = body.data?.activeConnectionId;
            if (requested) active = requested === second.id ? second : first;
        }
        await route.fulfill({ json: {
            ...session,
            activeConnectionId: active.id,
            user: { ...session.user, host: active.host, port: active.port },
        } });
        if (route.request().method() === "POST") synced();
    });
    await page.addInitScript(id => {
        localStorage.setItem("lastActiveConnectionId", id);
    }, first.id);
    return {
        first,
        second,
        switchTo: async (connection: SessionConnection, duringSetup = false) => {
            await sessionSynced;
            await page.evaluate(() => new Promise<void>(resolve => {
                requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
            }));
            const trigger = page.getByTestId("connections-dropdown-trigger");
            if (duringSetup) await trigger.dispatchEvent("pointerdown", { button: 0, ctrlKey: false });
            else await trigger.click();
            const item = page.getByTestId(`connection-item-${connection.id}`);
            if (duringSetup) await item.dispatchEvent("click");
            else await item.click();
            if (duringSetup) await trigger.dispatchEvent("pointerdown", { button: 0, ctrlKey: false });
            else await trigger.click();
            await expect(page.getByTestId(`connection-item-${connection.id}`).locator("svg.text-primary")).toBeVisible();
            await page.keyboard.press("Escape");
        },
    };
}

/*
 * Full tutorial walkthrough test.
 *
 * Walks through every tutorial step from the first to the last, interacting
 * with each step that requires user action (advanceOn).  After the tutorial
 * finishes, verifies that the demo graphs have been cleaned up and the user's
 * original graphs are restored.
 */

test.describe("Tutorial", () => {
    // Keep the walkthroughs sequential within each project; each tour creates
    // unique demo graphs so separate browser projects do not share graph names.
    test.describe.configure({ mode: "default" });

    let browser: BrowserWrapper;
    let apiCall: ApiCalls;
    const userGraph = getRandomString("tutorialTest");

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
        apiCall = new ApiCalls();
    });

    test.afterEach(async () => {
        let ownedTutorialGraphs: string[] = [];
        let teardownError: unknown;
        try {
            if (browser.getContext()?.pages().some(page => !page.isClosed())) {
                const page = await browser.getPage();
                const { ownerId, records } = await page.evaluate(() => {
                    const ownerId = sessionStorage.getItem("tutorialDemoOwnerId");
                    if (!ownerId) return { ownerId: null, records: [] };
                    const suffix = `tutorialDemoGraphOwnership:${ownerId}`;
                    const records = Object.keys(localStorage)
                        .filter(key => key.endsWith(suffix))
                        .map(key => ({ key, stored: localStorage.getItem(key) }));
                    return { ownerId, records };
                });
                if (ownerId) {
                    const suffix = tutorialDemoOwnershipKey(ownerId);
                    for (const record of records) {
                        if (!record.stored || !record.key.endsWith(suffix)) continue;
                        const scope = record.key.slice(0, -suffix.length);
                        if (!scope) throw new Error("Tutorial graph ownership has no connection scope");
                        ownedTutorialGraphs.push(...parseTutorialDemoOwnership(record.stored, scope, ownerId).names);
                    }
                    ownedTutorialGraphs = [...new Set(ownedTutorialGraphs)];
                }
            }
        } catch (error) {
            teardownError = error;
        }

        // Close before cleanup: a live graph page polls graph info and can
        // recreate a graph deleted out from under it. Always close, even if the
        // ownership record is malformed.
        try {
            await browser.closeBrowser();
        } catch (error) {
            teardownError ??= error;
        }

        for (const graph of ownedTutorialGraphs) {
            try {
                const { message } = await apiCall.removeGraph(graph, "admin");
                if (!message.includes("deleted") && !message.includes("empty key")) {
                    throw new Error(`Failed to remove owned tutorial graph ${graph}: ${message}`);
                }
            } catch (error) {
                teardownError ??= error;
            }
        }

        try {
            const { message } = await apiCall.removeGraph(userGraph, "admin");
            if (!message.includes("deleted") && !message.includes("empty key")) {
                throw new Error(`Failed to remove ${userGraph}: ${message}`);
            }
        } catch (error) {
            teardownError ??= error;
        }
        if (teardownError) throw teardownError;
    });

    test("@admin re-opening the tutorial does not duplicate the demo data", async () => {
        test.setTimeout(120_000);

        const tutorial = await browser.createNewPage(TutorialPanel, urls.graphUrl);
        await browser.setPageToFullScreen();
        const page = await browser.getPage();
        await page.addInitScript(() => {
            const nativeInterval = window.setInterval.bind(window);
            Object.defineProperty(window, "setInterval", {
                value: (handler: TimerHandler, timeout?: number, ...args: unknown[]) =>
                    nativeInterval(handler, timeout === 60000 ? 1000 : timeout, ...args),
            });
        });

        const demoNames: string[] = [];
        const countPeople = async () => {
            const page = await browser.getPage();
            const { ownerId, records } = await page.evaluate(() => {
                const ownerId = sessionStorage.getItem("tutorialDemoOwnerId");
                if (!ownerId) throw new Error("Tutorial graph owner ID was not recorded");

                const suffix = `tutorialDemoGraphOwnership:${ownerId}`;
                const records = Object.keys(localStorage)
                    .filter(key => key.endsWith(suffix))
                    .map(key => ({ key, stored: localStorage.getItem(key) }))
                    .filter((record): record is { key: string; stored: string } => record.stored !== null);
                return { ownerId, records };
            });
            const suffix = tutorialDemoOwnershipKey(ownerId);
            const demoGraph = records
                .filter(record => record.key.endsWith(suffix))
                .flatMap(record => {
                    const scope = record.key.slice(0, -suffix.length);
                    if (!scope) throw new Error("Tutorial graph ownership has no connection scope");
                    return parseTutorialDemoOwnership(record.stored, scope, ownerId).names;
                })
                .find(name => name.startsWith("tutorial-social-demo-"));
            if (!demoGraph) throw new Error("Tutorial demo graph was not recorded");
            demoNames.push(demoGraph);
            const result = await apiCall.runQuery(
                demoGraph,
                "MATCH (n:Person) RETURN count(n) AS cnt"
            );
            const cnt = result.data[0]?.cnt ?? result.data[0]?.["count(n)"];
            return Number(cnt);
        };

        try {
            await tutorial.changeLocalStorage("true");
            await tutorial.refreshPage();
            await tutorial.waitForStep("Welcome to FalkorDB Browser");
            expect(await countPeople()).toBe(9);
            const heartbeat = () => page.evaluate(() => {
                const ownerId = sessionStorage.getItem("tutorialDemoOwnerId");
                const key = Object.keys(localStorage).find(key => key.endsWith(`tutorialDemoGraphOwnership:${ownerId}`));
                const stored = key ? localStorage.getItem(key) : null;
                const timestamp: unknown = stored ? JSON.parse(stored).lastActiveAt : undefined;
                if (typeof timestamp !== "number") throw new Error("Active tutorial ownership has no heartbeat");
                return timestamp;
            });
            const previousHeartbeat = await heartbeat();
            await expect.poll(heartbeat).toBeGreaterThan(previousHeartbeat);

            // Leaving mid-tutorial skips the cleanup, and the tutorial re-opens by
            // itself on the next load and loads the demo data again — which used to
            // stack another copy of the dataset on top of the old one (#2087).
            await tutorial.refreshPage();
            await tutorial.waitForStep("Welcome to FalkorDB Browser");
            expect(await countPeople()).toBe(9);
            expect(demoNames[1]).not.toBe(demoNames[0]);
            expect((await apiCall.getGraphs()).opts).not.toContain(demoNames[0]);
        } finally {
            if (await (await browser.getPage()).getByTestId("skipTutorial").isVisible()) await tutorial.skip();
        }
    });

    for (const [webLocks, ownRecord, failedCleanup] of [[true, false, false], [false, false, false], [true, true, false], [false, false, true], [false, true, true]]) {
        test(`@admin app startup reclaims recorded abandoned tutorials only (Web Locks ${webLocks}, own record ${ownRecord}, failed cleanup ${failedCleanup})`, async () => {
            test.setTimeout(90_000);
            const suffix = getRandomString("owner").replaceAll("_", "-");
            const orphanOwner = `abandoned-${suffix}`;
            const orphan = `tutorial-social-demo-${suffix}`;
            const userNamedLikeDemo = `tutorial-social-test-user-${suffix}`;
            const recent = `tutorial-social-test-recent-${suffix}`;
            const recentOwner = `recent-${suffix}`;
            for (const name of [orphan, userNamedLikeDemo, recent]) {
                await apiCall.runQuery(name, "CREATE (:Mine {keep: true})");
            }
            try {
                await browser.createNewPage(TutorialPanel);
                const page = await browser.getPage();
                if (webLocks) {
                    const context = browser.getContext();
                    if (!context) throw new Error("Tutorial test context was not created");
                    const activeOwner = await context.newPage();
                    await activeOwner.goto(`${urls.localHost}/api/auth/providers`);
                    await activeOwner.evaluate(async ownerId => new Promise<void>(resolve => {
                        void navigator.locks.request(`falkordb-browser:tutorialDemoOwner:${ownerId}`, () => {
                            resolve();
                            return new Promise<void>(() => {});
                        });
                    }), recentOwner);
                }
                await page.addInitScript(({ orphanOwnerId, orphanName, recentOwnerId, recentName, locks, own }) => {
                    if (!locks) Object.defineProperty(navigator, "locks", { value: undefined, configurable: true });
                    const scope = "localhost:6379:default:";
                    if (localStorage.getItem("tutorial") === null) localStorage.setItem("tutorial", "false");
                    if (own) sessionStorage.setItem("tutorialDemoOwnerId", orphanOwnerId);
                    localStorage.setItem(`${scope}tutorialDemoGraphOwnership:${orphanOwnerId}`, JSON.stringify({
                        scope, ownerId: orphanOwnerId, names: [orphanName], pendingNames: [], lastActiveAt: Date.now() - 25 * 60 * 60 * 1000,
                    }));
                    localStorage.setItem(`${scope}tutorialDemoGraphOwnership:${recentOwnerId}`, JSON.stringify({
                        scope, ownerId: recentOwnerId, names: [recentName], pendingNames: [], lastActiveAt: locks ? Date.now() - 25 * 60 * 60 * 1000 : Date.now(),
                    }));
                }, { orphanOwnerId: orphanOwner, orphanName: orphan, recentOwnerId: recentOwner, recentName: recent, locks: webLocks, own: ownRecord });
                const cleanupUrl = `**/api/graph/${orphan}`;
                if (failedCleanup) {
                    await page.route(cleanupUrl, route => route.request().method() === "DELETE"
                        ? route.fulfill({ status: 503, json: { message: "Simulated tutorial cleanup failure" } })
                        : route.continue());
                }
                await page.goto(urls.graphUrl);
                if (ownRecord && !webLocks) await page.reload();
                if (failedCleanup) {
                    await expect(page.getByText("Tutorial cleanup failed", { exact: true })).toBeVisible({ timeout: 30000 });
                    expect((await apiCall.getGraphs()).opts).toContain(orphan);
                    const lastActiveAt = await page.evaluate(ownerId => {
                        const key = Object.keys(localStorage).find(name => name.endsWith(`tutorialDemoGraphOwnership:${ownerId}`));
                        if (!key) throw new Error("Failed cleanup lost its ownership record");
                        const timestamp: unknown = JSON.parse(localStorage.getItem(key)!).lastActiveAt;
                        if (typeof timestamp !== "number") throw new Error("Failed cleanup lost its ownership timestamp");
                        return timestamp;
                    }, orphanOwner);
                    expect(lastActiveAt).toBeLessThan(Date.now() - 24 * 60 * 60 * 1000);
                    await page.evaluate(() => localStorage.setItem("tutorial", "true"));
                    await page.reload();
                    const tutorial = new TutorialPanel(page);
                    await tutorial.waitForStep("Welcome to FalkorDB Browser");
                    expect((await apiCall.getGraphs()).opts).toContain(orphan);
                    await tutorial.skip();
                    await page.unroute(cleanupUrl);
                    await page.reload();
                }
                await expect.poll(async () => (await apiCall.getGraphs()).opts, { timeout: 30_000 }).not.toContain(orphan);
                const { opts } = await apiCall.getGraphs();
                expect(opts).toContain(userNamedLikeDemo);
                expect(opts).toContain(recent);
                const result = await apiCall.runQuery(userNamedLikeDemo, "MATCH (n:Mine {keep: true}) RETURN count(n) AS c");
                expect(Number(result.data[0].c)).toBe(1);
                await expect(page.getByTestId("tutorialSpotlight")).toHaveCount(0);
            } finally {
                await browser.closeBrowser();
                const { opts } = await apiCall.getGraphs();
                for (const name of [orphan, userNamedLikeDemo, recent]) {
                    if (opts.includes(name)) {
                        const { message } = await apiCall.removeGraph(name, "admin");
                        expect(message).toMatch(/deleted|empty key/);
                    }
                }
            }
        });
    }

    for (const suppressedBy of ["mobile", "share link"]) {
        test(`@admin a ${suppressedBy} visit reclaims completed samples owned by this tab`, async () => {
            test.setTimeout(60_000);
            const suffix = getRandomString("suppressed").replaceAll("_", "-");
            const ownerId = `owner-${suffix}`;
            const name = `tutorial-social-demo-${suffix}`;
            const scope = "localhost:6379:default:";
            const ownershipKey = `${scope}${tutorialDemoOwnershipKey(ownerId)}`;
            await apiCall.runQuery(name, "CREATE (:Mine)");
            if (suppressedBy === "share link") await apiCall.runQuery(userGraph, "CREATE (:Mine)");
            const page = await browser.createNewPage(TutorialPanel).then(() => browser.getPage());
            if (suppressedBy === "mobile") await page.setViewportSize({ width: 900, height: 900 });
            await page.addInitScript(({ ownerId, name, scope, ownershipKey }) => {
                sessionStorage.setItem("tutorialDemoOwnerId", ownerId);
                localStorage.setItem("tutorial", "true");
                localStorage.setItem(ownershipKey, JSON.stringify({
                    scope, ownerId, names: [name], pendingNames: [], lastActiveAt: Date.now(),
                }));
            }, { ownerId, name, scope, ownershipKey });
            try {
                await page.goto(suppressedBy === "mobile" ? urls.graphUrl : `${urls.graphUrl}?graph=${userGraph}&query=RETURN%201`);
                await expect.poll(() => page.evaluate(key => localStorage.getItem(key), ownershipKey), { timeout: 30000 }).toBeNull();
                expect((await apiCall.getGraphs()).opts).not.toContain(name);
                await expect(page.getByTestId("tutorialSpotlight")).toHaveCount(0);
            } finally {
                await browser.closeBrowser();
                const { message } = await apiCall.removeGraph(name, "admin");
                expect(message).toMatch(/deleted|empty key/);
            }
        });
    }

    test("@admin returning to a recovered connection waits for its new cleanup activation", async () => {
        test.setTimeout(60_000);
        await apiCall.runQuery(userGraph, "CREATE (:Mine)");
        await browser.createNewPage(TutorialPanel);
        const page = await browser.getPage();
        const connections = await mockTutorialConnectionSwitches(page);
        const suffix = getRandomString("activation").replaceAll("_", "-");
        const firstName = `tutorial-social-demo-${suffix}`;
        const secondName = `tutorial-social-test-${suffix}`;
        const stubName = `offloaded-${suffix}`;
        await page.route("**/api/DBVersion", route => route.fulfill({ json: {
            result: ["graph", GRAPH_OFFLOAD_VERSION_THRESHOLD], enterprise: true,
        } }));
        await page.route("**/api/graph/stubs", route => route.fulfill({ json: { stubs: [stubName] } }));
        const firstOwner = `first-${suffix}`;
        const secondOwner = `second-${suffix}`;
        const firstScope = `${connections.first.host}:${connections.first.port}:${connections.first.username || "default"}:`;
        const secondScope = `${connections.second.host}:${connections.second.port}:${connections.second.username || "default"}:`;
        await apiCall.runQuery(firstName, "CREATE (:Mine)");
        let release!: () => void;
        const gate = new Promise<void>(resolve => { release = resolve; });
        let firstStarted!: () => void;
        let secondStarted!: () => void;
        const firstDeletion = new Promise<void>(resolve => { firstStarted = resolve; });
        const secondDeletion = new Promise<void>(resolve => { secondStarted = resolve; });
        const queries: string[] = [];
        const routes: Promise<void>[] = [];
        let deleted = false;
        let returning = false;
        await page.route(url => url.pathname === "/api/graph", route => route.fulfill({ json: {
            opts: deleted ? [] : route.request().headers()["x-connection-id"] === connections.second.id ? [secondName] : returning ? [firstName] : [userGraph],
        } }));
        await page.route(url => [firstName, secondName].some(name => url.pathname === `/api/graph/${name}` || url.pathname.startsWith(`/api/graph/${name}/`)), async route => {
            const name = decodeURIComponent(new URL(route.request().url()).pathname.split("/")[3]);
            if (route.request().method() !== "DELETE") {
                queries.push(route.request().url());
                return route.fulfill({ status: 400, json: { message: "Recovery must finish before queries" } });
            }
            const pending = (async () => {
                if (name === firstName) firstStarted(); else secondStarted();
                await gate;
                deleted = true;
                await route.fulfill({ json: { message: `${name} graph deleted` } });
            })();
            routes.push(pending);
            return pending;
        });
        await page.addInitScript(() => localStorage.setItem("tutorial", "false"));
        try {
            await page.goto(urls.graphUrl);
            await expect(page.getByRole("button", { name: "New tab", exact: true }).last()).toBeEnabled();
            await page.getByTestId("selectGraph").click();
            await expect(page.getByTestId(`selectGraph${userGraph}Button`)).toBeVisible();
            await expect(page.getByTestId(`selectGraph${stubName}Button`)).toBeVisible();
            await page.keyboard.press("Escape");
            await page.evaluate(({ scope, ownerId, name }) => {
                localStorage.setItem(`${scope}tutorialDemoGraphOwnership:${ownerId}`, JSON.stringify({
                    scope, ownerId, names: [name], pendingNames: [], lastActiveAt: 1,
                }));
            }, { scope: secondScope, ownerId: secondOwner, name: secondName });
            await connections.switchTo(connections.second);
            await expect.poll(() => routes.length, { timeout: 15000 }).toBe(1);
            await secondDeletion;
            await expect(page.getByTestId("selectGraph")).toBeDisabled();
            await expect(page.getByTestId(`selectGraph${userGraph}Button`)).toHaveCount(0);
            await expect(page.getByTestId(`selectGraph${stubName}Button`)).toHaveCount(0);
            await page.evaluate(({ scope, ownerId, name, tab, tabsKey }) => {
                localStorage.setItem(`${scope}tutorialDemoGraphOwnership:${ownerId}`, JSON.stringify({
                    scope, ownerId, names: [name], pendingNames: [], lastActiveAt: 1,
                }));
                localStorage.setItem(`${scope}${tabsKey}`, JSON.stringify({ tabs: [tab], activeTabId: tab.id }));
            }, { scope: firstScope, ownerId: firstOwner, name: firstName, tab: forStorage({ ...createTab(), graphName: firstName }), tabsKey: TABS_STORAGE_KEY });
            returning = true;
            await connections.switchTo(connections.first);
            await expect.poll(() => routes.length, { timeout: 15000 }).toBe(2);
            await firstDeletion;
            await expect(page.getByTestId("selectGraph")).toBeDisabled();
            await page.clock.install();
            await page.clock.runFor(2000);
            expect(queries).toEqual([]);
            release();
            await Promise.all(routes);
            await expect(page.getByTestId("selectGraph")).toHaveText("Select Graph");
            expect(queries).toEqual([]);
        } finally {
            release();
            await Promise.all(routes);
            await browser.closeBrowser();
            const { message } = await apiCall.removeGraph(firstName, "admin");
            expect(message).toMatch(/deleted|empty key/);
        }
    });

    test("@admin stalled config initialization releases recovery and saved tabs", async ({ page }) => {
        test.setTimeout(60_000);
        await apiCall.runQuery(userGraph, "CREATE (:Mine)");
        const tab = forStorage({ ...createTab(), graphName: userGraph });
        await page.addInitScript(({ tab, key }) => {
            localStorage.removeItem("timeout");
            localStorage.setItem("tutorial", "false");
            localStorage.setItem("appDownloadPrompt", "false");
            localStorage.setItem(`localhost:6379:default:${key}`, JSON.stringify({ tabs: [tab], activeTabId: tab.id }));
        }, { tab, key: TABS_STORAGE_KEY });
        let configRequests = 0;
        await page.route("**/api/graph/config", () => { configRequests += 1; });
        try {
            await page.goto(urls.graphUrl);
            await expect.poll(() => configRequests, { timeout: 30000 }).toBeGreaterThan(0);
            await expect(page.getByTestId("selectGraph")).toBeEnabled({ timeout: 30000 });
            await expect(page.getByRole("button", { name: `Rename ${userGraph}`, exact: true })).toBeVisible();
        } finally {
            await page.close();
        }
    });

    test("@admin mobile suppression resets loaded tutorial state before Replay", async () => {
        test.setTimeout(90_000);
        const tutorial = await browser.createNewPage(TutorialPanel);
        const page = await browser.getPage();
        await page.addInitScript(() => localStorage.setItem("tutorial", "true"));
        await page.goto(urls.graphUrl);
        await tutorial.waitForStep("Welcome to FalkorDB Browser", 30000);
        const readNames = () => page.evaluate(() => {
            const owner = sessionStorage.getItem("tutorialDemoOwnerId");
            const key = Object.keys(localStorage).find(key => key.endsWith(`tutorialDemoGraphOwnership:${owner}`));
            return key ? (JSON.parse(localStorage.getItem(key)!) as { names: string[] }).names : [];
        });
        const oldNames = await readNames();
        expect(oldNames).toHaveLength(2);
        await tutorial.clickNextButton();
        await page.setViewportSize({ width: 900, height: 900 });
        await expect(page.getByTestId("tutorialSpotlight")).toHaveCount(0);
        await expect.poll(readNames, { timeout: 30000 }).toEqual([]);
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.getByTestId("settings").click();
        await expect(page).toHaveURL(/\/settings/, { timeout: 30000 });
        await page.getByTestId("settingsTabBrowser").click();
        await page.getByTestId("replayTutorial").click();
        await tutorial.waitForStep("Welcome to FalkorDB Browser", 30000);
        const newNames = await readNames();
        expect(newNames).toHaveLength(2);
        expect(newNames.every(name => !oldNames.includes(name))).toBe(true);
        expect((await apiCall.getGraphs()).opts.filter(name => oldNames.includes(name))).toEqual([]);
    });

    test("@admin stalled setup cannot block mobile recovery or publish a late tutorial", async () => {
        test.setTimeout(90_000);
        await apiCall.runQuery(userGraph, "CREATE (:Mine)");
        const tutorial = await browser.createNewPage(TutorialPanel);
        const page = await browser.getPage();
        let release!: () => void;
        const gate = new Promise<void>(resolve => { release = resolve; });
        const routes: Promise<void>[] = [];
        const names: string[] = [];
        await page.route(url => url.pathname.startsWith("/api/graph/tutorial-social-") && !!url.searchParams.get("query")?.includes("CREATE"), route => {
            names.push(decodeURIComponent(new URL(route.request().url()).pathname.split("/")[3]));
            const pending = gate.then(() => route.fulfill({ contentType: "text/event-stream", body: "event: result\ndata: {}\n\n" }));
            routes.push(pending);
            return pending;
        });
        await page.addInitScript(() => localStorage.setItem("tutorial", "true"));
        try {
            await page.goto(urls.graphUrl);
            await expect.poll(() => names.length, { timeout: 30000 }).toBe(2);
            await page.setViewportSize({ width: 900, height: 900 });
            await expect(page.getByTestId("tutorialSpotlight")).toHaveCount(0);
            await expect(page.getByText("Tutorial cleanup failed", { exact: true })).toBeVisible({ timeout: 40000 });
            await expect(page.getByTestId("selectGraph")).toBeEnabled({ timeout: 10000 });
            const pendingNames = await page.evaluate(() => {
                const owner = sessionStorage.getItem("tutorialDemoOwnerId");
                const key = Object.keys(localStorage).find(key => key.endsWith(`tutorialDemoGraphOwnership:${owner}`));
                return key ? (JSON.parse(localStorage.getItem(key)!) as { pendingNames: string[] }).pendingNames : [];
            });
            expect(pendingNames.sort()).toEqual([...names].sort());
            release();
            await Promise.all(routes);
            await expect.poll(() => page.evaluate(() => {
                const owner = sessionStorage.getItem("tutorialDemoOwnerId");
                return Object.keys(localStorage).some(key => key.endsWith(`tutorialDemoGraphOwnership:${owner}`));
            }), { timeout: 30000 }).toBe(false);
            await expect(page.getByTestId("tutorialSpotlight")).toHaveCount(0);
            await page.setViewportSize({ width: 1440, height: 900 });
            await expect(page.getByTestId("tutorialSpotlight")).toHaveCount(0);
        } finally {
            release();
            await Promise.all(routes);
            await browser.closeBrowser();
        }
    });

    test("@admin late tutorial background reads cannot recreate a deleted sample", async ({ page }) => {
        const name = `tutorial-social-demo-${getRandomString("late-read").replaceAll("_", "-")}`;
        await apiCall.runQuery(name, "CREATE (:Mine)");
        const removed = await page.request.delete(`${urls.api.graphUrl}${name}`);
        expect(removed.ok()).toBe(true);
        for (const suffix of ["/info?type=(label)", "/info?type=(property%20key)", "/0", "/count", "/count/nodes", "/count/edges", "?query=RETURN%201&readOnly=true"]) {
            const response = await page.request.get(`${urls.api.graphUrl}${name}${suffix}`);
            if (suffix.startsWith("?") || suffix.startsWith("/count")) {
                expect(await response.text()).toContain("event: error");
            } else {
                expect(response.status()).toBe(400);
            }
            expect((await apiCall.getGraphs()).opts).not.toContain(name);
        }
    });

    test("@admin setup completion stays with its original ownership record after switching away", async () => {
        test.setTimeout(60_000);
        await browser.createNewPage(TutorialPanel);
        const page = await browser.getPage();
        const connections = await mockTutorialConnectionSwitches(page);
        const scope = `${connections.first.host}:${connections.first.port}:${connections.first.username || "default"}:`;
        let release!: () => void;
        const gate = new Promise<void>(resolve => { release = resolve; });
        const createdNames: string[] = [];
        const routes: Promise<void>[] = [];
        await page.route("**/api/DBVersion", route => route.request().headers()["x-connection-id"] === connections.second.id
            ? route.fulfill({ status: 503, json: { message: "Second connection cannot allocate tutorial samples" } })
            : route.continue());
        await page.route(url => url.pathname.startsWith("/api/graph/tutorial-social-") && !!url.searchParams.get("query")?.includes("CREATE"), route => {
            const name = decodeURIComponent(new URL(route.request().url()).pathname.split("/")[3]);
            createdNames.push(name);
            const pending = (async () => {
                await gate;
                await apiCall.runQuery(name, "CREATE (:Mine)");
                await route.fulfill({ contentType: "text/event-stream", body: "event: result\ndata: {}\n\n" });
            })();
            routes.push(pending);
            return pending;
        });
        await page.addInitScript(() => localStorage.setItem("tutorial", "true"));
        try {
            await page.goto(urls.graphUrl);
            await expect.poll(() => createdNames.length, { timeout: 30000 }).toBe(2);
            await connections.switchTo(connections.second, true);
            release();
            await Promise.all(routes);
            await expect.poll(() => page.evaluate(scope => {
                const ownerId = sessionStorage.getItem("tutorialDemoOwnerId");
                const stored = localStorage.getItem(`${scope}tutorialDemoGraphOwnership:${ownerId}`);
                if (!stored) throw new Error("Original setup ownership was lost");
                return (JSON.parse(stored) as { pendingNames: string[] }).pendingNames;
            }, scope), { timeout: 30000 }).toEqual([]);
        } finally {
            release();
            await Promise.all(routes);
            await browser.closeBrowser();
            for (const name of createdNames) {
                const { message } = await apiCall.removeGraph(name, "admin");
                expect(message).toMatch(/deleted|empty key/);
            }
        }
    });

    test("@admin closing the tutorial cannot restore and recreate another owner's reclaimed sample", async () => {
        test.setTimeout(60_000);
        const suffix = getRandomString("snapshot").replaceAll("_", "-");
        const ownerId = `owner-${suffix}`;
        const name = `tutorial-social-demo-${suffix}`;
        const scope = "localhost:6379:default:";
        const ownershipKey = `${scope}${tutorialDemoOwnershipKey(ownerId)}`;
        await apiCall.runQuery(name, "CREATE (:Mine)");
        const tutorial = await browser.createNewPage(TutorialPanel);
        const page = await browser.getPage();
        const visibleNames = new Set([name]);
        const staleQueries: string[] = [];
        let failCleanup = true;
        let deleted = false;
        await page.route(url => url.pathname === "/api/graph", async route => {
            const response = await route.fetch();
            const { opts } = await response.json() as { opts: string[] };
            await route.fulfill({ json: { opts: opts.filter(option => visibleNames.has(option)) } });
        });
        await page.route(url => url.pathname.startsWith("/api/graph/tutorial-social-"), async route => {
            const request = route.request();
            const url = new URL(request.url());
            const graph = decodeURIComponent(url.pathname.split("/")[3]);
            if (graph === name && request.method() === "DELETE") {
                if (failCleanup) return route.fulfill({ status: 503, json: { message: "Held abandoned sample" } });
                const response = await route.fetch();
                deleted = response.ok();
                return route.fulfill({ response });
            }
            if (url.searchParams.get("query")?.includes("CREATE")) visibleNames.add(graph);
            if (graph === name && deleted) {
                staleQueries.push(request.url());
                return route.fulfill({ status: 400, json: { message: "Reclaimed sample must not be queried" } });
            }
            return route.continue();
        });
        await page.addInitScript(({ ownerId, name, scope, ownershipKey }) => {
            localStorage.setItem("tutorial", "true");
            if (localStorage.getItem(ownershipKey) === null) {
                localStorage.setItem(ownershipKey, JSON.stringify({
                    scope, ownerId, names: [name], pendingNames: [], lastActiveAt: Date.now() - 25 * 60 * 60 * 1000,
                }));
            }
        }, { ownerId, name, scope, ownershipKey });
        try {
            await page.goto(urls.graphUrl);
            await tutorial.waitForStep("Welcome to FalkorDB Browser", 30000);
            failCleanup = false;
            await page.clock.install();
            await page.getByTestId("skipTutorial").click();
            await expect(page.getByTestId("tutorialSpotlight")).toBeHidden({ timeout: 30000 });
            await page.clock.runFor(1000);
            expect(deleted).toBe(true);
            expect(staleQueries).toEqual([]);
            expect((await apiCall.getGraphs()).opts).not.toContain(name);
            await expect(page.getByTestId("selectGraph")).toBeDisabled();
            await expect(page.getByTestId(`selectGraph${name}Button`)).toHaveCount(0);
        } finally {
            await browser.closeBrowser();
            const { message } = await apiCall.removeGraph(name, "admin");
            expect(message).toMatch(/deleted|empty key/);
        }
    });

    test("@admin startup cleanup precedes restored and auto-selected tutorial graph queries", async () => {
        test.setTimeout(60_000);
        const suffix = getRandomString("restored").replaceAll("_", "-");
        const ownerId = `owner-${suffix}`;
        const name = `tutorial-social-demo-${suffix}`;
        const scope = "localhost:6379:default:";
        const ownershipKey = `${scope}${tutorialDemoOwnershipKey(ownerId)}`;
        const tab = forStorage({ ...createTab(), graphName: name, query: "MATCH (n) RETURN n" });
        await apiCall.runQuery(name, "CREATE (:Mine)");
        await browser.createNewPage(TutorialPanel);
        const page = await browser.getPage();
        let release!: () => void;
        const gate = new Promise<void>(resolve => { release = resolve; });
        let started!: () => void;
        const deletionStarted = new Promise<void>(resolve => { started = resolve; });
        let finished!: () => void;
        const deletionFinished = new Promise<void>(resolve => { finished = resolve; });
        let deletionPending = false;
        const queries: string[] = [];
        let listReads = 0;
        let deleted = false;
        await page.route(url => url.pathname === "/api/graph", route => {
            listReads += 1;
            return route.fulfill({ json: { opts: deleted ? [] : [name] } });
        });
        await page.route(url => url.pathname === `/api/graph/${name}` || url.pathname.startsWith(`/api/graph/${name}/`), async route => {
            if (route.request().method() === "DELETE") {
                deletionPending = true;
                started();
                try {
                    await gate;
                    const response = await route.fetch();
                    deleted = response.ok();
                    await route.fulfill({ response });
                    return;
                } finally {
                    finished();
                }
            }
            queries.push(route.request().url());
            return route.fulfill({ status: 400, json: { message: "Unexpected query during tutorial recovery" } });
        });
        await page.addInitScript(({ ownershipKey, ownerId, name, scope, tab, tabsKey }) => {
            localStorage.setItem("tutorial", "false");
            localStorage.setItem("refreshInterval", "1");
            localStorage.setItem(ownershipKey, JSON.stringify({
                scope, ownerId, names: [name], pendingNames: [], lastActiveAt: Date.now() - 25 * 60 * 60 * 1000,
            }));
            localStorage.setItem(`${scope}${tabsKey}`, JSON.stringify({ tabs: [tab], activeTabId: tab.id }));
        }, { ownershipKey, ownerId, name, scope, tab, tabsKey: TABS_STORAGE_KEY });
        try {
            await page.goto(`${urls.graphUrl}?tab=${tab.id}`);
            await deletionStarted;
            const readsBeforePolling = listReads;
            await page.clock.install();
            await page.clock.runFor(2000);
            expect(listReads).toBe(readsBeforePolling);
            expect(queries).toEqual([]);
            release();
            await expect.poll(() => page.evaluate(key => localStorage.getItem(key), ownershipKey)).toBeNull();
            await expect(page.getByRole("tab", { name: "No Graph Selected", exact: true })).toBeVisible();
            expect(queries).toEqual([]);
            expect((await apiCall.getGraphs()).opts).not.toContain(name);
        } finally {
            release();
            if (deletionPending) await deletionFinished;
            await browser.closeBrowser();
            const { message } = await apiCall.removeGraph(name, "admin");
            expect(message).toMatch(/deleted|empty key/);
        }
    });

    for (const failedVerification of [false, true, "stalled"] as const) {
        test(`@admin cleanup verifies offloaded tutorial samples (failed verification ${failedVerification})`, async () => {
            test.setTimeout(60_000);
            const suffix = getRandomString("offloaded").replaceAll("_", "-");
            const ownerId = `owner-${suffix}`;
            const name = `tutorial-social-demo-${suffix}`;
            const scope = "localhost:6379:default:";
            const ownershipKey = `${scope}${tutorialDemoOwnershipKey(ownerId)}`;
            await browser.createNewPage(TutorialPanel);
            const page = await browser.getPage();
            let exists = true;
            let deletes = 0;
            let stubReads = 0;
            let listReads = 0;
            await page.route(url => url.pathname === "/api/graph", route => {
                listReads += 1;
                return route.fulfill({ json: { opts: [] } });
            });
            await page.route("**/api/DBVersion", route =>
                route.fulfill({ json: { result: ["graph", 999999], enterprise: true } }));
            await page.route("**/api/graph/stubs", route => {
                stubReads += 1;
                if (failedVerification === "stalled") return;
                return failedVerification
                    ? route.fulfill({ status: 503, json: { message: "Unavailable stubs" } })
                    : route.fulfill({ json: { stubs: exists ? [name] : [] } });
            });
            await page.route(url => url.pathname === `/api/graph/${name}`, route => {
                if (route.request().method() !== "DELETE") return route.continue();
                deletes += 1;
                exists = false;
                return route.fulfill({ json: { message: `${name} graph deleted` } });
            });
            await page.addInitScript(({ ownershipKey, ownerId, name, scope }) => {
                localStorage.setItem("tutorial", "false");
                localStorage.setItem(ownershipKey, JSON.stringify({
                    scope, ownerId, names: [name], pendingNames: [], lastActiveAt: Date.now() - 25 * 60 * 60 * 1000,
                }));
            }, { ownershipKey, ownerId, name, scope });
            await page.goto(urls.graphUrl);
            if (failedVerification) {
                await expect(page.getByText("Tutorial cleanup failed", { exact: true })).toBeVisible({ timeout: 30000 });
                expect(deletes).toBe(0);
                expect(await page.evaluate(key => localStorage.getItem(key), ownershipKey)).not.toBeNull();
                await expect.poll(() => listReads, { timeout: 30000 }).toBeGreaterThan(1);
            } else {
                await expect.poll(() => deletes, { timeout: 30000 }).toBe(1);
                await expect.poll(() => page.evaluate(key => localStorage.getItem(key), ownershipKey)).toBeNull();
                expect(exists).toBe(false);
            }
            expect(stubReads).toBeGreaterThan(0);
        });
    }

    test("@admin tutorial selection targets its owned sample, not an offloaded user graph", async () => {
        test.setTimeout(60_000);
        const tutorial = await browser.createNewPage(TutorialPanel);
        const page = await browser.getPage();
        const unowned = "tutorial-social-demo-00000000-user";
        const unownedQueries: string[] = [];
        await page.route("**/api/DBVersion", route => route.fulfill({ json: { result: ["graph", 999999], enterprise: true } }));
        await page.route("**/api/graph/stubs", route => route.fulfill({ json: { stubs: [unowned] } }));
        await page.route(url => url.pathname === `/api/graph/${unowned}` || url.pathname.startsWith(`/api/graph/${unowned}/`), route => {
            unownedQueries.push(route.request().url());
            return route.fulfill({ status: 400, json: { message: "Must not query the unowned graph" } });
        });
        await page.goto(urls.graphUrl);
        await tutorial.changeLocalStorage("true");
        await page.reload();
        let completed = false;
        try {
            await tutorial.waitForStep("Welcome to FalkorDB Browser", 30000);
            await tutorial.clickNextButton();
            await tutorial.waitForStep("Select a Graph");
            await tutorial.clickTutorialTarget('[data-testid="selectGraph"]');
            await tutorial.waitForStep("Manage Graphs");
            await tutorial.clickTutorialTarget('[data-testid="manageGraphs"]');
            await tutorial.waitForStep("Manage Graphs Window");
            await tutorial.clickNextButton();
            await tutorial.waitForStep("Close Manage Graphs Window");
            await tutorial.clickTutorialTarget('[data-testid="closeManage"]');
            await tutorial.waitForStep("Select a Demo Graph");
            await expect(page.getByTestId(`selectGraph${unowned}Button`)).toHaveCount(0);
            const option = page.locator('[data-testid^="selectGraphtutorial-social-demo-"][data-testid$="Button"]').first();
            const optionId = await option.getAttribute("data-testid");
            if (!optionId) throw new Error("Owned tutorial sample option is missing");
            await tutorial.clickTutorialTarget(`[data-testid="${optionId}"]`);
            await tutorial.waitForStep("Graph Info Panel");
            await expect(page.getByTestId("selectGraph")).toContainText(optionId.slice("selectGraph".length, -"Button".length));
            expect(unownedQueries).toEqual([]);
            completed = true;
        } finally {
            if (completed) {
                await page.getByTestId("skipTutorial").click();
                await expect(page.getByTestId("tutorialSpotlight")).toBeHidden({ timeout: 30000 });
            }
        }
    });

    test("@admin ordinary startup does not wait for tutorial capabilities without ownership records", async () => {
        const tutorial = await browser.createNewPage(TutorialPanel);
        const page = await browser.getPage();
        await page.route("**/api/DBVersion", route => route.fulfill({ status: 503, json: { message: "Capability probe unavailable" } }));
        let listReads = 0;
        await page.route(url => url.pathname === "/api/graph", route => {
            listReads += 1;
            return route.fulfill({ json: { opts: [] } });
        });
        await page.addInitScript(() => {
            if (localStorage.getItem("tutorial") === null) localStorage.setItem("tutorial", "false");
        });
        await page.goto(urls.graphUrl);
        await expect.poll(() => listReads, { timeout: 8000 }).toBeGreaterThan(0);
        await tutorial.changeLocalStorage("true");
        await page.reload();
        await expect(page.getByText("Tutorial unavailable", { exact: true })).toBeVisible({ timeout: 8000 });
        await expect(page.getByTestId("skipTutorial")).toBeHidden();
    });

    test("@admin startup retains ownership while tutorial graph creation may still finish", async () => {
        test.setTimeout(60_000);
        const ownerId = `pending-${getRandomString("owner").replaceAll("_", "-")}`;
        const pendingGraph = `tutorial-social-demo-${getRandomString("pending").replaceAll("_", "-")}`;
        const scope = "localhost:6379:default:";
        const ownershipKey = `${scope}tutorialDemoGraphOwnership:${ownerId}`;

        try {
            await browser.createNewPage(TutorialPanel);
            const page = await browser.getPage();
            await page.addInitScript(({ ownerId, pendingGraph, scope }) => {
                localStorage.setItem("tutorial", "false");
                localStorage.setItem(`${scope}tutorialDemoGraphOwnership:${ownerId}`, JSON.stringify({
                    scope,
                    ownerId,
                    names: [pendingGraph],
                    pendingNames: [pendingGraph],
                    lastActiveAt: Date.now() - 25 * 60 * 60 * 1000,
                }));
            }, { ownerId, pendingGraph, scope });
            await page.goto(urls.graphUrl);

            await expect(page.getByText("Tutorial cleanup failed", { exact: true })).toBeVisible({ timeout: 30000 });
            expect((await apiCall.getGraphs()).opts).not.toContain(pendingGraph);
            expect(await page.evaluate(key => localStorage.getItem(key), ownershipKey)).not.toBeNull();

            await apiCall.runQuery(pendingGraph, "CREATE (:Late {keep: true})");
            await page.reload();

            await expect(page.getByText("Tutorial cleanup failed", { exact: true })).toBeVisible({ timeout: 30000 });
            expect((await apiCall.getGraphs()).opts).toContain(pendingGraph);
            const result = await apiCall.runQuery(pendingGraph, "MATCH (n:Late {keep: true}) RETURN count(n) AS c");
            expect(Number(result.data[0].c)).toBe(1);
            expect(await page.evaluate(key => localStorage.getItem(key), ownershipKey)).not.toBeNull();
        } finally {
            await browser.closeBrowser();
            const { message } = await apiCall.removeGraph(pendingGraph, "admin");
            if (!message.includes("deleted") && !message.includes("empty key")) {
                throw new Error(`Failed to remove pending tutorial test graph ${pendingGraph}: ${message}`);
            }
        }
    });

    test("@admin the tutorial leaves user graphs named social-demo and social-demo-test untouched", async ({ browserName }) => {
        // These names are fixed, so every browser project would share them.
        test.skip(browserName !== "chromium", "Runs in one project to avoid sharing fixed graph names");
        test.setTimeout(120_000);

        const userGraphs = ["social-demo", "social-demo-test"];
        const { opts: existingGraphs } = await apiCall.getGraphs();
        await browser.createNewPage(TutorialPanel);
        const page = await browser.getPage();
        const versionResponse = await page.request.get(`${urls.localHost}/api/DBVersion`);
        expect(versionResponse.ok(), "Verify offload capabilities before touching fixed graph names").toBe(true);
        const version: { result?: unknown; enterprise?: unknown } = await versionResponse.json();
        if (!Array.isArray(version.result) || version.result[0] !== "graph" || typeof version.result[1] !== "number" || typeof version.enterprise !== "boolean") {
            throw new Error("Cannot verify fixed-name fixture safety without graph capabilities");
        }
        if (version.enterprise && version.result[1] >= GRAPH_OFFLOAD_VERSION_THRESHOLD) {
            const stubsResponse = await page.request.get(`${urls.localHost}/api/graph/stubs`);
            expect(stubsResponse.ok(), "Verify offloaded graphs before touching fixed graph names").toBe(true);
            const { stubs }: { stubs?: unknown } = await stubsResponse.json();
            if (!Array.isArray(stubs) || !stubs.every((name): name is string => typeof name === "string")) {
                throw new Error("Cannot verify fixed-name fixture safety without a valid offloaded graph list");
            }
            existingGraphs.push(...stubs);
        }
        test.skip(
            userGraphs.some(name => existingGraphs.includes(name)),
            "A real graph already uses a fixed demo name; leave it alone"
        );

        for (const name of userGraphs) {
            await apiCall.runQuery(name, "CREATE (:Mine {keep: true})");
        }

        try {
            const tutorial = await browser.createNewPage(TutorialPanel, urls.graphUrl);
            await browser.setPageToFullScreen();
            await tutorial.changeLocalStorage("true");
            await tutorial.refreshPage();
            await tutorial.waitForStep("Welcome to FalkorDB Browser");
            await tutorial.skip();

            const { opts: graphsAfter } = await apiCall.getGraphs();
            expect(graphsAfter).toEqual(expect.arrayContaining(userGraphs));
            for (const name of userGraphs) {
                const result = await apiCall.runQuery(
                    name,
                    "MATCH (n) RETURN count(n) AS total, sum(CASE WHEN n:Mine THEN 1 ELSE 0 END) AS mine"
                );
                expect(Number(result.data[0].total)).toBe(1);
                expect(Number(result.data[0].mine)).toBe(1);
            }
        } finally {
            await browser.closeBrowser();
            for (const name of userGraphs) {
                const { message } = await apiCall.removeGraph(name, "admin");
                expect(message).toMatch(/deleted|empty key/);
            }
        }
    });

    test("@admin the app download popup waits until the tutorial is closed", async () => {
        const tutorial = await browser.createNewPage(TutorialPanel, urls.graphUrl);
        await browser.setPageToFullScreen();
        const page = await browser.getPage();
        const app = new AppDownloadComponent(page);
        // What's New would also wait for the tutorial and then go first; leave it out.
        await page.route("**/api/releases", (route) => route.fulfill({ json: { releases: [] } }));
        try {
            // The suite keeps the popup away with "false"; any other value lets
            // it open, and the init script only fills in a missing one.
            await app.evaluate(() => localStorage.setItem("appDownloadPrompt", "true"));
            await tutorial.changeLocalStorage("true");
            await tutorial.refreshPage();
            await tutorial.waitForStep("Welcome to FalkorDB Browser");

            // Both are first-visit popups: the tour goes first, alone.
            await tutorial.waitForTimeout(4000);
            await expect(app.prompt).toBeHidden();

            await tutorial.skip();
            await expect(app.prompt).toBeVisible({ timeout: 10_000 });
        } finally {
            await tutorial.changeLocalStorage("false");
        }
    });

    test("@admin walk through the entire tutorial and verify user data is restored", async () => {
        // Increase timeout — tutorial walkthrough involves many UI interactions
        test.setTimeout(180_000);

        // 1. Create a user graph before the tutorial so we can verify restoration
        await apiCall.addGraph(userGraph);

        // Get the list of graphs before tutorial starts
        const tutorial = await browser.createNewPage(TutorialPanel, urls.graphUrl);
        await browser.setPageToFullScreen();
        await tutorial.waitForTimeout(2000);

        const graphsBefore = await tutorial.getGraphList();
        expect(graphsBefore).toContain(userGraph);

        // Open a second tab, so the strip the tutorial replaces is one the user
        // can tell apart from the tutorial's own single tab.
        await tutorial.addStripTab();
        const userTabs = await tutorial.getStripTabCount();
        expect(userTabs).toBe(2);

        // 2. Start the tutorial by setting localStorage and refreshing
        await tutorial.changeLocalStorage("true");
        await tutorial.refreshPage();
        await tutorial.waitForTimeout(2000);

        // Step 0: "Preparing Tutorial..." — auto-advances after loading demo graphs
        // Step 1: "Welcome to FalkorDB Browser" — has Next button (no advanceOn)
        await tutorial.waitForStep("Welcome to FalkorDB Browser");
        expect(await tutorial.isTutorialVisible()).toBeTruthy();
        // The tutorial works on a strip of its own — the user's tabs are hidden
        // for its duration, exactly like their graphs.
        expect(await tutorial.getStripTabCount()).toBe(1);
        await tutorial.clickNextButton();

        // Step 2: "Select a Graph" — advanceOn: "click" on selectGraph
        await tutorial.waitForStep("Select a Graph");
        await tutorial.clickTutorialTarget('[data-testid="selectGraph"]');

        // Step 3: "Manage Graphs" — advanceOn: "click" on manageGraphs
        await tutorial.waitForStep("Manage Graphs");
        await tutorial.clickTutorialTarget('[data-testid="manageGraphs"]');

        // Step 4: "Manage Graphs Window" — no advanceOn, has Next button
        await tutorial.waitForStep("Manage Graphs Window");
        await tutorial.clickNextButton();

        // Step 5: "Close Manage Graphs Window" — advanceOn: "click" on closeManage
        await tutorial.waitForStep("Close Manage Graphs Window");
        await tutorial.clickTutorialTarget('[data-testid="closeManage"]');

        // Step 6: "Select a Demo Graph" — advanceOn: "click" on the generated demo graph option
        await tutorial.waitForStep("Select a Demo Graph");
        const page = await browser.getPage();
        const demoOptionSelector = '[data-testid^="selectGraphtutorial-social-demo-"][data-testid$="Button"]';
        const demoOptionId = await page.locator(demoOptionSelector).first().getAttribute("data-testid");
        if (!demoOptionId) throw new Error("Tutorial demo graph option was not found");
        expect(demoOptionId).toMatch(/Button$/);
        const demoGraph = demoOptionId.replace(/^selectGraph/, "").replace(/Button$/, "");
        const demoSuffix = demoGraph.slice("tutorial-social-demo-".length);
        const activeDemoGraphs = [demoGraph, `tutorial-social-test-${demoSuffix}`];
        await tutorial.clickTutorialTarget(demoOptionSelector);

        // Step 7: "Graph Info Panel" — no advanceOn, has Next button
        await tutorial.waitForStep("Graph Info Panel");
        await tutorial.waitForTimeout(1000); // Wait for graph info to load
        await tutorial.clickNextButton();

        // Step 8: "Open Label Options" — advanceOn: "click" on graphInfoPersonNode
        await tutorial.waitForStep("Open Label Options");
        await tutorial.clickTutorialTarget('[data-testid="graphInfoPersonNode"]');

        // Step 9: "Customize Label Styles" — advanceOn: "click" on customizeStylePerson
        await tutorial.waitForStep("Customize Label Styles");
        await tutorial.clickTutorialTarget('[data-testid="customizeStylePerson"]');

        // Step 10: "Choose Node Color" — advanceOn: "click" on color button
        await tutorial.waitForStep("Choose Node Color");
        await tutorial.clickTutorialTarget('button[aria-label^="Select color"]');

        // Step 11: "Adjust Node Size" — advanceOn: "click" on size button
        await tutorial.waitForStep("Adjust Node Size");
        await tutorial.clickTutorialTarget('button[aria-label^="Select size"]');

        // Step 12: "Save Style Changes" — advanceOn: "click" on saveStyleChanges
        await tutorial.waitForStep("Save Style Changes");
        await tutorial.clickTutorialTarget('[data-testid="saveStyleChanges"]');

        // Step 13: "Get all nodes (*)" — advanceOn: "click" on graphInfoAllNodes
        await tutorial.waitForStep("Get all nodes (*)");
        await tutorial.clickTutorialTarget('[data-testid="graphInfoAllNodes"]');

        // Step 14: "Open Edge Options" — advanceOn: "click" on graphInfoKNOWSEdge
        await tutorial.waitForStep("Open Edge Options");
        await tutorial.waitForTimeout(1000); // Wait for previous query to finish
        await tutorial.clickTutorialTarget('[data-testid="graphInfoKNOWSEdge"]');

        // Step 15: "Customize Edge Styles" — advanceOn: "click" on customizeRelationshipStyleKNOWS
        await tutorial.waitForStep("Customize Edge Styles");
        await tutorial.clickTutorialTarget('[data-testid="customizeRelationshipStyleKNOWS"]');

        // Step 16: "Choose Edge Color" — advanceOn: "click" on color button
        await tutorial.waitForStep("Choose Edge Color");
        await tutorial.clickTutorialTarget('button[aria-label^="Select color"]');

        // Step 17: "Adjust Edge Size" — advanceOn: "click" on size button
        await tutorial.waitForStep("Adjust Edge Size");
        await tutorial.clickTutorialTarget('button[aria-label^="Select size"]');

        // Step 18: "Save Edge Style Changes" — advanceOn: "click" on saveStyleChanges
        await tutorial.waitForStep("Save Edge Style Changes");
        await tutorial.clickTutorialTarget('[data-testid="saveStyleChanges"]');
        // Saving closes the style panel — that is what puts the KNOWS chip back
        // within reach of the next step.
        await expect(tutorial.customizeStyleClose).toHaveCount(0);

        // Step 19: "Reopen Edge Options" — advanceOn: "click" on graphInfoKNOWSEdge
        await tutorial.waitForStep("Reopen Edge Options");
        await tutorial.clickTutorialTarget('[data-testid="graphInfoKNOWSEdge"]');

        // Step 20: "Get KNOWS edge" — advanceOn: "click" on runRelationshipKNOWS
        await tutorial.waitForStep("Get KNOWS edge");
        await tutorial.clickTutorialTarget('[data-testid="runRelationshipKNOWS"]');

        // Step 21: "Query Editor" — advanceOn: "click" on editorRun
        await tutorial.waitForStep("Query Editor");
        await tutorial.waitForTimeout(1000); // Wait for previous query to finish
        await tutorial.clickTutorialTarget('[data-testid="editorRun"]');

        // Step 22: "Graph Visualization" — no advanceOn, has Next button
        await tutorial.waitForStep("Graph Visualization");
        await tutorial.waitForTimeout(2000); // Wait for canvas animation
        await tutorial.clickNextButton();

        // Step 23: "Expand Node" — no advanceOn, has Next button (forwards events for optional interaction)
        await tutorial.waitForStep("Expand Node");
        // The canvas remains interactive and populated for the optional expand interaction.
        await expect(tutorial.canvasElement).toBeVisible();
        expect((await tutorial.getNodesScreenPositions()).length).toBeGreaterThan(0);
        await tutorial.clickNextButton();

        // Step 24: "Collapse Node" — no advanceOn, has Next button (forwards events for optional interaction)
        await tutorial.waitForStep("Collapse Node");
        await expect(tutorial.canvasElement).toBeVisible();
        expect((await tutorial.getNodesScreenPositions()).length).toBeGreaterThan(0);
        await tutorial.clickNextButton();

        // Step 25: "View Node / Edge Details" — advanceOn: "click", with advanceCondition
        // Click on an actual node so the DataPanel opens reliably.
        await tutorial.waitForStep("View Node / Edge Details");
        const hit = await tutorial.clickCanvasUntilDataPanel();
        expect(hit, "Click fallback: DataPanel never appeared after exhausting all canvas node positions").toBeTruthy();

        // Step 26: "Data Panel" — no advanceOn, has Next button
        await tutorial.waitForStep("Data Panel");
        await tutorial.clickNextButton();

        // Step 27: "Graph Action Toolbar" — no advanceOn, has Next button
        await tutorial.waitForStep("Graph Action Toolbar");
        await tutorial.clickNextButton();

        // Step 28: "Table Results" — advanceOn: "mousedown" on tableTab
        await tutorial.waitForStep("Table Results");
        await tutorial.clickTutorialTarget('[data-testid="tableTab"]');

        // Step 29: "Export Table Results" — no advanceOn, has Next button
        await tutorial.waitForStep("Export Table Results");
        await tutorial.clickNextButton();

        // Step 30: "Query Metadata" — advanceOn: "mousedown" on metadataTab
        await tutorial.waitForStep("Query Metadata");
        await tutorial.clickTutorialTarget('[data-testid="metadataTab"]');

        // Step 31: "Graph Schema" — advanceOn: "mousedown" on schemaTab
        await tutorial.waitForStep("Graph Schema");
        await tutorial.clickTutorialTarget('[data-testid="schemaTab"]');

        // Step 32: "Schema View" — no advanceOn, has Next button
        await tutorial.waitForStep("Schema View");
        await expect(tutorial.schemaView).toBeVisible();
        await tutorial.clickNextButton();

        // Step 33: "Label Properties" — no advanceOn, has Next button
        await tutorial.waitForStep("Label Properties");
        await tutorial.clickNextButton();

        // Step 34: "Query History" — advanceOn: "click" on queryHistory
        await tutorial.waitForStep("Query History");
        await tutorial.clickTutorialTarget('[data-testid="queryHistory"]');

        // Step 35: "Query History Window" — no advanceOn, has Next button
        await tutorial.waitForStep("Query History Window");
        await tutorial.clickNextButton();

        // Step 36: "Close Query History Window" — advanceOn: "click" on queryHistoryCloseButton
        await tutorial.waitForStep("Close Query History Window");
        await tutorial.clickTutorialTarget('[data-testid="queryHistoryCloseButton"]');

        // Track 4: Layouts and canvas actions

        // Step 37: "Graph View" — advanceOn: "mousedown" on graphTab
        await tutorial.waitForStep("Graph View");
        await tutorial.clickTutorialTarget('[data-testid="graphTab"]');

        // Step 38: "Open Layout Dropdown" — advanceOn: "click" on layoutControl
        await tutorial.waitForStep("Open Layout Dropdown");
        await tutorial.clickTutorialTarget('[data-testid="layoutControl"]');

        // Step 39: "Hover Tree" — advanceOn: "pointermove" on layoutTreeSub, advanceCondition checks sub-content
        await tutorial.waitForStep("Hover Tree");
        await tutorial.hoverTutorialTarget(
            '[data-testid="layoutTreeSub"]',
            "Select Tree Direction",
            '[data-testid="layoutTreeDirection-td"]'
        );

        // Step 40: "Select Tree Direction" — advanceOn: "click" on layoutTreeDirection-td, passthrough
        await tutorial.waitForStep("Select Tree Direction");
        await tutorial.clickTutorialTarget('[data-testid="layoutTreeDirection-td"]');

        // Step 41: "Tree Layout Active" — no advanceOn, has Next button
        await tutorial.waitForStep("Tree Layout Active");
        await expect(tutorial.layoutControl).toContainText("Tree");
        await tutorial.clickNextButton();

        // Step 42: "Open Layout Dropdown" (again) — advanceOn: "click" on layoutControl
        await tutorial.waitForStep("Open Layout Dropdown");
        await tutorial.clickTutorialTarget('[data-testid="layoutControl"]');

        // Step 43: "Hover Radial" — advanceOn: "pointermove" on layoutRadialSub, advanceCondition checks sub-content
        await tutorial.waitForStep("Hover Radial");
        await tutorial.hoverTutorialTarget(
            '[data-testid="layoutRadialSub"]',
            "Select Radial Direction",
            '[data-testid="layoutRadialDirection-out"]'
        );

        // Step 44: "Select Radial Direction" — advanceOn: "click" on layoutRadialDirection-out, passthrough
        await tutorial.waitForStep("Select Radial Direction");
        await tutorial.clickTutorialTarget('[data-testid="layoutRadialDirection-out"]');

        // Step 45: "Radial Layout Active" — no advanceOn, has Next button
        await tutorial.waitForStep("Radial Layout Active");
        await expect(tutorial.layoutControl).toContainText("Radial");
        await tutorial.clickNextButton();

        // Step 46: "Animation Control" — no advanceOn, has Next button.
        // The radial layout is active here, so animation auto-pins and the
        // control must be disabled (animationDisabled = pinned || layout !== 'force').
        await tutorial.waitForStep("Animation Control");
        await expect(tutorial.animationControl).toBeVisible();
        await expect(tutorial.animationControl).toBeDisabled();
        await tutorial.clickNextButton();

        // Step 47: "Pin on Drag" — no advanceOn, has Next button.
        await tutorial.waitForStep("Pin on Drag");
        await expect(tutorial.pinControl).toBeVisible();
        await tutorial.clickNextButton();

        // Step 48: "Zoom Controls" — no advanceOn, has Next button
        await tutorial.waitForStep("Zoom Controls");
        await tutorial.clickNextButton();

        // Track 5: Graph tabs

        // Step 49: "Graph Tabs" — no advanceOn, has Next button
        await tutorial.waitForStep("Graph Tabs");
        await expect(tutorial.tabStrip).toBeVisible();
        const tabsBefore = await tutorial.getStripTabCount();
        await tutorial.clickNextButton();

        // Step 50: "Open a New Tab" — advanceOn: "click" on graphTabAdd
        await tutorial.waitForStep("Open a New Tab");
        await tutorial.clickTutorialTarget('[data-testid="graphTabAdd"]');
        expect(await tutorial.getStripTabCount()).toBe(tabsBefore + 1);

        // Step 51: "Rename a Tab" — no advanceOn; the pencil is only pointed at,
        // so the name box must stay closed when the step is advanced with Next.
        await tutorial.waitForStep("Rename a Tab");
        await tutorial.clickNextButton();
        await expect(tutorial.activeTabRenameInput).toHaveCount(0);

        // Step 52: "Switch Between Tabs" — advanceOn: "click" on the first tab
        await tutorial.waitForStep("Switch Between Tabs");
        await tutorial.clickTutorialTarget(
            '[data-testid="graphSubHeader"] > div:first-of-type [data-testid^="graphTabSelect-"]'
        );

        // Step 53: "Close a Tab" — advanceOn: "click" on the last tab's close button.
        await tutorial.waitForStep("Close a Tab");
        await tutorial.clickTutorialTarget(
            '[data-testid="graphSubHeader"] > div:last-of-type [data-testid^="graphTabClose-"]'
        );
        expect(await tutorial.getStripTabCount()).toBe(tabsBefore);

        // Step 54: "Theme Toggle" — no advanceOn, has Next button
        await tutorial.waitForStep("Theme Toggle");
        await tutorial.clickNextButton();

        // Step 55: "Left Menu Navigation" — no advanceOn, has Next button
        await tutorial.waitForStep("Left Menu Navigation");
        await tutorial.clickNextButton();

        // Step 56: "You're All Set!" — has Finish button
        await tutorial.waitForStep("You're All Set!");
        await tutorial.clickNextButton(); // This is the "Finish" button

        // 3. After tutorial closes, verify state restoration
        expect(await tutorial.isTutorialNotVisible()).toBeTruthy();

        // Wait for cleanup to complete (demo graphs deleted, user graphs restored)
        await tutorial.waitForTimeout(3000);

        // 4. Verify this tutorial's demo graphs are gone
        const graphsAfter = await tutorial.getGraphList();
        for (const demoGraph of activeDemoGraphs) {
            expect(graphsAfter).not.toContain(demoGraph);
        }

        // 5. Verify the user's original graph is still present
        expect(graphsAfter).toContain(userGraph);

        // 6. Verify the user's own tabs came back with them
        expect(await tutorial.getStripTabCount()).toBe(userTabs);

        // 6. Verify the tutorial flag is set to "false" (completed)
        const tutorialFlag = await page.evaluate(() =>
            localStorage.getItem("tutorial")
        );
        expect(tutorialFlag).toBe("false");
    });

    test("@admin validate that clicking away doesn't dismiss the tutorial", async () => {
        const tutorial = await browser.createNewPage(TutorialPanel, urls.graphUrl);
        await tutorial.changeLocalStorage("true");
        await tutorial.refreshPage();
        await tutorial.clickAtTopLeftCorner();
        // Nothing to await on: the assertion is that a dismissal the click could
        // have triggered has had time to happen and did not.
        await delay(1000);
        expect(await tutorial.isTutorialVisible()).toBeTruthy();
        await tutorial.changeLocalStorage("false");
    });

    test("@admin validate that clicking replay tutorial reopens the tutorial", async () => {
        const tutorial = await browser.createNewPage(TutorialPanel, urls.settingsUrl);
        await tutorial.clickReplayTutorial();
        expect(await tutorial.isTutorialVisible()).toBeTruthy();
    });
});
