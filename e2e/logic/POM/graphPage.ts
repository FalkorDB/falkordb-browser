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

    private get createGraphConfirmButton(): Locator {
        return this.page.getByTestId("createGraphConfirmButton");
    }

    private get createGraphCancelButton(): Locator {
        return this.page.getByTestId("createGraphCancelButton");
    }

    // DELETE
    private get deleteGraphButton(): Locator {
        return this.page.getByTestId("deleteGraphButton");
    }

    private get deleteGraphConfirmButton(): Locator {
        return this.page.getByTestId("deleteGraphConfirmButton");
    }

    private get deleteGraphCancelButton(): Locator {
        return this.page.getByTestId("deleteGraphCancelButton");
    }

    // EXPORT
    private get exportGraphButton(): Locator {
        return this.page.getByTestId("exportGraphButton");
    }

    private get exportGraphConfirmButton(): Locator {
        return this.page.getByTestId("exportGraphConfirmButton");
    }

    private get exportGraphCancelButton(): Locator {
        return this.page.getByTestId("exportGraphCancelButton");
    }

    // RELOAD
    private get reloadGraphsListButton(): Locator {
        return this.page.getByTestId("reloadGraphsListButton");
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
    private get manageGraphsButton(): Locator {
        return this.page.getByTestId("manageGraphsButton");
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

    private get editorRunButton(): Locator {
        return this.page.getByTestId("editorRunButton");
    }

    private get editorMaximizeButton(): Locator {
        return this.page.getByTestId("editorMaximizeButton");
    }

    // QUERY HISTORY
    private get queryHistoryButton(): Locator {
        return this.page.getByTestId("queryHistoryButton");
    }

    private get queryHistorySearchInput(): Locator {
        return this.page.getByTestId("queryHistorySearchInput");
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
    private get elementCanvasAddButton(): Locator {
        return this.page.getByTestId("elementCanvasAddButtonGraph");
    }

    private get elementCanvasAddNodeButton(): Locator {
        return this.page.getByTestId("elementCanvasAddNodeButtonGraph");
    }

    private get elementCanvasAddEdgeButton(): Locator {
        return this.page.getByTestId("elementCanvasAddEdgeButtonGraph");
    }

    // DELETE
    private get deleteElementButton(): Locator {
        return this.page.getByTestId("deleteElementButtonGraph");
    }

    private get deleteElementConfirmButton(): Locator {
        return this.page.getByTestId("deleteElementConfirmButtonGraph");
    }

    private get deleteElementCancelButton(): Locator {
        return this.page.getByTestId("deleteElementCancelButtonGraph");
    }

    // LABELS
    private get labelsButtonByName(): (label: "RelationshipTypes" | "Labels", name: string) => Locator {
        return (label: "RelationshipTypes" | "Labels", name: string) => this.page.getByTestId(`Graph${label}Button${name}`);
    }

    // TOAST
    private get toast(): Locator {
        return this.page.getByTestId("toast");
    }

    // CONTROLS
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

    // DATA PANEL
    private get dataPanelElementDeleteButton(): Locator {
        return this.page.getByTestId("deleteElementButtonGraph");
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

    async fillQueryHistorySearchInput(text: string): Promise<void> {
        await interactWhenVisible(this.queryHistorySearchInput, (el) => el.fill(text), "Query History Search Input");
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
        await interactWhenVisible(this.createGraphConfirmButton, (el) => el.click(), "Create Graph Confirm");
    }

    async clickCreateGraphCancel(): Promise<void> {
        await interactWhenVisible(this.createGraphCancelButton, (el) => el.click(), "Create Graph Cancel");
    }

    async clickDeleteGraph(): Promise<void> {
        await interactWhenVisible(this.deleteGraphButton, (el) => el.click(), "Delete Graph");
    }

    async clickDeleteGraphConfirm(): Promise<void> {
        await interactWhenVisible(this.deleteGraphConfirmButton, (el) => el.click(), "Confirm Delete Graph");
    }

    async clickDeleteGraphCancel(): Promise<void> {
        await interactWhenVisible(this.deleteGraphCancelButton, (el) => el.click(), "Cancel Delete Graph");
    }

    async clickExportGraph(): Promise<void> {
        await interactWhenVisible(this.exportGraphButton, (el) => el.click(), "Export Graph");
    }

    async clickExportGraphConfirm(): Promise<void> {
        await interactWhenVisible(this.exportGraphConfirmButton, (el) => el.click(), "Confirm Export Graph");
    }

    async clickExportGraphCancel(): Promise<void> {
        await interactWhenVisible(this.exportGraphCancelButton, (el) => el.click(), "Cancel Export Graph");
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

    async clickElementCanvasAddButton(): Promise<void> {
        await interactWhenVisible(this.elementCanvasAddButton, (el) => el.click(), "Add Element Button");
    }

    async clickElementCanvasAddNodeButton(): Promise<void> {
        await interactWhenVisible(this.elementCanvasAddNodeButton, (el) => el.click(), "Add Node Button");
    }

    async clickElementCanvasAddEdgeButton(): Promise<void> {
        await interactWhenVisible(this.elementCanvasAddEdgeButton, (el) => el.click(), "Add Edge Button");
    }

    async clickDeleteElementButton(): Promise<void> {
        await interactWhenVisible(this.deleteElementButton, (el) => el.click(), "Delete Element Button");
    }

    async clickDeleteElementConfirm(): Promise<void> {
        await interactWhenVisible(this.deleteElementConfirmButton, (el) => el.click(), "Confirm Delete Element");
    }

    async clickDeleteElementCancel(): Promise<void> {
        await interactWhenVisible(this.deleteElementCancelButton, (el) => el.click(), "Cancel Delete Element");
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

    async clickEditorRunButton(): Promise<void> {
        await interactWhenVisible(this.editorRunButton, (el) => el.click(), "Editor Run Button");
    }

    async clickManageGraphsButton(): Promise<void> {
        await interactWhenVisible(this.manageGraphsButton, (el) => el.click(), "Manage Graphs Button");
    }

    async clickTableGraphsCheckboxByName(name: string): Promise<void> {
        await interactWhenVisible(this.tableGraphsCheckboxByName(name), (el) => el.click(), `Table Graphs Checkbox ${name}`);
    }

    async clickExportGraphButton(): Promise<void> {
        await interactWhenVisible(this.exportGraphButton, (el) => el.click(), "Export Graph Button");
    }

    async clickReloadGraphsListButton(): Promise<void> {
        await interactWhenVisible(this.reloadGraphsListButton, (el) => el.click(), "Reload Graphs List Button");
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
        await this.clickEditorRunButton();
        if (waitForAnimation) {
            await this.waitForCanvasAnimationToEnd();
        } else {
            await waitForElementToBeEnabled(this.editorRunButton);
        }
    }

    async exportGraph(graphName: string): Promise<Download> {
        await this.clickSelectGraph();
        await this.clickManageGraphsButton();
        await this.clickTableGraphsCheckboxByName(graphName);
        await this.clickExportGraphButton();
        const [download] = await Promise.all([
            this.page.waitForEvent("download"),
            this.clickExportGraphConfirm(),
        ]);
        return download;
    }

    async reloadGraphList(): Promise<void> {
        await this.clickReloadGraphsListButton();
        await waitForElementToBeEnabled(this.reloadGraphsListButton);
    }

    async isModifyGraphNameButtonVisible(graphName: string): Promise<boolean> {
        await this.clickSelectGraph();
        await this.clickManageGraphsButton();
        await this.hoverTableGraphsRowByName(graphName);
        const isVisible = await this.isVisibleEditButtonGraphs();
        return isVisible;
    }

    async modifyGraphName(oldName: string, newName: string): Promise<void> {
        await this.clickSelectGraph();
        await this.clickManageGraphsButton();
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

    async deleteElements(positions: { x: number, y: number }[]): Promise<void> {
        positions.forEach(async (position) => {
            await this.elementClick(position.x, position.y);
        });
        await this.clickDeleteElementButton();
        await this.clickDeleteElementConfirm();
        await waitForElementToNotBeVisible(this.dataPanelElementDeleteButton);
    }

    async deleteElement(name: string): Promise<void> {
        await this.searchElementInCanvas(name);
        await this.clickDeleteElementButton();
        await this.clickDeleteElementConfirm();
        await waitForElementToNotBeVisible(this.dataPanelElementDeleteButton);
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

    async waitForCanvasAnimationToEnd(timeout = 7000): Promise<void> {
        await this.page.waitForTimeout(1500); // fit to size animation 
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

    async getNodeScreenPositions(windowKey: 'graph' | 'schema'): Promise<any[]> {
        const graphData = await this.page.evaluate((key) => (window as any)[key], windowKey);

        const transformData = await this.getCanvasTransform(this.canvasElement);
        const { a, e, d, f } = transformData.transform;
        const { left, top } = transformData;

        const offsets = {
            graph: { x: -105, y: -380 },
            schema: { x: -40, y: -370 }
        };

        const { x: offsetX, y: offsetY } = offsets[windowKey];

        return graphData.elements.nodes.map((node: any) => ({
            ...node,
            screenX: left + node.x * a + e + offsetX,
            screenY: top + node.y * d + f + offsetY,
        }));
    }

    async getLinksScreenPositions(windowKey: 'graph' | 'schema'): Promise<any[]> {
        const graphData = await this.page.evaluate((key) => (window as any)[key], windowKey);

        const transformData = await this.getCanvasTransform(this.canvasElement);
        const { a, e, d, f } = transformData.transform;
        const { left, top } = transformData;

        const offsets = {
            graph: { x: -105, y: -380 },
            schema: { x: -40, y: -370 }
        };

        const { x: offsetX, y: offsetY } = offsets[windowKey];

        return graphData.elements.links.map((link: any) => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;

            const source = graphData.elements.nodes.find((n: any) => n.id === sourceId);
            const target = graphData.elements.nodes.find((n: any) => n.id === targetId);

            const sourceScreenX = left + source.x * a + e + offsetX;
            const sourceScreenY = top + source.y * d + f + offsetY;
            const targetScreenX = left + target.x * a + e + offsetX;
            const targetScreenY = top + target.y * d + f + offsetY;

            return {
                id: link.id,
                sourceId,
                targetId,
                sourceScreenX,
                sourceScreenY,
                targetScreenX,
                targetScreenY,
                midX: (sourceScreenX + targetScreenX) / 2,
                midY: (sourceScreenY + targetScreenY) / 2,
                ...link
            };
        });
    }

    async changeNodePosition(fromX: number, fromY: number, toX: number, toY: number): Promise<void> {
        const box = (await this.getBoundingBoxCanvasElement())!;
        const absStartX = box.x + fromX;
        const absStartY = box.y + fromY;
        const absEndX = box.x + toX;
        const absEndY = box.y + toY;

        await this.page.mouse.move(absStartX, absStartY);
        await this.page.mouse.down();
        await this.page.mouse.move(absEndX, absEndY);
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