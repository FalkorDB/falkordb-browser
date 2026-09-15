import { expect, test } from "@playwright/test";
import urls from "../config/urls.json";
import BrowserWrapper from "../infra/ui/browserWrapper";
import MobileGraphPage from "../logic/POM/mobileGraphPage";
import ApiCalls from "../logic/api/apiCalls";
import { getRandomString } from "../infra/utils";

/**
 * The mobile layout (< 1100px) is a restructure of the desktop tree, not a
 * reflow, so it needs its own coverage. Two things matter most:
 *
 *  1. The hierarchy — header (connection) above navigation above the graph
 *     context above the data — must survive the collapse. Sheets therefore
 *     cover only the graph region, leaving header and nav on screen.
 *  2. Sheets must never lose state when closed. They stay mounted and only
 *     translate away; unmounting would also drop the canvas underneath.
 */
test.describe("@admin Mobile layout", () => {
    let browser: BrowserWrapper;
    let apiCall: ApiCalls;
    let graphName: string;

    test.beforeAll(async () => {
        apiCall = new ApiCalls();
        graphName = getRandomString("mobile");
        await apiCall.addGraph(graphName);
        // The canvas toolbar and controls only render once there is something to
        // act on, so the drawer would otherwise be empty. Two nodes, because the
        // multi-select test needs a second one to add to the selection.
        await apiCall.runQuery(graphName, "CREATE (:MobileSeed { name: 'seed' }), (:MobileSeed { name: 'seed2' })");
    });

    test.afterAll(async () => {
        await apiCall.removeGraph(graphName);
    });

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
    });

    test.afterEach(async () => {
        await browser.closeBrowser();
    });

    test("The header collapses to a status pill plus a details popover", async () => {
        const graph = await browser.createNewPage(MobileGraphPage, urls.graphUrl);
        await graph.waitForPageIdle();

        // The readouts that do not fit are behind the popover, not duplicated in
        // the bar — the counters carry test ids that must stay unique.
        await expect(graph.headerDetails).toBeVisible();
        await expect(graph.graphsCountValue).toBeHidden();

        await graph.headerDetails.click();
        await expect(graph.graphsCountValue).toBeVisible();
    });

    test("Navigation collapses into a hamburger drawer", async () => {
        const graph = await browser.createNewPage(MobileGraphPage, urls.graphUrl);
        await graph.waitForPageIdle();

        await expect(graph.navToggle).toBeVisible();
        await graph.navToggle.click();
        await expect(graph.navGraphsButton).toBeVisible();
        await expect(graph.navSettingsButton).toBeVisible();
    });

    test("About opens from the drawer's help section", async () => {
        const graph = await browser.createNewPage(MobileGraphPage, urls.graphUrl);
        await graph.waitForPageIdle();

        await graph.navToggle.click();
        await graph.aboutButton.click();

        await expect(graph.aboutPanel).toBeVisible();
        await expect(graph.aboutPanel).toContainText("We Make AI Reliable");
        // The nav drawer has to be out of the way first: two open drawers stack
        // their scrims and fight over the focus trap.
        await expect(graph.navGraphsButton).toBeHidden();
    });

    test("The tab strip collapses into a dropdown beside the hamburger", async () => {
        const graph = await browser.createNewPage(MobileGraphPage, urls.graphUrl);
        await graph.waitForPageIdle();

        // The desktop strip is gone; the trigger names the active tab instead.
        await expect(graph.tabStrip).toBeHidden();
        await expect(graph.tabsMenuTrigger).toBeVisible();
        expect(await graph.getActiveTabLabel()).toBe("New tab");

        await expect.poll(() => graph.getMenuTabLabels()).toEqual(["New tab"]);
    });

    test("Tabs can be added, renamed and closed from the dropdown", async () => {
        const graph = await browser.createNewPage(MobileGraphPage, urls.graphUrl);
        await graph.waitForPageIdle();

        await graph.addTabFromMenu();
        await expect.poll(() => graph.getMenuTabLabels()).toHaveLength(2);

        // Both tabs are called "New tab" at this point, so target the active one.
        await graph.renameActiveTabFromMenu("renamed");
        await expect.poll(() => graph.getActiveTabLabel()).toBe("renamed");

        // The last tab can never be closed, so one close leaves exactly one.
        await graph.closeTabFromMenu("renamed");
        await expect.poll(() => graph.getMenuTabLabels()).toHaveLength(1);
    });

    test("Secondary toolbar actions sit directly in the navigation row", async () => {
        const graph = await browser.createNewPage(MobileGraphPage, urls.graphUrl);
        await graph.waitForPageIdle();

        // The graph info toggle stays out in the open: it is the only route to
        // the graph picker, which lives inside the info panel.
        await expect(graph.infoToggle).toBeVisible();
        await expect(graph.uploadTrigger).toBeVisible();
        await expect(graph.queryHistoryTrigger).toBeVisible();
    });

    test("The graph info sheet leaves the header and navigation visible", async () => {
        const graph = await browser.createNewPage(MobileGraphPage, urls.graphUrl);
        await graph.waitForPageIdle();

        await graph.openGraphInfoSheet();
        await expect.poll(() => graph.isSheetOpen(graph.graphInfoSheet)).toBe(true);

        // The hierarchy rule: data is nested inside the graph context, so the
        // levels above it stay on screen.
        await expect(graph.navToggle).toBeVisible();
        await expect(graph.tabsMenuTrigger).toBeVisible();
    });

    test("Closing the graph info sheet never unmounts it", async () => {
        const graph = await browser.createNewPage(MobileGraphPage, urls.graphUrl);
        await graph.waitForPageIdle();
        await graph.selectGraphByName(graphName);

        await graph.openGraphInfoSheet();
        await expect.poll(() => graph.isSheetOpen(graph.graphInfoSheet)).toBe(true);

        const panel = graph.graphInfoSheet.getByTestId("graphInfoPanel");
        await expect(panel).toBeVisible();

        await graph.closeGraphInfoSheet();
        await expect.poll(() => graph.isSheetOpen(graph.graphInfoSheet)).toBe(false);

        // The heart of the mobile design: a closed sheet is translated off-screen
        // and marked inert, never unmounted, so nothing inside it loses its state.
        // (`vaul` was rejected as the primitive precisely because it unmounts.)
        await expect(panel).toBeAttached();
        await expect(graph.graphInfoSheet).toHaveAttribute("inert", "");

        await graph.openGraphInfoSheet();
        await expect(panel).toBeVisible();
    });

    test("The canvas toolbar, controls and result counts live in one drawer", async () => {
        const graph = await browser.createNewPage(MobileGraphPage, urls.graphUrl);
        await graph.waitForPageIdle();
        await graph.selectGraphByName(graphName);
        // Picking a graph goes through the info sheet, which then covers the canvas.
        await graph.closeGraphInfoSheet();
        await expect.poll(() => graph.isSheetOpen(graph.graphInfoSheet)).toBe(false);
        // The toolbar and controls only appear once the canvas has elements.
        await graph.insertQuery("MATCH (n) RETURN n");
        await graph.clickRunQuery();

        // The canvas is too narrow to carry them as overlays, so nothing but the
        // view tabs and this trigger is left on top of it.
        await expect(graph.canvasToolsToggle).toBeVisible();
        await expect.poll(() => graph.isSheetOpen(graph.canvasToolsSheet)).toBe(false);

        await graph.canvasToolsToggle.click();
        await expect.poll(() => graph.isSheetOpen(graph.canvasToolsSheet)).toBe(true);
        await expect(graph.canvasToolsSheet.getByTestId("elementCanvasShowAllGraph")).toBeVisible();
        await expect(graph.canvasToolsSheet.getByTestId("layoutControl")).toBeVisible();

        // The counts belong to the graph, not to the query bar above it, so the
        // toolbar overflow menu must not carry a second copy.
        await expect(graph.selectorResultStats).toHaveCount(0);
    });

    test("The layout menu opens above the tools drawer", async () => {
        const graph = await browser.createNewPage(MobileGraphPage, urls.graphUrl);
        await graph.waitForPageIdle();
        await graph.selectGraphByName(graphName);
        await graph.closeGraphInfoSheet();
        await expect.poll(() => graph.isSheetOpen(graph.graphInfoSheet)).toBe(false);
        await graph.insertQuery("MATCH (n) RETURN n");
        await graph.clickRunQuery();

        await graph.canvasToolsToggle.click();
        await expect.poll(() => graph.isSheetOpen(graph.canvasToolsSheet)).toBe(true);
        await graph.canvasToolsSheet.getByTestId("layoutControl").click();

        // Radix copies the content's z-index onto its transformed popper wrapper,
        // so a popover opened from inside a sheet has to out-rank the sheet itself.
        await expect(graph.layoutMenu).toBeVisible();
    });

    test("The query input keeps Run and collapses the rest into a menu", async () => {
        const graph = await browser.createNewPage(MobileGraphPage, urls.graphUrl);
        await graph.waitForPageIdle();

        // Run stays on the line; everything else moves off it so the query gets the width.
        await expect(graph.editorRun).toBeVisible();
        await expect(graph.editorMaximize).toHaveCount(0);

        await graph.editorMore.click();
        await expect(graph.editorMaximize).toBeVisible();
    });

    // Touch has no Ctrl key, so the only way to build a selection is a mode that
    // makes every tap additive — and while it is on the data panel has to stay
    // shut, since it covers the canvas the user is still picking from.
    test("Multi select stands in for Ctrl-click and keeps the data panel closed", async () => {
        const graph = await browser.createNewPage(MobileGraphPage, urls.graphUrl);
        await graph.waitForPageIdle();
        await graph.selectGraphByName(graphName);
        await graph.closeGraphInfoSheet();
        await expect.poll(() => graph.isSheetOpen(graph.graphInfoSheet)).toBe(false);
        await graph.insertQuery("MATCH (n) RETURN n");
        await graph.clickRunQuery();

        const toggle = graph.canvasToolsSheet.getByTestId("elementCanvasMultiSelectGraph");
        await graph.canvasToolsToggle.click();
        await expect.poll(() => graph.isSheetOpen(graph.canvasToolsSheet)).toBe(true);
        await expect(toggle).toHaveAttribute("aria-pressed", "false");
        await toggle.click();
        await expect(toggle).toHaveAttribute("aria-pressed", "true");

        // The sheet pushes the canvas up, so read the positions only once it is out
        // of the way and the nodes have settled where they will be tapped.
        await graph.canvasToolsSheetClose.click();
        await expect.poll(() => graph.isSheetOpen(graph.canvasToolsSheet)).toBe(false);
        const allNodes = await graph.getNodesScreenPositions();
        // Positions are absolute page coordinates, and a node parked outside the
        // canvas cannot be tapped — pick from the ones actually on screen.
        const canvasBox = await graph.canvasElement.boundingBox();
        expect(canvasBox).not.toBeNull();
        const nodes = allNodes.filter(n =>
            n.screenX >= canvasBox!.x && n.screenX <= canvasBox!.x + canvasBox!.width &&
            n.screenY >= canvasBox!.y && n.screenY <= canvasBox!.y + canvasBox!.height
        );
        expect(nodes.length).toBeGreaterThanOrEqual(2);

        await graph.elementClick(nodes[0].screenX, nodes[0].screenY);
        await graph.elementClick(nodes[1].screenX, nodes[1].screenY);

        await expect(graph.dataPanel).toHaveCount(0);

        await graph.canvasToolsToggle.click();
        await expect.poll(() => graph.isSheetOpen(graph.canvasToolsSheet)).toBe(true);
        await expect(graph.canvasToolsSheet.getByTestId("multiSelectCount")).toHaveText("2");
        // Two selected nodes is exactly what an edge needs, and deleting is the
        // other reason to select in bulk — neither has another route on mobile
        // while the panel is suppressed.
        await expect(graph.canvasToolsSheet.getByTestId("elementCanvasAddEdgeGraph")).toBeVisible();
        await expect(graph.canvasToolsSheet.getByTestId("deleteElementGraph")).toBeVisible();

        // Turning the mode off drops the selection rather than dumping the user
        // into a panel listing everything they picked.
        await toggle.click();
        await expect(toggle).toHaveAttribute("aria-pressed", "false");
        await expect(graph.canvasToolsSheet.getByTestId("multiSelectCount")).toHaveCount(0);
        await expect(graph.dataPanel).toHaveCount(0);
    });
});
