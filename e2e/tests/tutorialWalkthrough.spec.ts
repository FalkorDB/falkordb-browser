import { expect, test } from "@playwright/test";
import urls from "../config/urls.json";
import BrowserWrapper from "../infra/ui/browserWrapper";
import TutorialPanel from "../logic/POM/tutorialPanelComponent";
import ApiCalls from "../logic/api/apiCalls";
import { getRandomString } from "../infra/utils";

/*
 * Full tutorial walkthrough test.
 *
 * Walks through every tutorial step from the first to the last, interacting
 * with each step that requires user action (advanceOn).  After the tutorial
 * finishes, verifies that the demo graphs have been cleaned up and the user's
 * original graphs are restored.
 */

test.describe("Tutorial Walkthrough", () => {
    let browser: BrowserWrapper;
    let apiCall: ApiCalls;
    const userGraph = getRandomString("tutorialTest");
    const tabName = getRandomString("tutorialTab");

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
        apiCall = new ApiCalls();
    });

    test.afterEach(async () => {
        // Cleanup: remove the user graph if it still exists
        try {
            await apiCall.removeGraph(userGraph);
        } catch {
            // Ignore if already removed
        }
        await browser.closeBrowser();
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

        // 2. Start the tutorial by setting localStorage and refreshing
        await tutorial.changeLocalStorage("true");
        await tutorial.refreshPage();
        await tutorial.waitForTimeout(2000);

        // Step 0: "Preparing Tutorial..." — auto-advances after loading demo graphs
        // Step 1: "Welcome to FalkorDB Browser" — has Next button (no advanceOn)
        await tutorial.waitForStep("Welcome to FalkorDB Browser");
        expect(await tutorial.isTutorialVisible()).toBeTruthy();
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

        // Step 6: "Select a Demo Graph" — advanceOn: "click" on selectGraphsocial-demoButton
        await tutorial.waitForStep("Select a Demo Graph");
        await tutorial.clickTutorialTarget('[data-testid="selectGraphsocial-demoButton"]');

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

        // Step 25: "View Node / Edge Details" — advanceOn: "contextmenu", with advanceCondition
        // Right-click on an actual node so the DataPanel opens reliably.
        await tutorial.waitForStep("View Node / Edge Details");
        const hit = await tutorial.rightClickCanvasUntilDataPanel();
        expect(hit, "Right-click fallback: DataPanel never appeared after exhausting all canvas node positions").toBeTruthy();

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

        // Step 31: "Query History" — advanceOn: "click" on queryHistory
        await tutorial.waitForStep("Query History");
        await tutorial.clickTutorialTarget('[data-testid="queryHistory"]');

        // Step 32: "Query History Window" — no advanceOn, has Next button
        await tutorial.waitForStep("Query History Window");
        await tutorial.clickNextButton();

        // Step 33: "Close Query History Window" — advanceOn: "click" on queryHistoryCloseButton
        await tutorial.waitForStep("Close Query History Window");
        await tutorial.clickTutorialTarget('[data-testid="queryHistoryCloseButton"]');

        // Track 4: Layouts and canvas actions

        // Step 34: "Graph View" — advanceOn: "mousedown" on graphTab
        await tutorial.waitForStep("Graph View");
        await tutorial.clickTutorialTarget('[data-testid="graphTab"]');

        // Step 35: "Open Layout Dropdown" — advanceOn: "click" on layoutControl
        await tutorial.waitForStep("Open Layout Dropdown");
        await tutorial.clickTutorialTarget('[data-testid="layoutControl"]');

        // Step 36: "Hover Tree" — advanceOn: "pointermove" on layoutTreeSub, advanceCondition checks sub-content
        await tutorial.waitForStep("Hover Tree");
        await tutorial.hoverTutorialTarget(
            '[data-testid="layoutTreeSub"]',
            "Select Tree Direction",
            '[data-testid="layoutTreeDirection-td"]'
        );

        // Step 37: "Select Tree Direction" — advanceOn: "click" on layoutTreeDirection-td, passthrough
        await tutorial.waitForStep("Select Tree Direction");
        await tutorial.clickTutorialTarget('[data-testid="layoutTreeDirection-td"]');

        // Step 38: "Tree Layout Active" — no advanceOn, has Next button
        await tutorial.waitForStep("Tree Layout Active");
        await tutorial.waitForTimeout(1000);
        await tutorial.clickNextButton();

        // Step 39: "Open Layout Dropdown" (again) — advanceOn: "click" on layoutControl
        await tutorial.waitForStep("Open Layout Dropdown");
        await tutorial.clickTutorialTarget('[data-testid="layoutControl"]');

        // Step 40: "Hover Radial" — advanceOn: "pointermove" on layoutRadialSub, advanceCondition checks sub-content
        await tutorial.waitForStep("Hover Radial");
        await tutorial.hoverTutorialTarget(
            '[data-testid="layoutRadialSub"]',
            "Select Radial Direction",
            '[data-testid="layoutRadialDirection-out"]'
        );

        // Step 41: "Select Radial Direction" — advanceOn: "click" on layoutRadialDirection-out, passthrough
        await tutorial.waitForStep("Select Radial Direction");
        await tutorial.clickTutorialTarget('[data-testid="layoutRadialDirection-out"]');

        // Step 42: "Radial Layout Active" — no advanceOn, has Next button
        await tutorial.waitForStep("Radial Layout Active");
        await tutorial.waitForTimeout(1000);
        await tutorial.clickNextButton();

        // Step 43: "Animation Control" — no advanceOn, has Next button.
        // The radial layout is active here, so animation auto-pins and the
        // control must be disabled (animationDisabled = pinned || layout !== 'force').
        await tutorial.waitForStep("Animation Control");
        await expect(tutorial.animationControl).toBeVisible();
        await expect(tutorial.animationControl).toBeDisabled();
        await tutorial.clickNextButton();

        // Step 44: "Pin on Drag" — no advanceOn, has Next button.
        await tutorial.waitForStep("Pin on Drag");
        await expect(tutorial.pinControl).toBeVisible();
        await tutorial.clickNextButton();

        // Step 45: "Zoom Controls" — no advanceOn, has Next button
        await tutorial.waitForStep("Zoom Controls");
        await tutorial.clickNextButton();

        // Track 5: Graph tabs

        // Step 46: "Graph Tabs" — no advanceOn, has Next button
        await tutorial.waitForStep("Graph Tabs");
        await expect(tutorial.tabStrip).toBeVisible();
        const tabsBefore = await tutorial.getStripTabCount();
        await tutorial.clickNextButton();

        // Step 47: "Open a New Tab" — advanceOn: "click" on graphTabAdd
        await tutorial.waitForStep("Open a New Tab");
        await tutorial.clickTutorialTarget('[data-testid="graphTabAdd"]');
        expect(await tutorial.getStripTabCount()).toBe(tabsBefore + 1);

        // Step 48: "Rename a Tab" — advanceOn: "click" on the active tab's rename trigger
        await tutorial.waitForStep("Rename a Tab");
        await tutorial.clickTutorialTarget(
            '[data-testid="graphSubHeader"] > div[data-active="true"] [data-testid^="graphTabRenameTrigger-"]'
        );

        // Step 49: "Name Your Tab" — no advanceOn; typing commits when the box loses focus
        await tutorial.waitForStep("Name Your Tab");
        await tutorial.typeTabName(tabName);
        await tutorial.clickNextButton();
        await expect(tutorial.stripTab(tabName)).toBeVisible();

        // Step 50: "Switch Between Tabs" — advanceOn: "click" on the first tab
        await tutorial.waitForStep("Switch Between Tabs");
        await tutorial.clickTutorialTarget(
            '[data-testid="graphSubHeader"] > div:first-of-type [data-testid^="graphTabSelect-"]'
        );

        // Step 51: "Close a Tab" — advanceOn: "click" on the last tab's close button
        await tutorial.waitForStep("Close a Tab");
        await tutorial.clickTutorialTarget(
            '[data-testid="graphSubHeader"] > div:last-of-type [data-testid^="graphTabClose-"]'
        );
        expect(await tutorial.getStripTabCount()).toBe(tabsBefore);
        await expect(tutorial.stripTab(tabName)).toHaveCount(0);

        // Step 52: "Theme Toggle" — no advanceOn, has Next button
        await tutorial.waitForStep("Theme Toggle");
        await tutorial.clickNextButton();

        // Step 53: "Left Menu Navigation" — no advanceOn, has Next button
        await tutorial.waitForStep("Left Menu Navigation");
        await tutorial.clickNextButton();

        // Step 54: "You're All Set!" — has Finish button
        await tutorial.waitForStep("You're All Set!");
        await tutorial.clickNextButton(); // This is the "Finish" button

        // 3. After tutorial closes, verify state restoration
        expect(await tutorial.isTutorialNotVisible()).toBeTruthy();

        // Wait for cleanup to complete (demo graphs deleted, user graphs restored)
        await tutorial.waitForTimeout(3000);

        // 4. Verify demo graphs are gone
        const graphsAfter = await tutorial.getGraphList();
        expect(graphsAfter).not.toContain("social-demo");
        expect(graphsAfter).not.toContain("social-demo-test");

        // 5. Verify the user's original graph is still present
        expect(graphsAfter).toContain(userGraph);

        // 6. Verify the tutorial flag is set to "false" (completed)
        const page = await browser.getPage();
        const tutorialFlag = await page.evaluate(() =>
            localStorage.getItem("tutorial")
        );
        expect(tutorialFlag).toBe("false");
    });
});
