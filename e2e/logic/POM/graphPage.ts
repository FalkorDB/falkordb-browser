/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-await-in-loop */
import { Download, Locator } from "@playwright/test";
import { waitForElementToBeVisible, waitForElementToBeEnabled, waitForElementToNotBeVisible, interactWhenVisible, delay, pollForElementContent } from "@/e2e/infra/utils";
import Page from "./page";

export default class GraphPage extends Page {

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

    private get graphsTabInHeader(): Locator {
        return this.page.getByTestId("GraphsButton");
    }

    // EDITOR
    public get editorContainer(): Locator {
        return this.page.getByTestId(`editorContainer`);
    }

    public get editorRun(): Locator {
        return this.page.getByTestId(`editorRun`);
    }

    public get editorMaximize(): Locator {
        return this.page.getByTestId(`editorMaximize`);
    }

    // QUERY HISTORY
    public get queryHistory(): Locator {
        return this.page.getByTestId(`queryHistory`);
    }

    public get queryHistorySearch(): Locator {
        return this.page.getByTestId(`queryHistorySearch`);
    }

    public get queryHistoryButtonByIndex(): Locator {
        return this.page.getByTestId(`queryHistoryButtonByIndex`);
    }

    public get queryHistoryEditorInput(): Locator {
        return this.page.getByTestId(`queryHistoryEditorInput`);
    }

    public get queryHistoryEditorRun(): Locator {
        return this.page.getByTestId(`queryHistoryEditorRun`);
    }

    public get elementCanvasSuggestionsListGraph(): Locator {
        return this.page.getByTestId(`elementCanvasSuggestionsListGraph`);
    }

    private get querySearchList(): Locator {
        return this.page.locator("//div[contains(@class, 'tree')]");
    }

    private get querySearchListItems(): Locator {
        return this.page.locator("//div[contains(@class, 'tree')]//div[contains(@class, 'contents')]");
    }

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
        await interactWhenVisible(this.insertInput("Graph"), (el) => el.fill(text), "Create Graph Input");
    }

    async fillSearch(text: string): Promise<void> {
        await interactWhenVisible(this.search("Graph"), (el) => el.fill(text), "Search Graph");
    }

    async fillInput(type: "Graph" | "Schema", text: string): Promise<void> {
        await interactWhenVisible(this.input(type), (el) => el.fill(text), `Input ${type}s`);
    }    

    async fillQueryHistorySearch(text: string): Promise<void> {
        await interactWhenVisible(this.queryHistorySearch, (el) => el.fill(text), "Query History Search");
    }

    async fillElementCanvasSearch(type: "Graph" | "Schema", text: string): Promise<void> {        
        await interactWhenVisible(this.elementCanvasSearch(type), (el) => el.fill(text), `Element Canvas Search ${type}`);
    }

    async clickCanvasElement(x: number, y: number): Promise<void> {
        await interactWhenVisible(this.canvasElement, (el) => el.click({ position: { x, y } }), "Canvas Element");
    }

    async clickEditorInput(): Promise<void> {
        await interactWhenVisible(this.editorContainer, (el) => el.click(), "Editor Input");
    }

    async clickCreateGraph(): Promise<void> {        
        await interactWhenVisible(this.create("Graph"), (el) => el.click(), "Create Graph");
    }

    async clickConfirmCreateGraph(): Promise<void> {
        await interactWhenVisible(this.createConfirm("Graph"), (el) => el.click(), "Create Graph Confirm");
    }

    async clickCreateCancel(): Promise<void> {
        await interactWhenVisible(this.createCancel("Graph"), (el) => el.click(), "Create Graph Cancel");
    }

    async clickDelete(): Promise<void> {
        await interactWhenVisible(this.delete("Graph"), (el) => el.click(), "Delete Graph");
    }

    async clickDeleteConfirm(): Promise<void> {
        await interactWhenVisible(this.deleteConfirm("Graph"), (el) => el.click(), "Confirm Delete Graph");
    }

    async clickDeleteCancel(): Promise<void> {
        await interactWhenVisible(this.deleteCancel("Graph"), (el) => el.click(), "Cancel Delete Graph");
    }

    async clickExport(): Promise<void> {
        await interactWhenVisible(this.export("Graph"), (el) => el.click(), "Export Graph");
    }

    async clickExportConfirm(): Promise<void> {
        await interactWhenVisible(this.exportConfirm("Graph"), (el) => el.click(), "Confirm Export Graph");
    }

    async clickExportCancel(): Promise<void> {
        await interactWhenVisible(this.exportCancel("Graph"), (el) => el.click(), "Cancel Export Graph");
    }

    async clickSelect(type: "Graph" | "Schema"): Promise<void> {
        await interactWhenVisible(this.select(type), (el) => el.click(), `Select ${type}`);
    }    

    async clickSelectItem(graphName: string): Promise<void> {
        await interactWhenVisible(this.selectItemBySearch("Graph", graphName), (el) => el.click(), `Select Graph Item ${graphName}`);
    }

    async clickSearch(): Promise<void> {
        await interactWhenVisible(this.search("Graph"), (el) => el.click(), "Search Graph");
    }

    async clickElementCanvasAdd(): Promise<void> {
        await interactWhenVisible(this.elementCanvasAdd("Graph"), (el) => el.click(), "Add Element");
    }

    async clickElementCanvasAddNode(): Promise<void> {
        await interactWhenVisible(this.elementCanvasAddNode("Graph"), (el) => el.click(), "Add Node");
    }

    async clickElementCanvasAddEdge(): Promise<void> {
        await interactWhenVisible(this.elementCanvasAddEdge("Graph"), (el) => el.click(), "Add Edge");
    }

    async clickDeleteElement(type: string): Promise<void> {
        const element = type === "Node" ? "Node" : "Relation";      
        await interactWhenVisible(this.deleteElement(element), (el) => el.click(), "Delete Element");
    }

    async clickDeleteElementConfirm(): Promise<void> {
        await interactWhenVisible(this.deleteElementConfirm("Graph"), (el) => el.click(), "Confirm Delete Element");
    }

    async clickDeleteElementCancel(): Promise<void> {
        await interactWhenVisible(this.deleteElementCancel("Graph"), (el) => el.click(), "Cancel Delete Element");
    }

    async clickAnimationControl(): Promise<void> {
        await interactWhenVisible(this.animationControl(), (el) => el.click(), "Animation Control");
    }

    async clickZoomInControl(): Promise<void> {
        await interactWhenVisible(this.zoomInControl(), (el) => el.click(), "Zoom In Control");
    }

    async clickZoomOutControl(): Promise<void> {
        await interactWhenVisible(this.zoomOutControl(), (el) => el.click(), "Zoom Out Control");
    }

    async clickCenterControl(): Promise<void> {
        await interactWhenVisible(this.centerControl(), (el) => el.click(), "Center Control");
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

    async clickElementCanvasSuggestionByName(type: "Graph" | "Schema", name: string): Promise<void> {
        await interactWhenVisible(this.elementCanvasSuggestionByName(type, name),(el) => el.click(), `Element Canvas Suggestion ${type} ${name}`);
    }
    
    async clickLabelsButtonByLabel(tab: "Graph" | "Schema", label: "RelationshipTypes" | "Labels", name: string): Promise<void> {
        await interactWhenVisible(this.labelsButtonByName(tab, label, name), (el) => el.click(), `Labels Panel Button ${tab} ${label} ${name}`);
    }
    
    async clickEditorRun(): Promise<void> {
        await interactWhenVisible(this.editorRun, (el) => el.click(), "Editor Run");
    }

    async clickManage(): Promise<void> {
        await interactWhenVisible(this.manage("Graph"), (el) => el.click(), "Manage Graphs Button");
    }

    async clickTableCheckboxByName(name: string): Promise<void> {
        await interactWhenVisible(this.tableCheckboxByName("Graph", name), (el) => el.click(), `Table Graphs Checkbox ${name}`);
    }

    async clickEditButton(type: "Graph" | "Schema"): Promise<void> {
        await interactWhenVisible(this.editButton(type), (el) => el.click(), `Edit Button ${type}s`);
    }    

    async clickSaveButton(type: "Graph" | "Schema"): Promise<void> {
        await interactWhenVisible(this.saveButton(type), (el) => el.click(), `Save Button ${type}s`);
    }    

    async hoverCanvasElement(x: number, y: number): Promise<void> {
        await interactWhenVisible(this.canvasElement, (el) => el.hover({ position: { x, y } }), "Canvas Element");
    }

    async hoverTableRowByName(name: string): Promise<void> {
        await interactWhenVisible(this.tableRowByName("Graph", name), (el) => el.hover(), `Table Graphs Row ${name}`);
    }

    async isVisibleSelectItem(name: string): Promise<boolean> {
        const isVisible = await waitForElementToBeVisible(this.selectItemBySearch("Graph", name));
        return isVisible;
    }

    async clickGraphsTabInHeader(): Promise<void> {
        await interactWhenVisible(this.graphsTabInHeader, (el) => el.click(), "Graphs Tab in Header");
    }

    async isVisibleLabelsButtonByName(tab: "Graph" | "Schema", label: "RelationshipTypes" | "Labels", name: string): Promise<boolean> {
        const isVisible = await waitForElementToBeVisible(this.labelsButtonByName(tab, label, name));
        return isVisible;
    }

    async getLabelsButtonByNameContent(tab: "Graph" | "Schema", label: "RelationshipTypes" | "Labels", name: string): Promise<string | null> {
        const content = await interactWhenVisible(this.labelsButtonByName(tab, label, name), (el) => el.textContent(), ``);
        return content;
    }
    
    async isVisibleEditButton(): Promise<boolean> {
        const isVisible = await waitForElementToBeVisible(this.editButton("Graph"));
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

    async getNodesCount(): Promise<string | null> {
        return await pollForElementContent(this.nodesCount(), "Nodes Count");
    }

    async getEdgesCount(): Promise<string | null> {
        return await pollForElementContent(this.edgesCount(), "Edges Count");
    }

    async searchElementInCanvas(type: "Graph" | "Schema", name: string): Promise<void> {
        await this.fillElementCanvasSearch(type, name);
        await this.clickElementCanvasSuggestionByName(type, name);
    }    

    async isSearchElementInCanvasVisible(name: string): Promise<boolean> {
        await this.fillElementCanvasSearch("Graph", name);
        return await this.elementCanvasSuggestionsListGraph.isVisible();
    }

    async getGraphsCountInList(graphName: string): Promise<number> {
        await this.clickSelect("Graph");
        await this.fillSearch(graphName);
        const items = this.page.locator('//ul[@data-testid="queryList"]//li');
        const count = await items.count();
        return count;
    }

    async verifyGraphExists(graphName: string, apiCall?: any): Promise<boolean> {
        if (apiCall) {
            let attempts = 0;
            const maxAttempts = 10;
            while (attempts < maxAttempts) {
                const graphs = await apiCall.getGraphs();
                const graphExistsInAPI = graphs.opts.includes(graphName);
                if (!graphExistsInAPI) {
                    break;
                }
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                attempts++;
            }
        }
        
        await this.clickSelect("Graph");
        await this.fillSearch(graphName);
        
        let attempts = 0;
        const maxAttempts = 5;
        let isVisible = false;
        
        while (attempts < maxAttempts) {
            await this.page.waitForTimeout(1000); // wait for the search results to be populated
            const graphId = "0"; // always select the first result after search
            isVisible = await this.isVisibleSelectItem(graphId);
            
            if (!isVisible) {
                break;
            }
            
            attempts++;
            if (attempts < maxAttempts) {
                await this.fillSearch("");
                await this.page.waitForTimeout(500);
                await this.fillSearch(graphName);
            }
        }
        
        return isVisible;
    }

    async addGraph(graphName: string): Promise<void> {
        await this.clickCreateGraph();
        await this.fillCreateGraphInput(graphName);
        await this.page.waitForTimeout(1000); // wait for the input to be filled
        await this.clickConfirmCreateGraph();
        await this.isVisibleToast();
    }

    async removeGraph(graphName: string): Promise<void> {
        await this.clickSelect("Graph");
        await this.clickManage();
        await this.clickTableCheckboxByName(graphName);
        await this.clickDelete();
        await this.clickDeleteConfirm();
        await this.isVisibleToast();
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
        await this.clickSelect("Graph");
        await this.clickManage();
        await this.clickTableCheckboxByName(graphName);
        await this.clickExport();
        const [download] = await Promise.all([
            this.page.waitForEvent("download"),
            this.clickExportConfirm(),
        ]);
        return download;
    }

    async isModifyGraphNameButtonVisible(graphName: string): Promise<boolean> {
        await this.clickSelect("Graph");
        await this.clickManage();
        await this.hoverTableRowByName(graphName);
        const isVisible = await this.isVisibleEditButton();
        return isVisible;
    }

    async modifyGraphName(oldName: string, newName: string): Promise<void> {
        await this.clickSelect("Graph");
        await this.clickManage();
        await this.hoverTableRowByName(oldName);
        await this.clickEditButton("Graph");
        await this.fillInput("Graph" ,newName);
        await this.clickSaveButton("Graph");
        await waitForElementToNotBeVisible(this.saveButton("Graph"));
    }

    async selectGraphByName(graphName: string): Promise<void> {
        await this.clickSelect("Graph");
        await this.fillSearch(graphName);
        await this.page.waitForTimeout(500); // wait for the search results to be populated
        await this.clickSelectItem("0"); // selecting the first item in list after search
    }

    async deleteElementsByPosition(positions: { x: number, y: number }[], type: string): Promise<void> {
        positions.forEach(async (position) => {
            await this.elementClick(position.x, position.y);
        });
        await this.clickDeleteElement(type);
        await this.clickDeleteElementConfirm();
        await waitForElementToNotBeVisible(this.deleteElement("Graph"));
    }

    async deleteElementByName(name: string, type: string): Promise<void> {
        await this.searchElementInCanvas("Graph",name);
        await this.clickDeleteElement(type);
        await this.clickDeleteElementConfirm();
        await waitForElementToNotBeVisible(this.deleteElement("Node"));
        await this.page.waitForTimeout(1500); // wait for the element to be deleted
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
    // 1500 is extra timeout to ensure the animation is over
    async waitForCanvasAnimationToEnd(timeout = 7000): Promise<void> {
        // Allow some time for the initial animation like fit-to-size
        await this.page.waitForTimeout(1500);
    
        await this.page.waitForFunction(
            ({ selector }) => {
                const canvas = document.querySelector(selector);
                return canvas?.getAttribute("data-engine-status") === "stop";
            },
            { selector: '.force-graph-container canvas' },
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
        // Wait for canvas to be ready and animations to settle
        await this.waitForCanvasAnimationToEnd();
        await this.page.waitForTimeout(1500); // Allow some time for the canvas to render properly
        
        // Get canvas element and its properties
        const canvasInfo = await this.page.evaluate((selector) => {
            const canvasElement = document.querySelector(selector) as HTMLCanvasElement;
            if (!canvasElement) return null;
            const rect = canvasElement.getBoundingClientRect();
            const ctx = canvasElement.getContext('2d');
            const transform = ctx?.getTransform();
            return {
                width: canvasElement.width,
                height: canvasElement.height,
                clientWidth: rect.width,
                clientHeight: rect.height,
                left: rect.left,
                top: rect.top,
                devicePixelRatio: window.devicePixelRatio || 1,
                transform: transform ? {
                    a: transform.a,
                    b: transform.b,
                    c: transform.c,
                    d: transform.d,
                    e: transform.e,
                    f: transform.f
                } : null
            };
        }, ".force-graph-container canvas");

        if (!canvasInfo || !canvasInfo.transform) return [];

        // Get graph data from window object
        const graphData = await this.page.evaluate((key) => (window as any)[key], windowKey);
        
        if (!graphData?.elements?.nodes) return [];

        const { a: scaleX, e: translateX, d: scaleY, f: translateY } = canvasInfo.transform;

        return graphData.elements.nodes.map((node: any) => {
            // Apply canvas transform matrix to node coordinates
            // Transform: screenX = node.x * scaleX + translateX, screenY = node.y * scaleY + translateY
            const transformedX = node.x * scaleX + translateX;
            const transformedY = node.y * scaleY + translateY;
            
            // Convert from canvas coordinates to actual screen coordinates
            // Account for canvas positioning and device pixel ratio
            const screenX = canvasInfo.left + transformedX;
            const screenY = canvasInfo.top + transformedY;

            // Check if node is visible in viewport
            const isVisible = (
                screenX >= canvasInfo.left &&
                screenX <= canvasInfo.left + canvasInfo.clientWidth &&
                screenY >= canvasInfo.top &&
                screenY <= canvasInfo.top + canvasInfo.clientHeight
            );

            return {
                id: node.id,
                screenX,
                screenY,
                isVisible,
                canvasWidth: canvasInfo.clientWidth,
                canvasHeight: canvasInfo.clientHeight,
                // Keep original coordinates for reference
                x: node.x,
                y: node.y,
                // Transform data for debugging
                transformedX,
                transformedY,
                transform: { scaleX, translateX, scaleY, translateY },
                canvasInfo: {
                    left: canvasInfo.left,
                    top: canvasInfo.top,
                    clientWidth: canvasInfo.clientWidth,
                    clientHeight: canvasInfo.clientHeight,
                    devicePixelRatio: canvasInfo.devicePixelRatio
                },
                ...node
            };
        });
    }

    async getLinksScreenPositions(windowKey: 'graph' | 'schema'): Promise<any[]> {
        // Wait for canvas to be ready and animations to settle
        await this.waitForCanvasAnimationToEnd();
        
        // Get canvas element and its properties
        const canvasInfo = await this.page.evaluate((selector) => {
            const canvasElement = document.querySelector(selector) as HTMLCanvasElement;
            if (!canvasElement) return null;
            const rect = canvasElement.getBoundingClientRect();
            const ctx = canvasElement.getContext('2d');
            const transform = ctx?.getTransform();
            return {
                width: canvasElement.width,
                height: canvasElement.height,
                clientWidth: rect.width,
                clientHeight: rect.height,
                left: rect.left,
                top: rect.top,
                devicePixelRatio: window.devicePixelRatio || 1,
                transform: transform ? {
                    a: transform.a,
                    b: transform.b,
                    c: transform.c,
                    d: transform.d,
                    e: transform.e,
                    f: transform.f
                } : null
            };
        }, ".force-graph-container canvas");

        if (!canvasInfo || !canvasInfo.transform) return [];

        // Get graph data from window object
        const graphData = await this.page.evaluate((key) => (window as any)[key], windowKey);
        
        if (!graphData?.elements?.links || !graphData?.elements?.nodes) return [];

        const { a: scaleX, e: translateX, d: scaleY, f: translateY } = canvasInfo.transform;

        return graphData.elements.links.map((link: any) => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;

            const source = graphData.elements.nodes.find((n: any) => n.id === sourceId);
            const target = graphData.elements.nodes.find((n: any) => n.id === targetId);

            if (!source || !target) {
                return {
                    id: link.id,
                    sourceId,
                    targetId,
                    sourceScreenX: 0,
                    sourceScreenY: 0,
                    targetScreenX: 0,
                    targetScreenY: 0,
                    midX: 0,
                    midY: 0,
                    isVisible: false,
                    canvasWidth: canvasInfo.clientWidth,
                    canvasHeight: canvasInfo.clientHeight,
                    ...link
                };
            }

            // Apply canvas transform matrix to node coordinates
            // Transform: screenX = node.x * scaleX + translateX, screenY = node.y * scaleY + translateY
            const sourceTransformedX = source.x * scaleX + translateX;
            const sourceTransformedY = source.y * scaleY + translateY;
            const targetTransformedX = target.x * scaleX + translateX;
            const targetTransformedY = target.y * scaleY + translateY;
            
            // Convert from canvas coordinates to actual screen coordinates
            // Account for canvas positioning and device pixel ratio
            const sourceScreenX = canvasInfo.left + sourceTransformedX;
            const sourceScreenY = canvasInfo.top + sourceTransformedY;
            const targetScreenX = canvasInfo.left + targetTransformedX;
            const targetScreenY = canvasInfo.top + targetTransformedY;

            // Calculate midpoint
            const midX = (sourceScreenX + targetScreenX) / 2;
            const midY = (sourceScreenY + targetScreenY) / 2;

            // Check if link is visible in viewport (if any part of the link is visible)
            const isVisible = (
                (sourceScreenX >= canvasInfo.left && sourceScreenX <= canvasInfo.left + canvasInfo.clientWidth) ||
                (targetScreenX >= canvasInfo.left && targetScreenX <= canvasInfo.left + canvasInfo.clientWidth) ||
                (midX >= canvasInfo.left && midX <= canvasInfo.left + canvasInfo.clientWidth)
            ) && (
                (sourceScreenY >= canvasInfo.top && sourceScreenY <= canvasInfo.top + canvasInfo.clientHeight) ||
                (targetScreenY >= canvasInfo.top && targetScreenY <= canvasInfo.top + canvasInfo.clientHeight) ||
                (midY >= canvasInfo.top && midY <= canvasInfo.top + canvasInfo.clientHeight)
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
                canvasWidth: canvasInfo.clientWidth,
                canvasHeight: canvasInfo.clientHeight,
                // Keep original coordinates for reference
                sourceX: source.x,
                sourceY: source.y,
                targetX: target.x,
                targetY: target.y,
                // Transform data for debugging
                sourceTransformedX,
                sourceTransformedY,
                targetTransformedX,
                targetTransformedY,
                transform: { scaleX, translateX, scaleY, translateY },
                canvasInfo: {
                    left: canvasInfo.left,
                    top: canvasInfo.top,
                    clientWidth: canvasInfo.clientWidth,
                    clientHeight: canvasInfo.clientHeight,
                    devicePixelRatio: canvasInfo.devicePixelRatio
                },
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
        await this.page.mouse.click(x, y, { button: 'right' });
    }

    async getQuerySearchListText(): Promise<string[]> {
        await waitForElementToBeVisible(this.querySearchList);
        const elements = this.querySearchListItems;
        const count = await elements.count();
        const texts: string[] = [];
    
        for (let i = 0; i < count; i++) {
            const item = elements.nth(i);
            const text = await interactWhenVisible(item, el => el.textContent(), `Query search list item #${i}`);
            if (text) texts.push(text.trim());
        }
    
        return texts;
    }

    async rightClickElement(x: number, y: number): Promise<void> {
        console.log(`Right-clicking element at position (${x}, ${y})`);
        await this.page.mouse.click(x, y, { button: 'right' });
        await this.page.waitForTimeout(500);
    }
}