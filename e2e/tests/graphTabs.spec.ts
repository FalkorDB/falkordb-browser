import { expect, test } from "@playwright/test";
import urls from "../config/urls.json";
import BrowserWrapper from "../infra/ui/browserWrapper";
import GraphPage from "../logic/POM/graphPage";
import ApiCalls from "../logic/api/apiCalls";
import { getRandomString } from "../infra/utils";
import TutorialPanel from "../logic/POM/tutorialPanelComponent";

// The tab strip in the /graph sub-header. Each tab is an independent working
// context (graph, query, view, canvas state), so these tests assert both the
// strip mechanics and the isolation between contexts.
test.describe("@admin Graph tabs", () => {
    let browser: BrowserWrapper;
    let apiCall: ApiCalls;
    let graphOne: string;
    let graphTwo: string;

    test.beforeAll(async () => {
        apiCall = new ApiCalls();
        graphOne = getRandomString("tabone");
        graphTwo = getRandomString("tabtwo");
        await apiCall.addGraph(graphOne);
        await apiCall.addGraph(graphTwo);
    });

    test.afterAll(async () => {
        const results = await Promise.all([graphOne, graphTwo].map(graphName => apiCall.removeGraph(graphName, "admin")));
        for (const [index, result] of results.entries()) {
            const graphName = [graphOne, graphTwo][index];
            expect(result.message).toBe(`${graphName} graph deleted`);
        }
    });

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
    });

    test.afterEach(async () => {
        await browser.closeBrowser();
    });

    test("A fresh connection opens on a single blank tab", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await graph.waitForPageIdle();

        await expect.poll(() => graph.getStripTabCount(), { timeout: 15000 }).toBe(1);
        await expect(graph.stripTab("New tab")).toBeVisible();
    });

    test("A rejected bootstrap sync replaces pending graph lists using the session connection", async () => {
        test.setTimeout(60_000);
        await browser.createNewPage(GraphPage);
        const page = await browser.getPage();
        const session = await (await page.request.get(`${urls.localHost}/api/auth/session`)).json();
        const { connections } = await (await page.request.get(`${urls.localHost}/api/connections`)).json();
        expect(connections[0]?.id).toBeTruthy();
        let releaseSync!: () => void;
        const syncGate = new Promise<void>(resolve => { releaseSync = resolve; });
        let releaseLists!: () => void;
        const listGate = new Promise<void>(resolve => { releaseLists = resolve; });
        let releaseDiscovery!: () => void;
        const discoveryGate = new Promise<void>(resolve => { releaseDiscovery = resolve; });
        let rejected = false;
        let syncRequested = false;
        let heldRequests = 0;
        let replacementRequests = 0;
        await page.route("**/api/auth/session", async route => {
            if (route.request().method() === "POST") {
                syncRequested = true;
                await syncGate;
                rejected = true;
            }
            await route.fulfill({ json: { ...session, activeConnectionId: null } });
        });
        await page.route("**/api/connections", async route => {
            await discoveryGate;
            // Hold retries once synchronization starts, not earlier discovery
            // requests cancelled by authentication initialization.
            if (syncRequested) return;
            return route.fulfill({ json: { connections } });
        });
        await page.route("**/api/graph", async route => {
            const pinned = !!route.request().headers()["x-connection-id"];
            if (!rejected || pinned) {
                heldRequests += 1;
                await listGate;
                await route.fulfill({ json: { opts: ["stale-bootstrap-list"] } });
            } else {
                replacementRequests += 1;
                await route.fulfill({ json: { opts: [graphOne, graphTwo] } });
            }
        });
        try {
            await page.goto(urls.graphUrl);
            await expect.poll(() => heldRequests, { timeout: 15000 }).toBeGreaterThan(0);
            releaseDiscovery();
            await expect.poll(() => syncRequested, { timeout: 15000 }).toBe(true);
            await expect(page.getByTestId("graphTabAdd")).toBeDisabled();
            releaseSync();
            await expect.poll(() => replacementRequests, { timeout: 15000 }).toBeGreaterThan(0);
            await expect(page.getByTestId("graphPage")).toHaveAttribute("data-graph-names-ready", "true");
            await expect(page.getByTestId("graphTabAdd")).toBeEnabled();
            releaseLists();
            await page.getByTestId("selectGraph").click();
            await expect(page.getByText(graphOne, { exact: true })).toBeVisible();
            await expect(page.getByText("stale-bootstrap-list", { exact: true })).toBeHidden();
        } finally {
            releaseDiscovery();
            releaseSync();
            releaseLists();
        }
    });

    test("A bootstrap fetch deferred by the tutorial runs after Skip", async () => {
        test.setTimeout(60_000);
        const tutorial = await browser.createNewPage(TutorialPanel);
        const page = await browser.getPage();
        const session = await (await page.request.get(`${urls.localHost}/api/auth/session`)).json();
        const { connections } = await (await page.request.get(`${urls.localHost}/api/connections`)).json();
        expect(connections[0]?.id).toBeTruthy();
        await page.addInitScript(() => localStorage.setItem("tutorial", "true"));
        let syncCompleted = false;
        let graphLists = 0;
        let releaseLists!: () => void;
        const listGate = new Promise<void>(resolve => { releaseLists = resolve; });
        await page.route("**/api/auth/session", async route => {
            if (route.request().method() === "POST") syncCompleted = true;
            await route.fulfill({ json: { ...session, activeConnectionId: connections[0].id } });
        });
        await page.route("**/api/connections", route => route.fulfill({
            json: { connections },
        }));
        await page.route(url => /^\/api\/graph\/social-demo(?:-test)?(?:\/|$)/.test(url.pathname), route =>
            route.request().method() === "DELETE"
                ? route.fulfill({ json: { message: "Mock tutorial graph deleted" } })
                : route.fulfill({ contentType: "text/event-stream", body: "event: result\ndata: {}\n\n" }),
        );
        await page.route("**/api/graph", async route => {
            graphLists += 1;
            await listGate;
            await route.fulfill({ json: { opts: [graphOne, graphTwo] } });
        });
        try {
            await page.goto(urls.graphUrl);
            await tutorial.waitForStep("Welcome to FalkorDB Browser", 30000);
            await expect.poll(() => syncCompleted, { timeout: 15000 }).toBe(true);
            await expect(page.getByTestId("graphPage")).toHaveAttribute("data-graph-names-ready", "false");
            const beforeSkip = graphLists;
            await tutorial.skip();
            await expect.poll(() => graphLists, { timeout: 15000 }).toBeGreaterThan(beforeSkip);
            releaseLists();
            await expect(page.getByTestId("graphPage")).toHaveAttribute("data-graph-names-ready", "true");
            await expect(page.getByTestId("graphTabAdd")).toBeEnabled();
        } finally {
            releaseLists();
        }
    });

    test("Signing out during bootstrap does not fetch another graph list", async () => {
        test.setTimeout(60_000);
        await browser.createNewPage(GraphPage);
        const page = await browser.getPage();
        const session = await (await page.request.get(`${urls.localHost}/api/auth/session`)).json();
        const { connections } = await (await page.request.get(`${urls.localHost}/api/connections`)).json();
        expect(connections[0]?.id).toBeTruthy();
        let releaseSync!: () => void;
        const syncGate = new Promise<void>(resolve => { releaseSync = resolve; });
        let signedOut = false;
        let syncRequested = false;
        let signedOutRequests = 0;
        await page.route("**/api/auth/session", async route => {
            if (route.request().method() === "POST") {
                syncRequested = true;
                await syncGate;
                signedOut = true;
            }
            await route.fulfill({ json: signedOut ? null : session });
        });
        await page.route("**/api/connections", route => route.fulfill({
            json: { connections },
        }));
        await page.route("**/api/graph", route => {
            if (signedOut) signedOutRequests += 1;
            return route.fulfill({ json: { opts: [graphOne, graphTwo] } });
        });
        try {
            await page.goto(urls.graphUrl);
            await expect.poll(() => syncRequested, { timeout: 15000 }).toBe(true);
            signedOut = true;
            await page.evaluate(() => {
                const channel = new BroadcastChannel("next-auth");
                channel.postMessage({ event: "session", data: { trigger: "signout" } });
                channel.close();
            });
            await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
            releaseSync();
            await page.waitForLoadState("networkidle");
            expect(signedOutRequests).toBe(0);
        } finally {
            releaseSync();
        }
    });

    test("Delayed same-connection discovery does not replay a restored query", async () => {
        test.setTimeout(90_000);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const page = await browser.getPage();
        await graph.selectGraphByName(graphOne);
        await graph.insertQuery("MATCH (n) RETURN n");
        const firstRun = page.waitForResponse(response =>
            new URL(response.url()).searchParams.get("query")?.startsWith("MATCH (n) RETURN n") === true,
        );
        await graph.clickRunQuery();
        await firstRun;
        await graph.waitForPageIdle();
        await expect.poll(() => new URL(page.url()).searchParams.get("tab"), { timeout: 15000 }).toBeTruthy();
        await expect.poll(() => new URL(page.url()).searchParams.get("tab"), { timeout: 15000 }).not.toBe("initial");
        const session = await (await page.request.get(`${urls.localHost}/api/auth/session`)).json();
        const { connections } = await (await page.request.get(`${urls.localHost}/api/connections`)).json();
        const connection = connections.find((candidate: { id: string }) => candidate.id === session.activeConnectionId);
        expect(connection).toBeTruthy();
        let releaseDiscovery!: () => void;
        const discoveryGate = new Promise<void>(resolve => { releaseDiscovery = resolve; });
        let releaseRefresh!: () => void;
        const refreshGate = new Promise<void>(resolve => { releaseRefresh = resolve; });
        let syncCompleted = false;
        let graphLists = 0;
        const restoredQueries: string[] = [];
        await page.route("**/api/connections", async route => {
            await discoveryGate;
            await route.fulfill({ json: { connections: [connection] } });
        });
        await page.route("**/api/auth/session", async route => {
            if (route.request().method() === "POST") syncCompleted = true;
            await route.fulfill({ json: session });
        });
        await page.route("**/api/graph", async route => {
            graphLists += 1;
            if (route.request().headers()["x-connection-id"]) await refreshGate;
            return route.fulfill({ json: { opts: [graphOne, graphTwo] } });
        });
        page.on("request", request => {
            const url = new URL(request.url());
            if (url.pathname === `/api/graph/${graphOne}` && url.searchParams.get("query")?.startsWith("MATCH (n) RETURN n")) {
                restoredQueries.push(request.url());
            }
        });
        try {
            const restoredQuery = page.waitForResponse(response => {
                const url = new URL(response.url());
                return url.pathname === `/api/graph/${graphOne}`
                    && url.searchParams.get("query")?.startsWith("MATCH (n) RETURN n") === true;
            });
            await page.reload({ waitUntil: "domcontentloaded" });
            await restoredQuery;
            await expect(page.getByTestId("editorRun")).not.toHaveAttribute("aria-busy", "true");
            await expect.poll(() => restoredQueries.length, { timeout: 15000 }).toBe(1);
            await expect(graph.stripTab(graphOne)).toBeVisible();
            await expect(page.getByTestId("graphTabAdd")).toBeEnabled();
            const initialLists = graphLists;
            releaseDiscovery();
            await expect.poll(() => syncCompleted, { timeout: 15000 }).toBe(true);
            await expect.poll(() => graphLists, { timeout: 15000 }).toBeGreaterThan(initialLists);
            await expect(page.getByTestId("graphPage")).toHaveAttribute("data-graph-names-ready", "true");
            await expect(page.getByTestId("graphTabAdd")).toBeEnabled();
            await page.getByTestId("selectGraph").click();
            await expect(page.getByTestId(`selectGraph${graphOne}Button`)).toBeVisible();
            await page.keyboard.press("Escape");
            expect(restoredQueries).toHaveLength(1);
            releaseRefresh();
            await graph.waitForPageIdle();
            expect(restoredQueries).toHaveLength(1);
        } finally {
            releaseDiscovery();
            releaseRefresh();
        }
    });

    test("Delayed same-connection discovery preserves tutorial selector demos", async () => {
        test.setTimeout(60_000);
        const tutorial = await browser.createNewPage(TutorialPanel);
        const page = await browser.getPage();
        const originalSession = await (await page.request.get(`${urls.localHost}/api/auth/session`)).json();
        const { connections } = await (await page.request.get(`${urls.localHost}/api/connections`)).json();
        const connection = connections.find((candidate: { host: string; port: number; username: string }) =>
            candidate.host === originalSession.user.host && candidate.port === originalSession.user.port
            && candidate.username === originalSession.user.username,
        );
        expect(connection).toBeTruthy();
        const session = { ...originalSession, activeConnectionId: connection.id };
        await page.addInitScript(() => localStorage.setItem("tutorial", "true"));
        let releaseDiscovery!: () => void;
        const discoveryGate = new Promise<void>(resolve => { releaseDiscovery = resolve; });
        let syncCompleted = false;
        await page.route("**/api/connections", async route => {
            await discoveryGate;
            await route.fulfill({ json: { connections: [connection] } });
        });
        await page.route("**/api/auth/session", async route => {
            if (route.request().method() === "POST") syncCompleted = true;
            await route.fulfill({ json: session });
        });
        await page.route("**/api/graph", route => route.fulfill({ json: { opts: [graphOne, graphTwo] } }));
        await page.route(url => /^\/api\/graph\/social-demo(?:-test)?(?:\/|$)/.test(url.pathname), route =>
            route.request().method() === "DELETE"
                ? route.fulfill({ json: { message: "Mock tutorial graph deleted" } })
                : route.fulfill({ contentType: "text/event-stream", body: "event: result\ndata: {}\n\n" }),
        );
        try {
            await page.goto(urls.graphUrl);
            await tutorial.waitForStep("Welcome to FalkorDB Browser", 30000);
            await tutorial.clickNextButton();
            await tutorial.waitForStep("Select a Graph", 15000);
            await tutorial.clickTutorialTarget('[data-testid="selectGraph"]');
            await expect(page.getByTestId("selectGraphsocial-demoButton")).toBeVisible();
            await expect(page.getByTestId("selectGraphsocial-demo-testButton")).toBeVisible();
            releaseDiscovery();
            await expect.poll(() => syncCompleted, { timeout: 15000 }).toBe(true);
            await page.waitForLoadState("networkidle");
            await expect(page.getByTestId("selectGraphsocial-demoButton")).toBeVisible();
            await expect(page.getByTestId("selectGraphsocial-demo-testButton")).toBeVisible();
            await expect(page.getByTestId("graphTabAdd")).toBeEnabled();
        } finally {
            releaseDiscovery();
        }
    });

    test("Delayed discovery of a different connection invalidates session readiness", async () => {
        test.setTimeout(60_000);
        await browser.createNewPage(GraphPage);
        const page = await browser.getPage();
        const session = await (await page.request.get(`${urls.localHost}/api/auth/session`)).json();
        const { connections } = await (await page.request.get(`${urls.localHost}/api/connections`)).json();
        expect(connections[0]?.id).toBeTruthy();
        let releaseDiscovery!: () => void;
        const discoveryGate = new Promise<void>(resolve => { releaseDiscovery = resolve; });
        let releaseLists!: () => void;
        const listGate = new Promise<void>(resolve => { releaseLists = resolve; });
        let discovered = false;
        let syncCompleted = false;
        let replacementLists = 0;
        await page.route("**/api/connections", async route => {
            await discoveryGate;
            discovered = true;
            await route.fulfill({ json: { connections: [connections[0]] } });
        });
        await page.route("**/api/auth/session", async route => {
            if (route.request().method() === "POST") syncCompleted = true;
            await route.fulfill({
                json: { ...session, activeConnectionId: syncCompleted ? connections[0].id : "other-session-connection" },
            });
        });
        await page.route("**/api/graph", async route => {
            if (discovered) {
                replacementLists += 1;
                await listGate;
            }
            await route.fulfill({ json: { opts: [graphOne, graphTwo] } });
        });
        try {
            await page.goto(urls.graphUrl);
            await expect(page.getByTestId("graphTabAdd")).toBeEnabled({ timeout: 15000 });
            releaseDiscovery();
            await expect.poll(() => syncCompleted, { timeout: 15000 }).toBe(true);
            await expect.poll(() => replacementLists, { timeout: 15000 }).toBeGreaterThan(0);
            await expect(page.getByTestId("graphPage")).toHaveAttribute("data-graph-names-ready", "false");
            await expect(page.getByTestId("graphTabAdd")).toBeDisabled();
            releaseLists();
            await expect(page.getByTestId("graphPage")).toHaveAttribute("data-graph-names-ready", "true");
            await expect(page.getByTestId("graphTabAdd")).toBeEnabled();
        } finally {
            releaseDiscovery();
            releaseLists();
        }
    });

    test("A tab is labelled by the graph it holds", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await graph.selectGraphByName(graphOne);
        await graph.waitForPageIdle();

        await expect(graph.stripTab(graphOne)).toBeVisible({ timeout: 15000 });
    });

    test("Adding a tab opens a blank context next to the current one", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await graph.selectGraphByName(graphOne);
        await graph.waitForPageIdle();

        await graph.addStripTab();
        await graph.waitForPageIdle();

        await expect.poll(() => graph.getStripTabCount(), { timeout: 15000 }).toBe(2);
        // The new tab is the active one and carries no graph yet.
        await expect(graph.stripTab("New tab")).toHaveAttribute("data-active", "true");
        await expect(graph.stripTab(graphOne)).toHaveAttribute("data-active", "false");
    });

    test("Each tab keeps its own graph", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const page = await browser.getPage();

        await graph.selectGraphByName(graphOne);
        await graph.waitForPageIdle();

        await graph.addStripTab();
        await graph.waitForPageIdle();
        await graph.selectGraphByName(graphTwo);
        await graph.waitForPageIdle();

        await expect(page.getByTestId("selectGraph")).toContainText(graphTwo, { timeout: 15000 });

        // Switching back brings the first context along with it.
        await graph.selectStripTab(graphOne);
        await graph.waitForPageIdle();
        await expect(page.getByTestId("selectGraph")).toContainText(graphOne, { timeout: 15000 });

        await graph.selectStripTab(graphTwo);
        await graph.waitForPageIdle();
        await expect(page.getByTestId("selectGraph")).toContainText(graphTwo, { timeout: 15000 });
    });

    test("Switching tabs points the URL at the active tab", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const tabParam = () => new URL(graph.getCurrentURL()).searchParams.get("tab");

        await graph.selectGraphByName(graphOne);
        await graph.waitForPageIdle();
        await expect.poll(tabParam, { timeout: 15000 }).toBeTruthy();
        const firstTabId = tabParam();

        await graph.addStripTab();
        await graph.waitForPageIdle();
        await expect.poll(tabParam, { timeout: 15000 }).not.toBe(firstTabId);

        await graph.selectStripTab(graphOne);
        await expect.poll(tabParam, { timeout: 15000 }).toBe(firstTabId);
    });

    test("Renaming a tab replaces its label, and clearing it restores the graph name", async () => {
        const custom = getRandomString("renamed");
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);

        await graph.selectGraphByName(graphOne);
        await graph.waitForPageIdle();

        await graph.renameStripTab(graphOne, custom);
        await expect(graph.stripTab(custom)).toBeVisible({ timeout: 15000 });
        await expect(graph.stripTab(graphOne)).toBeHidden();

        // An empty name is the way back to the graph name.
        await graph.renameStripTab(custom, "");
        await expect(graph.stripTab(graphOne)).toBeVisible({ timeout: 15000 });
    });

    test("A renamed tab survives a reload", async () => {
        const custom = getRandomString("persisted");
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);

        await graph.selectGraphByName(graphOne);
        await graph.waitForPageIdle();
        await graph.renameStripTab(graphOne, custom);
        await expect(graph.stripTab(custom)).toBeVisible({ timeout: 15000 });

        await graph.refreshPage();
        await graph.waitForPageIdle();

        await expect(graph.stripTab(custom)).toBeVisible({ timeout: 15000 });
    });

    test("Reloading re-runs the restored tab's query with the saved timeout, not 0", async () => {
        test.setTimeout(60_000);
        browser = new BrowserWrapper({ seedTimeout: false });
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const page = await browser.getPage();

        await graph.selectGraphByName(graphOne);
        await graph.insertQuery("MATCH (n) RETURN n");
        const firstRun = page.waitForResponse((response) => new URL(response.url()).searchParams.get("query")?.startsWith("MATCH (n) RETURN n") ?? false);
        await graph.clickRunQuery();
        await firstRun;
        await graph.waitForPageIdle();
        await expect.poll(() => new URL(page.url()).searchParams.get("tab")).toBeTruthy();
        await expect.poll(() => new URL(page.url()).searchParams.get("tab")).not.toBe("initial");
        const savedTabId = new URL(page.url()).searchParams.get("tab");

        await page.addInitScript(() => localStorage.removeItem("timeout"));
        let releaseConfig!: () => void;
        const configReleased = new Promise<void>((resolve) => { releaseConfig = resolve; });
        await page.route("**/api/graph/config", async (route) => {
            await configReleased;
            await route.fulfill({ json: { configs: [["TIMEOUT_MAX", 12000]] } });
        });

        const restoredQueries: URL[] = [];
        page.on("request", (request) => {
            const url = new URL(request.url());
            if (/^\/api\/graph\/[^/]+$/.test(url.pathname) && url.searchParams.get("query")?.startsWith("MATCH (n) RETURN n")) {
                restoredQueries.push(url);
            }
        });

        const configRequested = page.waitForRequest("**/api/graph/config");
        try {
            await page.addInitScript(() => {
                const timeout = AbortSignal.timeout.bind(AbortSignal);
                AbortSignal.timeout = milliseconds => timeout(milliseconds === 5000 ? 60000 : milliseconds);
            });
            await page.reload({ waitUntil: "domcontentloaded" });
            await configRequested;
            await expect(page.getByTestId("graphPage")).toHaveAttribute("data-graph-names-ready", "true", { timeout: 15000 });
            await expect(page.getByTestId("graphPage")).toHaveAttribute("aria-busy", "true");
            await expect(page.getByTestId("graphTabAdd")).toBeDisabled();
            expect(new URL(page.url()).searchParams.get("tab")).toBe(savedTabId);
            expect(restoredQueries).toHaveLength(0);

            releaseConfig();
            await graph.waitForPageIdle();

            await expect.poll(() => restoredQueries.length, { timeout: 15000 }).toBeGreaterThan(0);
            expect(new URL(page.url()).searchParams.get("tab")).toBe(savedTabId);
            await expect.poll(() => graph.getStripTabCount()).toBe(1);
            for (const url of restoredQueries) {
                expect(Number(url.searchParams.get("timeout"))).toBe(12);
            }
        } finally {
            releaseConfig();
        }
    });

    test("A stalled timeout config falls back to 60 and restores the saved tab", async () => {
        test.setTimeout(60_000);
        browser = new BrowserWrapper({ seedTimeout: false });
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const page = await browser.getPage();
        await graph.selectGraphByName(graphOne);
        await graph.insertQuery("MATCH (n) RETURN n");
        const firstRun = page.waitForResponse((response) =>
            new URL(response.url()).searchParams.get("query")?.startsWith("MATCH (n) RETURN n") ?? false,
        );
        await graph.clickRunQuery();
        await firstRun;
        await graph.waitForPageIdle();
        await expect.poll(() => new URL(page.url()).searchParams.get("tab")).toBeTruthy();
        await expect.poll(() => new URL(page.url()).searchParams.get("tab")).not.toBe("initial");
        const savedTabId = new URL(page.url()).searchParams.get("tab");
        await page.addInitScript(() => localStorage.removeItem("timeout"));
        await page.route("**/api/graph/config", () => {});
        const restoredQuery = page.waitForRequest((request) => {
            const url = new URL(request.url());
            return /^\/api\/graph\/[^/]+$/.test(url.pathname)
                && url.searchParams.get("query")?.startsWith("MATCH (n) RETURN n") === true;
        });
        await page.reload({ waitUntil: "domcontentloaded" });
        const request = await restoredQuery;
        expect(new URL(page.url()).searchParams.get("tab")).toBe(savedTabId);
        expect(new URL(request.url()).searchParams.get("timeout")).toBe("60");
        await expect(graph.stripTab(graphOne)).toBeVisible();
    });

    test("The mobile portalled toolbar waits for timeout restoration", async () => {
        browser = new BrowserWrapper({ seedTimeout: false });
        await browser.createNewPage(GraphPage);
        const page = await browser.getPage();
        await page.setViewportSize({ width: 900, height: 900 });
        await page.addInitScript(() => localStorage.removeItem("timeout"));
        let release!: () => void;
        const gate = new Promise<void>(resolve => { release = resolve; });
        await page.route("**/api/graph/config", async route => {
            await gate;
            await route.fulfill({ json: { configs: [["TIMEOUT_MAX", 12000]] } });
        });
        await page.addInitScript(() => {
            const timeout = AbortSignal.timeout.bind(AbortSignal);
            AbortSignal.timeout = milliseconds => timeout(milliseconds === 5000 ? 60000 : milliseconds);
        });
        try {
            await page.goto(urls.graphUrl);
            await expect(page.getByTestId("mobileSelectorToolbar")).toHaveAttribute("inert", "", { timeout: 15000 });
            await expect(page.getByTestId("selectorMore")).toBeDisabled();
            release();
            await expect(page.getByTestId("selectorMore")).toBeEnabled({ timeout: 15000 });
            await expect(page.getByTestId("mobileSelectorToolbar")).not.toHaveAttribute("inert");
            await page.getByTestId("selectorMore").click();
            await expect(page.getByTestId("uploadGraphToolbarTrigger")).toBeVisible();
        } finally {
            release();
        }
    });

    test("The tutorial strip stays interactive when the initial user graph list is pending", async () => {
        test.setTimeout(60_000);
        const tutorial = await browser.createNewPage(TutorialPanel, urls.graphUrl);
        const page = await browser.getPage();
        await expect(page.getByTestId("graphTabAdd")).toBeEnabled({ timeout: 15000 });
        await tutorial.changeLocalStorage("true");
        let release!: () => void;
        const gate = new Promise<void>(resolve => { release = resolve; });
        let held = false;
        await page.route(url => /^\/api\/graph\/social-demo(?:-test)?(?:\/|$)/.test(url.pathname), route =>
            route.request().method() === "DELETE"
                ? route.fulfill({ json: { message: "Mock tutorial graph deleted" } })
                : route.fulfill({ contentType: "text/event-stream", body: "event: result\ndata: {}\n\n" }),
        );
        await page.route("**/api/graph", async route => {
            if (held) return route.continue();
            held = true;
            await gate;
            return route.continue();
        });
        try {
            await page.reload();
            await tutorial.waitForStep("Welcome to FalkorDB Browser", 30000);
            expect(held).toBe(true);
            await expect(page.getByTestId("graphTabAdd")).toBeEnabled();
            release();
            await tutorial.skip();
        } finally {
            release();
        }
    });

    test("Closing a tab drops it and falls back to a neighbour", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const page = await browser.getPage();

        await graph.selectGraphByName(graphOne);
        await graph.waitForPageIdle();
        await graph.addStripTab();
        await graph.waitForPageIdle();
        await graph.selectGraphByName(graphTwo);
        await graph.waitForPageIdle();

        await graph.closeStripTab(graphTwo);
        await graph.waitForPageIdle();

        await expect.poll(() => graph.getStripTabCount(), { timeout: 15000 }).toBe(1);
        await expect(page.getByTestId("selectGraph")).toContainText(graphOne, { timeout: 15000 });
    });

    test("The last tab cannot be closed", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);

        await graph.selectGraphByName(graphOne);
        await graph.waitForPageIdle();

        await expect(graph.stripTabClose(graphOne)).toBeDisabled({ timeout: 15000 });
    });

    test("The strip stops growing at the max-tabs limit", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const page = await browser.getPage();
        await graph.waitForPageIdle();

        // Read the limit actually in force instead of assuming the default, so
        // the assertion below can be exact. Mirrors clampMaxTabs (lib/graphTabs).
        const limit = await page.evaluate(() => {
            const stored = Number(window.localStorage.getItem("maxTabs"));
            return Number.isFinite(stored) && stored > 0 ? Math.min(10, Math.max(4, Math.round(stored))) : 8;
        });

        for (let i = 0; i < limit + 2; i += 1) {
            if (await page.getByTestId("graphTabAdd").isDisabled()) break;
            await graph.addStripTab();
        }

        await expect.poll(() => graph.getStripTabCount(), { timeout: 15000 }).toBe(limit);
        await expect(page.getByTestId("graphTabAdd")).toBeDisabled();
    });

    // A share link carries the tab's graph and query, not its id, so it opens
    // for anyone — including a browser that has never seen the tab.
    const shareLink = (graphName: string, query: string, view = "Graph") => {
        const url = new URL(urls.graphUrl);
        url.searchParams.set("graph", graphName);
        url.searchParams.set("query", query);
        url.searchParams.set("view", view);
        return url.toString();
    };

    test("A share link opens its graph in a tab of its own, and the address bar names that tab", async () => {
        const graph = await browser.createNewPage(GraphPage, shareLink(graphOne, "MATCH (n) RETURN n LIMIT 1"));
        const page = await browser.getPage();
        await graph.waitForPageIdle();

        await expect(graph.stripTab(graphOne)).toHaveAttribute("data-active", "true", { timeout: 15000 });
        await expect(page.getByTestId("selectGraph")).toContainText(graphOne, { timeout: 15000 });
        // The untouched tab the visitor already had takes the link — no leftover "New tab".
        await expect.poll(() => graph.getStripTabCount(), { timeout: 15000 }).toBe(1);

        // The address bar names the user's own tab, still carrying what it shows.
        await expect.poll(() => new URL(graph.getCurrentURL()).searchParams.get("tab"), { timeout: 15000 }).toBeTruthy();
        const params = new URL(graph.getCurrentURL()).searchParams;
        expect(params.get("graph")).toBe(graphOne);
        expect(params.get("query")).toBe("MATCH (n) RETURN n LIMIT 1");
    });

    test("A URL copied straight out of the address bar opens for someone else", async () => {
        // People share by copying the address bar, not by finding the link
        // button — and `?tab=` alone names an entry in the sender's storage.
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await graph.selectGraphByName(graphOne);
        await graph.waitForPageIdle();
        await expect.poll(() => new URL(graph.getCurrentURL()).searchParams.get("graph"), { timeout: 15000 }).toBe(graphOne);
        const copied = graph.getCurrentURL();

        const other = new BrowserWrapper();
        try {
            const otherGraph = await other.createNewPage(GraphPage, copied);
            const otherPage = await other.getPage();
            await otherGraph.waitForPageIdle();

            await expect(otherGraph.stripTab(graphOne)).toHaveAttribute("data-active", "true", { timeout: 15000 });
            await expect(otherPage.getByTestId("selectGraph")).toContainText(graphOne, { timeout: 15000 });
        } finally {
            await other.closeBrowser();
        }
    });

    test("Reloading keeps the tab as it is now, not the URL's snapshot of it", async () => {
        const graph = await browser.createNewPage(GraphPage, shareLink(graphOne, "MATCH (n) RETURN n LIMIT 1"));
        const page = await browser.getPage();
        await graph.waitForPageIdle();
        await expect.poll(() => new URL(graph.getCurrentURL()).searchParams.get("tab"), { timeout: 15000 }).toBeTruthy();

        // A stale query next to the user's own tab id must not win.
        const url = new URL(graph.getCurrentURL());
        url.searchParams.set("query", "MATCH (n) RETURN n LIMIT 9");
        await browser.navigateTo(url.toString());
        await graph.waitForPageIdle();

        await expect.poll(() => graph.getStripTabCount(), { timeout: 15000 }).toBe(1);
        await expect.poll(() => new URL(page.url()).searchParams.get("query"), { timeout: 15000 }).toBe("MATCH (n) RETURN n LIMIT 1");
    });

    test("A share link opens on a first visit instead of the tutorial", async () => {
        // The suite marks the tutorial as seen for every page. A real first
        // visit has not, and the tour would otherwise take over the page.
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        const page = await browser.getPage();
        await page.evaluate(() => localStorage.setItem("tutorial", "true"));

        await browser.navigateTo(shareLink(graphOne, "MATCH (n) RETURN n LIMIT 3"));
        await graph.waitForPageIdle();

        await expect(graph.stripTab(graphOne)).toHaveAttribute("data-active", "true", { timeout: 15000 });
        await expect(page.getByTestId("selectGraph")).toContainText(graphOne, { timeout: 15000 });
        await expect(page.getByTestId("skipTutorial")).toBeHidden();
        // Deferred, not skipped: the next regular visit still gets the tour.
        expect(await page.evaluate(() => localStorage.getItem("tutorial"))).toBe("true");
    });

    test("Opening a link to a tab you already have reuses it", async () => {
        const query = "MATCH (n) RETURN n LIMIT 2";
        const graph = await browser.createNewPage(GraphPage, shareLink(graphOne, query));
        await graph.waitForPageIdle();
        await expect.poll(() => graph.getStripTabCount(), { timeout: 15000 }).toBe(1);

        await browser.navigateTo(shareLink(graphOne, query));
        await graph.waitForPageIdle();

        await expect.poll(() => graph.getStripTabCount(), { timeout: 15000 }).toBe(1);
        await expect(graph.stripTab(graphOne)).toHaveAttribute("data-active", "true");
    });

    test("A share link shows its query but leaves running it to the user", async () => {
        test.setTimeout(60_000);

        // Distinctive enough to pick this query's requests out of the page's own.
        const marker = getRandomString("sharedmarker");
        const query = `MATCH (n) WHERE n.\`${marker}\` IS NULL RETURN n LIMIT 1`;
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const page = await browser.getPage();
        await graph.waitForPageIdle();

        const runs: string[] = [];
        // The share link's own page load (and every reload) carries the query
        // too — only a query request to the graph API counts as running it.
        page.on("request", (request) => {
            if (request.method() !== "GET") return;
            const url = new URL(request.url());
            if (!url.pathname.startsWith("/api/graph/")) return;
            if (url.searchParams.get("query")?.includes(marker)) runs.push(request.url());
        });

        await browser.navigateTo(shareLink(graphOne, query));
        await graph.waitForPageIdle();

        // The graph and the query are loaded…
        await expect(graph.stripTab(graphOne)).toHaveAttribute("data-active", "true", { timeout: 15000 });
        await expect(page.getByTestId("selectGraph")).toContainText(graphOne, { timeout: 15000 });
        await expect.poll(() => graph.getEditorInput(), { timeout: 15000 }).toBe(query);
        // …but nothing ran them.
        expect(runs).toHaveLength(0);

        // The tab is stored off a state update — reloading too eagerly would
        // race that write and test nothing.
        await expect
            .poll(() => page.evaluate(() => JSON.stringify(window.localStorage)), { timeout: 15000 })
            .toContain(marker);

        // A reload restores the tab without running it either.
        await graph.refreshPage();
        await graph.waitForPageIdle();
        await expect.poll(() => graph.getEditorInput(), { timeout: 15000 }).toBe(query);
        expect(runs).toHaveLength(0);

        // Running it is the user's call.
        await graph.clickRunQuery(false);
        await expect.poll(() => runs.length, { timeout: 15000 }).toBeGreaterThan(0);
    });

    test("A tab without a graph puts nothing to share on the URL", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await graph.waitForPageIdle();

        await expect.poll(() => new URL(graph.getCurrentURL()).searchParams.get("tab"), { timeout: 15000 }).toBeTruthy();
        expect(new URL(graph.getCurrentURL()).searchParams.get("graph")).toBeNull();
    });
});
