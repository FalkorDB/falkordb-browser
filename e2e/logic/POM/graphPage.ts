/* eslint-disable prefer-destructuring */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Locator, Download } from "@playwright/test";
import BasePage from "@/e2e/infra/ui/basePage";
import { waitForElementToBeVisible, waitForTimeOut } from "@/e2e/infra/utils";

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
        return this.page.getByText("Create New Graph");
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

    private get canvasElement(): Locator {
        return this.page.locator("//div[contains(@class, 'force-graph-container')]//canvas");
    }

    private get showLimitBtn(): Locator {
        return this.page.getByRole("button", { name: "Show Limit" });
    }

    private get limitInput(): Locator {
        return this.page.locator("#limitInput");
    }

    private get increaseLimitBtn(): Locator {
        return this.page.getByRole("button", { name: "Increase Limit" });
    }

    private get decreaseLimitBtn(): Locator {
        return this.page.getByRole("button", { name: "Decrease Limit" });
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

    /* QUERY History */

    private get queryHistoryDialog(): Locator {
        return this.page.locator("//div[contains(@id, 'queryHistory')]");
    }

    private get queryHistory(): Locator {
        return this.page.locator("//button[contains(text(), 'Query History')]");
    }

    private get queryInHistory(): (query: string) => Locator {
        return (query: string) => this.page.locator(`//div[contains(@id, 'queryHistory')]//ul//li[${query}]`);
    }

    private get selectQueryInHistoryBtn(): (query: string) => Locator {
        return (query: string) => this.page.locator(`//div[contains(@id, 'queryHistory')]//ul//li[${query}]/button`);
    }

    private get runBtnInQueryHistory(): Locator {
        return this.page.locator("//div[contains(@id, 'queryHistory')]//button[contains(text(), 'Run')]");
    }

    private get queryHistoryTextarea(): Locator {
        return this.page.locator("#queryHistoryEditor textarea");
    }

    private get queryHistoryPanel(): Locator {
        return this.page.locator("//div[@id='queryHistoryPanel']//ul");
    }

    async countGraphsInMenu(): Promise<number> {
        await waitForTimeOut(this.page, 1000);

        if (await this.graphsMenu.isEnabled()) {
            await this.graphsMenu.click();
            await this.manageGraphBtn.click();
            const count = await this.graphMenuElements.count();
            await this.refreshPage();
            return count;
        }

        return 0;
    }

    async removeAllGraphs(): Promise<void> {
        await waitForTimeOut(this.page, 1000);
        if (await this.graphsMenu.isEnabled()) {
            await this.graphsMenu.click();
            await this.manageGraphBtn.click();
            await this.deleteAllGraphInMenu.click()
            await this.deleteGraphBtn.click()
            await this.deleteGraphConfirmBtn.click();
        }
    }

    async addGraph(graphName: string): Promise<void> {
        await this.addGraphBtnInNavBar.click();
        await this.graphNameInput.fill(graphName);
        await this.createGraphBtn.click();
    }

    async exportGraph(): Promise<Download> {
        await this.page.waitForLoadState('networkidle');
        const [download] = await Promise.all([
            this.page.waitForEvent('download'),
            this.exportDataBtn.click(),
            this.exportDataConfirmBtn.click()
        ]);

        return download;
    }

    async verifyGraphExists(graph: string): Promise<boolean> {
        if (await this.graphsMenu.isDisabled()) return false;

        await this.graphsMenu.click();
        await this.manageGraphBtn.click();
        const isVisible = await this.findGraphInMenu(graph).isVisible();

        return isVisible;
    }

    async modifyGraphName(graph: string, newGraphName: string): Promise<void> {
        await this.graphsMenu.click();
        await this.manageGraphBtn.click();
        const isFindGraphInMenuVisible = await waitForElementToBeVisible(this.findGraphInMenu(graph));
        if (!isFindGraphInMenuVisible) throw new Error("find graph in menu button is not visible!");
        await this.findGraphInMenu(graph).hover();
        await this.editBtnInGraphListMenu(graph).click();
        await this.editInputInGraphListMenu(graph).fill(newGraphName);
        await this.editSaveBtnInGraphListMenu(graph).click();
    }

    async deleteGraph(graph: string): Promise<void> {
        await this.graphsMenu.click();
        await this.manageGraphBtn.click();
        await this.checkGraphInMenu(graph).click();
        await this.deleteGraphBtn.click();
        await this.deleteGraphConfirmBtn.click();
    }

    async getErrorNotification(): Promise<boolean> {
        await this.page.waitForTimeout(500);
        const isVisible = await this.errorNotification.isVisible();
        return isVisible;
    }

    async insertQuery(query: string): Promise<void> {
        await this.queryInput.click();
        await this.page.keyboard.type(query);
    }

    async clickRunQuery(waitForAnimation = true): Promise<void> {
        const isVisible = await waitForElementToBeVisible(this.queryRunBtn);
        if (!isVisible) throw new Error("run query button is not visible!");
        await this.queryRunBtn.click();
        if (waitForAnimation) {
            await this.waitForCanvasAnimationToEnd();
        }
    }

    async nodeClick(x: number, y: number): Promise<void> {
        await this.canvasElement.hover({ position: { x, y } });
        await this.page.waitForTimeout(500);
        await this.canvasElement.click({ position: { x, y }, button: 'right' });
    }

    async clickOnSelectBtnFromGraphManager(role: string = "admin"): Promise<void> {
        const index = role === 'readonly' ? "2" : "3";
        const isSelectBtnFromGraphManager = await waitForElementToBeVisible(this.selectBtnFromGraphManager(index));
        if (!isSelectBtnFromGraphManager) throw new Error("select from graph manager button is not visible!");
        await this.selectBtnFromGraphManager(index).click();
    }

    async selectGraphFromList(graph: string): Promise<void> {
        await this.graphSelectSearchInput.fill(graph);
        const graphLocator = this.selectGraphList(graph);
        const isVisible = await waitForElementToBeVisible(graphLocator);
        if (!isVisible) throw new Error("select Graph From List button is not visible!");
        await graphLocator.click();
    }

    async selectExistingGraph(graph: string, role?: string): Promise<void> {
        await this.clickOnSelectBtnFromGraphManager(role);
        await this.selectGraphFromList(graph);
    }

    async insertElementInCanvasSearch(node: string): Promise<void> {
        const isCanvasElementSearchInput = await waitForElementToBeVisible(this.canvasElementSearchInput);
        if (!isCanvasElementSearchInput) throw new Error("canvas element search input is not visible!");
        await this.canvasElementSearchInput.fill(node);
    }

    async clickOnElementSearchInCanvas(): Promise<void> {
        const isCanvasElementSearchBtn = await waitForElementToBeVisible(this.canvasElementSearchBtn);
        if (!isCanvasElementSearchBtn) throw new Error("canvas element search button is not visible!");
        await this.canvasElementSearchBtn.click();
    }

    async searchForElementInCanvas(node: string): Promise<void> {
        await this.insertElementInCanvasSearch(node);
        await this.clickOnElementSearchInCanvas();
        await this.waitForCanvasAnimationToEnd();
    }

    async isNodeCanvasToolTip(): Promise<boolean> {
        await this.page.waitForTimeout(500);
        const isVisible = await this.nodeCanvasToolTip.isVisible();
        return isVisible;
    }

    async getNodeCanvasToolTip(): Promise<string | null> {
        await this.page.waitForTimeout(500);
        const toolTipText = await this.nodeCanvasToolTip.textContent();
        return toolTipText;
    }

    async reloadGraphList(role: string = "admin"): Promise<void> {
        const index = role === 'readonly' ? "1" : "2";
        const isVisible = await waitForElementToBeVisible(this.reloadGraphListBtn(index));
        if (!isVisible) throw new Error("reload graph button is not visible!");
        await this.reloadGraphListBtn(index).click();
    }

    async clickOnZoomIn(): Promise<void> {
        const isVisible = await waitForElementToBeVisible(this.zoomInBtn);
        if (!isVisible) throw new Error("zoom in button is not visible!");
        await this.zoomInBtn.click();
    }

    async clickOnZoomOut(): Promise<void> {
        const isVisible = await waitForElementToBeVisible(this.zoomOutBtn);
        if (!isVisible) throw new Error("zoom out button is not visible!");
        await this.zoomOutBtn.click();
    }

    async clickOnFitToSize(): Promise<void> {
        const isVisible = await waitForElementToBeVisible(this.fitToSizeBtn);
        if (!isVisible) throw new Error("fit to size button is not visible!");
        await this.fitToSizeBtn.click();
        await this.waitForCanvasAnimationToEnd();
    }

    async getGraphDetails(): Promise<any[]> {
        await this.page.waitForTimeout(2000);

        const graphData = await this.page.evaluate(() => {
            return (window as any).graph;
        });

        let transformData: any = null;
        for (let attempt = 0; attempt < 3; attempt++) {
            await this.page.waitForTimeout(1000);

            transformData = await this.canvasElement.evaluate((canvas: HTMLCanvasElement) => {
                const rect = canvas.getBoundingClientRect();
                const ctx = canvas.getContext('2d');
                return {
                    left: rect.left,
                    top: rect.top,
                    transform: ctx?.getTransform() || null,
                };
            });

            if (transformData.transform) break;
            console.warn(`Attempt ${attempt + 1}: Transform data not available, retrying...`);
        }

        if (!transformData?.transform) throw new Error("Canvas transform data not available!");

        const { a, e, d, f } = transformData.transform;
        return graphData.elements.nodes.map((node: any) => ({
            ...node,
            screenX: transformData.left + node.x * a + e - 105,
            screenY: transformData.top + node.y * d + f - 380,
        }));
    }

    /* QUERY History */

    async clickOnQueryHistory(): Promise<void> {
        const isVisible = await waitForElementToBeVisible(this.queryHistory);
        if (!isVisible) throw new Error("query history button is not visible!");
        await this.queryHistory.click();
    }

    async selectQueryInHistory(query: string): Promise<void> {
        await this.queryInHistory(query).click();
    }

    async getQueryHistory(query: string): Promise<boolean> {
        await this.page.waitForTimeout(500);
        const isVisible = await this.queryInHistory(query).isVisible();
        return isVisible;
    }

    async clickOnRunBtnInQueryHistory(): Promise<void> {
        await this.runBtnInQueryHistory.click();
    }

    async isQueryHistoryDialog(): Promise<void> {
        await this.queryHistoryDialog.isVisible();
    }

    async ClickOnSelectQueryInHistoryBtn(queryNumber: string): Promise<void> {
        await this.selectQueryInHistoryBtn(queryNumber).click();
    }

    async getSelectQueryInHistoryText(queryNumber: string): Promise<string | null> {
        const text = await this.selectQueryInHistoryBtn(queryNumber).textContent();
        return text;
    }

    async runAQueryFromHistory(queryNumber: string): Promise<void> {
        await this.clickOnQueryHistory();
        await this.ClickOnSelectQueryInHistoryBtn(queryNumber);
        await this.clickOnRunBtnInQueryHistory();
        await this.waitForCanvasAnimationToEnd();
    }

    async getQueryHistoryEditor(): Promise<string | null> {
        await this.page.waitForTimeout(500);
        const value = await this.queryHistoryTextarea.inputValue();
        return value;
    }

    async getQueryHistoryPanel(): Promise<string[]> {
        const rawText = await this.queryHistoryPanel.allTextContents();

        if (!rawText || rawText.length === 0) {
            return [];
        }
        const formattedText = rawText[0]
            .replace(/Query internal execution time:.*/, '')
            .replace(/([a-z]+: \d+)/gi, '$1\n')
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        return formattedText;
    }

    /* End of QUERY History */

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

    async waitForCanvasAnimationToEnd(timeout = 15000, checkInterval = 500): Promise<void> {
        const canvasHandle = await this.canvasElement.elementHandle();

        if (!canvasHandle) {
            throw new Error("Canvas element not found!");
        }

        await this.page.waitForFunction(
            async ({ canvas, checkInterval, timeout }) => {
                const ctx = canvas.getContext('2d');
                if (!ctx) return false;

                const width = canvas.width;
                const height = canvas.height;

                let previousData = ctx.getImageData(0, 0, width, height).data;
                const startTime = Date.now();

                return new Promise<boolean>((resolve) => {
                    const checkCanvas = () => {
                        if (Date.now() - startTime > timeout) {
                            resolve(true);
                            return;
                        }

                        setTimeout(() => {
                            const currentData = ctx.getImageData(0, 0, width, height).data;
                            if (JSON.stringify(previousData) === JSON.stringify(currentData)) {
                                resolve(true);
                            } else {
                                previousData = currentData;
                                checkCanvas();
                            }
                        }, checkInterval);
                    };
                    checkCanvas();
                });
            },
            {
                canvas: await canvasHandle.evaluateHandle((el) => el as HTMLCanvasElement),
                checkInterval,
                timeout
            },
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

    async addLimit(limit?: number): Promise<void> {
        await this.showLimitBtn.click();
        if (limit) {
            await this.limitInput.fill(limit.toString());
        } else {
            await this.increaseLimitBtn.click();
        }
    }


}