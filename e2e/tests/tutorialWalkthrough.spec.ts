import { expect, test } from "@playwright/test";
import urls from "../config/urls.json";
import BrowserWrapper from "../infra/ui/browserWrapper";
import TutorialPanel from "../logic/POM/tutorialPanelComponent";
import AppDownloadComponent from "../logic/POM/appDownloadComponent";
import ApiCalls from "../logic/api/apiCalls";
import { delay, getRandomString } from "../infra/utils";

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
            if (browser.getContext()) {
                const page = await browser.getPage();
                ownedTutorialGraphs = await page.evaluate(() => {
                    const ownerId = sessionStorage.getItem("tutorialDemoOwnerId");
                    if (!ownerId || !/^[a-zA-Z0-9-]+$/.test(ownerId)) return [];

                    const suffix = `tutorialDemoGraphOwnership:${ownerId}`;
                    const key = Object.keys(localStorage).find(name => name.endsWith(suffix));
                    if (!key) return [];

                    const stored = localStorage.getItem(key);
                    if (!stored) return [];

                    const ownership: unknown = JSON.parse(stored);
                    if (
                        typeof ownership !== "object" ||
                        ownership === null ||
                        !("scope" in ownership) ||
                        typeof ownership.scope !== "string" ||
                        !ownership.scope ||
                        key !== `${ownership.scope}${suffix}` ||
                        !("ownerId" in ownership) ||
                        ownership.ownerId !== ownerId ||
                        !("names" in ownership) ||
                        !Array.isArray(ownership.names)
                    ) {
                        throw new Error("Tutorial graph ownership is invalid; refusing broad test cleanup");
                    }

                    const names = ownership.names.filter((name): name is string =>
                        typeof name === "string" && /^tutorial-social-(?:demo|test)-[a-zA-Z0-9-]+$/.test(name));
                    if (names.length !== ownership.names.length) {
                        throw new Error("Tutorial graph ownership is invalid; refusing broad test cleanup");
                    }

                    return [...new Set(names)];
                });
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

        const demoNames: string[] = [];
        const countPeople = async () => {
            const page = await browser.getPage();
            const demoGraph = await page.evaluate(() => {
                const ownerId = sessionStorage.getItem("tutorialDemoOwnerId");
                if (!ownerId) throw new Error("Tutorial graph owner ID was not recorded");

                const suffix = `tutorialDemoGraphOwnership:${ownerId}`;
                const key = Object.keys(localStorage).find(name => name.endsWith(suffix));
                const stored = key ? localStorage.getItem(key) : null;
                if (!stored) throw new Error("Tutorial graph ownership was not recorded");

                const ownership: unknown = JSON.parse(stored);
                if (
                    typeof ownership !== "object" ||
                    ownership === null ||
                    !("names" in ownership) ||
                    !Array.isArray(ownership.names)
                ) {
                    throw new Error("Tutorial graph ownership is invalid");
                }

                const name = ownership.names.find((graph: unknown) =>
                    typeof graph === "string" && graph.startsWith("tutorial-social-demo-"));
                if (typeof name !== "string") throw new Error("Tutorial demo graph was not recorded");
                return name;
            });
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

            // Leaving mid-tutorial skips the cleanup, and the tutorial re-opens by
            // itself on the next load and loads the demo data again — which used to
            // stack another copy of the dataset on top of the old one (#2087).
            await tutorial.refreshPage();
            await tutorial.waitForStep("Welcome to FalkorDB Browser");
            expect(await countPeople()).toBe(9);
            expect(demoNames[1]).not.toBe(demoNames[0]);
            expect((await apiCall.getGraphs()).opts).not.toContain(demoNames[0]);
        } finally {
            await tutorial.skip();
        }
    });

    for (const [webLocks, ownRecord, failedCleanup] of [[true, false, false], [false, false, false], [true, true, false], [false, false, true]]) {
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
                    localStorage.setItem("tutorial", "false");
                    if (own) sessionStorage.setItem("tutorialDemoOwnerId", orphanOwnerId);
                    localStorage.setItem(`${scope}tutorialDemoGraphOwnership:${orphanOwnerId}`, JSON.stringify({
                        scope, ownerId: orphanOwnerId, names: [orphanName], lastActiveAt: Date.now() - 25 * 60 * 60 * 1000,
                    }));
                    localStorage.setItem(`${scope}tutorialDemoGraphOwnership:${recentOwnerId}`, JSON.stringify({
                        scope, ownerId: recentOwnerId, names: [recentName], lastActiveAt: locks ? Date.now() - 25 * 60 * 60 * 1000 : Date.now(),
                    }));
                }, { orphanOwnerId: orphanOwner, orphanName: orphan, recentOwnerId: recentOwner, recentName: recent, locks: webLocks, own: ownRecord });
                const cleanupUrl = `**/api/graph/${orphan}`;
                if (failedCleanup) {
                    await page.route(cleanupUrl, route => route.request().method() === "DELETE"
                        ? route.fulfill({ status: 503, json: { message: "Simulated tutorial cleanup failure" } })
                        : route.continue());
                }
                await page.goto(urls.graphUrl);
                if (failedCleanup) {
                    await expect(page.getByText("Tutorial cleanup failed", { exact: true })).toBeVisible();
                    expect((await apiCall.getGraphs()).opts).toContain(orphan);
                    const lastActiveAt = await page.evaluate(ownerId => {
                        const key = Object.keys(localStorage).find(name => name.endsWith(`tutorialDemoGraphOwnership:${ownerId}`));
                        if (!key) throw new Error("Failed cleanup lost its ownership record");
                        const timestamp: unknown = JSON.parse(localStorage.getItem(key)!).lastActiveAt;
                        if (typeof timestamp !== "number") throw new Error("Failed cleanup lost its ownership timestamp");
                        return timestamp;
                    }, orphanOwner);
                    expect(lastActiveAt).toBeLessThan(Date.now() - 24 * 60 * 60 * 1000);
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
                const { opts } = await apiCall.getGraphs();
                for (const name of [orphan, userNamedLikeDemo, recent]) {
                    if (opts.includes(name)) await apiCall.removeGraph(name, "admin");
                }
            }
        });
    }

    test("@admin the tutorial leaves user graphs named social-demo and social-demo-test untouched", async ({ browserName }) => {
        // These names are fixed, so every browser project would share them.
        test.skip(browserName !== "chromium", "Runs in one project to avoid sharing fixed graph names");
        test.setTimeout(120_000);

        const userGraphs = ["social-demo", "social-demo-test"];
        const { opts: existingGraphs } = await apiCall.getGraphs();
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
            for (const name of userGraphs) {
                await apiCall.removeGraph(name, "admin");
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
        const demoOptionId = await page.locator('[data-testid^="selectGraphtutorial-social-demo-"]').first().getAttribute("data-testid");
        if (!demoOptionId) throw new Error("Tutorial demo graph option was not found");
        const demoGraph = demoOptionId.replace(/^selectGraph/, "").replace(/Button$/, "");
        const demoSuffix = demoGraph.slice("tutorial-social-demo-".length);
        const activeDemoGraphs = [demoGraph, `tutorial-social-test-${demoSuffix}`];
        await tutorial.clickTutorialTarget('[data-testid^="selectGraphtutorial-social-demo-"]');

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
