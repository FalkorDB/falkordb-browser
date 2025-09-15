/* eslint-disable no-await-in-loop */
import {
  interactWhenVisible,
  waitForElementToNotBeVisible,
  pollForElementContent,
  waitForElementToBeVisible,
} from "@/e2e/infra/utils";
import { Locator } from "playwright";
import Page, { ElementLabel, Type } from "./page";

export default class SchemaPage extends Page {
  // TABLE
  private get dataPanelTable(): Locator {
    return this.page.getByTestId("attributesTableBody");
  }

  private tableRowInDataPanel(type: string): Locator {
    return this.dataPanelTable.locator(`tr:nth-of-type(${type})`);
  }

  // ADD ATTRIBUTES
  private insertAttribute(attributeRow: string, typeInput: string): Locator {
    return this.dataPanelTable
      .locator(`tr:nth-of-type(${attributeRow})`)
      .locator(`td:nth-of-type(${typeInput})`)
      .locator("input");
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
    return this.page
      .getByTestId(`elementCanvasSuggestionsListSchema`)
      .locator("button");
  }

  async clickRemoveAttributeButton(): Promise<void> {
    await interactWhenVisible(
      this.removeAttributeButton(),
      (el) => el.click(),
      "Click Remove Attribute Button"
    );
  }

  async clickEditAttributeButton(): Promise<void> {
    await interactWhenVisible(
      this.editAttributeButton(),
      (el) => el.click(),
      "Click Edit Attribute Button"
    );
  }

  async clickLabelsButtonByLabel(
    label: ElementLabel,
    name: string
  ): Promise<void> {
    await interactWhenVisible(
      this.labelsButtonByName("Schema", label, name),
      (el) => el.click(),
      `Labels Panel Button Schema ${label} ${name}`
    );
  }

  private clickAttribute(attributeRow: string, typeInput: string): Locator {
    return this.dataPanelTable
      .locator(`tr:nth-of-type(${attributeRow})`)
      .locator(`td:nth-of-type(${typeInput})`)
      .locator("button");
  }

  async clickElementCanvasAdd(): Promise<void> {
    await interactWhenVisible(
      this.elementCanvasAdd("Schema"),
      (el) => el.click(),
      "Add schema Element"
    );
  }

  async clickElementCanvasAddNode(): Promise<void> {
    await interactWhenVisible(
      this.elementCanvasAddNode("Schema"),
      (el) => el.click(),
      "Add Node"
    );
  }

  async clickElementCanvasAddEdge(): Promise<void> {
    await interactWhenVisible(
      this.elementCanvasAddEdge("Schema"),
      (el) => el.click(),
      "Add Edge"
    );
  }

  async clickAddNewLabelButton(): Promise<void> {
    await interactWhenVisible(
      this.addNewLabelButton(),
      (el) => el.click(),
      "Click Add New Label Button"
    );
  }

  async insertAddNewLabelInput(labelInput: string): Promise<void> {
    await interactWhenVisible(
      this.addNewLabelInput(),
      (el) => el.fill(labelInput),
      "Insert Add New Label Input"
    );
  }

  async clickSaveNewLabelButton(): Promise<void> {
    await interactWhenVisible(
      this.saveNewLabelButton(),
      (el) => el.click(),
      "Click Save New Label Button"
    );
  }

  async clickDeleteElementSchema(): Promise<void> {
    await interactWhenVisible(
      this.deleteElementSchema(),
      (el) => el.click(),
      "Click Delete Element Schema"
    );
  }

  async clickConfirmDeleteElementSchema(): Promise<void> {
    await interactWhenVisible(
      this.confirmDeleteElementSchema(),
      (el) => el.click(),
      "Click Confirm Delete Element Schema"
    );
  }

  async clickAddValueButton(): Promise<void> {
    await interactWhenVisible(
      this.addValueButton(),
      (el) => el.click(),
      "Click Add Value Button"
    );
  }

  async clickSaveAddValueButton(): Promise<void> {
    await interactWhenVisible(
      this.saveAddValueButton(),
      (el) => el.click(),
      "Click Save Add Value Button"
    );
  }

  async clickManage(): Promise<void> {
    await interactWhenVisible(
      this.manage("Schema"),
      (el) => el.click(),
      "Manage Schemas Button"
    );
  }

  async clickTableCheckboxByName(name: string): Promise<void> {
    await interactWhenVisible(
      this.tableCheckboxByName("Schema", name),
      (el) => el.click(),
      `Table Schemas Checkbox ${name}`
    );
  }

  async hoverTableRowByName(name: string): Promise<void> {
    await interactWhenVisible(
      this.tableRowByName("Schema", name),
      (el) => el.hover(),
      `Table Schemas Row ${name}`
    );
  }

  async hoverTableRowInDataPanel(type: string): Promise<void> {
    await interactWhenVisible(
      this.tableRowInDataPanel(type),
      (el) => el.hover(),
      `Table Row in Data Panel ${type}`
    );
  }

  async insertAttributeValue(
    attributeRow: string,
    typeInput: string,
    value: string
  ): Promise<void> {
    await interactWhenVisible(
      this.insertAttribute(attributeRow, typeInput),
      (el) => el.fill(value),
      "Insert Attribute Value"
    );
  }

  async clickAttributeButton(
    attributeRow: string,
    typeInput: string
  ): Promise<void> {
    await interactWhenVisible(
      this.clickAttribute(attributeRow, typeInput),
      (el) => el.click(),
      "Click Attribute Button"
    );
  }

  async clickCreateSchema(): Promise<void> {
    await interactWhenVisible(
      this.create("Schema"),
      (el) => el.click(),
      "Click Create"
    );
  }

  async fillCreateSchemaInput(text: string): Promise<void> {
    await interactWhenVisible(
      this.insertInput("Schema"),
      (el) => el.fill(text),
      "Create Schema Input"
    );
  }

  async clickConfirmCreateSchema(): Promise<void> {
    await interactWhenVisible(
      this.createConfirm("Schema"),
      (el) => el.click(),
      "Click Create Confirm"
    );
  }

  async clickAddAttributeButton(): Promise<void> {
    await interactWhenVisible(
      this.addAttributeButton(),
      (el) => el.click(),
      "Click Add Attribute Button"
    );
  }

  async clickCreateNewNodeButton(): Promise<void> {
    await interactWhenVisible(
      this.createNewNodeButton(),
      (el) => el.click(),
      "Click Create New Node Button"
    );
  }

  async clickEditButton(): Promise<void> {
    await interactWhenVisible(
      this.editButton("Schema"),
      (el) => el.click(),
      "Edit Button Schemas"
    );
  }

  async clickSelect(type: Type = "Schema"): Promise<void> {
    await interactWhenVisible(
      this.select(type),
      (el) => el.click(),
      `Select ${type}`
    );
  }

  async clickSelectItem(id: string, type: Type = "Schema"): Promise<void> {
    await interactWhenVisible(
      this.selectItem(type, id),
      (el) => el.click(),
      `Select ${type} Item ${id}`
    );
  }

  async clickSearch(type: Type = "Schema"): Promise<void> {
    await interactWhenVisible(this.search(type), (el) => el.click(), "Schema");
  }

  async clickDelete(): Promise<void> {
    await interactWhenVisible(
      this.delete("Schema"),
      (el) => el.click(),
      "Delete Schema"
    );
  }

  async clickDeleteConfirm(): Promise<void> {
    await interactWhenVisible(
      this.deleteConfirm("Schema"),
      (el) => el.click(),
      "Confirm Delete Schema"
    );
  }

  async clickDeleteCancel(): Promise<void> {
    await interactWhenVisible(
      this.deleteCancel("Schema"),
      (el) => el.click(),
      "Cancel Delete Schema"
    );
  }

  async clickExport(): Promise<void> {
    await interactWhenVisible(
      this.export("Schema"),
      (el) => el.click(),
      "Export Schema"
    );
  }

  async clickExportConfirm(): Promise<void> {
    await interactWhenVisible(
      this.exportConfirm("Schema"),
      (el) => el.click(),
      "Confirm Export Schema"
    );
  }

  async clickConfirmRemoveAttributeButton(): Promise<void> {
    await interactWhenVisible(
      this.confirmRemoveAttributeButton(),
      (el) => el.click(),
      "Click Confirm Remove Attribute Button"
    );
  }

  async clickFirstElementSuggestionInSearch(): Promise<void> {
    await interactWhenVisible(
      this.elementCanvasSuggestionsListSchemaFirstSuggestion(),
      (el) => el.click(),
      `Click First Element Suggestion in Search`
    );
  }

  async clickSaveButton(): Promise<void> {
    await interactWhenVisible(
      this.saveButton("Schema"),
      (el) => el.click(),
      `Save Button Schemas`
    );
  }

  async fillInput(text: string): Promise<void> {
    await interactWhenVisible(
      this.input("Schema"),
      (el) => el.fill(text),
      `Input Schemas`
    );
  }

  async fillSearch(text: string, type: Type = "Schema"): Promise<void> {
    await interactWhenVisible(
      this.search(type),
      (el) => el.fill(text),
      "Search Schema"
    );
  }

  async fillElementCanvasSearch(text: string): Promise<void> {
    await interactWhenVisible(
      this.elementCanvasSearch("Schema"),
      (el) => el.fill(text),
      `Element Canvas Search Schema`
    );
  }

  async isVisibleSelectItem(name: string): Promise<boolean> {
    return waitForElementToBeVisible(this.selectItem("Schema", name));
  }

  async isVisibleLabelsButtonByName(
    label: ElementLabel,
    name: string
  ): Promise<boolean> {
    return waitForElementToBeVisible(
      this.labelsButtonByName("Schema", label, name)
    );
  }

  async getLabelsButtonByNameContent(
    label: ElementLabel,
    name: string
  ): Promise<string | null> {
    const content = await interactWhenVisible(
      this.labelsButtonByName("Schema", label, name),
      (el) => el.textContent(),
      `Schema label ${name}`
    );
    return content;
  }

  async getContentDataPanelAttributesCount(): Promise<number> {
    const content = await pollForElementContent(
      this.dataPanelAttributesCount,
      "Data Panel Attributes Count"
    );
    return parseInt(content ?? "0", 10);
  }

  async getDataPanelNodeSelection(nodeId: string): Promise<string | null> {
    return interactWhenVisible(
      this.dataPanelNodeSelection(nodeId),
      (el) => el.textContent(),
      "Data Panel Node Selection Count"
    );
  }

  async modifySchemaName(oldName: string, newName: string): Promise<void> {
    await this.clickSelect();
    await this.clickManage();
    await this.hoverTableRowByName(oldName);
    await this.clickEditButton();
    await this.fillInput(newName);
    await this.clickSaveButton();
    await this.waitForPageIdle();
    // await waitForElementToNotBeVisible(this.saveButton("Schema"));
  }

  async verifySchemaExists(schemaName: string): Promise<boolean> {
    await this.clickSelect();
    await this.fillSearch(schemaName);
    const isVisible = await this.isVisibleSelectItem(schemaName);
    return isVisible;
  }

  async selectSchemaByName(schemaName: string): Promise<void> {
    await this.clickSelect();
    await this.fillSearch(schemaName);
    await this.page.waitForTimeout(1000); // wait for the search results to load
    await this.clickSelectItem(schemaName); // selecting the first item in list after search
    await this.waitForCanvasAnimationToEnd();
  }

  async addSchema(schemaName: string): Promise<void> {
    await this.clickCreateSchema();
    await this.fillCreateSchemaInput(schemaName);
    await this.clickConfirmCreateSchema();
    await waitForElementToBeVisible(this.createConfirm("Schema"));
  }

  async deleteSchema(schemaName: string): Promise<void> {
    await this.clickSelect();
    await this.clickManage();
    await this.clickTableCheckboxByName(schemaName);
    await this.clickDelete();
    await this.clickDeleteConfirm();
    await waitForElementToBeVisible(this.deleteConfirm("Schema"));
  }

  async addLabelToNode(label: string): Promise<void> {
    await this.clickAddNewLabelButton();
    await this.insertAddNewLabelInput(label);
    await this.clickSaveNewLabelButton();
  }

  async selectAttributeType(attributeRow: string, type: string): Promise<void> {
    await this.clickAttributeButton(attributeRow, "2"); // click type button
    await this.fillSearch(type, "Type"); // search for type
    await this.clickSelectItem(type, "Type"); // select type from list
  }

  async addAttribute(
    attributeRow: string,
    key: string,
    type: string,
    description: string,
    unique: boolean,
    required: boolean
  ): Promise<void> {
    await this.insertAttributeValue(attributeRow, "1", key); // key
    await this.selectAttributeType(attributeRow, type); // type
    await this.insertAttributeValue(attributeRow, "3", description); // description
    if (unique) await this.clickAttributeButton(attributeRow, "4"); // enable unique
    if (required) await this.clickAttributeButton(attributeRow, "5"); // enable required
    await this.clickAddAttributeButton();
  }

  async addValueToExistingElementDataPanel(
    attributeRow: string,
    key: string,
    type: string,
    description: string,
    unique: boolean,
    required: boolean
  ): Promise<void> {
    await this.insertAttributeValue(attributeRow, "1", key); // key
    await this.selectAttributeType(attributeRow, type); // type
    await this.insertAttributeValue(attributeRow, "3", description); // description
    if (unique) await this.clickAttributeButton(attributeRow, "4"); // enable unique
    if (required) await this.clickAttributeButton(attributeRow, "5"); // enable required
    await this.clickSaveAddValueButton();
    await waitForElementToBeVisible(this.saveAddValueButton());
  }

  async addNode(
    attributeRow: string,
    label: string,
    key: string,
    type: string,
    description: string,
    unique: boolean,
    required: boolean
  ): Promise<void> {
    await this.clickElementCanvasAdd();
    await this.clickElementCanvasAddNode();
    await this.addLabelToNode(label);
    await this.addAttribute(
      attributeRow,
      key,
      type,
      description,
      unique,
      required
    );
    await this.clickCreateNewNodeButton();
    await this.waitForScaleToStabilize();
  }

  async searchElementInCanvasSelectFirst(name: string): Promise<void> {
    await this.fillElementCanvasSearch(name);
    await this.clickFirstElementSuggestionInSearch();
  }

  async deleteSchemaElement(): Promise<void> {
    await this.clickDeleteElementSchema();
    await this.clickConfirmDeleteElementSchema();
    await waitForElementToNotBeVisible(this.deleteConfirm("Schema"));
    await this.waitForCanvasAnimationToEnd();
  }

  async selectTwoNodesByValidSelection(): Promise<void> {
    const nodes = await this.getNodesScreenPositions("schema");

    if (nodes.length < 2) {
      throw new Error("Need at least 2 nodes to create an edge");
    }

    for (let i = 0; i < nodes.length - 1; i += 1) {
      const first = nodes[i];
      await this.elementClick(first.screenX, first.screenY);
      await this.page.waitForTimeout(500);

      for (let j = i + 1; j < nodes.length; j += 1) {
        const second = nodes[j];
        await this.elementClick(second.screenX, second.screenY);
        await this.page.waitForTimeout(500);

        try {
          const selectedNode1Locator = this.dataPanelNodeSelection("1");
          const selectedNode2Locator = this.dataPanelNodeSelection("2");

          const isNode1Visible = await selectedNode1Locator.isVisible();
          const isNode2Visible = await selectedNode2Locator.isVisible();

          if (isNode1Visible && isNode2Visible) {
            const node1Text = await this.getDataPanelNodeSelection("1");
            const node2Text = await this.getDataPanelNodeSelection("2");

            if (
              node1Text &&
              node1Text.trim() !== "" &&
              node2Text &&
              node2Text.trim() !== ""
            ) {
              return;
            }
          }
        } catch (error) {
          console.log(`Selection attempt failed: ${error}`);
        }
      }
    }

    throw new Error("Failed to select two valid nodes.");
  }

  async addEdge(
    attributeRow: string,
    label: string,
    key: string,
    type: string,
    description: string,
    unique: boolean,
    required: boolean
  ): Promise<void> {
    await this.clickElementCanvasAdd();
    await this.clickElementCanvasAddEdge();
    await this.addLabelToNode(label);
    await this.addAttribute(
      attributeRow,
      key,
      type,
      description,
      unique,
      required
    );
    await this.selectTwoNodesByValidSelection();
    await this.clickCreateNewNodeButton();
    await waitForElementToNotBeVisible(this.createNewNodeButton());
    await this.waitForCanvasAnimationToEnd();
  }

  async exportSchema(schemaName: string): Promise<void> {
    // must check if its working
    await this.clickExport();
    await this.fillCreateSchemaInput(schemaName);
    await this.clickExportConfirm();
    await waitForElementToNotBeVisible(this.exportConfirm("Schema"));
  }

  // async swapNodesInAddEdgeDataPanel(node1: string, node2: string): Promise<void> {}

  // async clearNodesInAddEdgeDataPanel(): Promise<void> {}

  async modifyAttributeValueByRow(
    attributeRow: string,
    type: string,
    description: string,
    unique: boolean,
    required: boolean
  ): Promise<void> {
    await this.hoverTableRowInDataPanel(attributeRow);
    await this.clickEditAttributeButton();
    await this.selectAttributeType(attributeRow, type); // type
    await this.insertAttributeValue(attributeRow, "3", description); // description
    if (unique) await this.clickAttributeButton(attributeRow, "4"); // enable unique
    if (required) await this.clickAttributeButton(attributeRow, "5"); // enable required
  }

  async removeAttributeByRow(attributeRow: string): Promise<void> {
    await this.hoverTableRowInDataPanel(attributeRow);
    await this.clickRemoveAttributeButton();
    await this.clickConfirmRemoveAttributeButton();
    await waitForElementToNotBeVisible(this.confirmRemoveAttributeButton());
    await this.waitForScaleToStabilize();
  }
}
