import { interactWhenVisible, waitForElementToBeVisible } from "@/e2e/infra/utils";
import Page from "./page";

export default class SchemaPage extends Page {

    async clickCreate(): Promise<void> {
        await interactWhenVisible(this.create("Schema"), (el) => el.click(), "Click Create");
    }

    // async clickCreateInput(): Promise<void> {
    //     await interactWhenVisible(this.createInput("Schema"), (el) => el.click(), "Click Create Input");
    // }

    async clickCreateConfirm(): Promise<void> {
        await interactWhenVisible(this.createConfirm("Schema"), (el) => el.click(), "Click Create Confirm");
    }

    async clickCreateCancel(): Promise<void> {
        await interactWhenVisible(this.createCancel("Schema"), (el) => el.click(), "Click Create Cancel");
    }

    async clickDelete(): Promise<void> {
        await interactWhenVisible(this.delete("Schema"), (el) => el.click(), "Click Delete");
    }

    async clickDeleteConfirm(): Promise<void> {
        await interactWhenVisible(this.deleteConfirm("Schema"), (el) => el.click(), "Click Delete Confirm");
    }

    async clickDeleteCancel(): Promise<void> {
        await interactWhenVisible(this.deleteCancel("Schema"), (el) => el.click(), "Click Delete Cancel");
    }

    async clickExport(): Promise<void> {
        await interactWhenVisible(this.export("Schema"), (el) => el.click(), "Click Export");
    }

    async clickExportConfirm(): Promise<void> {
        await interactWhenVisible(this.exportConfirm("Schema"), (el) => el.click(), "Click Export Confirm");
    }

    async clickExportCancel(): Promise<void> {
        await interactWhenVisible(this.exportCancel("Schema"), (el) => el.click(), "Click Export Cancel");
    }

    async clickReloadList(): Promise<void> {
        await interactWhenVisible(this.reloadList("Schema"), (el) => el.click(), "Click Reload List");
    }

    async clickSelect(): Promise<void> {
        await interactWhenVisible(this.select("Schema"), (el) => el.click(), "Click Select");
    }

    async clickSelectItem(name: string): Promise<void> {
        await interactWhenVisible(this.selectItemBySearch("Schema", name), (el) => el.click(), "Click Select Item");
    }

    async clickSearch(): Promise<void> {
        await interactWhenVisible(this.search("Schema"), (el) => el.click(), "Click Search");
    }

    async clickManage(): Promise<void> {
        await interactWhenVisible(this.manage("Schema"), (el) => el.click(), "Click Manage");
    }

    async clickTableCheckbox(): Promise<void> {
        await interactWhenVisible(this.tableCheckbox("Schema"), (el) => el.click(), "Click Table Checkbox");
    }

    async clickTableCheckboxByName(name: string): Promise<void> {
        await interactWhenVisible(this.tableCheckboxByName("Schema", name), (el) => el.click(), "Click Table Checkbox By Name");
    }

    async clickEditButton(): Promise<void> {
        await interactWhenVisible(this.editButton("Schema"), (el) => el.click(), "Click Edit Button");
    }

    async clickInput(): Promise<void> {
        await interactWhenVisible(this.input("Schema"), (el) => el.click(), "Click Input");
    }

    async clickSaveButton(): Promise<void> {
        await interactWhenVisible(this.saveButton("Schema"), (el) => el.click(), "Click Save Button");
    }

    async clickCancelButton(): Promise<void> {
        await interactWhenVisible(this.cancelButton("Schema"), (el) => el.click(), "Click Cancel Button");
    }

    async clickCanvasElement(x: number, y: number): Promise<void> {
        await interactWhenVisible(this.canvasElement, (el) => el.click({ position: { x, y }, button: "right" }), "Canvas Element");
    }

    async hoverCanvasElement(x: number, y: number): Promise<void> {
        await interactWhenVisible(this.canvasElement, (el) => el.hover({ position: { x, y } }), "Canvas Element");
    }

    async clickElementCanvasAdd(): Promise<void> {
        await interactWhenVisible(this.elementCanvasAdd("Schema"), (el) => el.click(), "Add Element");
    }

    async clickElementCanvasAddNode(): Promise<void> {
        await interactWhenVisible(this.elementCanvasAddNode("Schema"), (el) => el.click(), "Add Node");
    }

    async clickElementCanvasAddEdge(): Promise<void> {
        await interactWhenVisible(this.elementCanvasAddEdge("Schema"), (el) => el.click(), "Add Edge");
    }

    async clickDeleteElement(): Promise<void> {
        await interactWhenVisible(this.deleteElement("Schema"), (el) => el.click(), "Delete Element");
    }

    async clickDeleteElementConfirm(): Promise<void> {
        await interactWhenVisible(this.deleteElementConfirm("Schema"), (el) => el.click(), "Confirm Delete Element");
    }

    async clickDeleteElementCancel(): Promise<void> {
        await interactWhenVisible(this.deleteElementCancel("Schema"), (el) => el.click(), "Cancel Delete Element");
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

    async fillElementCanvasSearch(text: string): Promise<void> {
        await interactWhenVisible(this.elementCanvasSearch("Schema"), (el) => el.fill(text), "Element Canvas Search");
    }

    async clickElementCanvasSuggestionByName(name: string): Promise<void> {
        await interactWhenVisible(this.elementCanvasSuggestionByName("Schema", name), (el) => el.click(), `Element Canvas Suggestion ${name}`);
    }

    async clickLabelsButtonByLabel(label: "RelationshipTypes" | "Labels", name: string): Promise<void> {
        await interactWhenVisible(this.labelsButtonByName("Schema", label, name), (el) => el.click(), `Labels Panel Button ${label} ${name}`);
    }

    async getNodesCount(): Promise<string> {
        const count = await interactWhenVisible(this.nodesCount(), (el) => el.textContent(), "Nodes Count");
        return count?.split(" ")[1] ?? "0";
    }

    async getEdgesCount(): Promise<string> {
        const count = await interactWhenVisible(this.edgesCount(), (el) => el.textContent(), "Edges Count");
        return count?.split(" ")[1] ?? "0";
    }

    async isVisibleLabelsButtonByName(label: "RelationshipTypes" | "Labels", name: string): Promise<boolean> {
        const isVisible = await waitForElementToBeVisible(this.labelsButtonByName("Schema", label, name));
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
}