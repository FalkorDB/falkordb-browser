import { interactWhenVisible, waitForElementToBeVisible, waitForElementToNotBeVisible } from "@/e2e/infra/utils";
import Page from "./page";
import GraphPage from "./graphPage";
import { Locator } from "playwright";

export default class SchemaPage extends GraphPage {

    // TABLE
    private get dataPanelTable(): Locator {
        return this.page.getByTestId("attributesTableBody");
    }

    private tableRowInDataPanel(type: string): Locator {
        return this.dataPanelTable.locator(`tr:nth-of-type(${type})`);
    }

    //ADD ATTRIBUTES
    private insertAttriubute(attriubuteRow: string, typeInput: string): Locator {
        return this.dataPanelTable.locator(`tr:nth-of-type(${attriubuteRow})`).locator(`td:nth-of-type(${typeInput})`).locator("input");
    }

    private addAttriubuteButton(): Locator {
        return this.page.getByTestId(`addAttributeButton`);
    }

    private saveAddValueButton(): Locator {
        return this.page.getByTestId(`saveAddValueButton`);
    }

    // CREATE NODE
    private createNewNodeButton(): Locator {
        return this.page.getByTestId(`createElementButton`);
    }

    // DATA PANEL
    private addNewLabelButton(): Locator {
        return this.page.getByTestId(`addNewLabelButton`);
    }

    private addNewLabelInput(): Locator {
        return this.page.getByTestId(`newLabelInput`);
    }

    private saveNewLabelButton(): Locator {
        return this.page.getByTestId(`saveNewLabelButton`);
    }

    private searchTypeInput(): Locator {
        return this.page.getByTestId(`searchType`);
    }

    private selectTypeItem(type: string): Locator {
        return this.page.getByTestId(`selectTypeItem${type}`);
    }

    private get dataPanelAttributesCount(): Locator {
        return this.page.getByTestId("DataPanelAttributesCount");
    }

    private dataPanelNodeSelection(nodeId: string): Locator {
        return this.page.getByTestId(`selectedNode${nodeId}`);
    }

    private deleteElementSchema(): Locator {
        return this.page.getByTestId(`deleteElementSchema`);
    }

    private confirmDeleteElementSchema(): Locator {
        return this.page.getByTestId(`deleteElementConfirmSchema`);
    }

    private confirmRemoveAttributeButton(): Locator {
        return this.page.getByTestId(`confirmRemoveAttributeButton`);
    }

    private addValueButton(): Locator {
        return this.page.getByTestId(`addValueButton`);
    }

    private removeAttributeButton(): Locator {
        return this.page.getByTestId(`removeAttributeButton`);
    }

    private editAttributeButton(): Locator {
        return this.page.getByTestId(`editAttributeButton`);
    }

    async clickRemoveAttributeButton(): Promise<void> {
        await interactWhenVisible(this.removeAttributeButton(), (el) => el.click(), "Click Remove Attribute Button");
    }

    async clickEditAttributeButton(): Promise<void> {
        await interactWhenVisible(this.editAttributeButton(), (el) => el.click(), "Click Edit Attribute Button");
    }

    async getContentDataPanelAttributesCount(): Promise<number> {
        const content = await interactWhenVisible(this.dataPanelAttributesCount, (el) => el.textContent(), "Data Panel Attributes Count");
        return parseInt(content ?? "0")
    }

    async getDataPanelNodeSelection(nodeId: string): Promise<string | null> {
        return await interactWhenVisible(this.dataPanelNodeSelection(nodeId), (el) => el.textContent(), "Data Panel Node Selection Count");
    }

    private clickAttriubute(attriubuteRow: string, typeInput: string): Locator {
        return this.dataPanelTable.locator(`tr:nth-of-type(${attriubuteRow})`).locator(`td:nth-of-type(${typeInput})`).locator("button");
    }

    async clickElementCanvasAdd(): Promise<void> {
        await interactWhenVisible(this.elementCanvasAdd("Schema"), (el) => el.click(), "Add schema Element");
    }

    async clickElementCanvasAddNode(): Promise<void> {
        await interactWhenVisible(this.elementCanvasAddNode("Schema"), (el) => el.click(), "Add Node");
    }

    async clickElementCanvasAddEdge(): Promise<void> {
        await interactWhenVisible(this.elementCanvasAddEdge("Schema"), (el) => el.click(), "Add Edge");
    }

    async clickAddNewLabelButton(): Promise<void> {
        await interactWhenVisible(this.addNewLabelButton(), (el) => el.click(), "Click Add New Label Button");
    }

    async insertAddNewLabelInput(labelInput: string): Promise<void> {
        await interactWhenVisible(this.addNewLabelInput(), (el) => el.fill(labelInput), "Insert Add New Label Input");
    }

    async clickSaveNewLabelButton(): Promise<void> {
        await interactWhenVisible(this.saveNewLabelButton(), (el) => el.click(), "Click Save New Label Button");
    }

    async insertSeachType(searchInput: string): Promise<void> {
        await interactWhenVisible(this.searchTypeInput(), (el) => el.fill(searchInput), "Insert Search Type Input");
    }

    async clickDeleteElementSchema(): Promise<void> {
        await interactWhenVisible(this.deleteElementSchema(), (el) => el.click(), "Click Delete Element Schema");
    }

    async clickConfirmDeleteElementSchema(): Promise<void> {
        await interactWhenVisible(this.confirmDeleteElementSchema(), (el) => el.click(), "Click Confirm Delete Element Schema");
    }

    async clickAddValueButton(): Promise<void> {
        await interactWhenVisible(this.addValueButton(), (el) => el.click(), "Click Add Value Button");
    }

    async clickSaveAddValueButton(): Promise<void> {
        await interactWhenVisible(this.saveAddValueButton(), (el) => el.click(), "Click Save Add Value Button");
    }
    
    async clickManage(): Promise<void> {
        await interactWhenVisible(this.manage("Schema"), (el) => el.click(), "Manage Schemas Button");
    }

    async clickTableCheckboxByName(name: string): Promise<void> {
        await interactWhenVisible(this.tableCheckboxByName("Schema", name), (el) => el.click(), `Table Schemas Checkbox ${name}`);
    }

    async hoverTableRowByName(name: string): Promise<void> {
        await interactWhenVisible(this.tableRowByName("Schema", name), (el) => el.hover(), `Table Schemas Row ${name}`);
    }

    async hoverTableRowInDataPanel(type: string): Promise<void> {
        await interactWhenVisible(this.tableRowInDataPanel(type), (el) => el.hover(), `Table Row in Data Panel ${type}`);
    }

    async insertAttriubuteValue(attriubuteRow: string, typeInput: string, value: string): Promise<void> {
        await interactWhenVisible(this.insertAttriubute(attriubuteRow, typeInput), (el) => el.fill(value), "Insert Attribute Value");
    }

    async clickAttriubuteButton(attriubuteRow: string, typeInput: string): Promise<void> {
        await interactWhenVisible(this.clickAttriubute(attriubuteRow, typeInput), (el) => el.click(), "Click Attribute Button");
    }

    async clickCreateSchema(): Promise<void> {
        await interactWhenVisible(this.create("Schema"), (el) => el.click(), "Click Create");
    }

    async fillCreateSchemaInput(text: string): Promise<void> {
        await interactWhenVisible(this.insertInput("Schema"), (el) => el.fill(text), "Create Schema Input");
    }

    async clickConfirmCreateSchema(): Promise<void> {
        await interactWhenVisible(this.createConfirm("Schema"), (el) => el.click(), "Click Create Confirm");
    }

    async clickAddAttributeButton(): Promise<void> {
        await interactWhenVisible(this.addAttriubuteButton(), (el) => el.click(), "Click Add Attribute Button");
    }

    async clickCreateNewNodeButton(): Promise<void> {
        await interactWhenVisible(this.createNewNodeButton(), (el) => el.click(), "Click Add Attribute Button");
    }

    async clickEditButton(): Promise<void> {
        await interactWhenVisible(this.editButton("Schema"), (el) => el.click(), "Edit Button Schemas");
    }

    async clickSelectTypeItem(type: string): Promise<void> {
        await interactWhenVisible(this.selectTypeItem(type), (el) => el.click(), "Edit Button Schemas");
    }

    async clickConfirmRemoveAttributeButton(): Promise<void> {
        await interactWhenVisible(this.confirmRemoveAttributeButton(), (el) => el.click(), "Click Confirm Remove Attribute Button");
    }

    async modifySchemaName(oldName: string, newName: string): Promise<void> {
        await this.clickSelect("Schema");
        await this.clickManage();
        await this.hoverTableRowByName(oldName);
        await this.clickEditButton();
        await this.fillInput("Schema", newName);
        await this.clickSaveButton("Schema");
        await waitForElementToNotBeVisible(this.saveButton("Schema"));
    }

    async verifySchemaExists(schemaName: string): Promise<boolean> {
        await this.clickSelect("Schema");
        await this.fillSearch(schemaName);
        const schemaId = "0"; // always select the first result
        const isVisible = await this.isVisibleSelectItem(schemaId);
        return isVisible;
    }

    async selectSchemaByName(schemaName: string): Promise<void> {
        await this.clickSelect("Schema");
        await this.fillSearch(schemaName);
        await this.isVisibleSelectItem(schemaName);
        await this.clickSelectItem("0"); // selecting the first item in list after search
    }


    async addSchema(schemaName: string): Promise<void> {
        await this.clickCreateSchema();
        await this.fillCreateSchemaInput(schemaName);
        await this.clickConfirmCreateSchema();
        await this.isVisibleToast();
    }

    async deleteSchema(schemaName: string): Promise<void> {
        await this.clickSelect("Schema");
        await this.clickManage();
        await this.clickTableCheckboxByName(schemaName);
        await this.clickDelete();
        await this.clickDeleteConfirm();
        await this.isVisibleToast();
    }

    async addLabelToNode(label: string): Promise<void> {
        await this.clickAddNewLabelButton();
        await this.insertAddNewLabelInput(label);
        await this.clickSaveNewLabelButton();
    }

    async selectAttriubuteType(attriubuteRow: string, type: string): Promise<void> {
        await this.clickAttriubuteButton(attriubuteRow, "2"); //click type button
        await this.insertSeachType(type); //search for type
        await this.clickSelectTypeItem(type); //select type from list
    }

    async addAttribute(attributeRow: string, key: string, type: string, description: string, unique: boolean, required: boolean): Promise<void> {
        await this.insertAttriubuteValue(attributeRow, "1", key); //key
        await this.selectAttriubuteType(attributeRow, type); //type
        await this.insertAttriubuteValue(attributeRow, "3", description); //description
        unique ? await this.clickAttriubuteButton(attributeRow, "4") : null; //Enable Unique
        required ? await this.clickAttriubuteButton(attributeRow, "5") : null; //Enable Required
        await this.clickAddAttributeButton();
    }

    async addValueToExistingElementDataPanel(attributeRow: string, key: string, type: string, description: string, unique: boolean, required: boolean): Promise<void> {
        await this.insertAttriubuteValue(attributeRow, "1", key); //key
        await this.selectAttriubuteType(attributeRow, type); //type
        await this.insertAttriubuteValue(attributeRow, "3", description); //description
        unique ? await this.clickAttriubuteButton(attributeRow, "4") : null; //Enable Unique
        required ? await this.clickAttriubuteButton(attributeRow, "5") : null; //Enable Required
        await this.clickSaveAddValueButton();
    }

    async addNode(attributeRow: string, label: string, key: string, type: string, description: string, unique: boolean, required: boolean): Promise<void> {
        await this.clickElementCanvasAdd();
        await this.clickElementCanvasAddNode();
        await this.addLabelToNode(label);
        await this.addAttribute(attributeRow, key, type, description, unique, required);
        await this.clickCreateNewNodeButton();
    }

    async searchElementInCanvasSelectFirst(name: string): Promise<void> {
        await this.fillElementCanvasSearch("Schema", name);
        await this.clickElementCanvasSuggestionByName("Schema", "0"); // always select the first result
    }

    async deleteSchemaElement(): Promise<void> {
        await this.clickDeleteElementSchema();
        await this.clickConfirmDeleteElementSchema();
        await this.isVisibleToast();
    }

    async selectTwoNodesForEdge(node1x: number, node1y: number, node2x: number, node2y: number): Promise<void> {
        await this.elementClick(node1x, node1y);
        await this.page.waitForTimeout(500);
        await this.elementClick(node2x, node2y);
    }

    async addEdge(attributeRow: string, label: string, key: string, type: string, description: string, unique: boolean, required: boolean, node1x: number, node1y: number, node2x: number, node2y: number): Promise<void> {
        await this.clickElementCanvasAdd();
        await this.clickElementCanvasAddEdge();
        await this.addLabelToNode(label);
        await this.addAttribute(attributeRow, key, type, description, unique, required);
        const check = await this.selectTwoNodesForEdge(node1x, node1y, node2x, node2y);
        await this.clickCreateNewNodeButton();
    }

    async exportSchema(schemaName: string): Promise<void> { // must check if its working
        await this.clickExport();
        await this.fillCreateSchemaInput(schemaName);
        await this.clickExportConfirm();
        await this.isVisibleToast();
    }

    async swapNodesInAddEdgeDataPanel(node1: string, node2: string): Promise<void> {
        // click add element button
        // click add edge button from dropdown
         // must make two clicks one for first node and one for second node
         // then click swap nodes button

    }

    async clearNodesInAddEdgeDataPanel(): Promise<void> {
        //click add element button
        // click add edge button from dropdown
        // must make two clicks one for first node and one for second node
        // then click clear nodes button
    }

    async modifyAttributeValueByRow(attributeRow: string, type: string, description: string, unique: boolean, required: boolean): Promise<void> {
        await this.hoverTableRowInDataPanel(attributeRow);
        await this.clickEditAttributeButton();
        await this.selectAttriubuteType(attributeRow, type); //type
        await this.insertAttriubuteValue(attributeRow, "3", description); //description
        unique ? await this.clickAttriubuteButton(attributeRow, "4") : null; //Enable Unique
        required ? await this.clickAttriubuteButton(attributeRow, "5") : null; //Enable Required
    }

    async removeAttributeByRow(attributeRow: string): Promise<void> {
        await this.hoverTableRowInDataPanel(attributeRow);
        await this.clickRemoveAttributeButton();
        await this.clickConfirmRemoveAttributeButton();
    }

}