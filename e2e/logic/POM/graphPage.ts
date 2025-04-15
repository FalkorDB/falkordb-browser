/* eslint-disable prefer-destructuring */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Locator, Download } from "@playwright/test";
import BasePage from "@/e2e/infra/ui/basePage";
import { interactWhenVisible, waitForElementToBeVisible, waitForTimeOut } from "@/e2e/infra/utils";

export default class GraphPage extends BasePage {

    private get graphsMenu(): Locator {
        return this.page.getByRole("combobox");
    }

    private get manageGraphBtn(): Locator {
      return this.page.locator("//button[contains(text(), 'Manage Graphs')]")
    }

    private get deleteGraphBtn(): Locator {
        return this.page.locator("//div[contains(@id, 'tableComponent')]//button[contains(text(), 'Delete')]")
    }

    private get addGraphBtnInNavBar(): Locator {
        return this.page.locator("//*[contains(@class, 'Header')]//button[contains(text(), 'Create New Graph')]");
    }

    private get addGraphBtnInGraphManager(): Locator {
        return this.page.locator("//div[contains(@id, 'graphManager')]//button[contains(@aria-label, 'Create New Graph')]");
    }

    private get graphNameInput(): Locator {
        return this.page.getByRole("textbox");
    }

    private get createGraphBtn(): Locator {
        return this.page.locator("//div[@id='dialog']//button[contains(text(), 'Create your Graph')]");
    }

    private get exportDataBtn(): Locator {
        return this.page.locator("//button[contains(text(), 'Export Data')]");
    }

    private get exportDataConfirmBtn(): Locator {
        return this.page.getByRole("button", { name: "Download" });
    }

    private get findGraphInMenu(): (graph: string) => Locator {
        return (graph: string) => this.page.getByRole('row', { name: graph, exact: true });
    }

    private get checkGraphInMenu(): (graph: string) => Locator {
        return (graph: string) => this.findGraphInMenu(graph).getByRole('checkbox');
    }

    private get deleteAllGraphInMenu(): Locator {
        return this.page.getByRole('row', { name: 'Name', exact: true }).getByRole('checkbox');
    }

    private get graphMenuElements(): Locator {
        return this.page.getByRole('row');
    }

    private get deleteGraphConfirmBtn(): Locator {
        return this.page.locator("//button[contains(text(), 'Delete Graph')]")
    }

    private get errorNotification(): Locator {
        return this.page.locator("//ol//li//div[text()='Error']")
    }

    private get queryInput(): Locator {
        return this.page.locator("#editor-container")
    }

    private get queryRunBtn(): Locator {
        return this.page.locator("//button[text()='Run']");
    }

    protected get canvasElement(): Locator {
        return this.page.locator("//div[contains(@class, 'force-graph-container')]//canvas");
    }

    private get selectBtnFromGraphManager(): (buttonNumber: string) => Locator {
        return (buttonNumber: string) => this.page.locator(`//div[@id='graphManager']//button[${buttonNumber}]`);
    }

    private get selectGraphList(): (graph: string) => Locator {
        return (graph: string) => this.page.locator(`//ul[@id='graphsList']/div[descendant::text()[contains(., '${graph}')]]`);
    }

    private get graphSelectSearchInput(): Locator {
        return this.page.locator(`//div[@id='graphSearch']//input`);
    }

    private get canvasElementSearchInput(): Locator {
        return this.page.locator("//div[@id='elementCanvasSearch']//input");
    }

    private get canvasElementSearchBtn(): Locator {
        return this.page.locator("//div[@id='elementCanvasSearch']//button");
    }

    private get nodeCanvasToolTip(): Locator {
        return this.page.locator("//div[contains(@class, 'float-tooltip-kap')]");
    }

    private get reloadGraphListBtn(): (index: string) => Locator {
        return (index: string) => this.page.locator(`//div[@id='graphManager']//button[${index}]`);
    }

    private get zoomInBtn(): Locator {
        return this.page.locator("//button[contains(., 'Zoom In')]");
    }

    private get zoomOutBtn(): Locator {
        return this.page.locator("//button[contains(., 'Zoom Out')]");
    }

    private get fitToSizeBtn(): Locator {
        return this.page.locator("//button[contains(., 'Fit To Size')]");
    }

    private get editBtnInGraphListMenu(): (graph: string) => Locator {
        return (graph: string) => this.page.locator(`//table//tbody/tr[@data-id='${graph}']//td[2]//button`);
    }

    private get editInputInGraphListMenu(): (graph: string) => Locator {
        return (graph: string) => this.page.locator(`//table//tbody/tr[@data-id='${graph}']//td[2]//input`);
    }

    private get editSaveBtnInGraphListMenu(): (graph: string) => Locator {
        return (graph: string) => this.page.locator(`//table//tbody/tr[@data-id='${graph}']//td[2]//button[1]`);
    }

    private get valueCellByAttributeInDataPanel(): (attribute: string) => Locator {
        return (attribute: string) => this.page.locator(`//div[contains(@id, 'graphDataPanel')]//tbody//tr[td[contains(text(), '${attribute}')]]/td[last()]/button`);
    }

    private get nodesGraphStats(): Locator {
        return this.page.locator("//div[@id='graphStats']//span[1]");
    }

    private get edgesGraphStats(): Locator {
        return this.page.locator("//div[@id='graphStats']//span[2]");
    }

    private get showTimeoutInput(): Locator {
        return this.page.getByRole("button", { name: "Show Timeout" });
    }

    private get increaseTimeoutBtn(): Locator {
        return this.page.getByRole("button", { name: "Increase Timeout" });
    }

    private get decreaseTimeoutBtn(): Locator {
        return this.page.getByRole("button", { name: "Decrease Timeout" });
    }

    private get timeoutInput(): Locator {
        return this.page.locator("#timeoutInput");
    }

    private get deleteNodeInGraphDataPanel(): Locator {
        return this.page.locator('//div[contains(@id, "graphDataPanel")]//button[contains(text(), "Delete Node")]');
    }

    private get confirmDeleteNodeInDataPanel(): Locator {
        return this.page.locator('//div[@role="dialog"]//button[contains(text(), "Delete")]');
    }

    private get deleteRelationInGraphDataPanel(): Locator {
        return this.page.locator('//div[contains(@id, "graphDataPanel")]//button[contains(text(), "Delete Relation")]');
    }

    private get deleteNodeInCanvasPanel(): Locator {
        return this.page.locator('//button[normalize-space(text()) = "Delete"]');
    }

    async insertGraphInSearchInput(graph: string): Promise<void> {
        await interactWhenVisible(this.graphSelectSearchInput, el => el.fill(graph), "graph search input");
    }
    
    async insertElementInCanvasSearch(node: string): Promise<void> {
        await interactWhenVisible(this.canvasElementSearchInput, el => el.fill(node), "canvas element search input");
    }
    
    async clickOnElementSearchInCanvas(): Promise<void> {
        await interactWhenVisible(this.canvasElementSearchBtn, el => el.click(), "canvas element search button");
    }
    
    async reloadGraphList(role: string = "admin"): Promise<void> {
        const index = role === 'readonly' ? "1" : "2";
        await interactWhenVisible(this.reloadGraphListBtn(index), el => el.click(), "reload graph button");
    }
    
    async clickOnZoomIn(): Promise<void> {
        await interactWhenVisible(this.zoomInBtn, el => el.click(), "zoom in button");
    }
    
    async clickOnZoomOut(): Promise<void> {
        await interactWhenVisible(this.zoomOutBtn, el => el.click(), "zoom out button");
    }
    
    async clickOnFitToSize(): Promise<void> {
        await interactWhenVisible(this.fitToSizeBtn, el => el.click(), "fit to size button");
        await this.waitForCanvasAnimationToEnd();
    }
    
    async clickAddGraphBtnInNavBar(): Promise<void> {
        await interactWhenVisible(this.addGraphBtnInNavBar, el => el.click(), "add graph in nav bar button");
    }
    
    async getDataCellByAttrInDataPanel(attribute: string): Promise<string | null> {
        const locator = this.valueCellByAttributeInDataPanel(attribute);
        await interactWhenVisible(locator, async () => {}, "value cell by attr button");
        return await locator.textContent();
    }
    
    async getNodesGraphStats(): Promise<string | null> {
        await this.page.waitForTimeout(300);
        await interactWhenVisible(this.nodesGraphStats, async () => {}, "node graph stats button");
        return await this.nodesGraphStats.textContent();
    }
    
    async getEdgesGraphStats(): Promise<string | null> {
        await this.page.waitForTimeout(300);
        await interactWhenVisible(this.edgesGraphStats, async () => {}, "edges graph stats button");
        return await this.edgesGraphStats.textContent();
    }

    async openGraphsMenu(): Promise<void> {
        await interactWhenVisible(this.graphsMenu, el => el.click(), "graphs menu combobox");
    }
    
    async clickManageGraphButton(): Promise<void> {
        await interactWhenVisible(this.manageGraphBtn, el => el.click(), "manage graphs button");
    }
    
    async clickDeleteGraphButton(): Promise<void> {
        await interactWhenVisible(this.deleteGraphBtn, el => el.click(), "delete graph button");
    }
    
    async insertGraphName(name: string): Promise<void> {
        await interactWhenVisible(this.graphNameInput, el => el.fill(name), "graph name input");
    }
    
    async clickCreateGraphButton(): Promise<void> {
        await interactWhenVisible(this.createGraphBtn, el => el.click(), "create graph button");
    }
    
    async clickExportDataButton(): Promise<void> {
        await interactWhenVisible(this.exportDataBtn, el => el.click(), "export data button");
    }
    
    async clickExportDataConfirmButton(): Promise<void> {
        await interactWhenVisible(this.exportDataConfirmBtn, el => el.click(), "confirm export data button");
    }
    
    async confirmGraphDeletion(): Promise<void> {
        await interactWhenVisible(this.deleteGraphConfirmBtn, el => el.click(), "confirm delete graph button");
    }
    
    async clickRunQuery(waitForAnimation = true): Promise<void> {
        await interactWhenVisible(this.queryRunBtn, el => el.click(), "run query button");
        if (waitForAnimation) {
            await this.waitForCanvasAnimationToEnd();
        }
    }
    
    async clickShowTimeout(): Promise<void> {
        await interactWhenVisible(this.showTimeoutInput, el => el.click(), "show timeout button");
    }
    
    async clickIncreaseTimeout(): Promise<void> {
        await interactWhenVisible(this.increaseTimeoutBtn, el => el.click(), "increase timeout button");
    }
    
    async clickDecreaseTimeout(): Promise<void> {
        await interactWhenVisible(this.decreaseTimeoutBtn, el => el.click(), "decrease timeout button");
    }
    
    async insertTimeoutValue(value: string): Promise<void> {
        await interactWhenVisible(this.timeoutInput, el => el.fill(value), "timeout input");
    }

    async clickOnQueryInput(): Promise<void> {
        await interactWhenVisible(this.queryInput, el => el.click(), "query input");
    }
    
    async clickGraphCheckbox(graph: string): Promise<void> {
        const checkbox = this.checkGraphInMenu(graph);
        await interactWhenVisible(checkbox, el => el.click(), `checkbox for graph "${graph}"`);
    }
    
    async clickSelectBtnFromGraphManager(role: string = "admin"): Promise<void> {
        const index = role === 'readonly' ? "2" : "3";
        const button = this.selectBtnFromGraphManager(index);
        await interactWhenVisible(button, el => el.click(), `graph manager select button #${index}`);
    }
    
    async clickDeleteAllGraphsCheckbox(): Promise<void> {
        await interactWhenVisible(this.deleteAllGraphInMenu, el => el.click(), "delete all graphs checkbox");
    }

    async hoverOverGraphInMenu(graph: string): Promise<void> {
        const row = this.findGraphInMenu(graph);
        await interactWhenVisible(row, el => el.hover(), `graph row for "${graph}"`);
    }

    async clickEditBtnInGraphListMenu(graph: string): Promise<void> {
        const editBtn = this.editBtnInGraphListMenu(graph);
        await interactWhenVisible(editBtn, el => el.click(), `edit button for graph "${graph}"`);
    }
    
    async fillEditInputInGraphListMenu(graph: string, newName: string): Promise<void> {
        const input = this.editInputInGraphListMenu(graph);
        await interactWhenVisible(input, el => el.fill(newName), `edit input for graph "${graph}"`);
    }

    async clickEditSaveBtnInGraphListMenu(graph: string): Promise<void> {
        const saveBtn = this.editSaveBtnInGraphListMenu(graph);
        await interactWhenVisible(saveBtn, el => el.click(), `save button for graph "${graph}"`);
    }
    
    async clickGraphFromList(graph: string): Promise<void> {
        const graphItem = this.selectGraphList(graph);
        await interactWhenVisible(graphItem, el => el.click(), `graph item "${graph}" in graph list`);
    }

    async clickAddGraphBtnInGraphManager(): Promise<void> {
        await interactWhenVisible(this.addGraphBtnInGraphManager, el => el.click(), "add graph button in graph manager");
    }

    async clickDeleteNodeInGraphDataPanel(): Promise<void> {
        await interactWhenVisible(this.deleteNodeInGraphDataPanel, el => el.click(), "delete node in data panel");
    }

    async clickConfirmDeleteNodeInDataPanel(): Promise<void> {
        await interactWhenVisible(this.confirmDeleteNodeInDataPanel, el => el.click(), "confirm delete in data panel");
    }

    async clickDeleteRelationInGraphDataPanel(): Promise<void> {
        await interactWhenVisible(this.deleteRelationInGraphDataPanel, el => el.click(), "delete relation in data panel");
    }

    async clickDeleteNodeInCanvasPanel(): Promise<void> {
        await interactWhenVisible(this.deleteNodeInCanvasPanel, el => el.click(), "delete node in canvas panel");
    }
    
    async countGraphsInMenu(): Promise<number> {
        await waitForTimeOut(this.page, 1000);

        if (await this.graphsMenu.isEnabled()) {
            await this.openGraphsMenu();
            await this.clickManageGraphButton();
            const count = await this.graphMenuElements.count();
            await this.refreshPage();
            return count;
        }
        return 0;
    }

    async removeAllGraphs(): Promise<void> {
        await waitForTimeOut(this.page, 1000);
        if (await this.graphsMenu.isEnabled()) {
            await this.openGraphsMenu();
            await this.clickManageGraphButton();
            await this.clickDeleteAllGraphsCheckbox()
            await this.clickDeleteGraphButton()
            await this.confirmGraphDeletion();
        }
    }

    async addGraph(graphName: string): Promise<void> {
        await this.clickAddGraphBtnInNavBar();
        await this.insertGraphName(graphName);
        await this.clickCreateGraphButton();
    }

    async exportGraph(): Promise<Download> {
        await this.waitForPageIdle();
        const [download] = await Promise.all([
            this.page.waitForEvent('download'),
            this.clickExportDataButton(),
            this.clickExportDataConfirmButton()
        ]);

        return download;
    }

    async verifyGraphExists(graph: string): Promise<boolean> {
        if (await this.graphsMenu.isDisabled()) return false;

        await this.openGraphsMenu();
        await this.clickManageGraphButton();
        return await this.findGraphInMenu(graph).isVisible();
    }

    async modifyGraphName(graph: string, newGraphName: string): Promise<void> {
        await this.openGraphsMenu();
        await this.clickManageGraphButton();
        await this.hoverOverGraphInMenu(graph);
        await this.clickEditBtnInGraphListMenu(graph);
        await this.fillEditInputInGraphListMenu(graph, newGraphName);
        await this.clickEditSaveBtnInGraphListMenu(graph);
    }

    async deleteGraph(graph: string): Promise<void> {
        await this.openGraphsMenu();
        await this.clickManageGraphButton();
        await this.clickGraphCheckbox(graph);
        await this.clickDeleteGraphButton();
        await this.confirmGraphDeletion();
    }

    async getErrorNotification(): Promise<boolean>{
        await this.page.waitForTimeout(500);
        const isVisible = await this.errorNotification.isVisible();
        return isVisible;
    }

    async insertQuery(query: string): Promise<void>{
        await this.clickOnQueryInput();
        await this.page.keyboard.type(query);
    }

    async waitForRunQueryToBeEnabled(): Promise<void> {
        while (await this.queryRunBtn.isDisabled()) {
            await this.page.waitForTimeout(1000);
        }
    }

    async nodeClick(x: number, y: number): Promise<void> {
        await this.canvasElement.hover({ position: { x, y } });
        await this.page.waitForTimeout(500);
        await this.canvasElement.click({ position: { x, y }, button: 'right' });
    }

    async selectGraphFromList(graph: string): Promise<void> {
        await this.insertGraphInSearchInput(graph);
        await this.clickGraphFromList(graph);
    }

    async selectExistingGraph(graph: string, role?: string): Promise<void>{
        await this.clickSelectBtnFromGraphManager(role);
        await this.selectGraphFromList(graph);
    }

    async searchForElementInCanvas(node: string): Promise<void>{
        await this.insertElementInCanvasSearch(node);
        await this.clickOnElementSearchInCanvas();
        await this.waitForCanvasAnimationToEnd();
    }

    async isNodeCanvasToolTip(): Promise<boolean>{
        await this.page.waitForTimeout(500);
        const isVisible = await this.nodeCanvasToolTip.isVisible();
        return isVisible;
    }

    async getNodeCanvasToolTip(): Promise<string | null>{
        await this.page.waitForTimeout(1000);
        const toolTipText = await this.nodeCanvasToolTip.textContent();
        return toolTipText;
    }
    
    async getCanvasTransform(canvasElement: Locator): Promise<any> {
        let transformData = null;
        for (let attempt = 0; attempt < 3; attempt++) {
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
            await new Promise(res => setTimeout(res, 1000));
        }
    
        throw new Error("Canvas transform data not available!");
    }

    async getNodeScreenPositions(windowKey: 'graph' | 'schema'): Promise<any[]> {
        await this.page.waitForTimeout(2000);
    
        const graphData = await this.page.evaluate((key) => {
            return (window as any)[key];
        }, windowKey);
    
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
        await this.page.waitForTimeout(2000);
    
        const graphData = await this.page.evaluate((key) => {
            return (window as any)[key];
        }, windowKey);
    
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

    async changeNodePosition(x: number, y: number): Promise<void> {
        const box = (await this.canvasElement.boundingBox())!;
        const targetX = x + 100;
        const targetY = y + 50;
        const absStartX = box.x + x;
        const absStartY = box.y + y;
        const absEndX = box.x + targetX;
        const absEndY = box.y + targetY;
        await this.page.mouse.move(absStartX, absStartY);
        await this.page.mouse.down();
        await this.page.mouse.move(absEndX, absEndY);
        await this.page.mouse.up();
    }

    async rightClickAtCanvasCenter(): Promise<void> {
        const boundingBox = await this.canvasElement.boundingBox();
        if (!boundingBox) throw new Error('Canvas bounding box not found');
        const centerX = boundingBox.x + boundingBox.width / 2;
        const centerY = boundingBox.y + boundingBox.height / 2;
        await this.page.mouse.click(centerX, centerY, { button: 'right' });
    }

    async hoverAtCanvasCenter(): Promise<void> {
        const boundingBox = await this.canvasElement.boundingBox();
        if (!boundingBox) throw new Error('Canvas bounding box not found');
        const centerX = boundingBox.x + boundingBox.width / 2;
        const centerY = boundingBox.y + boundingBox.height / 2;
        await this.page.mouse.move(centerX, centerY);
    }
    
    async waitForCanvasAnimationToEnd(timeout = 7000): Promise<void> {
        await this.page.waitForTimeout(1500); // fit to size animation 
      
        await this.page.waitForFunction(
          (selector) => {
            const canvas = document.querySelector(selector);
            return canvas?.getAttribute("data-engine-status") === "stop";
          },
          '.force-graph-container canvas',
          { timeout }
        );
    }
      
    async getCanvasScaling(): Promise<{ scaleX: number; scaleY: number }> {
        const { scaleX, scaleY } = await this.canvasElement.evaluate((canvas: HTMLCanvasElement) => {
            const ctx = canvas.getContext('2d');
            const transform = ctx?.getTransform();
            return {
                scaleX: transform?.a || 1,
                scaleY: transform?.d || 1,
            };
        });
        return { scaleX, scaleY };
    }
    
    async addTimeout(timeout?: number): Promise<void> {
        await this.showTimeoutInput.click();
        if (timeout) {
            await this.timeoutInput.fill(timeout.toString());
        } else {
            await this.increaseTimeoutBtn.click();
        }
    }

    async deleteNodeViaCanvasPanel(x: number, y: number): Promise<void>{
        await this.nodeClick(x, y);
        await this.clickDeleteNodeInCanvasPanel();
        await Promise.all([
            this.page.waitForResponse(res => res.status() === 200),
            this.clickConfirmDeleteNodeInDataPanel()
        ]);    
    }


    async deleteNode(x: number, y: number): Promise<void>{
        await this.nodeClick(x, y);
        await this.clickDeleteNodeInGraphDataPanel();
        await Promise.all([
            this.page.waitForResponse(res => res.status() === 200),
            this.clickConfirmDeleteNodeInDataPanel()
        ]);    
    }

    async deleteRelation(x: number, y: number): Promise<void> {
        await this.nodeClick(x, y);
        await this.clickDeleteRelationInGraphDataPanel();
        await Promise.all([
            this.page.waitForResponse(res => res.status() === 200),
            this.clickConfirmDeleteNodeInDataPanel()
        ]);
    }
}