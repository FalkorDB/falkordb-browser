/* eslint-disable prefer-destructuring */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Locator, Download } from "@playwright/test";
import { waitForElementToBeVisible, waitForTimeOut } from "@/e2e/infra/utils";
import GraphPage from "./graphPage";

export default class SchemaPage extends GraphPage {

    private get addSchemaBtnInNavBar(): Locator {
        return this.page.getByText("Create New Schema");
    }

    private get schemahNameInput(): Locator {
        return this.page.getByRole("textbox");
    }

    private get createSchemaBtn(): Locator {
        return this.page.locator("//div[@id='dialog']//button[contains(text(), 'Create your Schema')]");
    }

    private get addNodeBtn(): Locator {
        return this.page.locator('button').filter({ hasText: 'Add Node' });
    }

    private get addRelationBtn(): Locator {
        return this.page.locator('button').filter({ hasText: 'Add Relation' });
    }

    private get closeBtnInHeaderDataPanel(): Locator {
        return this.page.locator('(//div[contains(@id, "headerDataPanel")]//button)[1]');
    }

    private get addBtnInHeaderDataPanel(): Locator {
        return this.page.locator('//div[contains(@id, "headerDataPanel")]//button[contains(text(), "Add")]');
    }

    private get saveBtnInHeaderDataPanel(): Locator {
        return this.page.locator('//div[contains(@id, "headerDataPanel")]//button[contains(text(), "Save")]');
    }

    private get dataPanelHeaderInput(): Locator {
        return this.page.locator('//div[contains(@id, "headerDataPanel")]//input');
    }

    private get keyInDataPanel(): (keyIndex: string) => Locator {
        return (keyIndex: string) => this.page.locator(`//div[contains(@class, "DataPanel")]//tr[${keyIndex}]//td[1]`);
    }

    private get activekeyInputInDataPanel(): Locator {
        return this.page.locator('//div[contains(@class, "DataPanel")]//tr//td[1]//input[not(@disabled)]');
    }

    private get activeDescInputInDataPanel(): Locator {
        return this.page.locator('//div[contains(@class, "DataPanel")]//tr//td[3]//input[not(@disabled)]');
    }

    private get descInDataPanel(): (descIndex: string) => Locator {
        return (descIndex: string) => this.page.locator(`//div[contains(@class, "DataPanel")]//tr[${descIndex}]//td[3]`);
    }

    private get typeActiveBtnInDataPanel(): Locator {
        return this.page.locator('//div[contains(@class, "DataPanel")]//td[2]//button[not(@disabled)]');
    }

    private get uniqueAtiveRadioBtn(): Locator {
        return this.page.locator('//div[contains(@class, "DataPanel")]//tr//td[4]//button[not(@disabled)]');
    }

    private get requiredAtiveRadioBtn(): Locator {
        return this.page.locator('//div[contains(@class, "DataPanel")]//tr//td[5]//button[not(@disabled)]');
    }

    private get addActiveBtnInDataPanel(): Locator {
        return this.page.locator('//div[contains(@class, "DataPanel")]//tr//td[6]//button[not(@disabled) and contains(text(), "Add")]');
    }

    private get cancelActiveBtnInDataPanel(): Locator {
        return this.page.locator('//div[contains(@class, "DataPanel")]//tr//td[6]//button[not(@disabled) and contains(text(), "Cancel")]');
    }

    private get createNewNodeBtnInDataPanel(): Locator {
        return this.page.locator('//div[contains(@class, "DataPanel")]//button[contains(text(), "Create new node")]');
    }

    private get createNewEdgeBtnInDataPanel(): Locator {
        return this.page.locator('//div[contains(@class, "DataPanel")]//button[contains(text(), "Create new edge")]');
    }

    private get addValueBtnInDataPanel(): Locator {
        return this.page.locator('//div[contains(@class, "DataPanel")]//button[contains(text(), "Add Value")]');
    }

    private get deleteValueBtnInDataPanel(): Locator {
        return this.page.locator('(//div[contains(@class, "DataPanel")]//tr//td//button)[1]');
    }

    private get editValueBtnInDataPanel(): Locator {
        return this.page.locator('(//div[contains(@class, "DataPanel")]//tr//td//button)[2]');
    }

    private get attributeRows(): Locator {
        return this.page.locator('//div[contains(@class, "DataPanel")]//tbody//tr');
    }

    private get deleteNodeInDataPanel(): Locator {
        return this.page.locator('//div[contains(@class, "DataPanel")]//button[contains(text(), "Delete Node")]');
    }

    private get confirmDeleteNodeInDataPanel(): Locator {
        return this.page.locator('//div[@role="dialog"]//button[contains(text(), "Delete")]');
    }

    async clickAddNewSchemaBtn(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.addSchemaBtnInNavBar);
        if (!isVisible) throw new Error("add new schema button is not visible!");
        await this.addSchemaBtnInNavBar.click();
    }

    async fillSchemaNameInput(schemaName: string): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.schemahNameInput);
        if (!isVisible) throw new Error("schema name input is not visible!");
        await this.schemahNameInput.fill(schemaName);
    }

    async clickCreateSchemaBtn(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.createSchemaBtn);
        if (!isVisible) throw new Error("create schema button is not visible!");
        await this.createSchemaBtn.click();
    }

    async clickAddNode(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.addNodeBtn);
        if (!isVisible) throw new Error("Add Node button is not visible!");
        await this.addNodeBtn.click();
    }

    async clickAddRelation(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.addRelationBtn);
        if (!isVisible) throw new Error("Add Relation button is not visible!");
        await this.addRelationBtn.click();
    }

    async clickCloseBtnInHeaderDataPanel(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.closeBtnInHeaderDataPanel);
        if (!isVisible) throw new Error("close button in header data panels is not visible!");
        await this.closeBtnInHeaderDataPanel.click();
    }

    async clickAddBtnInHeaderDataPanel(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.addBtnInHeaderDataPanel);
        if (!isVisible) throw new Error("Add button in header data panels is not visible!");
        await this.addBtnInHeaderDataPanel.click();
    }

    async insertDataPanelHeader(title: string): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.dataPanelHeaderInput);
        if (!isVisible) throw new Error("data panel header input is not visible!");
        await this.dataPanelHeaderInput.fill(title);
    }

    async clickSaveBtnInHeaderDataPanel(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.saveBtnInHeaderDataPanel);
        if (!isVisible) throw new Error("save button in header data panel is not visible!");
        await this.saveBtnInHeaderDataPanel.click();
    }

    async insertActiveKeyInputInDataPanelAttr(key: string): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.activekeyInputInDataPanel);
        if (!isVisible) throw new Error("active key input in data panel is not visible!");
        await this.activekeyInputInDataPanel.fill(key);
    }

    async getKeyInDataPanelAttr(keyIndex: string): Promise<string | null>{
        const isVisible = await waitForElementToBeVisible(this.keyInDataPanel(keyIndex));
        if (!isVisible) throw new Error("key input in data panel is not visible!");
        return await this.keyInDataPanel(keyIndex).textContent();
    }

    async insertActiveDescInputInDataPanelAttr(desc: string): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.activeDescInputInDataPanel);
        if (!isVisible) throw new Error("desc input in data panel is not visible!");
        await this.activeDescInputInDataPanel.fill(desc);
    }

    async getDescInDataPanelAttr(descIndex: string): Promise<string | null>{
        const isVisible = await waitForElementToBeVisible(this.descInDataPanel(descIndex));
        if (!isVisible) throw new Error("desc input in data panel is not visible!");
        return await this.descInDataPanel(descIndex).textContent();
    }

    async clickTypeActiveBtnInDataPanel(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.typeActiveBtnInDataPanel);
        if (!isVisible) throw new Error("type active button in data panel is not visible!");
        await this.typeActiveBtnInDataPanel.click();
    }

    async clickUniqueAtiveRadioBtn(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.uniqueAtiveRadioBtn);
        if (!isVisible) throw new Error("unique active button in data panel is not visible!");
        await this.uniqueAtiveRadioBtn.click();
    }

    async clickRequiredAtiveRadioBtn(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.requiredAtiveRadioBtn);
        if (!isVisible) throw new Error("required active button in data panel is not visible!");
        await this.requiredAtiveRadioBtn.click();
    }

    async clickAddActiveBtnInDataPanel(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.addActiveBtnInDataPanel);
        if (!isVisible) throw new Error("add active button in data panel is not visible!");
        await this.addActiveBtnInDataPanel.click();
    }

    async clickCancelActiveBtnInDataPanel(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.cancelActiveBtnInDataPanel);
        if (!isVisible) throw new Error("cancel active button in data panel is not visible!");
        await this.cancelActiveBtnInDataPanel.click();
    }

    async clickCreateNewNodeBtnInDataPanel(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.createNewNodeBtnInDataPanel);
        if (!isVisible) throw new Error("create new node button in data panel is not visible!");
        await this.createNewNodeBtnInDataPanel.click();
    }

    async clickCreateNewEdgeBtnInDataPanel(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.createNewEdgeBtnInDataPanel);
        if (!isVisible) throw new Error("create new edge button in data panel is not visible!");
        await this.createNewEdgeBtnInDataPanel.click();
    }

    async clickAddValueBtnInDataPanel(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.addValueBtnInDataPanel);
        if (!isVisible) throw new Error("add value button in data panel is not visible!");
        await this.addValueBtnInDataPanel.click();
    }

    async clickDeleteValueBtnInDataPanel(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.deleteValueBtnInDataPanel);
        if (!isVisible) throw new Error("delete value button in data panel is not visible!");
        await this.deleteValueBtnInDataPanel.click();
    }

    async clickEditeValueBtnInDataPanel(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.editValueBtnInDataPanel);
        if (!isVisible) throw new Error("edit value button in data panel is not visible!");
        await this.editValueBtnInDataPanel.click();
    }

    async getAttributeRowsCount(): Promise<boolean>{
        const isVisible = await waitForElementToBeVisible(this.attributeRows);
        if (!isVisible) throw new Error("attribute rows in data panel is not visible!");
        const count = await this.attributeRows.count() > 0 ? true : false;
        return count;
    }

    async clickDeleteNodeInDataPanel(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.deleteNodeInDataPanel);
        if (!isVisible) throw new Error("attribute rows in data panel is not visible!");
        await this.deleteNodeInDataPanel.click();
    }

    async clickConfirmDeleteNodeInDataPanel(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.confirmDeleteNodeInDataPanel);
        if (!isVisible) throw new Error("confirm delete in data panel is not visible!");
        await this.confirmDeleteNodeInDataPanel.click();
    }


    async addSchema(schemaName: string): Promise<void> {
        await this.clickAddNewSchemaBtn();
        await this.fillSchemaNameInput(schemaName);
        await this.clickCreateSchemaBtn();
    }

    async addNode(title: string, key: string, type: string, desc: string, unique: boolean, required: boolean): Promise<void> {
        await this.clickAddNode();
        await this.clickAddBtnInHeaderDataPanel();
        await this.insertDataPanelHeader(title);
        await this.clickSaveBtnInHeaderDataPanel();
        await this.addAttribute(key, type, desc, unique, required);
        await this.clickCreateNewNodeBtnInDataPanel();
    }

    async deleteNode(x: number, y: number): Promise<void>{
        await this.nodeClick(x, y);
        await this.clickDeleteNodeInDataPanel();
        await Promise.all([
            this.page.waitForResponse(res => res.status() === 200),
            this.clickConfirmDeleteNodeInDataPanel()
          ]);          
    }

    async addRelation(title: string, key: string, type: string, desc: string, unique: boolean, required: boolean): Promise<void> {
        await this.clickAddRelation();
        await this.clickAddBtnInHeaderDataPanel();
        await this.insertDataPanelHeader(title);
        await this.clickSaveBtnInHeaderDataPanel();
        await this.addAttribute(key, type, desc, unique, required);
        const schema = await this.getNodeScreenPositions();
        await this.nodeClick(schema[0].screenX, schema[0].screenY);
        await this.nodeClick(schema[1].screenX, schema[1].screenY);
        await this.clickCreateNewEdgeBtnInDataPanel();
    }

    async deleteRelation(node: string): Promise<void> {
        await this.clickAddRelation();
        
    }

    async addAttribute(key: string, type: string, desc: string, unique: boolean, required: boolean): Promise<void>{
        await this.insertActiveKeyInputInDataPanelAttr(key);
        await this.clickTypeActiveBtnInDataPanel();
        await this.selectGraphFromList(type); //should be changed for select type from list after #835 fix
        await this.insertActiveDescInputInDataPanelAttr(desc);
        if(unique){
            await this.clickUniqueAtiveRadioBtn();
        }
        if(required){
            await this.clickRequiredAtiveRadioBtn();
        }
        await this.clickAddActiveBtnInDataPanel();
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

    async getNodeScreenPositions(): Promise<any[]> {
        await this.page.waitForTimeout(2000);
        const graphData = await this.page.evaluate(() => {
            return (window as any).schema;
        });
    
        const transformData = await this.getCanvasTransform(this.canvasElement);
        const { a, e, d, f } = transformData.transform;
        const { left, top } = transformData;
    
        return graphData.elements.nodes.map((node: any) => ({
            ...node,
            screenX: left + node.x * a + e - 40,
            screenY: top + node.y * d + f - 370,
        }));
    }

    async getLinkScreenPositions(): Promise<any[]> {
        await this.page.waitForTimeout(2000);
    
        const graphData = await this.page.evaluate(() => {
            return (window as any).schema;
        });
    
        const transformData = await this.getCanvasTransform(this.canvasElement);
        const { a, e, d, f } = transformData.transform;
        const { left, top } = transformData;
    
        const linkPositions = graphData.elements.links.map((link: any) => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    
            const source = graphData.elements.nodes.find((n: any) => n.id === sourceId);
            const target = graphData.elements.nodes.find((n: any) => n.id === targetId);
    
            return {
                id: link.id,
                sourceId,
                targetId,
                sourceScreenX: left + source.x * a + e - 40,
                sourceScreenY: top + source.y * d + f - 370,
                targetScreenX: left + target.x * a + e - 40,
                targetScreenY: top + target.y * d + f - 370,
                midX: (left + source.x * a + e - 40 + left + target.x * a + e - 40) / 2,
                midY: (top + source.y * d + f - 370 + top + target.y * d + f - 370) / 2,
            };
        });
    
        return linkPositions;
    }
    
}