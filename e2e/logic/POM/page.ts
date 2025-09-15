import BasePage from "@/e2e/infra/ui/basePage";
import { Locator } from "@playwright/test";

type GraphType = "Graph" | "Schema"

type Element = "Node" | "Relation"

type Type = GraphType | "Role" | "Type" | "Model" | "Theme"

export default class Page extends BasePage {
    // CREATE
    public get create(): (type: GraphType) => Locator {
        return (type: GraphType) => this.page.getByTestId(`create${type}`);
    }

    public get insertInput(): (type: GraphType) => Locator {
        return (type: GraphType) => this.page.getByTestId(`create${type}Input`);
    }

    public get createConfirm(): (type: GraphType) => Locator {
        return (type: GraphType) => this.page.getByTestId(`create${type}Confirm`);
    }

    public get createCancel(): (type: GraphType) => Locator {
        return (type: GraphType) => this.page.getByTestId(`create${type}Cancel`);
    }

    // DELETE
    public get delete(): (type: GraphType) => Locator {
        return (type: GraphType) => this.page.getByTestId(`delete${type}`);
    }

    public get deleteConfirm(): (type: GraphType) => Locator {
        return (type: GraphType) => this.page.getByTestId(`delete${type}Confirm`);
    }

    public get deleteCancel(): (type: GraphType) => Locator {
        return (type: GraphType) => this.page.getByTestId(`delete${type}Cancel`);
    }

    // EXPORT
    public get export(): (type: GraphType) => Locator {
        return (type: GraphType) => this.page.getByTestId(`export${type}`);
    }

    public get exportConfirm(): (type: GraphType) => Locator {
        return (type: GraphType) => this.page.getByTestId(`export${type}Confirm`);
    }

    public get exportCancel(): (type: GraphType) => Locator {
        return (type: GraphType) => this.page.getByTestId(`export${type}Cancel`);
    }

    // RELOAD
    public get reloadList(): (type: GraphType) => Locator {
        return (type: GraphType) => this.page.getByTestId(`reload${type}sList`);
    }

    // SELECT
    public get select(): (type: Type) => Locator {
        return (type: Type) => this.page.getByTestId(`select${type}`);
    }

    public get selectItem(): (type: Type, id: string) => Locator {
        return (type: Type, id: string) => this.page.getByTestId(`select${type}${id}`);
    }

    // SEARCH
    public get search(): (type: GraphType) => Locator {
        return (type: GraphType) => this.page.getByTestId(`search${type}`);
    }

    // MANAGE
    public get manage(): (type: GraphType) => Locator {
        return (type: GraphType) => this.page.getByTestId(`manage${type}s`);
    }

    // TABLE
    public get tableCheckbox(): (type: GraphType) => Locator {
        return (type: GraphType) => this.page.getByTestId(`table${type}sCheckbox`);
    }

    public get tableRowByName(): (type: GraphType, name: string) => Locator {
        return (type: GraphType, name: string) => this.page.getByTestId(`tableRow${type}s${name}`);
    }

    public get tableCheckboxByName(): (type: GraphType, name: string) => Locator {
        return (type: GraphType, name: string) => this.page.getByTestId(`tableCheckbox${type}s${name}`);
    }

    public get editButton(): (type: GraphType) => Locator {
        return (type: GraphType) => this.page.getByTestId(`editButton${type}s`);
    }

    public get input(): (type: GraphType) => Locator {
        return (type: GraphType) => this.page.getByTestId(`input${type}s`);
    }

    public get saveButton(): (type: GraphType) => Locator {
        return (type: GraphType) => this.page.getByTestId(`saveButton${type}s`);
    }

    public get cancelButton(): (type: GraphType) => Locator {
        return (type: GraphType) => this.page.getByTestId(`cancel${type}Button`);
    }

    // CANVAS TOOLBAR

    // SEARCH
    public get elementCanvasSearch(): (type: GraphType) => Locator {
        return (type: GraphType) => this.page.getByTestId(`elementCanvasSearch${type}`);
    }

    public get elementCanvasSuggestionList(): (type: GraphType) => Locator {
        return (type: GraphType) => this.page.getByTestId(`elementCanvasSuggestionsList${type}`);
    }

    public get elementCanvasSuggestionByName(): (type: GraphType, name: string) => Locator {
        return (type: GraphType, name: string) => this.page.getByTestId(`elementCanvasSuggestion${type}${name}`);
    }

    // ADD
    public get elementCanvasAdd(): (type: GraphType) => Locator {
        return (type: GraphType) => this.page.getByTestId(`elementCanvasAdd${type}`);
    }

    public get elementCanvasAddNode(): (type: GraphType) => Locator {
        return (type: GraphType) => this.page.getByTestId(`elementCanvasAddNode${type}`);
    }

    public get elementCanvasAddEdge(): (type: GraphType) => Locator {
        return (type: GraphType) => this.page.getByTestId(`elementCanvasAddEdge${type}`);
    }

    // DELETE
    public get deleteElement(): (type: Element | GraphType) => Locator {
        return (type: Element | GraphType) => this.page.getByTestId(`delete${type}`);
    }

    public get deleteElementConfirm(): (type: GraphType) => Locator {
        return (type: GraphType) => this.page.getByTestId(`deleteElementConfirm${type}`);
    }

    public get deleteElementCancel(): (type: GraphType) => Locator {
        return (type: GraphType) => this.page.getByTestId(`deleteElementCancel${type}`);
    }

    // LABELS
    public get labelsButtonByName(): (type: GraphType, label: "Relationships" | "Labels", name: string) => Locator {
        return (type: GraphType, label: "Relationships" | "Labels", name: string) => this.page.getByTestId(`${type}${label}Button${name}`);
    }

    // CANVAS CONTROLS
    public get animationControl(): () => Locator {
        return () => this.page.getByTestId(`animationControl`);
    }

    public get zoomInControl(): () => Locator {
        return () => this.page.getByTestId(`zoomInControl`);
    }

    public get zoomOutControl(): () => Locator {
        return () => this.page.getByTestId(`zoomOutControl`);
    }

    public get centerControl(): () => Locator {
        return () => this.page.getByTestId('centerControl');
    }    

    // COUNT
    public get nodesCount(): () => Locator {
        return () => this.page.getByTestId(`nodesCount`);
    }

    public get nodesCountLoader(): () => Locator {
        return () => this.page.getByTestId(`nodesCountLoader`);
    }

    public get edgesCount(): () => Locator {
        return () => this.page.getByTestId(`edgesCount`);
    }

    public get edgesCountLoader(): () => Locator {
        return () => this.page.getByTestId(`edgesCountLoader`);
    }

    // CANVAS TOOLTIP
    public get nodeCanvasToolTip(): Locator {
        return this.page.locator("//div[contains(@class, 'float-tooltip-kap')]");
    }

    // CANVAS
    public get canvasElement(): Locator {
        return this.page.locator("//div[contains(@class, 'force-graph-container')]//canvas");
    }

    // TOAST
    public get toast(): Locator {
        return this.page.getByTestId(`toast`);
    }

    public get errorToast(): Locator {
        return this.page.getByTestId(`toast-destructive`);
    }

    public get toastUnDoButton(): Locator {
        return this.page.getByTestId('toast').getByRole('button', { name: 'Undo' });
    }
}
