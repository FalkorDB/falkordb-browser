/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-await-in-loop */
import BasePage from "@/e2e/infra/ui/basePage";
import { Download, Locator } from "@playwright/test";
import { waitForElementToBeVisible, waitForElementToBeEnabled, waitForElementToNotBeVisible, interactWhenVisible } from "@/e2e/infra/utils";

export default class GraphPage extends BasePage {

    // ===================================================GETTERS===================================================

    // CREATE
    private get createGraph(): Locator {
        return this.page.getByTestId("createGraph");
    }

    private get createGraphInput(): Locator {
        return this.page.getByTestId("createGraphInput");
    }

    private get createGraphConfirm(): Locator {
        return this.page.getByTestId("createGraphConfirm");
    }

    private get createGraphCancel(): Locator {
        return this.page.getByTestId("createGraphCancel");
    }

    // DELETE
    private get deleteGraph(): Locator {
        return this.page.getByTestId("deleteGraph");
    }

    private get deleteGraphConfirm(): Locator {
        return this.page.getByTestId("deleteGraphConfirm");
    }

    private get deleteGraphCancel(): Locator {
        return this.page.getByTestId("deleteGraphCancel");
    }

    // EXPORT
    private get exportGraph(): Locator {
        return this.page.getByTestId("exportGraph");
    }

    private get exportGraphConfirm(): Locator {
        return this.page.getByTestId("exportGraphConfirm");
    }

    private get exportGraphCancel(): Locator {
        return this.page.getByTestId("exportGraphCancel");
    }

    // RELOAD
    private get reloadGraphsList(): Locator {
        return this.page.getByTestId("reloadGraphsList");
    }

    // SELECT
    private get selectGraph(): Locator {
        return this.page.getByTestId("SelectGraph");
    }


    private get selectGraphItem(): (graphName: string) => Locator {
        return (graphName: string) => this.page.getByTestId(`SelectItemGraph${graphName}`);
    }

    // SEARCH
    private get searchGraph(): Locator {
        return this.page.getByTestId("SearchGraph");
    }

    // MANAGE
    private get manageGraphs(): Locator {
        return this.page.getByTestId("manageGraphs");
    }

    // TABLE
    private get tableGraphsCheckbox(): Locator {
        return this.page.getByTestId("tableCheckboxGraphs");
    }

    private get tableGraphsRowByName(): (name: string) => Locator {
        return (name: string) => this.page.getByTestId(`tableRowGraphs${name}`);
    }

    private get tableGraphsCheckboxByName(): (name: string) => Locator {
        return (name: string) => this.page.getByTestId(`tableCheckboxGraphs${name}`);
    }

    private get editButtonGraphs(): Locator {
        return this.page.getByTestId("editButtonGraphs");
    }

    private get inputGraphs(): Locator {
        return this.page.getByTestId("inputGraphs");
    }

    private get saveButtonGraphs(): Locator {
        return this.page.getByTestId("saveButtonGraphs");
    }

    private get cancelButtonGraphs(): Locator {
        return this.page.getByTestId("cancelButtonGraphs");
    }

    // EDITOR
    private get editorInput(): Locator {
        return this.page.getByTestId("editorContainer");
    }

    private get editorRun(): Locator {
        return this.page.getByTestId("editorRun");
    }

    private get editorMaximize(): Locator {
        return this.page.getByTestId("editorMaximize");
    }

    // QUERY HISTORY
    private get queryHistory(): Locator {
        return this.page.getByTestId("queryHistory");
    }

    private get queryHistorySearch(): Locator {
        return this.page.getByTestId("queryHistorySearch");
    }

    private get queryHistoryButtonByIndex(): (index: number) => Locator {
        return (index: number) => this.page.getByTestId(`queryHistoryButton${index}`);
    }

    private get queryHistoryEditor(): Locator {
        return this.page.getByTestId("queryHistoryEditor");
    }

    // CANVAS TOOLBAR

    // SEARCH
    private get elementCanvasSearch(): Locator {
        return this.page.getByTestId("elementCanvasSearchGraph");
    }

    private get elementCanvasSuggestionList(): Locator {
        return this.page.getByTestId("elementCanvasSuggestionsListGraph");
    }

    private get elementCanvasSuggestionByName(): (name: string) => Locator {
        return (name: string) => this.page.getByTestId(`elementCanvasSuggestionGraph${name}`);
    }

    // ADD
    private get elementCanvasAdd(): Locator {
        return this.page.getByTestId("elementCanvasAddGraph");
    }

    private get elementCanvasAddNode(): Locator {
        return this.page.getByTestId("elementCanvasAddNodeGraph");
    }

    private get elementCanvasAddEdge(): Locator {
        return this.page.getByTestId("elementCanvasAddEdgeGraph");
    }

    // DELETE
    private get deleteElement(): Locator {
        return this.page.getByTestId("deleteElementGraph");
    }

    private get deleteElementConfirm(): Locator {
        return this.page.getByTestId("deleteElementConfirmGraph");
    }

    private get deleteElementCancel(): Locator {
        return this.page.getByTestId("deleteElementCancelGraph");
    }

    // LABELS
    private get labelsButtonByName(): (label: "RelationshipTypes" | "Labels", name: string) => Locator {
        return (label: "RelationshipTypes" | "Labels", name: string) => this.page.getByTestId(`Graph${label}Button${name}`);
    }

    // TOAST
    private get toast(): Locator {
        return this.page.getByTestId("toast");
    }

    // CANVAS CONTROLS
    private get animationControl(): Locator {
        return this.page.getByTestId("animationControl");
    }

    private get zoomInControl(): Locator {
        return this.page.getByTestId("zoomInControl");
    }

    private get zoomOutControl(): Locator {
        return this.page.getByTestId("zoomOutControl");
    }

    private get centerControl(): Locator {
        return this.page.getByTestId("centerControl");
    }

    // TABS
    private get graphTab(): Locator {
        return this.page.getByTestId("graphTab");
    }

    private get tableTab(): Locator {
        return this.page.getByTestId("tableTab");
    }

    private get metadataTab(): Locator {
        return this.page.getByTestId("metadataTab");
    }

    // COUNT
    private get nodesCount(): Locator {
        return this.page.getByTestId("nodesCount");
    }

    private get edgesCount(): Locator {
        return this.page.getByTestId("edgesCount");
    }

    // CANVAS TOOLTIP
    private get nodeCanvasToolTip(): Locator {
        return this.page.locator("//div[contains(@class, 'float-tooltip-kap')]");
    }

    // CANVAS
    protected get canvasElement(): Locator {
        return this.page.locator("//div[contains(@class, 'force-graph-container')]//canvas");
    }

    // ===================================================ACTIONS===================================================

    async getBoundingBoxCanvasElement(): Promise<null | {
        x: number;
        y: number;
        width: number;
        height: number;
    }> {
        const boundingBox = await interactWhenVisible(this.canvasElement, (el) => el.boundingBox(), "Canvas Element");
        return boundingBox;
    }

    async getAttributeCanvasElement(attribute: string): Promise<string> {
        const attributeValue = await interactWhenVisible(this.canvasElement, (el) => el.getAttribute(attribute), "Canvas Element");
        return attributeValue ?? "";
    }

    async fillCreateGraphInput(text: string): Promise<void> {
        await interactWhenVisible(this.createGraphInput, (el) => el.fill(text), "Create Graph Input");
    }

    async fillSearchGraph(text: string): Promise<void> {
        await interactWhenVisible(this.searchGraph, (el) => el.fill(text), "Search Graph");
    }

    async fillInputGraphs(text: string): Promise<void> {
        await interactWhenVisible(this.inputGraphs, (el) => el.fill(text), "Input Graphs");
    }

    async fillQueryHistorySearch(text: string): Promise<void> {
        await interactWhenVisible(this.queryHistorySearch, (el) => el.fill(text), "Query History Search");
    }

    async fillElementCanvasSearch(text: string): Promise<void> {
        await interactWhenVisible(this.elementCanvasSearch, (el) => el.fill(text), "Element Canvas Search");
    }

    async clickCanvasElement(x: number, y: number): Promise<void> {
        await interactWhenVisible(this.canvasElement, (el) => el.click({ position: { x, y }, button: "right" }), "Canvas Element");
    }

    async clickEditorInput(): Promise<void> {
        await interactWhenVisible(this.editorInput, (el) => el.click(), "Editor Input");
    }

    async clickCreateGraph(): Promise<void> {
        await interactWhenVisible(this.createGraph, (el) => el.click(), "Create Graph");
    }

    async clickCreateGraphConfirm(): Promise<void> {
        await interactWhenVisible(this.createGraphConfirm, (el) => el.click(), "Create Graph Confirm");
    }

    async clickCreateGraphCancel(): Promise<void> {
        await interactWhenVisible(this.createGraphCancel, (el) => el.click(), "Create Graph Cancel");
    }

    async clickDeleteGraph(): Promise<void> {
        await interactWhenVisible(this.deleteGraph, (el) => el.click(), "Delete Graph");
    }

    async clickDeleteGraphConfirm(): Promise<void> {
        await interactWhenVisible(this.deleteGraphConfirm, (el) => el.click(), "Confirm Delete Graph");
    }

    async clickDeleteGraphCancel(): Promise<void> {
        await interactWhenVisible(this.deleteGraphCancel, (el) => el.click(), "Cancel Delete Graph");
    }

    async clickExportGraph(): Promise<void> {
        await interactWhenVisible(this.exportGraph, (el) => el.click(), "Export Graph");
    }

    async clickExportGraphConfirm(): Promise<void> {
        await interactWhenVisible(this.exportGraphConfirm, (el) => el.click(), "Confirm Export Graph");
    }

    async clickExportGraphCancel(): Promise<void> {
        await interactWhenVisible(this.exportGraphCancel, (el) => el.click(), "Cancel Export Graph");
    }

    async clickSelectGraph(): Promise<void> {
        await interactWhenVisible(this.selectGraph, (el) => el.click(), "Select Graph");
    }

    async clickSelectGraphItem(graphName: string): Promise<void> {
        await interactWhenVisible(this.selectGraphItem(graphName), (el) => el.click(), `Select Graph Item ${graphName}`);
    }

    async clickSearchGraph(): Promise<void> {
        await interactWhenVisible(this.searchGraph, (el) => el.click(), "Search Graph");
    }

    async clickElementCanvasAdd(): Promise<void> {
        await interactWhenVisible(this.elementCanvasAdd, (el) => el.click(), "Add Element");
    }

    async clickElementCanvasAddNode(): Promise<void> {
        await interactWhenVisible(this.elementCanvasAddNode, (el) => el.click(), "Add Node");
    }

    async clickElementCanvasAddEdge(): Promise<void> {
        await interactWhenVisible(this.elementCanvasAddEdge, (el) => el.click(), "Add Edge");
    }

    async clickDeleteElement(): Promise<void> {
        await interactWhenVisible(this.deleteElement, (el) => el.click(), "Delete Element");
    }

    async clickDeleteElementConfirm(): Promise<void> {
        await interactWhenVisible(this.deleteElementConfirm, (el) => el.click(), "Confirm Delete Element");
    }

    async clickDeleteElementCancel(): Promise<void> {
        await interactWhenVisible(this.deleteElementCancel, (el) => el.click(), "Cancel Delete Element");
    }

    async clickAnimationControl(): Promise<void> {
        await interactWhenVisible(this.animationControl, (el) => el.click(), "Animation Control");
    }

    async clickZoomInControl(): Promise<void> {
        await interactWhenVisible(this.zoomInControl, (el) => el.click(), "Zoom In Control");
    }

    async clickZoomOutControl(): Promise<void> {
        await interactWhenVisible(this.zoomOutControl, (el) => el.click(), "Zoom Out Control");
    }

    async clickCenterControl(): Promise<void> {
        await interactWhenVisible(this.centerControl, (el) => el.click(), "Center Control");
    }

    async clickGraphTab(): Promise<void> {
        await interactWhenVisible(this.graphTab, (el) => el.click(), "Graph Tab");
    }

    async clickTableTab(): Promise<void> {
        await interactWhenVisible(this.tableTab, (el) => el.click(), "Table Tab");
    }

    async clickMetadataTab(): Promise<void> {
        await interactWhenVisible(this.metadataTab, (el) => el.click(), "Metadata Tab");
    }

    async clickElementCanvasSuggestionByName(name: string): Promise<void> {
        await interactWhenVisible(this.elementCanvasSuggestionByName(name), (el) => el.click(), `Element Canvas Suggestion ${name}`);
    }

    async clickLabelsButtonByLabel(label: "RelationshipTypes" | "Labels", name: string): Promise<void> {
        await interactWhenVisible(this.labelsButtonByName(label, name), (el) => el.click(), `Labels Panel Button ${label} ${name}`);
    }

    async clickEditorRun(): Promise<void> {
        await interactWhenVisible(this.editorRun, (el) => el.click(), "Editor Run");
    }

    async clickManageGraphs(): Promise<void> {
        await interactWhenVisible(this.manageGraphs, (el) => el.click(), "Manage Graphs Button");
    }

    async clickTableGraphsCheckboxByName(name: string): Promise<void> {
        await interactWhenVisible(this.tableGraphsCheckboxByName(name), (el) => el.click(), `Table Graphs Checkbox ${name}`);
    }

    async clickReloadGraphsList(): Promise<void> {
        await interactWhenVisible(this.reloadGraphsList, (el) => el.click(), "Reload Graphs List");
    }

    async clickEditButtonGraphs(): Promise<void> {
        await interactWhenVisible(this.editButtonGraphs, (el) => el.click(), "Edit Button Graphs");
    }

    async clickSaveButtonGraphs(): Promise<void> {
        await interactWhenVisible(this.saveButtonGraphs, (el) => el.click(), "Save Button Graphs");
    }

    async hoverCanvasElement(x: number, y: number): Promise<void> {
        await interactWhenVisible(this.canvasElement, (el) => el.hover({ position: { x, y } }), "Canvas Element");
    }

    async hoverTableGraphsRowByName(name: string): Promise<void> {
        await interactWhenVisible(this.tableGraphsRowByName(name), (el) => el.hover(), `Table Graphs Row ${name}`);
    }

    async isVisibleSelectGraphItem(name: string): Promise<boolean> {
        const isVisible = await waitForElementToBeVisible(this.selectGraphItem(name));
        return isVisible;
    }

    async isVisibleLabelsButtonByName(label: "RelationshipTypes" | "Labels", name: string): Promise<boolean> {
        const isVisible = await waitForElementToBeVisible(this.labelsButtonByName(label, name));
        return isVisible;
    }

    async isVisibleEditButtonGraphs(): Promise<boolean> {
        const isVisible = await waitForElementToBeVisible(this.editButtonGraphs);
        return isVisible;
    }

    async isVisibleToast(): Promise<boolean> {
        const isVisible = await waitForElementToBeVisible(this.toast);
        return isVisible;
    }

    async isVisibleNodeCanvasToolTip(): Promise<boolean> {
        const isVisible = await waitForElementToBeVisible(this.nodeCanvasToolTip);
        return isVisible;
    }

    async getNodeCanvasToolTipContent(): Promise<string | null> {
        const content = await interactWhenVisible(this.nodeCanvasToolTip, (el) => el.textContent(), "Node Canvas Tooltip");
        return content;
    }

    async getNodeCountContent(): Promise<string> {
        const count = await interactWhenVisible(this.nodesCount, (el) => el.textContent(), "Nodes Count");
        return count?.split(" ")[1] ?? "0";
    }

    async getEdgesCountContent(): Promise<string> {
        const count = await interactWhenVisible(this.edgesCount, (el) => el.textContent(), "Edges Count");
        return count?.split(" ")[1] ?? "0";
    }

    // ===================================================FUNCTIONS===================================================

    async searchElementInCanvas(name: string): Promise<void> {
        await this.fillElementCanvasSearch(name);
        await this.clickElementCanvasSuggestionByName(name);
    }

    async verifyGraphExists(graphName: string): Promise<boolean> {
        await this.clickSelectGraph();
        await this.fillSearchGraph(graphName);
        const isVisible = await this.isVisibleSelectGraphItem(graphName);
        return isVisible;
    }

    async addGraph(graphName: string): Promise<void> {
        await this.clickCreateGraph();
        await this.fillCreateGraphInput(graphName);
        await this.clickCreateGraphConfirm();
        await waitForElementToNotBeVisible(this.createGraph);
    }

    async insertQuery(query: string): Promise<void> {
        await this.clickEditorInput();
        await this.page.keyboard.type(query);
    }

    async clickRunQuery(waitForAnimation = false): Promise<void> {
        await this.clickEditorRun();
        await waitForElementToBeEnabled(this.editorRun);
        if (waitForAnimation) {
            await this.waitForCanvasAnimationToEnd();
        }
    }

    async exportGraphByName(graphName: string): Promise<Download> {
        await this.clickSelectGraph();
        await this.clickManageGraphs();
        await this.clickTableGraphsCheckboxByName(graphName);
        await this.clickExportGraph();
        const [download] = await Promise.all([
            this.page.waitForEvent("download"),
            this.clickExportGraphConfirm(),
        ]);
        return download;
    }

    async reloadGraphList(): Promise<void> {
        await this.clickReloadGraphsList();
        await waitForElementToBeEnabled(this.reloadGraphsList);
    }

    async isModifyGraphNameButtonVisible(graphName: string): Promise<boolean> {
        await this.clickSelectGraph();
        await this.clickManageGraphs();
        await this.hoverTableGraphsRowByName(graphName);
        const isVisible = await this.isVisibleEditButtonGraphs();
        return isVisible;
    }

    async modifyGraphName(oldName: string, newName: string): Promise<void> {
        await this.clickSelectGraph();
        await this.clickManageGraphs();
        await this.hoverTableGraphsRowByName(oldName);
        await this.clickEditButtonGraphs();
        await this.fillInputGraphs(newName);
        await this.clickSaveButtonGraphs();
        await waitForElementToNotBeVisible(this.saveButtonGraphs);
    }

    async selectGraphByName(graphName: string): Promise<void> {
        await this.clickSelectGraph();
        await this.fillSearchGraph(graphName);
        await this.clickSelectGraphItem(graphName);
    }

    async getNodesCount(): Promise<string> {
        const count = await this.getNodeCountContent();
        return count;
    }

    async getEdgesCount(): Promise<string> {
        const count = await this.getEdgesCountContent();
        return count;
    }

    async deleteElementsByPosition(positions: { x: number, y: number }[]): Promise<void> {
        positions.forEach(async (position) => {
            await this.elementClick(position.x, position.y);
        });
        await this.clickDeleteElement();
        await this.clickDeleteElementConfirm();
        await waitForElementToNotBeVisible(this.deleteElement);
    }

    async deleteElementByName(name: string): Promise<void> {
        await this.searchElementInCanvas(name);
        await this.clickDeleteElement();
        await this.clickDeleteElementConfirm();
        await waitForElementToNotBeVisible(this.deleteElement);
    }

    async getErrorNotification(): Promise<boolean> {
        await this.page.waitForTimeout(1000);
        const isVisible = await this.isVisibleToast();
        return isVisible;
    }

    async getAnimationControl(): Promise<boolean> {
        const status = await this.getAttributeCanvasElement("data-engine-status");
        return status === "running"
    }

    // 6000 is the timeout for the animation to end
    // 1500 is the timeout for the fit to size animation
    // 2000 is extra timeout to ensure the animation is over
    async waitForCanvasAnimationToEnd(timeout = 9500): Promise<void> {
        await this.page.waitForFunction(
            (selector: string) => {
                const canvas = document.querySelector(selector) as HTMLCanvasElement;
                return canvas.getAttribute("data-engine-status") === "stop";
            },
            '.force-graph-container canvas',
            { timeout }
        );
    }

    async isNodeCanvasToolTipVisible(): Promise<boolean> {
        await this.page.waitForTimeout(500);
        const isVisible = await this.isVisibleNodeCanvasToolTip();
        return isVisible;
    }

    async getNodeCanvasToolTip(): Promise<string | null> {
        await this.page.waitForTimeout(1000);
        const toolTipText = await this.getNodeCanvasToolTipContent();
        return toolTipText;
    }

    // eslint-disable-next-line class-methods-use-this
    async getCanvasTransform(canvasElement: Locator): Promise<any> {
        let transformData = null;
        for (let attempt = 0; attempt < 3; attempt += 1) {
            transformData = await canvasElement.evaluate((canvas: HTMLCanvasElement) => {
                const rect = canvas.getBoundingClientRect();
                const ctx = canvas.getContext('2d');
                return {
                    left: rect.left,
                    top: rect.top,
                    transform: ctx?.getTransform() || null,
                };
            });

            if (transformData?.transform) return transformData;
            await new Promise(res => { setTimeout(res, 1000) });
        }

        throw new Error("Canvas transform data not available!");
    }

    async getNodesScreenPositions(windowKey: 'graph' | 'schema'): Promise<any[]> {
        // Get canvas element and its properties
        const canvas = await this.page.evaluate((selector) => {
            const canvasElement = document.querySelector(selector);
            if (!canvasElement) return null;
            const rect = canvasElement.getBoundingClientRect();
            return {
                width: rect.width,
                height: rect.height,
                left: rect.left,
                top: rect.top,
                scale: window.devicePixelRatio || 1
            };
        }, ".force-graph-container canvas");

        if (!canvas) return [];

        // Get graph data
        const graphData = await this.page.evaluate((key) => (window as any)[key], windowKey);

        // Get canvas transform
        const transformData = await this.getCanvasTransform(this.canvasElement);
        const { a, e, d, f } = transformData.transform;

        return graphData.elements.nodes.map((node: any) => {
            // Calculate node position relative to canvas
            const screenX = canvas.left + (node.x * a + e) * canvas.scale;
            const screenY = canvas.top + (node.y * d + f) * canvas.scale;

            // Check if node is visible in viewport
            const isVisible = (
                screenX >= canvas.left &&
                screenX <= canvas.left + canvas.width &&
                screenY >= canvas.top &&
                screenY <= canvas.top + canvas.height
            );

            return {
                id: node.id,
                screenX,
                screenY,
                isVisible,
                canvasWidth: canvas.width,
                canvasHeight: canvas.height,
                ...node
            };
        });
    }

    async getLinksScreenPositions(windowKey: 'graph' | 'schema'): Promise<any[]> {
        // Get canvas element and its properties
        const canvas = await this.page.evaluate((selector) => {
            const canvasElement = document.querySelector(selector);
            if (!canvasElement) return null;
            const rect = canvasElement.getBoundingClientRect();
            return {
                width: rect.width,
                height: rect.height,
                left: rect.left,
                top: rect.top,
                scale: window.devicePixelRatio || 1
            };
        }, ".force-graph-container canvas");

        if (!canvas) return [];

        // Get graph data
        const graphData = await this.page.evaluate((key) => (window as any)[key], windowKey);

        // Get canvas transform
        const transformData = await this.getCanvasTransform(this.canvasElement);
        const { a, e, d, f } = transformData.transform;

        return graphData.elements.links.map((link: any) => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;

            const source = graphData.elements.nodes.find((n: any) => n.id === sourceId);
            const target = graphData.elements.nodes.find((n: any) => n.id === targetId);

            // Calculate node positions relative to canvas
            const sourceScreenX = canvas.left + (source.x * a + e) * canvas.scale;
            const sourceScreenY = canvas.top + (source.y * d + f) * canvas.scale;
            const targetScreenX = canvas.left + (target.x * a + e) * canvas.scale;
            const targetScreenY = canvas.top + (target.y * d + f) * canvas.scale;

            // Calculate midpoint
            const midX = (sourceScreenX + targetScreenX) / 2;
            const midY = (sourceScreenY + targetScreenY) / 2;

            // Check if link is visible in viewport
            const isVisible = (
                (sourceScreenX >= canvas.left && sourceScreenX <= canvas.left + canvas.width) ||
                (targetScreenX >= canvas.left && targetScreenX <= canvas.left + canvas.width) ||
                (midX >= canvas.left && midX <= canvas.left + canvas.width)
            ) && (
                    (sourceScreenY >= canvas.top && sourceScreenY <= canvas.top + canvas.height) ||
                    (targetScreenY >= canvas.top && targetScreenY <= canvas.top + canvas.height) ||
                    (midY >= canvas.top && midY <= canvas.top + canvas.height)
                );

            return {
                id: link.id,
                sourceId,
                targetId,
                sourceScreenX,
                sourceScreenY,
                targetScreenX,
                targetScreenY,
                midX,
                midY,
                isVisible,
                canvasWidth: canvas.width,
                canvasHeight: canvas.height,
                ...link
            };
        });
    }

    async changeNodePosition(fromX: number, fromY: number, toX: number, toY: number): Promise<void> {
        await this.page.mouse.move(fromX, fromY);
        await this.page.mouse.down();
        await this.page.mouse.move(toX, toY);
        await this.page.mouse.up();
    }

    async rightClickAtCanvasCenter(): Promise<void> {
        const boundingBox = await this.getBoundingBoxCanvasElement();
        if (!boundingBox) throw new Error('Canvas bounding box not found');
        const centerX = boundingBox.x + boundingBox.width / 2;
        const centerY = boundingBox.y + boundingBox.height / 2;
        await this.page.mouse.click(centerX, centerY, { button: 'right' });
    }

    async hoverAtCanvasCenter(): Promise<void> {
        const boundingBox = await this.getBoundingBoxCanvasElement();
        if (!boundingBox) throw new Error('Canvas bounding box not found');
        const centerX = boundingBox.x + boundingBox.width / 2;
        const centerY = boundingBox.y + boundingBox.height / 2;
        await this.page.mouse.move(centerX, centerY);
    }

    async elementClick(x: number, y: number): Promise<void> {
        await this.hoverCanvasElement(x, y);
        await this.page.waitForTimeout(500);
        await this.clickCanvasElement(x, y);
    }
}