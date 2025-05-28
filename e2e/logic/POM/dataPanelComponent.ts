/* eslint-disable prefer-destructuring */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Locator } from "@playwright/test";
import { interactWhenVisible, waitForElementToBeVisible, waitForElementToNotBeVisible } from "@/e2e/infra/utils";
import GraphPage from "./graphPage";

export default class DataPanel extends GraphPage {

    private get dataPanel(): Locator {
        return this.page.getByTestId("DataPanel");
    }

    // CLOSE
    private get dataPanelClose(): Locator {
        return this.page.getByTestId("DataPanelClose");
    }

    // COUNT
    private get dataPanelAttributesCount(): Locator {
        return this.page.getByTestId("DataPanelAttributesCount").locator("span");
    }

    // LABEL
    private get dataPanelLabel(): Locator {
        return this.page.getByTestId("DataPanelLabel");
    }

    dataPanelLabelByName(label: string): Locator {
        return this.page.getByTestId(`DataPanelLabel${label}`);
    }

    // REMOVE LABEL
    private get dataPanelRemoveLabelByLabel(): (label: string) => Locator {
        return (label: string) => this.page.getByTestId(`DataPanelRemoveLabel${label}`);
    }

    private get dataPanelRemoveLabelButtonConfirm(): Locator {
        return this.page.getByTestId("removeLabelButton");
    }

    // ADD LABEL
    private get dataPanelAddLabel(): Locator {
        return this.page.getByTestId("DataPanelAddLabel");
    }

    private get dataPanelAddLabelInput(): Locator {
        return this.page.getByTestId("addLabelInput");
    }

    private get dataPanelAddLabelButton(): Locator {
        return this.page.getByTestId("addLabelButton");
    }

    private get dataPanelAddLabelCancel(): Locator {
        return this.page.getByTestId("DataPanelAddLabelCancel");
    }

    private get dataPanelAttribute(): (key: string) => Locator {
        return (key: string) => this.page.getByTestId(`DataPanelAttribute${key}`);
    }

    // SET ATTRIBUTE
    private get dataPanelValueSetAttribute(): Locator {
        return this.page.getByTestId("DataPanelValueSetAttribute");
    }

    private get dataPanelSetAttribute(): Locator {
        return this.page.getByTestId("DataPanelSetAttribute");
    }

    private get dataPanelSetAttributeInput(): Locator {
        return this.page.getByTestId("DataPanelSetAttributeInput");
    }

    private get dataPanelSetAttributeConfirm(): Locator {
        return this.page.getByTestId("DataPanelSetAttributeConfirm");
    }

    private get dataPanelSetAttributeCancel(): Locator {
        return this.page.getByTestId("DataPanelSetAttributeCancel");
    }

    // ADD ATTRIBUTE
    private get dataPanelAddAttribute(): Locator {
        return this.page.getByTestId("DataPanelAddAttribute");
    }

    private get dataPanelAddAttributeConfirm(): Locator {
        return this.page.getByTestId("DataPanelAddAttributeConfirm");
    }

    private get dataPanelAddAttributeCancel(): Locator {
        return this.page.getByTestId("DataPanelAddAttributeCancel");
    }

    private get dataPanelAddAttributeKey(): Locator {
        return this.page.getByTestId("DataPanelAddAttributeKey");
    }

    private get dataPanelAddAttributeValue(): Locator {
        return this.page.getByTestId("DataPanelAddAttributeValue");
    }

    // DELETE ATTRIBUTE
    private get dataPanelDeleteAttribute(): Locator {
        return this.page.getByTestId("DataPanelDeleteAttribute");
    }

    private get dataPanelDeleteAttributeConfirm(): Locator {
        return this.page.getByTestId("DataPanelDeleteAttributeConfirm");
    }

    private get dataPanelDeleteAttributeCancel(): Locator {
        return this.page.getByTestId("DataPanelDeleteAttributeCancel");
    }

    // GET ATTRIBUTE
    private attributeValue(type: string): Locator {
        return this.page.getByTestId(`DataPanelAttribute${type}`);
    }

    async getContentDataPanelAttributesCount(): Promise<number> {
        const content = await interactWhenVisible(this.dataPanelAttributesCount, (el) => el.textContent(), "Data Panel Attributes Count");
        return Number(content ?? "0")
    }

    async isVisibleDataPanel(): Promise<boolean> {
        const isVisible = await waitForElementToBeVisible(this.dataPanel);
        return isVisible;
    }

    async isVisibleLabel(label: string): Promise<boolean> {
        const isVisible = await waitForElementToBeVisible(this.dataPanelLabelByName(label));
        return isVisible;
    }

    async isVisibleAttribute(key: string): Promise<boolean> {
        const isVisible = await waitForElementToBeVisible(this.dataPanelAttribute(key));
        return isVisible;
    }

    async hoverDataPanelLabel(): Promise<void> {
        await interactWhenVisible(this.dataPanelLabel, (el) => el.hover(), "Data Panel Label");
    }

    async hoverDataPanelAttribute(key: string): Promise<void> {
        await interactWhenVisible(this.dataPanelAttribute(key), (el) => el.hover(), "Data Panel Attribute");
    }

    async fillDataPanelAddLabelInput(label: string): Promise<void> {
        await interactWhenVisible(this.dataPanelAddLabelInput, (el) => el.fill(label), "Data Panel Add Label Input");
    }

    async fillDataPanelAddAttributeKey(key: string): Promise<void> {
        await interactWhenVisible(this.dataPanelAddAttributeKey, (el) => el.fill(key), "Data Panel Add Attribute Key");
    }

    async fillDataPanelAddAttributeValue(value: string): Promise<void> {
        await interactWhenVisible(this.dataPanelAddAttributeValue, (el) => el.fill(value), "Data Panel Add Attribute Value");
    }

    async fillDataPanelSetAttributeInput(value: string): Promise<void> {
        await interactWhenVisible(this.dataPanelSetAttributeInput, (el) => el.fill(value), "Data Panel Set Attribute Input");
    }

    async clickDataPanelClose(): Promise<void> {
        await interactWhenVisible(this.dataPanelClose, (el) => el.click(), "Data Panel Close");
    }

    async clickDataPanelRemoveLabelByLabel(label: string): Promise<void> {
        await interactWhenVisible(this.dataPanelRemoveLabelByLabel(label), (el) => el.click(), "Data Panel Remove Label");
    }

    async clickDataPanelAddLabel(): Promise<void> {
        await interactWhenVisible(this.dataPanelAddLabel, (el) => el.click(), "Data Panel Add Label");
    }

    async clickDataPanelAddLabelConfirm(): Promise<void> {
        await interactWhenVisible(this.dataPanelAddLabelButton, (el) => el.click(), "Data Panel Add Label Confirm");
    }

    async clickDataPanelRemoveLabelConfirm(): Promise<void> {
        await interactWhenVisible(this.dataPanelRemoveLabelButtonConfirm, (el) => el.click(), "Data Panel Add Label Confirm");
    }

    async clickDataPanelAddLabelCancel(): Promise<void> {
        await interactWhenVisible(this.dataPanelAddLabelCancel, (el) => el.click(), "Data Panel Add Label Cancel");
    }

    async clickDataPanelAddAttribute(): Promise<void> {
        await interactWhenVisible(this.dataPanelAddAttribute, (el) => el.click(), "Data Panel Add Attribute");
    }

    async clickDataPanelAddAttributeConfirm(): Promise<void> {
        await interactWhenVisible(this.dataPanelAddAttributeConfirm, (el) => el.click(), "Data Panel Add Attribute Confirm");
    }

    async clickDataPanelAddAttributeCancel(): Promise<void> {
        await interactWhenVisible(this.dataPanelAddAttributeCancel, (el) => el.click(), "Data Panel Add Attribute Cancel");
    }

    async clickDataPanelValueSetAttribute(): Promise<void> {
        await interactWhenVisible(this.dataPanelValueSetAttribute, (el) => el.click(), "Data Panel Value Set Attribute");
    }

    async clickDataPanelSetAttribute(): Promise<void> {
        await interactWhenVisible(this.dataPanelSetAttribute, (el) => el.click(), "Data Panel Set Attribute");
    }

    async clickDataPanelSetAttributeConfirm(): Promise<void> {
        await interactWhenVisible(this.dataPanelSetAttributeConfirm, (el) => el.click(), "Data Panel Set Attribute Confirm");
    }

    async clickDataPanelSetAttributeCancel(): Promise<void> {
        await interactWhenVisible(this.dataPanelSetAttributeCancel, (el) => el.click(), "Data Panel Set Attribute Cancel");
    }

    async clickDataPanelDeleteAttribute(): Promise<void> {
        await interactWhenVisible(this.dataPanelDeleteAttribute, (el) => el.click(), "Data Panel Delete Attribute");
    }

    async clickDataPanelDeleteAttributeConfirm(): Promise<void> {
        await interactWhenVisible(this.dataPanelDeleteAttributeConfirm, (el) => el.click(), "Data Panel Delete Attribute Confirm");
    }

    async clickDataPanelDeleteAttributeCancel(): Promise<void> {
        await interactWhenVisible(this.dataPanelDeleteAttributeCancel, (el) => el.click(), "Data Panel Delete Attribute Cancel");
    }

    async getAttributeValueByName(attribute: string): Promise<string | null> {
        return await interactWhenVisible(this.attributeValue(attribute), (el) => el.textContent(), "Data Panel Delete Attribute Cancel");
    }

    async isAttributeValueByNameVisible(attribute: string): Promise<boolean> {
        return await this.attributeValue(attribute).isVisible();
    }

    async closeDataPanel(): Promise<void> {
        await this.clickDataPanelClose();
    }

    async removeLabel(label: string): Promise<void> {
        await this.clickDataPanelRemoveLabelByLabel(label);
        await this.clickDataPanelRemoveLabelConfirm();
        await waitForElementToNotBeVisible(this.dataPanelRemoveLabelByLabel(label));
    }

    async addLabel(label: string, hasLabel = true): Promise<void> {
        if (hasLabel) {
            await this.hoverDataPanelLabel();
        }

        await this.clickDataPanelAddLabel();
        await this.fillDataPanelAddLabelInput(label);
        await this.clickDataPanelAddLabelConfirm();
    }

    async getAttributesCount(): Promise<number> {
        const count = await this.getContentDataPanelAttributesCount();
        return count;
    }

    async getLabel(label: string): Promise<string> {
        const labelValue =  await this.dataPanelLabelByName(label).textContent();
        return labelValue ? labelValue.trim() : "";
    }

    async setAttribute(key: string, value: string): Promise<void> {
        await this.hoverDataPanelAttribute(key);
        await this.clickDataPanelSetAttribute();
        await this.fillDataPanelSetAttributeInput(value);
        await this.clickDataPanelSetAttributeConfirm();
        await waitForElementToNotBeVisible(this.dataPanelSetAttributeConfirm);
    }

    async addAttribute(key: string, value: string): Promise<void> {
        await this.clickDataPanelAddAttribute();
        await this.fillDataPanelAddAttributeKey(key);
        await this.fillDataPanelAddAttributeValue(value);
        await this.clickDataPanelAddAttributeConfirm();
        await waitForElementToNotBeVisible(this.dataPanelAddAttributeConfirm);
    }

    async removeAttribute(key: string): Promise<void> {
        await this.hoverDataPanelAttribute(key);
        await this.clickDataPanelDeleteAttribute();
        await this.clickDataPanelDeleteAttributeConfirm();
        await waitForElementToNotBeVisible(this.dataPanelDeleteAttributeConfirm);
    }
}