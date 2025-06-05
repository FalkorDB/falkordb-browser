import { interactWhenVisible, waitForElementToNotBeVisible, waitForElementToBeVisible, delay, pollForElementContent } from "@/e2e/infra/utils";
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
    private insertAttribute(attributeRow: string, typeInput: string): Locator {
        return this.dataPanelTable.locator(`tr:nth-of-type(${attributeRow})`).locator(`td:nth-of-type(${typeInput})`).locator("input");
    }

    private addAttributeButton(): Locator {
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

    private elementCanvasSuggestionsListSchemaFirstSuggestion(): Locator {
        return this.page.getByTestId(`elementCanvasSuggestionsListSchema`).locator("button");
    }

    async clickRemoveAttributeButton(): Promise<void> {
        await interactWhenVisible(this.removeAttributeButton(), (el) => el.click(), "Click Remove Attribute Button");
    }

    async clickEditAttributeButton(): Promise<void> {
        await interactWhenVisible(this.editAttributeButton(), (el) => el.click(), "Click Edit Attribute Button");
    }

    async getContentDataPanelAttributesCount(): Promise<number> {
        const content = await pollForElementContent(this.dataPanelAttributesCount, "Data Panel Attributes Count");
        return parseInt(content ?? "0");
    }

    async getDataPanelNodeSelection(nodeId: string): Promise<string | null> {
        return await interactWhenVisible(this.dataPanelNodeSelection(nodeId), (el) => el.textContent(), "Data Panel Node Selection Count");
    }

    private clickAttribute(attributeRow: string, typeInput: string): Locator {
        return this.dataPanelTable.locator(`tr:nth-of-type(${attributeRow})`).locator(`td:nth-of-type(${typeInput})`).locator("button");
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

    async insertAttributeValue(attributeRow: string, typeInput: string, value: string): Promise<void> {
        await interactWhenVisible(this.insertAttribute(attributeRow, typeInput), (el) => el.fill(value), "Insert Attribute Value");
    }

    async clickAttributeButton(attributeRow: string, typeInput: string): Promise<void> {
        await interactWhenVisible(this.clickAttribute(attributeRow, typeInput), (el) => el.click(), "Click Attribute Button");
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
        await interactWhenVisible(this.addAttributeButton(), (el) => el.click(), "Click Add Attribute Button");
    }

    async clickCreateNewNodeButton(): Promise<void> {
        await interactWhenVisible(this.createNewNodeButton(), (el) => el.click(), "Click Create New Node Button");
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

    async clickFirstElementSuggestionInSearch(): Promise<void> {
        await interactWhenVisible(this.elementCanvasSuggestionsListSchemaFirstSuggestion(), (el) => el.click(), `Click First Element Suggestion in Search`);
    }

    async modifySchemaName(oldName: string, newName: string): Promise<void> {
        await this.clickSelect("Schema");
        await this.clickManage();
        await this.hoverTableRowByName(oldName);
        await this.clickEditButton();
        await this.fillInput("Schema", newName);
        await this.clickSaveButton("Schema");
        await this.waitForPageIdle();
        // await waitForElementToNotBeVisible(this.saveButton("Schema"));
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
        await this.page.waitForTimeout(1000); // wait for the search results to load
        await this.clickSelectItem("0"); // selecting the first item in list after search
        await this.waitForCanvasAnimationToEnd();
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

    async selectAttributeType(attributeRow: string, type: string): Promise<void> {
        await this.clickAttributeButton(attributeRow, "2"); //click type button
        await this.insertSeachType(type); //search for type
        await this.clickSelectTypeItem(type); //select type from list
    }

    async addAttribute(attributeRow: string, key: string, type: string, description: string, unique: boolean, required: boolean): Promise<void> {
        await this.insertAttributeValue(attributeRow, "1", key); //key
        await this.selectAttributeType(attributeRow, type); //type
        await this.insertAttributeValue(attributeRow, "3", description); //description
        unique ? await this.clickAttributeButton(attributeRow, "4") : null; //Enable Unique
        required ? await this.clickAttributeButton(attributeRow, "5") : null; //Enable Required
        await this.clickAddAttributeButton();
    }

    async addValueToExistingElementDataPanel(attributeRow: string, key: string, type: string, description: string, unique: boolean, required: boolean): Promise<void> {
        await this.insertAttributeValue(attributeRow, "1", key); //key
        await this.selectAttributeType(attributeRow, type); //type
        await this.insertAttributeValue(attributeRow, "3", description); //description
        unique ? await this.clickAttributeButton(attributeRow, "4") : null; //Enable Unique
        required ? await this.clickAttributeButton(attributeRow, "5") : null; //Enable Required
        await this.clickSaveAddValueButton();
    }

    async addNode(attributeRow: string, label: string, key: string, type: string, description: string, unique: boolean, required: boolean): Promise<void> {
        await this.clickElementCanvasAdd();
        await this.clickElementCanvasAddNode();
        await this.addLabelToNode(label);
        await this.addAttribute(attributeRow, key, type, description, unique, required);
        await this.clickCreateNewNodeButton();
        await this.waitForPageIdle();
        await this.page.waitForTimeout(1500); // wait for the element to be created
    }

    async searchElementInCanvasSelectFirst(name: string): Promise<void> {
        await this.fillElementCanvasSearch("Schema", name);
        // Use first() to handle multiple elements with same test ID
        await this.clickFirstElementSuggestionInSearch();
        // await this.page.getByTestId(`elementCanvasSuggestionSchema0`).first().click();
    }

    async deleteSchemaElement(): Promise<void> {
        await this.clickDeleteElementSchema();
        await this.clickConfirmDeleteElementSchema();
        await this.isVisibleToast();
        await this.waitForPageIdle();
        await this.page.waitForTimeout(1500); // wait for the element to be deleted
    }

    async selectTowNodes(): Promise<void> {
        // Wait for canvas to be fully loaded and nodes to be visible
        await this.waitForCanvasAnimationToEnd();
        await this.page.waitForTimeout(2000); // Give extra time for nodes to be rendered
        
        const nodes = await this.getNodesScreenPositions('schema');
        
        // Add debugging information
        console.log(`Found ${nodes.length} nodes in schema canvas`);
        if (nodes.length > 0) {
            console.log('Node details:', nodes.map(n => ({ id: n.id, visible: n.visible, x: n.screenX, y: n.screenY })));
        }
        
        // Ensure we have at least 2 visible nodes
        const visibleNodes = nodes.filter(node => node.visible);
        if (visibleNodes.length < 2) {
            throw new Error(`Expected at least 2 visible nodes, but found ${visibleNodes.length}. Total nodes: ${nodes.length}`);
        }
        
        // Click on the first two visible nodes
        console.log(`Clicking on first node at (${visibleNodes[0].screenX}, ${visibleNodes[0].screenY})`);
        await this.elementClick(visibleNodes[0].screenX, visibleNodes[0].screenY);
        await this.page.waitForTimeout(500);
        
        console.log(`Clicking on second node at (${visibleNodes[1].screenX}, ${visibleNodes[1].screenY})`);
        await this.elementClick(visibleNodes[1].screenX, visibleNodes[1].screenY);
        await this.page.waitForTimeout(500);
    }

    async addEdge(attributeRow: string, label: string, key: string, type: string, description: string, unique: boolean, required: boolean): Promise<void> {
        console.log(`Starting addEdge process with label: ${label}`);
        
        await this.clickElementCanvasAdd();
        await this.clickElementCanvasAddEdge();
        await this.addLabelToNode(label);
        await this.addAttribute(attributeRow, key, type, description, unique, required);
        
        console.log('About to select two nodes for edge creation');
        await this.selectTowNodes();
        
        console.log('Creating the edge element');
        await this.clickCreateNewNodeButton();
        await this.waitForPageIdle();
        await this.page.waitForTimeout(1500); // wait for the edge to be created
        
        // Additional wait for UI to update after edge creation
        await this.page.waitForTimeout(1000);
        console.log('Edge creation process completed');
    }

    async exportSchema(schemaName: string): Promise<void> { // must check if its working
        await this.clickExport();
        await this.fillCreateSchemaInput(schemaName);
        await this.clickExportConfirm();
        await this.isVisibleToast();
    }

    // async swapNodesInAddEdgeDataPanel(node1: string, node2: string): Promise<void> {}

    // async clearNodesInAddEdgeDataPanel(): Promise<void> {}

    async modifyAttributeValueByRow(attributeRow: string, type: string, description: string, unique: boolean, required: boolean): Promise<void> {
        await this.hoverTableRowInDataPanel(attributeRow);
        await this.clickEditAttributeButton();
        await this.selectAttributeType(attributeRow, type); //type
        await this.insertAttributeValue(attributeRow, "3", description); //description
        unique ? await this.clickAttributeButton(attributeRow, "4") : null; //Enable Unique
        required ? await this.clickAttributeButton(attributeRow, "5") : null; //Enable Required
    }

    async removeAttributeByRow(attributeRow: string): Promise<void> {
        await this.hoverTableRowInDataPanel(attributeRow);
        await this.clickRemoveAttributeButton();
        await this.clickConfirmRemoveAttributeButton();
        await this.isVisibleToast();
        await this.waitForPageIdle();
    }

}