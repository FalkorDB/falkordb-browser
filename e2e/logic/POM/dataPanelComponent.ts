/* eslint-disable prefer-destructuring */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Locator } from "@playwright/test";
import { waitForElementToBeVisible } from "@/e2e/infra/utils";
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

    async clickAddAttributeButtonInGraphDataPanel(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.addAttributeButtonInGraphDataPanel);
        if (!isVisible) throw new Error("add attribute button is not visible!");
        await this.addAttributeButtonInGraphDataPanel.click();
    }

    async clickDeleteNodeButtonInGraphDataPanel(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.deleteNodeButtonInGraphDataPanel);
        if (!isVisible) throw new Error("delete node button is not visible!");
        await this.deleteNodeButtonInGraphDataPanel.click();
    }

    async fillAttributeInputInGraphDataPanel(index: number, input: string): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.attributeInputInGraphDataPanel(index));
        if (!isVisible) throw new Error("attribute input in data panel input is not visible!");
        await this.attributeInputInGraphDataPanel(index).fill(input);
    }

    async clickSaveAttributeButtonInGraphDataPanel(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.saveAttributeButtonInGraphDataPanel);
        if (!isVisible) throw new Error("save attribute in graph panel button is not visible!");
        await this.saveAttributeButtonInGraphDataPanel.click();
    }

    async getAttributeValueInGraphDataPanel(): Promise<string | null>{
        const isVisible = await waitForElementToBeVisible(this.saveAttributeButtonInGraphDataPanel);
        if (!isVisible) throw new Error("save attribute in graph panel button is not visible!");
        return await this.saveAttributeButtonInGraphDataPanel.textContent();
    }

    async clickModifyAttributeButtonInLastRowOfGraphDataPanel(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.modifyAttributeButtonInLastRowOfGraphDataPanel);
        if (!isVisible) throw new Error("modify attribute in data panel button is not visible!");
        await this.modifyAttributeButtonInLastRowOfGraphDataPanel.click();
    }

    async hoverLastAttributeRowInGraphDataPanell(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.lastAttributeRowInGraphDataPanel);
        if (!isVisible) throw new Error("last attribute is not visible!");
        await this.lastAttributeRowInGraphDataPanel.hover();
    }

    async clickEditAttributeButtonForFirstRowInGraphDataPanel(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.editAttributeButtonForFirstRowInGraphDataPanel);
        if (!isVisible) throw new Error("edit attribute button is not visible!");
        await this.editAttributeButtonForFirstRowInGraphDataPanel.click();
    }

    async clickDeleteAttributeButtonForFirstRowInGraphDataPanel(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.deleteAttributeButtonForFirstRowInGraphDataPanel);
        if (!isVisible) throw new Error("delete attribute button is not visible!");
        await this.deleteAttributeButtonForFirstRowInGraphDataPanel.click();
    }

    async clickDeleteButtonInDialog(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.deleteButtonInDialog);
        if (!isVisible) throw new Error("dialog delete button is not visible!");
        await this.deleteButtonInDialog.click();
    }

    async isLastAttributeNameCellInGraphDataPanel(attribute: string): Promise<boolean>{
        return await this.lastAttributeNameCellInGraphDataPanel(attribute).isVisible();
    }

    async getLastAttributeNameCellInGraphDataPanel(attribute: string): Promise<string | null>{
        const isVisible = await waitForElementToBeVisible(this.lastAttributeNameCellInGraphDataPanel(attribute));
        if (!isVisible) throw new Error("last attribute bame cell is not visible!");
        return await this.lastAttributeNameCellInGraphDataPanel(attribute).textContent();
    }

    async fillAttributeValueInputInGraphDataPanel(input: string): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.attributeValueInputInGraphDataPanel);
        if (!isVisible) throw new Error("attribute value input is not visible!");
        await this.attributeValueInputInGraphDataPanel.fill(input);
    }

    async hoverOnDataPanelHeaderAttr(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.dataPanelHeaderAttr);
        if (!isVisible) throw new Error("data panel header attribute button is not visible!");
        await this.dataPanelHeaderAttr.hover();
    }

    async clickOnAddButtonInDataPanelHeader(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.addButtonInDataPanelHeader);
        if (!isVisible) throw new Error("add button in data panel header button is not visible!");
         await this.addButtonInDataPanelHeader.click();
    }

    async fillInputButtonInDataPanelHeader(attribute: string): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.inputInDataPanelHeader);
        if (!isVisible) throw new Error("input in data panel header button is not visible!");
        await this.inputInDataPanelHeader.fill(attribute);
    }

    async clickOnSaveButtonInDataPanelHeader(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.saveButtonInDataPanelHeader);
        if (!isVisible) throw new Error("save in data panel header button is not visible!");
        await this.saveButtonInDataPanelHeader.click();
    }

    async clickOnRemoveAttributeButtonInDataPanelHeader(): Promise<void>{
        const isVisible = await waitForElementToBeVisible(this.removeAttributeButtonInDataPanelHeader);
        if (!isVisible) throw new Error("remove attr in data panel header button is not visible!");
        await this.removeAttributeButtonInDataPanelHeader.click();
    }

    async getAttributeHeaderLabelInDataPanelHeader(): Promise<string | null>{
        const isVisible = await waitForElementToBeVisible(this.attributeHeaderLabelInDataPanelHeader);
        if (!isVisible) throw new Error("attr in data panel header text is not visible!");
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