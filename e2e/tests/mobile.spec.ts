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

    test("Secondary toolbar actions fold into the nav row's overflow menu", async () => {
        const graph = await browser.createNewPage(MobileGraphPage, urls.graphUrl);
        await graph.waitForPageIdle();

        // The graph info toggle stays out in the open: it is the only route to
        // the graph picker, which lives inside the info panel. The rest of the
        // desktop bar is one tap deeper, in the overflow menu.
        await expect(graph.infoToggle).toBeVisible();
        await expect(graph.uploadTrigger).toBeHidden();

        await graph.selectorMore.click();
        await expect(graph.uploadTrigger).toBeVisible();
        await expect(graph.queryHistoryTrigger).toBeVisible();
    });

    // A phone cannot hover, so every icon-only button would be unlabelled if the
    // tooltip only answered to a mouse.
    test("A press and hold reads out an icon button's tooltip", async () => {
        const graph = await browser.createNewPage(MobileGraphPage, urls.graphUrl);
        await graph.waitForPageIdle();

        await expect(graph.tooltip).toHaveCount(0);

        await graph.longPressElement(graph.infoToggle);
        await expect(graph.tooltip).toContainText("Graph info");
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

    // Every sheet covers the same region at the same stacking level, so a second
    // one opened over the first would only hide it — with no hint that the first
    // is still there. Opening one therefore closes whichever is up.
    test("Only one sheet covers the canvas at a time", async () => {
        const graph = await browser.createNewPage(MobileGraphPage, urls.graphUrl);
        await graph.waitForPageIdle();
        await graph.selectGraphByName(graphName);
        await graph.closeGraphInfoSheet();
        await expect.poll(() => graph.isSheetOpen(graph.graphInfoSheet)).toBe(false);
        await graph.insertQuery("MATCH (n) RETURN n");
        await graph.clickRunQuery();

        // Only nodes parked inside the canvas can actually be tapped.
        const canvasBox = await graph.canvasElement.boundingBox();
        expect(canvasBox).not.toBeNull();
        const node = (await graph.getNodesScreenPositions()).find(n =>
            n.screenX >= canvasBox!.x && n.screenX <= canvasBox!.x + canvasBox!.width &&
            n.screenY >= canvasBox!.y && n.screenY <= canvasBox!.y + canvasBox!.height
        );
        expect(node).toBeDefined();

        await graph.elementClick(node.screenX, node.screenY);
        await expect.poll(() => graph.isSheetOpen(graph.dataSheet)).toBe(true);

        await graph.openGraphInfoSheet();
        await expect.poll(() => graph.isSheetOpen(graph.dataSheet)).toBe(false);

        await graph.chatToggle.click();
        await expect.poll(() => graph.isSheetOpen(graph.chatSheet)).toBe(true);
        await expect.poll(() => graph.isSheetOpen(graph.graphInfoSheet)).toBe(false);
    });

    // Touch has no Ctrl key, so the only way to build a selection is a mode that
    // makes every tap additive — entered by pressing and holding an element, the
    // way every touch platform starts a bulk selection. While it is on the data
    // panel has to stay shut, since it covers the canvas the user is still
    // picking from.
    test("Long press starts multi select and keeps the data panel closed", async () => {
        // Four canvas settles and two query runs put this within a couple of seconds
        // of the default budget, which makes any CI hiccup a timeout.
        test.setTimeout(60_000);
        const graph = await browser.createNewPage(MobileGraphPage, urls.graphUrl);
        await graph.waitForPageIdle();
        await graph.selectGraphByName(graphName);
        await graph.closeGraphInfoSheet();
        await expect.poll(() => graph.isSheetOpen(graph.graphInfoSheet)).toBe(false);
        await graph.insertQuery("MATCH (n) RETURN n");
        await graph.clickRunQuery();

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

        await expect(graph.multiSelectBar).toHaveCount(0);

        // The held element is the first of the pile, so the gesture never costs a
        // tap of its own.
        await graph.longPressCanvas(nodes[0].screenX, nodes[0].screenY);
        await expect(graph.multiSelectBar).toBeVisible();
        await expect(graph.multiSelectCount).toHaveText("1 selected");
        await expect(graph.dataPanel).toHaveCount(0);

        // Selecting pans the canvas onto the selection, so the second node is no
        // longer where it was measured — re-read it by id before tapping it.
        const secondNode = (await graph.readNodesScreenPositions()).find(n => n.id === nodes[1].id);
        expect(secondNode).toBeDefined();
        await graph.elementClick(secondNode.screenX, secondNode.screenY);
        await expect(graph.multiSelectCount).toHaveText("2 selected");
        await expect(graph.dataPanel).toHaveCount(0);

        // Two selected nodes is exactly what an edge needs, and deleting is the
        // other reason to select in bulk — neither has another route on mobile
        // while the panel is suppressed.
        await graph.canvasToolsToggle.click();
        await expect.poll(() => graph.isSheetOpen(graph.canvasToolsSheet)).toBe(true);
        await expect(graph.canvasToolsSheet.getByTestId("elementCanvasAddEdgeGraph")).toBeVisible();
        await expect(graph.canvasToolsSheet.getByTestId("deleteElementGraph")).toBeVisible();
        await graph.canvasToolsSheetClose.click();
        await expect.poll(() => graph.isSheetOpen(graph.canvasToolsSheet)).toBe(false);

        // Re-running the query swaps in a fresh graph object and the selection is
        // re-resolved from it. That restore path has to honour the mode too —
        // otherwise it reopens the panel over the canvas the user is still picking from.
        await graph.clickRunQuery();
        await expect(graph.multiSelectCount).toHaveText("2 selected");
        await expect(graph.dataPanel).toHaveCount(0);

        // A miss on the background is easy to make at this size, and it must not
        // cost a selection built up one tap at a time — Done is the only way out.
        const settled = await graph.readNodesScreenPositions();
        const corners = [
            { x: canvasBox!.x + 12, y: canvasBox!.y + 12 },
            { x: canvasBox!.x + canvasBox!.width - 12, y: canvasBox!.y + 12 },
            { x: canvasBox!.x + 12, y: canvasBox!.y + canvasBox!.height - 12 },
            { x: canvasBox!.x + canvasBox!.width - 12, y: canvasBox!.y + canvasBox!.height - 12 },
        ];
        const distanceToNearestNode = (c: { x: number; y: number }) =>
            Math.min(...settled.map(n => Math.hypot(n.screenX - c.x, n.screenY - c.y)));
        const emptySpot = corners.reduce((a, b) => (distanceToNearestNode(b) > distanceToNearestNode(a) ? b : a));
        await graph.elementClick(emptySpot.x, emptySpot.y);
        await expect(graph.multiSelectCount).toHaveText("2 selected");
        await expect(graph.multiSelectBar).toBeVisible();

        // Done is the way out, and it drops the selection rather than dumping the
        // user into a panel listing everything they picked.
        await graph.multiSelectDone.click();
        await expect(graph.multiSelectBar).toHaveCount(0);
        await expect(graph.dataPanel).toHaveCount(0);
    });

    // The data sheet is the selection made visible, so it has no open state of
    // its own: it is up for exactly as long as something is selected. Another
    // sheet taking the screen only covers it, and closing it deselects — a
    // sheet that could be dismissed on its own would leave the element picked
    // on the canvas with nothing on screen saying so.
    test("The data sheet follows the selection", async () => {
        // Two canvas settles plus four sheet transitions put this close to the
        // default budget, which makes any CI hiccup a timeout.
        test.setTimeout(60_000);
        const graph = await browser.createNewPage(MobileGraphPage, urls.graphUrl);
        await graph.waitForPageIdle();
        await graph.selectGraphByName(graphName);
        await graph.closeGraphInfoSheet();
        await expect.poll(() => graph.isSheetOpen(graph.graphInfoSheet)).toBe(false);
        await graph.insertQuery("MATCH (n) RETURN n");
        await graph.clickRunQuery();

        await graph.tapFirstNodeOnCanvas();
        await expect.poll(() => graph.isSheetOpen(graph.dataSheet)).toBe(true);

        // The info sheet covers the same region, so the data sheet steps aside
        // — but the node stays selected, and uncovering brings the sheet back.
        await graph.openGraphInfoSheet();
        await expect.poll(() => graph.isSheetOpen(graph.dataSheet)).toBe(false);
        await graph.closeGraphInfoSheet();
        await expect.poll(() => graph.isSheetOpen(graph.graphInfoSheet)).toBe(false);
        await expect.poll(() => graph.isSheetOpen(graph.dataSheet)).toBe(true);
        await expect(graph.dataPanel).toBeVisible();

        // Closing the panel is the only way to drop a single selection here:
        // the sheet covers the canvas, so there is no background left to tap.
        await graph.dataPanelClose.click();
        await expect.poll(() => graph.isSheetOpen(graph.dataSheet)).toBe(false);

        // And it stays shut. Had it only been hidden, the selection would still
        // be live and the next uncovering would bring the sheet back up.
        await graph.openGraphInfoSheet();
        await graph.closeGraphInfoSheet();
        await expect.poll(() => graph.isSheetOpen(graph.graphInfoSheet)).toBe(false);
        await expect.poll(() => graph.isSheetOpen(graph.dataSheet)).toBe(false);
    });

    // Touch has no hover, so the row actions cannot hide behind one — they are
    // always on screen. That leaves the value cell redundant as an edit
    // trigger, and it is the one thing the table scrolls sideways by, so a tap
    // meant to read the rest of a value must not open an editor instead.
    test("The attribute value is not an edit trigger", async () => {
        test.setTimeout(60_000);
        const graph = await browser.createNewPage(MobileGraphPage, urls.graphUrl);
        await graph.waitForPageIdle();
        await graph.selectGraphByName(graphName);
        await graph.closeGraphInfoSheet();
        await expect.poll(() => graph.isSheetOpen(graph.graphInfoSheet)).toBe(false);
        await graph.insertQuery("MATCH (n) RETURN n");
        await graph.clickRunQuery();

        await graph.tapFirstNodeOnCanvas();
        await expect.poll(() => graph.isSheetOpen(graph.dataSheet)).toBe(true);

        // The pencil is what replaces it, and it is there without a hover.
        await expect(graph.dataPanelSetAttribute).toBeVisible();
        await expect(graph.dataPanelValueSetAttribute).toBeDisabled();
        await graph.dataPanelValueSetAttribute.click({ force: true });
        await expect(graph.dataPanelSetAttributeConfirm).toHaveCount(0);

        await graph.dataPanelSetAttribute.click();
        await expect(graph.dataPanelSetAttributeConfirm).toBeVisible();
        await graph.dataPanelSetAttributeCancel.click();
    });

    // Maximizing is what a phone needs most and was what it fitted worst: the
    // dialog kept its desktop margins and the query ran off the right edge.
    test("The maximized editor fills the screen and wraps", async () => {
        const graph = await browser.createNewPage(MobileGraphPage, urls.graphUrl);
        await graph.waitForPageIdle();
        await graph.insertQuery("MATCH (n:MobileSeed) WHERE n.name = 'seed' RETURN n.name AS name");

        await graph.editorMore.click();
        await graph.editorMaximize.click();

        const { dialog, viewport } = await graph.maximizedEditorLayout();
        expect(Math.round(dialog.width)).toBe(viewport.width);
        expect(Math.round(dialog.x)).toBe(0);
        expect(Math.round(dialog.y)).toBe(0);
        expect(Math.round(dialog.height)).toBe(viewport.height);

        // Filling the screen is only half of it — a line longer than the screen
        // has to wrap, because there is no room to scroll sideways for the rest.
        await expect.poll(() => graph.maximizedEditorVisualLines()).toBeGreaterThan(1);
    });

    // `group-hover` never fires on a touch screen, so the close button was
    // invisible while staying tappable: the toast could only be dismissed by
    // guessing where its X was.
    test("The toast close button shows without a hover", async () => {
        const graph = await browser.createNewPage(MobileGraphPage, urls.graphUrl);
        await graph.waitForPageIdle();
        await graph.selectGraphByName(graphName);
        await graph.closeGraphInfoSheet();
        await expect.poll(() => graph.isSheetOpen(graph.graphInfoSheet)).toBe(false);
        await graph.insertQuery("MATCH (n RETURN n");
        await graph.clickRunQuery(false);

        await expect(graph.errorToast).toBeVisible();
        // `toBeVisible` passes at `opacity: 0` — which is exactly the bug, so
        // the assertion has to be on the computed opacity itself.
        await expect
            .poll(() => graph.toastClose.evaluate(el => getComputedStyle(el).opacity))
            .toBe("1");

        await graph.toastClose.click();
        await expect(graph.errorToast).toBeHidden();
    });

    test("Manage Graphs wraps its actions instead of stacking them", async () => {
        const graph = await browser.createNewPage(MobileGraphPage, urls.graphUrl);
        await graph.waitForPageIdle();
        // The picker lives in the info sheet on mobile, so it has to be opened first.
        await graph.openGraphInfoSheet();
        await graph.clickSelect();
        await graph.clickManage();

        const { panel, actions, search } = await graph.manageToolbarLayout();

        // One action per line spent four rows on buttons and pushed the table
        // itself off the bottom of the phone. They share a row; the search box
        // is the only control allowed to drop below them.
        expect(new Set(actions.map(a => Math.round(a.y))).size).toBe(1);
        expect(search.y).toBeGreaterThanOrEqual(actions[0].y + actions[0].height);

        // The panel clips rather than scrolls, so an edge crossed is a control lost.
        actions.forEach(action => {
            expect(action.x).toBeGreaterThanOrEqual(panel.x);
            expect(action.x + action.width).toBeLessThanOrEqual(panel.x + panel.width);
        });
    });

    test("The Delete Graph dialog keeps its buttons on screen", async () => {
        const graph = await browser.createNewPage(MobileGraphPage, urls.graphUrl);
        await graph.waitForPageIdle();
        // The picker lives in the info sheet on mobile, so it has to be opened first.
        await graph.openGraphInfoSheet();
        await graph.clickSelect();
        await graph.clickManage();
        await graph.clickTableCheckboxByName(graphName);
        await graph.clickDelete();

        const { dialog, buttons, viewport } = await graph.deleteDialogLayout();

        // `left-50%` leaves an auto-width dialog only the right half of the screen
        // to fit into, and `justify-end` sends whatever does not fit off the left
        // edge — Delete Graph used to start at a negative x, half of it unreadable
        // and none of it tappable.
        expect(dialog.x).toBeGreaterThanOrEqual(0);
        expect(dialog.x + dialog.width).toBeLessThanOrEqual(viewport.width);
        buttons.forEach(button => {
            expect(button.x).toBeGreaterThanOrEqual(dialog.x);
            expect(button.x + button.width).toBeLessThanOrEqual(dialog.x + dialog.width);
        });

        await graph.clickDeleteCancel();
    });
});
