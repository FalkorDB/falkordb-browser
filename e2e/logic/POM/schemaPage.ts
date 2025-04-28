/* eslint-disable prefer-destructuring */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Locator } from "@playwright/test";
import { interactWhenVisible, waitForElementToBeVisible } from "@/e2e/infra/utils";
import GraphPage from "./graphPage";

export default class SchemaPage extends GraphPage {

    private get addSchemaBtnInNavBar(): Locator {
        return this.page.getByText("Create New Schema");
    }

    private get schemaNameInput(): Locator {
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

    private get uniqueActiveRadioBtn(): Locator {
        return this.page.locator('//div[contains(@class, "DataPanel")]//tr//td[4]//button[not(@disabled)]');
    }

    private get requiredActiveRadioBtn(): Locator {
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

    private get deleteRelationInDataPanel(): Locator {
        return this.page.locator('//div[contains(@class, "DataPanel")]//button[contains(text(), "Delete Relation")]');
    }

    private get categoriesPanelBtn(): Locator {
        return this.page.locator('//div[contains(@id, "CategoriesPanel")]//button');
    }

    private get typeSelectSearchInput(): Locator {
        return this.page.locator(`//div[@id='TypeSearch']//input`);
    }

    private get selectSearchType(): Locator {
        return this.page.locator(`//ul[@id='TypeList']//div[@role="option"]`);
    }

    async clickAddNewSchemaBtn(): Promise<void> {
        await interactWhenVisible(this.addSchemaBtnInNavBar, el => el.click(), "add new schema button");
    }

    async fillSchemaNameInput(schemaName: string): Promise<void> {
        await interactWhenVisible(this.schemaNameInput, el => el.fill(schemaName), "schema name input");
    }

    async clickCreateSchemaBtn(): Promise<void> {
        await interactWhenVisible(this.createSchemaBtn, el => el.click(), "create schema button");
    }

    async clickAddNode(): Promise<void> {
        await interactWhenVisible(this.addNodeBtn, el => el.click(), "add node button");
    }

    async clickAddRelation(): Promise<void> {
        await interactWhenVisible(this.addRelationBtn, el => el.click(), "add relation button");
    }

    async clickCloseBtnInHeaderDataPanel(): Promise<void> {
        await interactWhenVisible(this.closeBtnInHeaderDataPanel, el => el.click(), "close button in header data panel");
    }

    async clickAddBtnInHeaderDataPanel(): Promise<void> {
        await interactWhenVisible(this.addBtnInHeaderDataPanel, el => el.click(), "add button in header data panel");
    }

    async insertDataPanelHeader(title: string): Promise<void> {
        await interactWhenVisible(this.dataPanelHeaderInput, el => el.fill(title), "data panel header input");
    }

    async clickSaveBtnInHeaderDataPanel(): Promise<void> {
        await interactWhenVisible(this.saveBtnInHeaderDataPanel, el => el.click(), "save button in header data panel");
    }

    async insertActiveKeyInputInDataPanelAttr(key: string): Promise<void> {
        await interactWhenVisible(this.activekeyInputInDataPanel, el => el.fill(key), "active key input in data panel");
    }

    async getKeyInDataPanelAttr(keyIndex: string): Promise<string | null> {
        const text = await interactWhenVisible(this.keyInDataPanel(keyIndex), el => el.textContent(), "key input in data panel");
        return text;
    }

    async insertActiveDescInputInDataPanelAttr(desc: string): Promise<void> {
        await interactWhenVisible(this.activeDescInputInDataPanel, el => el.fill(desc), "desc input in data panel");
    }

    async getDescInDataPanelAttr(descIndex: string): Promise<string | null> {
        const text = await interactWhenVisible(this.descInDataPanel(descIndex), el => el.textContent(), "desc input in data panel");
        return text;
    }

    async clickTypeActiveBtnInDataPanel(): Promise<void> {
        await interactWhenVisible(this.typeActiveBtnInDataPanel, el => el.click(), "type active button in data panel");
    }

    async clickUniqueActiveRadioBtn(): Promise<void> {
        await interactWhenVisible(this.uniqueActiveRadioBtn, el => el.click(), "unique active button in data panel");
    }

    async clickRequiredActiveRadioBtn(): Promise<void> {
        await interactWhenVisible(this.requiredActiveRadioBtn, el => el.click(), "required active button in data panel");
    }

    async clickAddActiveBtnInDataPanel(): Promise<void> {
        await interactWhenVisible(this.addActiveBtnInDataPanel, el => el.click(), "add active button in data panel");
    }

    async clickCancelActiveBtnInDataPanel(): Promise<void> {
        await interactWhenVisible(this.cancelActiveBtnInDataPanel, el => el.click(), "cancel active button in data panel");
    }

    async clickCreateNewNodeBtnInDataPanel(): Promise<void> {
        await interactWhenVisible(this.createNewNodeBtnInDataPanel, el => el.click(), "create new node button in data panel");
    }

    async clickCreateNewEdgeBtnInDataPanel(): Promise<void> {
        await interactWhenVisible(this.createNewEdgeBtnInDataPanel, el => el.click(), "create new edge button in data panel");
    }

    async clickAddValueBtnInDataPanel(): Promise<void> {
        await interactWhenVisible(this.addValueBtnInDataPanel, el => el.click(), "add value button in data panel");
    }

    async clickDeleteValueBtnInDataPanel(): Promise<void> {
        await interactWhenVisible(this.deleteValueBtnInDataPanel, el => el.click(), "delete value button in data panel");
    }

    async clickEditValueBtnInDataPanel(): Promise<void> {
        await interactWhenVisible(this.editValueBtnInDataPanel, el => el.click(), "edit value button in data panel");
    }

    async hasAttributeRows(): Promise<boolean> {
        const isVisible = await waitForElementToBeVisible(this.attributeRows);
        if (!isVisible) return false;
        const rows = await this.attributeRows.count();
        return rows > 0;
    }

    async getAttributeRowsCount(): Promise<number> {
        const rows = await this.attributeRows.count();
        return rows;
    }

    async clickDeleteNodeInDataPanel(): Promise<void> {
        await interactWhenVisible(this.deleteNodeInDataPanel, el => el.click(), "delete node in data panel");
    }

    async clickDeleteRelationInDataPanel(): Promise<void> {
        await interactWhenVisible(this.deleteRelationInDataPanel, el => el.click(), "delete relation in data panel");
    }

    async clickCategoriesPanelBtn(): Promise<void> {
        await interactWhenVisible(this.categoriesPanelBtn, el => el.click(), "categories panel button");
    }

    async getCategoriesPanelBtn(): Promise<string | null> {
        const text = await interactWhenVisible(this.categoriesPanelBtn, el => el.textContent(), "categories panel button");
        return text;
    }

    async fillTypeSelectSearchInput(type: string): Promise<void> {
        await interactWhenVisible(this.typeSelectSearchInput, el => el.fill(type), "type search input");
    }

    async clickSearchedType(): Promise<void> {
        await interactWhenVisible(this.selectSearchType, el => el.click(), "type search input");
    }

    async isCategoriesPanelBtnHidden(): Promise<boolean> {
        const isHidden = await this.categoriesPanelBtn.isHidden();
        return isHidden;
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

    async deleteNode(x: number, y: number): Promise<void> {
        await this.nodeClick(x, y);
        await this.clickDeleteNodeInDataPanel();
        await this.clickConfirmDeleteNodeInDataPanel();
    }

    async addLabel(title: string): Promise<void> {
        await this.clickAddRelation();
        await this.clickAddBtnInHeaderDataPanel();
        await this.insertDataPanelHeader(title);
        await this.clickSaveBtnInHeaderDataPanel();
    }

    async prepareRelation(title: string, key: string, type: string, desc: string, unique: boolean, required: boolean): Promise<void> {
        await this.addLabel(title);
        await this.addAttribute(key, type, desc, unique, required);
    }

    async clickRelationBetweenNodes(): Promise<void> {
        const schema = await this.getNodeScreenPositions('schema');
        await this.nodeClick(schema[0].screenX, schema[0].screenY);
        await this.nodeClick(schema[1].screenX, schema[1].screenY);
        await this.clickCreateNewEdgeBtnInDataPanel();
    }

    async deleteRelation(x: number, y: number): Promise<void> {
        await this.nodeClick(x, y);
        await this.clickDeleteRelationInDataPanel();
        await this.clickConfirmDeleteNodeInDataPanel();
    }

    async selectTypeFromList(type: string): Promise<void> {
        await this.fillTypeSelectSearchInput(type);
        await this.clickSearchedType();
    }

    async addAttribute(key: string, type: string, desc: string, unique: boolean, required: boolean): Promise<void> {
        await this.insertActiveKeyInputInDataPanelAttr(key);
        await this.clickTypeActiveBtnInDataPanel();
        await this.selectTypeFromList(type);
        await this.insertActiveDescInputInDataPanelAttr(desc);
        if (unique) {
            await this.clickUniqueActiveRadioBtn();
        }
        if (required) {
            await this.clickRequiredActiveRadioBtn();
        }
        await this.clickAddActiveBtnInDataPanel();
    }

}