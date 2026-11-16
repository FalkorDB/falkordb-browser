import { expect, test } from "@playwright/test";
import urls from "../config/urls.json";
import BrowserWrapper from "../infra/ui/browserWrapper";
import { readOwnedTutorialGraphs } from "../infra/tutorialGraphs";
import GraphPage from "../logic/POM/graphPage";
import ApiCalls from "../logic/api/apiCalls";
import { getRandomString } from "../infra/utils";
import TutorialPanel from "../logic/POM/tutorialPanelComponent";
import { INITIAL_TAB_ID, tabScopedKey } from "../../lib/graphTabs";

// The tab strip in the /graph sub-header. Each tab is an independent working
// context (graph, query, view, canvas state), so these tests assert both the
// strip mechanics and the isolation between contexts.
test.describe("@admin Graph tabs", () => {
    let browser: BrowserWrapper;
    let apiCall: ApiCalls;
    let graphOne: string;
    let graphTwo: string;
    // Graphs a test creates through the UI; deleted after the test so a cleanup
    // failure cannot mask the test's own error.
    const createdGraphs: string[] = [];

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
        // Tests that run the real tutorial own sample graphs; a failure before
        // Skip leaves them behind. Read them before closing, delete after (a
        // live page polls graph info and could recreate them).
        let tutorialGraphs: string[] = [];
        if (browser.getContext()?.pages().some(page => !page.isClosed())) {
            tutorialGraphs = await readOwnedTutorialGraphs(await browser.getPage()).catch(() => []);
        }
        await browser.closeBrowser();
        const results = await Promise.all(tutorialGraphs.map(graphName => apiCall.removeGraph(graphName, "admin")));
        // Skip normally deletes them already ("empty key").
        for (const { message } of results) {
            expect(message.includes("deleted") || message.includes("empty key"), message).toBe(true);
        }
    });

    test.afterEach(async () => {
        const names = createdGraphs.splice(0);
        const results = await Promise.all(names.map(graphName => apiCall.removeGraph(graphName, "admin")));
        for (const [index, result] of results.entries()) {
            expect(result.message).toBe(`${names[index]} graph deleted`);
        }
    });

    test("A fresh connection opens on a single blank tab", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await graph.waitForPageIdle();

        await expect.poll(() => graph.getStripTabCount(), { timeout: 15000 }).toBe(1);
        await expect(graph.stripTab("New tab")).toBeVisible();
    });

    test("A stalled graph list leaves desktop information accessible without enabling edits", async () => {
        test.setTimeout(60_000);
        await browser.createNewPage(GraphPage);
        const page = await browser.getPage();
        await page.setViewportSize({ width: 1400, height: 900 });
        let release!: () => void;
        const gate = new Promise<void>(resolve => { release = resolve; });
        let requested = false;
        await page.route("**/api/graph", async route => {
            requested = true;
            await gate;
            await route.fulfill({ json: { opts: [graphOne, graphTwo] } });
        });
        try {
            await page.goto(urls.graphUrl);
            await expect.poll(() => requested, { timeout: 15000 }).toBe(true);
            await expect(page.getByTestId("graphPage")).toHaveAttribute("aria-busy", "true");
            await expect(page.getByTestId("graphTabAdd")).toBeDisabled();
            await expect(page.getByTestId("uploadGraphToolbarTrigger")).toBeDisabled();
            await expect(page.getByTestId("editorContainer").locator("xpath=ancestor::*[@inert]")).toHaveCount(1);
            await page.getByTestId("graphInfoToggle").click();
            await expect(page.getByTestId("graphInfoPanel")).toBeVisible();
            await expect(page.getByTestId("createGraph")).toBeDisabled();
            await expect(page.getByTestId("graphPage")).toHaveAttribute("aria-busy", "true");
            release();
            await expect(page.getByTestId("graphTabAdd")).toBeEnabled({ timeout: 15000 });
            await expect(page.getByTestId("editorContainer").locator("xpath=ancestor::*[@inert]")).toHaveCount(0);
        } finally {
            release();
        }
    });

    test("A failed graph list request still unlocks the graph page", async () => {
        await browser.createNewPage(GraphPage);
        const page = await browser.getPage();
        let requests = 0;
        await page.route("**/api/graph", route => {
            requests += 1;
            return route.abort("connectionreset");
        });
        await page.goto(urls.graphUrl);
        await expect.poll(() => requests, { timeout: 15000 }).toBeGreaterThan(0);
        await expect(page.getByTestId("graphPage")).toHaveAttribute("data-graph-names-ready", "true");
        await expect(page.getByTestId("graphTabAdd")).toBeEnabled();
        await expect(page.getByTestId("editorContainer").locator("xpath=ancestor::*[@inert]")).toHaveCount(0);
    });

    test("A failed graph list keeps the saved tab's graph until a later list confirms it", async () => {
        test.setTimeout(60_000);
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
        // Page load can request the list more than once; fail every request
        // until the assertions below, or a later success confirms the graph.
        let failLists = true;
        let failedLists = 0;
        await page.route("**/api/graph", async route => {
            if (!failLists) {
                await route.continue();
                return;
            }
            failedLists += 1;
            await route.fulfill({ status: 200, contentType: "text/html", body: "<html>not a graph list</html>" });
        });
        // The empty selector is disabled, so recovery comes from the periodic refresh.
        await page.evaluate(() => localStorage.setItem("refreshInterval", "1"));
        const isRestoredQuery = (requestUrl: string) => {
            const url = new URL(requestUrl);
            return url.pathname === `/api/graph/${graphOne}`
                && url.searchParams.get("query")?.startsWith("MATCH (n) RETURN n") === true;
        };
        const restoredQueries: string[] = [];
        // Info and count polls run GRAPH.QUERY on a writable connection, which
        // would re-create the graph if it had been dropped.
        const graphPolls: string[] = [];
        page.on("request", request => {
            if (isRestoredQuery(request.url())) restoredQueries.push(request.url());
            const { pathname } = new URL(request.url());
            if (pathname === `/api/graph/${graphOne}` || pathname.startsWith(`/api/graph/${graphOne}/`)) graphPolls.push(request.url());
        });

        await page.reload({ waitUntil: "domcontentloaded" });
        await expect.poll(() => failedLists, { timeout: 15000 }).toBeGreaterThan(0);
        await expect(page.getByTestId("graphPage")).toHaveAttribute("data-graph-names-ready", "true");
        await expect(page.getByTestId("graphTabAdd")).toBeEnabled();
        await expect(graph.stripTab(graphOne)).toBeVisible();
        await expect(graph.editorContainer).toHaveAttribute("data-value", "MATCH (n) RETURN n");
        await graph.waitForPageIdle();
        expect(restoredQueries).toHaveLength(0);
        expect(graphPolls).toHaveLength(0);

        failLists = false;
        await expect(page.getByTestId("selectGraph")).toBeEnabled({ timeout: 15000 });
        await page.getByTestId("selectGraph").click();
        await expect(page.getByTestId(`selectGraph${graphOne}Button`)).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(graph.stripTab(graphOne)).toBeVisible();
        // The confirmed list releases the polls, but the held query stays held.
        await expect.poll(() => graphPolls.length, { timeout: 15000 }).toBeGreaterThan(0);
        expect(restoredQueries).toHaveLength(0);

        const restoredQuery = page.waitForRequest(request => isRestoredQuery(request.url()));
        await page.reload({ waitUntil: "domcontentloaded" });
        await restoredQuery;
        await expect(graph.stripTab(graphOne)).toBeVisible();
    });

    test("An empty graph list after a failed one drops the saved tab's graph", async () => {
        test.setTimeout(60_000);
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const page = await browser.getPage();
        await graph.selectGraphByName(graphOne);
        await graph.insertQuery("MATCH (n) RETURN n");
        await graph.clickRunQuery();
        await graph.waitForPageIdle();
        await expect.poll(() => new URL(page.url()).searchParams.get("tab"), { timeout: 15000 }).toBeTruthy();
        await expect.poll(() => new URL(page.url()).searchParams.get("tab"), { timeout: 15000 }).not.toBe("initial");
        // Fail every list on load, then answer as if the graph had been dropped.
        let listPhase: "fail" | "empty" = "fail";
        let failedLists = 0;
        await page.route("**/api/graph", async route => {
            if (listPhase === "empty") {
                await route.fulfill({ json: { opts: [] } });
                return;
            }
            failedLists += 1;
            await route.fulfill({ status: 200, contentType: "text/html", body: "<html>not a graph list</html>" });
        });
        // The empty selector is disabled, so the empty list comes from the periodic refresh.
        await page.evaluate(() => localStorage.setItem("refreshInterval", "1"));
        // Graph requests run GRAPH.QUERY on a writable connection and would
        // re-create a dropped graph — none may run for it, before or after the
        // empty list (which releases the unknown state before the selection clears).
        const graphRequests: string[] = [];
        page.on("request", request => {
            const { pathname } = new URL(request.url());
            if (pathname === `/api/graph/${graphOne}` || pathname.startsWith(`/api/graph/${graphOne}/`)) graphRequests.push(request.url());
        });

        await page.reload({ waitUntil: "domcontentloaded" });
        await expect.poll(() => failedLists, { timeout: 15000 }).toBeGreaterThan(0);
        await expect(page.getByTestId("graphPage")).toHaveAttribute("data-graph-names-ready", "true");
        await expect(page.getByTestId("selectGraph")).toContainText(graphOne);

        // The selector shows no graphs either way; the unchanged list must still
        // confirm that the saved graph is gone.
        listPhase = "empty";
        await expect(page.getByTestId("selectGraph")).not.toContainText(graphOne, { timeout: 15000 });
        await graph.waitForPageIdle();
        expect(graphRequests).toHaveLength(0);
    });

    test("Creating a graph after a failed graph list keeps another saved tab's graph", async () => {
        test.setTimeout(60_000);
        const createdGraph = getRandomString("unknowncreated");
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const page = await browser.getPage();
        await graph.selectGraphByName(graphOne);
        await graph.insertQuery("MATCH (n) RETURN n");
        await graph.clickRunQuery();
        await graph.waitForPageIdle();
        await expect.poll(() => new URL(page.url()).searchParams.get("tab"), { timeout: 15000 }).toBeTruthy();
        await expect.poll(() => new URL(page.url()).searchParams.get("tab"), { timeout: 15000 }).not.toBe("initial");
        const graphOneTab = new URL(page.url()).searchParams.get("tab");
        await graph.addStripTab();
        await expect.poll(() => new URL(page.url()).searchParams.get("tab"), { timeout: 15000 }).not.toBe(graphOneTab);
        let failedLists = 0;
        await page.route("**/api/graph", async route => {
            failedLists += 1;
            await route.fulfill({ status: 200, contentType: "text/html", body: "<html>not a graph list</html>" });
        });
        await page.route(`**/api/graph/${createdGraph}`, async route => {
            if (route.request().method() === "POST") createdGraphs.push(createdGraph);
            await route.continue();
        });

        await page.reload({ waitUntil: "domcontentloaded" });
        await expect.poll(() => failedLists, { timeout: 15000 }).toBeGreaterThan(0);
        await expect(page.getByTestId("graphPage")).toHaveAttribute("data-graph-names-ready", "true");
        await expect(graph.stripTab(graphOne)).toBeVisible();

        // The created graph is added to the list locally, which must not turn
        // it into a confirmed list that leaves graphOne out.
        await graph.create.click();
        await graph.insertInput.fill(createdGraph);
        await graph.createConfirm.click();
        await expect(page.getByTestId("toast-title").filter({ hasText: "Graph created successfully" })).toBeVisible();
        await expect(page.getByTestId("selectGraph")).toContainText(createdGraph);

        await graph.selectStripTab(graphOne);
        await expect(page.getByTestId("selectGraph")).toContainText(graphOne);
        await expect(graph.stripTab(graphOne)).toBeVisible();
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

    test("The user graph list deferred by the tutorial loads after Skip", async () => {
        test.setTimeout(60_000);
        const tutorial = await browser.createNewPage(TutorialPanel);
        const page = await browser.getPage();
        await page.addInitScript(() => localStorage.setItem("tutorial", "true"));
        // Lists pass while the tutorial prepares its samples; the ones after
        // Welcome are held to show the page waits for the user's list.
        let holdLists = false;
        let heldLists = 0;
        let releaseLists!: () => void;
        const listGate = new Promise<void>(resolve => { releaseLists = resolve; });
        await page.route("**/api/graph", async route => {
            if (holdLists) {
                heldLists += 1;
                await listGate;
            }
            await route.continue();
        });
        try {
            await page.goto(urls.graphUrl);
            await tutorial.waitForStep("Welcome to FalkorDB Browser", 30000);
            await expect(page.getByTestId("graphPage")).toHaveAttribute("data-graph-names-ready", "false");
            holdLists = true;
            // Skip's own cleanup lists graphs too, so the tour only closes once released.
            await page.getByTestId("skipTutorial").click();
            await expect.poll(() => heldLists, { timeout: 15000 }).toBeGreaterThan(0);
            await expect(page.getByTestId("graphPage")).toHaveAttribute("data-graph-names-ready", "false");
            releaseLists();
            await expect(page.getByTestId("tutorialSpotlight")).toBeHidden({ timeout: 15000 });
            await expect(page.getByTestId("graphPage")).toHaveAttribute("data-graph-names-ready", "true", { timeout: 15000 });
            await expect(page.getByTestId("graphTabAdd")).toBeEnabled();
            await page.getByTestId("selectGraph").click();
            await expect(page.getByTestId(`selectGraph${graphOne}Button`)).toBeVisible();
            await page.keyboard.press("Escape");
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

    test("A graph created during same-connection discovery is selected after bootstrap", async () => {
        test.setTimeout(60_000);
        const createdGraph = getRandomString("bootstrapcreated");
        const graph = await browser.createNewPage(GraphPage);
        const page = await browser.getPage();
        await page.setViewportSize({ width: 1400, height: 900 });
        const session = await (await page.request.get(`${urls.localHost}/api/auth/session`)).json();
        const { connections } = await (await page.request.get(`${urls.localHost}/api/connections`)).json();
        const connection = connections.find((candidate: { id: string }) => candidate.id === session.activeConnectionId);
        expect(connection).toBeTruthy();
        let releaseDiscovery!: () => void;
        const discoveryGate = new Promise<void>(resolve => { releaseDiscovery = resolve; });
        let releaseCreate!: () => void;
        const createGate = new Promise<void>(resolve => { releaseCreate = resolve; });
        let syncCompleted = false;
        let createStarted = false;
        let initialConnectionHeader: string | undefined;
        await page.route("**/api/connections", async route => {
            await discoveryGate;
            await route.fulfill({ json: { connections: [connection] } });
        });
        await page.route("**/api/auth/session", async route => {
            if (route.request().method() === "POST") syncCompleted = true;
            await route.fulfill({ json: session });
        });
        await page.route("**/api/graph", route => route.fulfill({ json: { opts: [graphOne, graphTwo] } }));
        await page.route(`**/api/graph/${createdGraph}`, async route => {
            if (route.request().method() !== "POST") {
                await route.continue();
                return;
            }
            initialConnectionHeader = route.request().headers()["x-connection-id"];
            createStarted = true;
            createdGraphs.push(createdGraph);
            await createGate;
            await route.continue();
        });
        try {
            await page.goto(urls.graphUrl);
            await expect(page.getByTestId("graphTabAdd")).toBeEnabled({ timeout: 15000 });
            await graph.create.click();
            await graph.insertInput.fill(createdGraph);
            await graph.createConfirm.click();
            await expect.poll(() => createStarted).toBe(true);
            expect(initialConnectionHeader).toBeUndefined();
            releaseDiscovery();
            await expect.poll(() => syncCompleted, { timeout: 15000 }).toBe(true);
            releaseCreate();
            await expect(graph.stripTab(createdGraph)).toBeVisible();
            await expect(page.getByTestId("toast-title").filter({ hasText: "Graph created successfully" })).toBeVisible();
        } finally {
            releaseDiscovery();
            releaseCreate();
        }
    });

    test("A graph created during same-connection timeout restoration stays selected over the saved tab", async () => {
        test.setTimeout(60_000);
        const createdGraph = getRandomString("restorationcreated");
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const page = await browser.getPage();
        await page.setViewportSize({ width: 1400, height: 900 });
        await graph.selectGraphByName(graphOne);
        await graph.insertQuery("MATCH (n) RETURN n");
        await graph.clickRunQuery();
        await graph.waitForPageIdle();
        await expect.poll(() => new URL(page.url()).searchParams.get("tab"), { timeout: 15000 }).toBeTruthy();
        await expect.poll(() => new URL(page.url()).searchParams.get("tab"), { timeout: 15000 }).not.toBe("initial");
        const session = await (await page.request.get(`${urls.localHost}/api/auth/session`)).json();
        let releaseCreate!: () => void;
        const createGate = new Promise<void>(resolve => { releaseCreate = resolve; });
        let releaseConfig!: () => void;
        const configGate = new Promise<void>(resolve => { releaseConfig = resolve; });
        let createStarted = false;
        let configRequested = false;
        await page.route(`**/api/graph/${createdGraph}`, async route => {
            if (route.request().method() !== "POST") {
                await route.continue();
                return;
            }
            createStarted = true;
            createdGraphs.push(createdGraph);
            await createGate;
            await route.continue();
        });
        try {
            await graph.create.click();
            await graph.insertInput.fill(createdGraph);
            await graph.createConfirm.click();
            await expect.poll(() => createStarted).toBe(true);

            await page.evaluate(() => localStorage.removeItem("timeout"));
            // Only the held config may restore readiness, not the production deadline.
            await page.evaluate(() => {
                const timeout = AbortSignal.timeout.bind(AbortSignal);
                AbortSignal.timeout = milliseconds => timeout(milliseconds === 5000 ? 60000 : milliseconds);
            });
            await page.route("**/api/graph/config", async route => {
                configRequested = true;
                await configGate;
                await route.fulfill({ json: { configs: [["TIMEOUT_MAX", 12000]] } });
            });
            await page.route("**/api/auth/session", route => route.fulfill({
                json: { ...session, user: { ...session.user, id: `${session.user.id}-restoration` } },
            }));
            await page.evaluate(() => {
                const channel = new BroadcastChannel("next-auth");
                channel.postMessage({ event: "session", data: { trigger: "getSession" } });
                channel.close();
            });
            await expect.poll(() => configRequested, { timeout: 15000 }).toBe(true);
            await expect(page.getByTestId("graphPage")).toHaveAttribute("aria-busy", "true");

            const created = page.waitForResponse(response =>
                new URL(response.url()).pathname === `/api/graph/${createdGraph}` && response.request().method() === "POST",
            );
            releaseCreate();
            expect((await created).ok()).toBe(true);
            // Let the page settle the creation while readiness is still lost.
            await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
            await expect(page.getByTestId("graphPage")).toHaveAttribute("aria-busy", "true");
            releaseConfig();

            await expect(page.getByTestId("graphPage")).toHaveAttribute("aria-busy", "false");
            await expect(page.getByTestId("toast-title").filter({ hasText: "Graph created successfully" })).toBeVisible();
            await expect(graph.stripTab(createdGraph)).toBeVisible();
            await expect(graph.stripTab(graphOne)).toHaveCount(0);
        } finally {
            releaseCreate();
            releaseConfig();
        }
    });

    test("Delayed same-connection discovery preserves tutorial selector demos", async () => {
        test.setTimeout(90_000);
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
        let discoveryRequested = false;
        let syncCompleted = false;
        await page.route("**/api/connections", async route => {
            discoveryRequested = true;
            await discoveryGate;
            await route.fulfill({ json: { connections: [connection] } });
        });
        await page.route("**/api/auth/session", async route => {
            if (route.request().method() === "POST") syncCompleted = true;
            await route.fulfill({ json: session });
        });
        const demoOptions = page.locator('[data-testid^="selectGraphtutorial-social-"][data-testid$="Button"]');
        try {
            await page.goto(urls.graphUrl);
            // The tutorial creates its samples only on the discovered connection.
            await expect.poll(() => discoveryRequested, { timeout: 15000 }).toBe(true);
            releaseDiscovery();
            await expect.poll(() => syncCompleted, { timeout: 15000 }).toBe(true);
            await tutorial.waitForStep("Welcome to FalkorDB Browser", 30000);
            await tutorial.clickNextButton();
            await tutorial.waitForStep("Select a Graph", 15000);
            await tutorial.clickTutorialTarget('[data-testid="selectGraph"]');
            await expect(demoOptions).toHaveCount(2);
            await page.waitForLoadState("networkidle");
            await expect(demoOptions).toHaveCount(2);
            await expect(page.getByTestId("graphTabAdd")).toBeEnabled();
            await page.keyboard.press("Escape");
            await tutorial.skip();
        } finally {
            releaseDiscovery();
        }
    });

    for (const portal of ["maximized editor", "toolbar delete", "create graph", "creating graph", "create completes during restoration", "manage graphs"] as const) {
    test(`Delayed connection discovery closes the ${portal} when readiness is lost`, async () => {
        test.setTimeout(60_000);
        const graph = await browser.createNewPage(GraphPage);
        const page = await browser.getPage();
        await page.setViewportSize({ width: 1400, height: 900 });
        const session = await (await page.request.get(`${urls.localHost}/api/auth/session`)).json();
        const { connections } = await (await page.request.get(`${urls.localHost}/api/connections`)).json();
        expect(connections[0]?.id).toBeTruthy();
        let releaseDiscovery!: () => void;
        const discoveryGate = new Promise<void>(resolve => { releaseDiscovery = resolve; });
        let releaseLists!: () => void;
        const listGate = new Promise<void>(resolve => { releaseLists = resolve; });
        let releaseCreate!: () => void;
        const createGate = new Promise<void>(resolve => { releaseCreate = resolve; });
        let createRequests = 0;
        let createResponded = false;
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
        await page.route("**/api/graph/unsaved-readiness-graph", async route => {
            if (route.request().method() !== "POST") {
                await route.continue();
                return;
            }
            createRequests += 1;
            await createGate;
            await route.fulfill({ json: {} });
            createResponded = true;
        });
        try {
            await page.goto(urls.graphUrl);
            await expect(page.getByTestId("graphTabAdd")).toBeEnabled({ timeout: 15000 });
            await graph.selectGraphByName(graphOne);
            await graph.insertQuery("RETURN 1");
            if (portal === "maximized editor") {
                await page.getByTestId("editorMaximize").click();
                await expect(page.getByTestId("editorMinimize")).toBeVisible();
            } else if (portal === "toolbar delete") {
                await graph.insertQuery("CREATE (n:Readiness {name: 'readiness'}) RETURN n");
                await graph.clickRunQuery();
                await graph.searchElementInCanvas("readiness");
                await page.getByTestId("deleteElementGraph").click();
                await expect(page.getByTestId("deleteElementConfirmGraph")).toBeVisible();
            } else if (portal === "create graph" || portal === "creating graph" || portal === "create completes during restoration") {
                await graph.create.click();
                await graph.insertInput.fill("unsaved-readiness-graph");
                await expect(graph.createConfirm).toBeVisible();
                if (portal !== "create graph") {
                    await graph.createConfirm.click();
                    await expect.poll(() => createRequests).toBe(1);
                }
            } else {
                await graph.select().click();
                await graph.manage.click();
                await expect(graph.manageContent).toBeVisible();
            }
            releaseDiscovery();
            await expect.poll(() => syncCompleted, { timeout: 15000 }).toBe(true);
            await expect.poll(() => replacementLists, { timeout: 15000 }).toBeGreaterThan(0);
            await expect(page.getByTestId("graphPage")).toHaveAttribute("data-graph-names-ready", "false");
            await expect(page.getByTestId("graphTabAdd")).toBeDisabled();
            await expect(page.getByTestId("editorMinimize")).toHaveCount(0);
            await expect(page.getByTestId("deleteElementConfirmGraph")).toHaveCount(0);
            await expect(graph.createConfirm).toHaveCount(0);
            await expect(graph.manageContent).toHaveCount(0);
            await expect(graph.create).toBeDisabled();
            await expect(graph.select()).toBeDisabled();
            await expect(page.getByTestId("editorRun")).toBeDisabled();
            await expect(page.getByTestId("editorRun")).toHaveAttribute("aria-label", "Restoring graph tabs");
            if (portal === "create completes during restoration") {
                releaseCreate();
                await expect.poll(() => createResponded).toBe(true);
                await expect(graph.stripTab("unsaved-readiness-graph")).toHaveCount(0);
            }
            releaseLists();
            await expect(page.getByTestId("graphPage")).toHaveAttribute("data-graph-names-ready", "true");
            await expect(page.getByTestId("graphTabAdd")).toBeEnabled();
            await expect(graph.manageContent).toHaveCount(0);
            if (portal === "creating graph") {
                await expect(graph.createConfirm).toBeDisabled();
                expect(createRequests).toBe(1);
                releaseCreate();
                await expect(graph.createConfirm).toHaveCount(0);
            } else {
                await expect(graph.createConfirm).toHaveCount(0);
            }
            if (portal === "create graph") {
                await graph.create.click();
                await expect(graph.insertInput).toHaveValue("");
            } else if (portal === "manage graphs") {
                await graph.select().click();
                await graph.manage.click();
                await expect(graph.manageContent).toBeVisible();
            }
        } finally {
            releaseDiscovery();
            releaseLists();
            releaseCreate();
        }
    });
    }

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

    test("A graph auto-selected before settings load still runs the default query", async () => {
        test.setTimeout(60_000);
        browser = new BrowserWrapper({ seedTimeout: false });
        await browser.createNewPage(GraphPage);
        const page = await browser.getPage();
        const defaultQuery = `MATCH (n) RETURN n LIMIT ${Date.now() % 1000 + 1}`;
        await page.addInitScript((query) => {
            localStorage.removeItem("timeout");
            localStorage.setItem("runDefaultQuery", "true");
            localStorage.setItem("defaultQuery", query);
        }, defaultQuery);
        // A single-graph list auto-selects it while settings, which load with
        // the timeout, are still held behind the config fetch.
        await page.route("**/api/graph", route => (route.request().method() === "GET"
            ? route.fulfill({ json: { opts: [graphOne] } })
            : route.continue()));
        let releaseConfig!: () => void;
        const configGate = new Promise<void>(resolve => { releaseConfig = resolve; });
        let configRequested = false;
        await page.route("**/api/graph/config", async route => {
            configRequested = true;
            await configGate;
            await route.continue();
        });
        try {
            await page.goto(urls.graphUrl);
            await expect.poll(() => configRequested, { timeout: 15000 }).toBe(true);
            await expect(page.getByTestId("graphPage")).toHaveAttribute("data-graph-names-ready", "true", { timeout: 15000 });
            // Created here, not before goto, so an earlier failure leaves no
            // unawaited wait to reject later. The default query cannot run
            // before the config (and with it the timeout) is released.
            const defaultRun = page.waitForRequest(request => {
                const url = new URL(request.url());
                return url.pathname === `/api/graph/${graphOne}` && url.searchParams.get("query") === defaultQuery;
            }, { timeout: 15000 });
            releaseConfig();
            await defaultRun;
        } finally {
            releaseConfig();
        }
    });

    test("The mobile toolbar keeps panels usable while tab actions wait for timeout restoration", async () => {
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
        await page.route("**/api/graph", route => route.fulfill({ json: { opts: [graphOne] } }));
        await page.addInitScript(key => {
            localStorage.setItem(key, JSON.stringify({
                version: 2,
                messages: [
                    { role: "user", type: "Text", content: "Show one result" },
                    { role: "assistant", type: "CypherQuery", content: "RETURN 1" },
                ],
            }));
        }, `localhost:6379:default:${tabScopedKey(INITIAL_TAB_ID, `chat-${graphOne}`)}`);
        await page.addInitScript(() => {
            const timeout = AbortSignal.timeout.bind(AbortSignal);
            AbortSignal.timeout = milliseconds => timeout(milliseconds === 5000 ? 60000 : milliseconds);
        });
        try {
            await page.goto(urls.graphUrl);
            await expect(page.getByTestId("mobileSelectorToolbar")).toHaveAttribute("aria-busy", "true", { timeout: 15000 });
            await expect(page.getByTestId("selectorMore")).toBeDisabled();
            const info = page.getByTestId("graphInfoToggle");
            await info.focus();
            await expect(info).toBeFocused();
            await page.keyboard.press("Enter");
            await expect(page.getByTestId("graphInfoPanel")).toBeVisible();
            await expect(info).toHaveAttribute("aria-pressed", "true");
            await expect(page.getByTestId("graphInfoAllNodes")).toBeDisabled();
            await expect(page.getByTestId("createGraph")).toBeDisabled();
            await page.getByTestId("graphInfoPanel").getByRole("button", { name: "Close", exact: true }).click();
            await expect(page.getByTestId("mobileGraphInfoSheet")).toHaveAttribute("data-state", "closed");
            const chat = page.getByTestId("chatToggleButton");
            await expect(chat).toBeEnabled();
            await chat.click();
            await expect(page.getByTestId("chatPanel")).toBeVisible();
            await expect(chat).toHaveAttribute("aria-pressed", "true");
            await expect(page.getByTestId("chatInsertQueryButton")).toBeDisabled();
            await expect(page.getByTestId("chatCopyQueryButton")).toBeEnabled();
            await page.getByTestId("chatInput").fill("Draft during restoration");
            await expect(page.getByTestId("chatInput")).toHaveValue("Draft during restoration");
            await page.getByTestId("cypherOnlySwitch").click();
            await expect(page.getByTestId("cypherOnlySwitch")).toHaveAttribute("aria-pressed", "true");
            await expect(page.getByTestId("mobileSelectorToolbar")).toHaveAttribute("aria-busy", "true");
            await expect(page.getByTestId("selectorMore")).toBeDisabled();
            await page.getByTestId("chatCloseButton").click();
            await expect(page.getByTestId("mobileChatSheet")).toHaveAttribute("data-state", "closed");
            release();
            await expect(page.getByTestId("selectorMore")).toBeEnabled({ timeout: 15000 });
            await expect(page.getByTestId("mobileSelectorToolbar")).toHaveAttribute("aria-busy", "false");
            await page.getByTestId("selectorMore").click();
            await expect(page.getByTestId("uploadGraphToolbarTrigger")).toBeVisible();
        } finally {
            release();
        }
    });

    test("A mobile overflow menu stays closed after connection readiness returns", async () => {
        test.setTimeout(60_000);
        await browser.createNewPage(GraphPage);
        const page = await browser.getPage();
        await page.setViewportSize({ width: 900, height: 900 });
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
            await expect(page.getByTestId("selectorMore")).toBeEnabled({ timeout: 15000 });
            await page.getByTestId("selectorMore").click();
            await expect(page.getByTestId("uploadGraphToolbarTrigger")).toBeVisible();
            releaseDiscovery();
            await expect.poll(() => syncCompleted, { timeout: 15000 }).toBe(true);
            await expect.poll(() => replacementLists, { timeout: 15000 }).toBeGreaterThan(0);
            await expect(page.getByTestId("selectorMore")).toBeDisabled();
            await expect(page.getByTestId("uploadGraphToolbarTrigger")).toBeHidden();
            releaseLists();
            await expect(page.getByTestId("selectorMore")).toBeEnabled({ timeout: 15000 });
            await expect(page.getByTestId("selectorMore")).toHaveAttribute("aria-expanded", "false");
            await expect(page.getByTestId("uploadGraphToolbarTrigger")).toBeHidden();
            await page.getByTestId("selectorMore").click();
            await expect(page.getByTestId("uploadGraphToolbarTrigger")).toBeVisible();
        } finally {
            releaseDiscovery();
            releaseLists();
        }
    });

    for (const panel of ["data", "data-editor", "data-add", "create"]) {
        test(`A mobile ${panel} sheet can close while restoration blocks editing`, async () => {
            test.setTimeout(60_000);
            const create = panel === "create";
            await apiCall.runQuery(graphOne, "MERGE (:RestorationClose {name: 'close-control'})");
            const graph = await browser.createNewPage(TutorialPanel, urls.graphUrl);
            const page = await browser.getPage();
            await graph.selectGraphByName(graphOne);
            await graph.insertQuery("MATCH (n) RETURN n");
            await graph.clickRunQuery();
            await graph.waitForPageIdle();
            if (create) {
                await page.getByTestId("elementCanvasAddNodeGraph").click();
            } else {
                expect(await graph.clickCanvasUntilDataPanel()).toBe(true);
            }
            await page.setViewportSize({ width: 900, height: 900 });
            const sheet = page.getByTestId("mobileDataSheet");
            await expect(sheet).toHaveAttribute("data-state", "open");
            if (create) {
                await expect(sheet.getByRole("button", { name: "Add a new node to the graph", exact: true })).toBeEnabled();
                await sheet.getByRole("button", { name: "Add a new label", exact: true }).click();
            } else if (panel === "data-editor") {
                await page.getByTestId("DataPanelSetAttribute").click();
                await expect(page.getByTestId("DataPanelSetAttributeConfirm")).toBeVisible();
            } else if (panel === "data-add") {
                await page.getByTestId("DataPanelAddAttribute").click();
                await page.getByTestId("DataPanelAddAttributeKey").fill("discardedDraft");
                await sheet.getByTestId("selectType").click();
                await page.getByTestId("selectTypeinteger").click();
                await page.getByTestId("DataPanelAddAttributeValue").fill("42");
            } else {
                await expect(page.getByTestId("DataPanelSetAttribute")).toBeVisible();
                await page.getByTestId("DataPanelAddLabel").click();
            }
            if (panel === "data" || create) await expect(page.getByRole("dialog")).toBeVisible();
            const session = await (await page.request.get(`${urls.localHost}/api/auth/session`)).json();
            await page.evaluate(() => localStorage.removeItem("timeout"));
            // Only the held config may restore readiness, not the production deadline.
            await page.evaluate(() => {
                const timeout = AbortSignal.timeout.bind(AbortSignal);
                AbortSignal.timeout = milliseconds => timeout(milliseconds === 5000 ? 60000 : milliseconds);
            });
            let release!: () => void;
            const gate = new Promise<void>(resolve => { release = resolve; });
            let configRequested = false;
            await page.route("**/api/graph/config", async route => {
                configRequested = true;
                await gate;
                await route.fulfill({ json: { configs: [["TIMEOUT_MAX", 12000]] } });
            });
            await page.route("**/api/auth/session", route => route.fulfill({
                json: { ...session, user: { ...session.user, id: `${session.user.id}-restoration` } },
            }));
            try {
                await page.evaluate(() => {
                    const channel = new BroadcastChannel("next-auth");
                    channel.postMessage({ event: "session", data: { trigger: "getSession" } });
                    channel.close();
                });
                await expect.poll(() => configRequested, { timeout: 15000 }).toBe(true);
                await expect(page.getByTestId("graphPage")).toHaveAttribute("aria-busy", "true");
                await expect(page.getByRole("dialog")).toHaveCount(0);
                const close = create ? sheet.getByRole("button", { name: "Close", exact: true }) : page.getByTestId("DataPanelClose");
                await close.focus();
                await expect(close).toBeFocused();
                if (create) {
                    await expect(sheet.getByRole("button", { name: "Add a new node to the graph", exact: true })).toBeDisabled();
                } else {
                    await expect(page.getByTestId("DataPanelSetAttribute")).toHaveCount(0);
                    await expect(page.getByTestId("DataPanelSetAttributeConfirm")).toHaveCount(0);
                    await expect(page.getByTestId("DataPanelAddAttribute")).toHaveCount(0);
                    await expect(page.getByTestId("DataPanelAddLabel")).toHaveCount(0);
                    await expect(page.getByTestId("DataPanelAttributeclose-control")).toBeVisible();
                }
                if (panel !== "data-add") {
                    await close.click();
                    await expect(sheet).toHaveAttribute("data-state", "closed");
                    await expect(page.getByTestId("graphPage")).toHaveAttribute("aria-busy", "true");
                }
                release();
                await expect(page.getByTestId("graphPage")).toHaveAttribute("aria-busy", "false");
                if (panel === "data-add") {
                    await expect(page.getByTestId("DataPanelAddAttributeKey")).toHaveCount(0);
                    await page.getByTestId("DataPanelAddAttribute").click();
                    await expect(page.getByTestId("DataPanelAddAttributeKey")).toHaveValue("");
                    await expect(page.getByTestId("DataPanelAddAttributeValue")).toHaveValue("");
                    await expect(sheet.getByTestId("selectType")).toHaveText("string");
                    await close.click();
                    await expect(sheet).toHaveAttribute("data-state", "closed");
                }
            } finally {
                release();
            }
        });
    }

    test("The tutorial strip stays interactive before the user graph list loads", async () => {
        test.setTimeout(60_000);
        const tutorial = await browser.createNewPage(TutorialPanel, urls.graphUrl);
        const page = await browser.getPage();
        await expect(page.getByTestId("graphTabAdd")).toBeEnabled({ timeout: 15000 });
        await tutorial.changeLocalStorage("true");
        await page.reload();
        await tutorial.waitForStep("Welcome to FalkorDB Browser", 30000);
        // The tutorial defers the user's graph list until it closes.
        await expect(page.getByTestId("graphPage")).toHaveAttribute("data-graph-names-ready", "false");
        await expect(page.getByTestId("graphTabAdd")).toBeEnabled();
        await tutorial.skip();
        await expect(page.getByTestId("graphPage")).toHaveAttribute("data-graph-names-ready", "true", { timeout: 15000 });
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
        // The add button stays disabled until the tabs are ready; the loop's isDisabled() check does not wait.
        await expect(graph.addTabButton).toBeEnabled({ timeout: 15000 });

        // Read the limit actually in force instead of assuming the default, so
        // the assertion below can be exact. Mirrors clampMaxTabs (lib/graphTabs).
        const limit = await page.evaluate(() => {
            const stored = Number(window.localStorage.getItem("maxTabs"));
            return Number.isFinite(stored) && stored > 0 ? Math.min(10, Math.max(4, Math.round(stored))) : 8;
        });

        for (let i = 0; i < limit + 2; i += 1) {
            if (await graph.addTabButton.isDisabled()) break;
            await graph.addStripTab();
        }

        await expect.poll(() => graph.getStripTabCount(), { timeout: 15000 }).toBe(limit);
        await expect(graph.addTabButton).toBeDisabled();
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
