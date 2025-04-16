/* eslint-disable prefer-destructuring */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Locator } from "@playwright/test";
import { interactWhenVisible, waitForElementToBeVisible } from "@/e2e/infra/utils";
import GraphPage from "./graphPage";

export default class DataPanel extends GraphPage {

    private get addAttributeButtonInGraphDataPanel(): Locator {
        return this.page.locator('#graphDataPanel').locator('button:has-text("Add Attribute")');
    }

    private get deleteNodeButtonInGraphDataPanel(): Locator {
        return this.page.locator('#graphDataPanel').locator('button:has-text("Delete Node")');
    }

    private get attributeInputInGraphDataPanel(): (index: number) => Locator {
        return (index: number) => this.page.locator('#graphDataPanel tbody tr input').nth(index);
    }

    private get saveAttributeButtonInGraphDataPanel(): Locator {
        return this.page.locator('#graphDataPanel tbody tr').nth(2).locator('button').first();
    }

    private get modifyAttributeButtonInLastRowOfGraphDataPanel(): Locator {
        return this.page.locator('#graphDataPanel tbody tr').last().locator('td').last().locator('button');
    }

    private get lastAttributeRowInGraphDataPanel(): Locator {
        return this.page.locator('#graphDataPanel tr').last();
    }

    private get editAttributeButtonForFirstRowInGraphDataPanel(): Locator {
        return this.page.locator("//div[@id='graphDataPanel']//td[1]//button[1]");
    }

    private get deleteAttributeButtonForFirstRowInGraphDataPanel(): Locator {
        return this.page.locator("//div[@id='graphDataPanel']//td[1]//button[2]");
    }

    private get deleteButtonInDialog(): Locator {
        return this.page.locator('#dialog').locator('button:has-text("Delete")');
    }

    private get lastAttributeNameCellInGraphDataPanel(): (attribute: string) => Locator {
        return (attribute: string) => this.page.locator(`//div[@id='graphDataPanel']//td[2][normalize-space(text()) = '${attribute}']`);
    }

    private get attributeValueInputInGraphDataPanel(): Locator {
        return this.page.locator('#graphDataPanel tr input');
    }

    private get dataPanelHeaderAttr(): Locator {
        return this.page.locator("//div[contains(@id, 'dataPanelHeader')]/div/ul");
    }

    private get addButtonInDataPanelHeader(): Locator {
        return this.page.locator("//div[contains(@id, 'dataPanelHeader')]//button[contains(text(), 'Add')]");
    }

    private get inputInDataPanelHeader(): Locator {
        return this.page.locator("//div[contains(@id, 'dataPanelHeader')]//input");
    }

    private get saveButtonInDataPanelHeader(): Locator {
        return this.page.locator("//div[contains(@id, 'dataPanelHeader')]//button[contains(text(), 'Save')]");
    }

    private get removeAttributeButtonInDataPanelHeader(): Locator {
        return this.page.locator("//div[contains(@id, 'dataPanelHeader')]//li//button").first();
    }

    private get attributeHeaderLabelInDataPanelHeader(): Locator {
        return this.page.locator("//div[contains(@id, 'dataPanelHeader')]//li/p");
    }

    async clickAddAttributeButtonInGraphDataPanel(): Promise<void> {
        await interactWhenVisible(this.addAttributeButtonInGraphDataPanel, el => el.click(), "add attribute button in graph data panel");
    }
    
    async clickDeleteNodeButtonInGraphDataPanel(): Promise<void> {
        await interactWhenVisible(this.deleteNodeButtonInGraphDataPanel, el => el.click(), "delete node button in graph data panel");
    }
    
    async fillAttributeInputInGraphDataPanel(index: number, input: string): Promise<void> {
        await interactWhenVisible(this.attributeInputInGraphDataPanel(index), el => el.fill(input), `attribute input in graph data panel [index ${index}]`);
    }
    
    async clickSaveAttributeButtonInGraphDataPanel(): Promise<void> {
        await interactWhenVisible(this.saveAttributeButtonInGraphDataPanel, el => el.click(), "save attribute button in graph data panel");
    }
    
    async getAttributeValueInGraphDataPanel(): Promise<string | null> {
        await interactWhenVisible(this.saveAttributeButtonInGraphDataPanel, async () => {}, "save attribute button in graph data panel");
        return await this.saveAttributeButtonInGraphDataPanel.textContent();
    }    

    async clickModifyAttributeButtonInLastRowOfGraphDataPanel(): Promise<void> {
        await interactWhenVisible(this.modifyAttributeButtonInLastRowOfGraphDataPanel, el => el.click(), "modify attribute button in last row of graph data panel");
    }
    
    async hoverLastAttributeRowInGraphDataPanell(): Promise<void> {
        await interactWhenVisible(this.lastAttributeRowInGraphDataPanel, el => el.hover(), "last attribute row in graph data panel");
    }
    
    async clickEditAttributeButtonForFirstRowInGraphDataPanel(): Promise<void> {
        await interactWhenVisible(this.editAttributeButtonForFirstRowInGraphDataPanel, el => el.click(), "edit attribute button in first row of graph data panel");
    }
    
    async clickDeleteAttributeButtonForFirstRowInGraphDataPanel(): Promise<void> {
        await interactWhenVisible(this.deleteAttributeButtonForFirstRowInGraphDataPanel, el => el.click(), "delete attribute button in first row of graph data panel");
    }
    
    async clickDeleteButtonInDialog(): Promise<void> {
        await interactWhenVisible(this.deleteButtonInDialog, el => el.click(), "delete button in dialog");
    }    

    async isLastAttributeNameCellInGraphDataPanel(attribute: string): Promise<boolean>{
        return await this.lastAttributeNameCellInGraphDataPanel(attribute).isVisible();
    }

    async getLastAttributeNameCellInGraphDataPanel(attribute: string): Promise<string | null> {
        await interactWhenVisible(this.lastAttributeNameCellInGraphDataPanel(attribute), async () => {}, `last attribute name cell for "${attribute}"`);
        return await this.lastAttributeNameCellInGraphDataPanel(attribute).textContent();
    }
    
    async fillAttributeValueInputInGraphDataPanel(input: string): Promise<void> {
        await interactWhenVisible(this.attributeValueInputInGraphDataPanel, el => el.fill(input), "attribute value input in graph data panel");
    }
    
    async hoverOnDataPanelHeaderAttr(): Promise<void> {
        await interactWhenVisible(this.dataPanelHeaderAttr, el => el.hover(), "data panel header attribute hover");
    }
    
    async clickOnAddButtonInDataPanelHeader(): Promise<void> {
        await interactWhenVisible(this.addButtonInDataPanelHeader, el => el.click(), "add button in data panel header");
    }
    
    async fillInputButtonInDataPanelHeader(attribute: string): Promise<void> {
        await interactWhenVisible(this.inputInDataPanelHeader, el => el.fill(attribute), "input in data panel header");
    }
    
    async clickOnSaveButtonInDataPanelHeader(): Promise<void> {
        await interactWhenVisible(this.saveButtonInDataPanelHeader, el => el.click(), "save button in data panel header");
    }
    
    async clickOnRemoveAttributeButtonInDataPanelHeader(): Promise<void> {
        await interactWhenVisible(this.removeAttributeButtonInDataPanelHeader, el => el.click(), "remove attribute button in data panel header");
    }
    
    async getAttributeHeaderLabelInDataPanelHeader(): Promise<string | null> {
        await interactWhenVisible(this.attributeHeaderLabelInDataPanelHeader, async () => {}, "attribute header label in data panel header");
        return await this.attributeHeaderLabelInDataPanelHeader.textContent();
    }

    async modifyNodeHeaderAttribute(attribute: string): Promise<void> {
        await this.hoverOnDataPanelHeaderAttr();
        await this.clickOnAddButtonInDataPanelHeader();
        await this.fillInputButtonInDataPanelHeader(attribute);
        await this.clickOnSaveButtonInDataPanelHeader();
        await this.clickOnRemoveAttributeButtonInDataPanelHeader();
    }

    async addAttribute(attribute: string, attributeValue: string): Promise<void>{
        await this.clickAddAttributeButtonInGraphDataPanel();
        await this.fillAttributeInputInGraphDataPanel(0, attribute);
        await this.fillAttributeInputInGraphDataPanel(1, attributeValue);
        await this.clickSaveAttributeButtonInGraphDataPanel();
    }

    async removeAttribute(): Promise<void>{
        await this.hoverLastAttributeRowInGraphDataPanell();
        await this.clickDeleteAttributeButtonForFirstRowInGraphDataPanel();
        await this.clickDeleteButtonInDialog();
    }

    async modifyAttribute(input: string): Promise<void>{
        await this.hoverLastAttributeRowInGraphDataPanell();
        await this.clickEditAttributeButtonForFirstRowInGraphDataPanel();
        await this.fillAttributeValueInputInGraphDataPanel(input);
        await Promise.all([
            this.page.waitForResponse(res => res.status() === 200),
            this.clickSaveAttributeButtonInGraphDataPanel()
        ]);
    }

    async deleteNodeViaDataPanel(): Promise<void>{
        await this.clickDeleteNodeButtonInGraphDataPanel();
        await this.clickDeleteButtonInDialog();
    }

}