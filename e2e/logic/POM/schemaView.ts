import { Locator } from "@playwright/test";
import {
  interactWhenVisible,
  waitForElementToBeEnabled,
} from "@/e2e/infra/utils";
import GraphPage from "./graphPage";

/** A single (source label)-[relationship]->(target label) placement. */
export interface SchemaTriple {
  source: string;
  relationship: string;
  target: string;
}

/** Mirrors SCHEMA_CAPTION_KEY: the reserved entry the view captions nodes from. */
const CAPTION_KEY = "__schemaCaption";

/** Mirrors SCHEMA_RULES_KEY: the reserved entry carrying the property rules. */
const RULES_KEY = "__schemaRules";

/** The property keys of one element, without the entries the view reserves. */
const propertyKeysOf = (data: Record<string, string> | undefined) =>
  Object.fromEntries(
    Object.entries(data ?? {}).filter(
      ([key]) => key !== CAPTION_KEY && key !== RULES_KEY
    )
  );

/** Raw shape of the canvas data the schema view renders. */
interface SchemaCanvasData {
  nodes: {
    id: number;
    data?: Record<string, string>;
    visible?: boolean;
    x?: number;
    y?: number;
  }[];
  links: {
    relationship: string;
    source: number | { id: number };
    target: number | { id: number };
    visible?: boolean;
    data?: Record<string, string>;
  }[];
}

/** Zoom level and world-space center of the schema canvas. */
export interface SchemaViewport {
  zoom: number;
  centerX: number;
  centerY: number;
}

export default class SchemaView extends GraphPage {
  private get schemaTab(): Locator {
    return this.page.getByTestId("schemaTab");
  }

  private get schemaTabPanel(): Locator {
    return this.page.getByRole("tabpanel", { name: "Schema" });
  }

  private get schemaContainer(): Locator {
    return this.page.getByTestId("schemaView");
  }

  // The toolbar, legend and controls are the graph view's own, shown in schema
  // mode — so they sit outside the schema canvas. Only one set of them is ever
  // mounted, which is why they are looked up on the page rather than scoped.

  private get schemaEmptyState(): Locator {
    return this.page.getByTestId("schemaEmptyState");
  }

  private get schemaControls(): Locator {
    return this.page.getByTestId("schemaControls");
  }

  private get schemaZoomIn(): Locator {
    return this.schemaControls.getByTestId("zoomInControl");
  }

  private get schemaZoomOut(): Locator {
    return this.schemaControls.getByTestId("zoomOutControl");
  }

  private get schemaCenter(): Locator {
    return this.schemaControls.getByTestId("centerControl");
  }

  private get schemaSearch(): Locator {
    return this.page.getByTestId("elementCanvasSearchGraph");
  }

  private get schemaDataPanel(): Locator {
    return this.page.getByTestId("DataPanel");
  }

  /** The element counts the schema reports in the tab bar. */
  public async getSchemaCounts(): Promise<{ labels: number; connections: number }> {
    const read = async (testId: string) =>
      Number((await this.page.getByTestId(testId).textContent())?.split(":")[1]?.trim() ?? NaN);

    return {
      labels: await read("schemaLabelsCount"),
      connections: await read("schemaConnectionsCount"),
    };
  }

  /** The query run time, which only the graph reports. */
  public async isRunTimeVisible(): Promise<boolean> {
    return this.page.getByText(/^RT:/).isVisible();
  }

  public async clickSchemaTab(): Promise<void> {
    await interactWhenVisible(
      this.schemaTab,
      (el) => el.click(),
      "schema tab"
    );
  }

  public async clickSchemaZoomIn(): Promise<void> {
    await interactWhenVisible(this.schemaZoomIn, (el) => el.click(), "schema zoom in");
  }

  public async clickSchemaZoomOut(): Promise<void> {
    await interactWhenVisible(this.schemaZoomOut, (el) => el.click(), "schema zoom out");
  }

  public async clickSchemaCenter(): Promise<void> {
    await interactWhenVisible(this.schemaCenter, (el) => el.click(), "schema fit to screen");
  }

  /** Brings back everything hidden, including whatever the legend hid. */
  public async clickSchemaShowAll(): Promise<void> {
    await interactWhenVisible(
      this.page.getByTestId("elementCanvasShowAllGraph"),
      (el) => el.click(),
      "schema show all"
    );
  }

  /** Selects the first element the search matches, which opens the details panel. */
  public async selectSchemaElementBySearch(text: string): Promise<void> {
    await interactWhenVisible(this.schemaSearch, (el) => el.fill(text), "schema search");
    // The suggestions are debounced, so Enter would be a no-op until they land.
    await this.page
      .getByTestId("elementCanvasSuggestionsListGraph")
      .waitFor({ state: "visible" });
    await this.schemaSearch.press("Enter");
    await this.schemaDataPanel.waitFor({ state: "visible" });
  }

  /** The label or relationship type the details panel is describing. */
  public async getSchemaDataPanelName(): Promise<string> {
    return (
      (await this.schemaDataPanel.getByTestId("DataPanelLabel").textContent())?.trim() ?? ""
    );
  }

  public async isSchemaDataPanelVisible(): Promise<boolean> {
    return this.schemaDataPanel.isVisible();
  }

  /** The property keys the details panel lists, mapped to the type it shows for them. */
  public async getSchemaDataPanelKeys(): Promise<Record<string, string>> {
    const prefix = "DataPanelAttributeType";
    const entries = await this.schemaDataPanel
      .locator(`[data-testid^="${prefix}"]`)
      .evaluateAll((cells, testIdPrefix) =>
        cells.map((cell) => [
          (cell.getAttribute("data-testid") ?? "").slice(testIdPrefix.length),
          cell.textContent?.trim() ?? "",
        ]),
        prefix
      );

    return Object.fromEntries(entries);
  }

  /** What the details panel says the graph enforces on one property key. */
  public async getSchemaDataPanelRules(key: string): Promise<string[]> {
    const cell = this.schemaDataPanel.getByTestId(`DataPanelAttributeIndicators${key}`);

    await cell.waitFor({ state: "visible" });

    return cell
      .locator("[role='img']")
      .evaluateAll((icons) => icons.map((icon) => icon.getAttribute("aria-label") ?? ""));
  }

  /** The index types the details panel lists for one property key, if any. */
  public async getSchemaDataPanelIndexTypes(key: string): Promise<string> {
    const cell = this.schemaDataPanel.getByTestId(`DataPanelAttributeIndex${key}`);

    await cell.waitFor({ state: "visible" });

    return (await cell.textContent())?.trim() ?? "";
  }

  public async isSchemaTabEnabled(): Promise<boolean> {
    return waitForElementToBeEnabled(this.schemaTab);
  }

  public async isSchemaTabSelected(): Promise<boolean> {
    await waitForElementToBeEnabled(this.schemaTab);
    return (await this.schemaTabPanel.getAttribute("data-state")) === "active";
  }

  public async isSchemaViewVisible(): Promise<boolean> {
    return this.schemaContainer.isVisible();
  }

  public async getSchemaEmptyStateText(): Promise<string> {
    await this.schemaEmptyState.waitFor({ state: "visible" });
    return (await this.schemaEmptyState.textContent())?.trim() ?? "";
  }

  /**
   * Reads the canvas data the schema view is currently rendering, through the
   * `window.schema` hook the view installs (the canvas itself is a bitmap, so
   * there is nothing in the DOM to assert against).
   */
  private async readSchemaCanvasData(): Promise<SchemaCanvasData> {
    await this.page.waitForFunction(
      () => typeof (window as any).schema === "function",
      undefined,
      { timeout: 20000 }
    );

    return this.page.evaluate(() => (window as any).schema() as SchemaCanvasData);
  }

  /** Label of every node in the schema, sorted. Unlabeled nodes read "Empty". */
  public async getSchemaLabels(): Promise<string[]> {
    const { nodes } = await this.readSchemaCanvasData();
    return nodes.map((node) => node.data?.[CAPTION_KEY] ?? "").sort();
  }

  /** Toggles a label in the legend, which hides or shows it on the canvas. */
  public async toggleSchemaLabel(name: string): Promise<void> {
    await interactWhenVisible(
      this.page.getByTestId(`GraphLabelsButton${name}`),
      (el) => el.click(),
      `schema label ${name}`
    );
  }

  /** Toggles a relationship type in the legend. */
  public async toggleSchemaRelationship(name: string): Promise<void> {
    await interactWhenVisible(
      this.page.getByTestId(`GraphRelationshipsButton${name}`),
      (el) => el.click(),
      `schema relationship ${name}`
    );
  }

  /** Only the labels the canvas is actually drawing, sorted. */
  public async getVisibleSchemaLabels(): Promise<string[]> {
    const { nodes } = await this.readSchemaCanvasData();
    return nodes
      .filter((node) => node.visible !== false)
      .map((node) => node.data?.[CAPTION_KEY] ?? "")
      .sort();
  }

  /** Current position of every node, keyed by label, for stability assertions. */
  public async getSchemaNodePositions(): Promise<Record<string, { x: number; y: number }>> {
    const { nodes } = await this.readSchemaCanvasData();

    return Object.fromEntries(
      nodes.map((node) => [
        node.data?.[CAPTION_KEY] ?? "",
        { x: node.x ?? 0, y: node.y ?? 0 },
      ])
    );
  }

  /** Zoom and center of the schema canvas, read straight off the web component. */
  public async getSchemaViewport(): Promise<SchemaViewport | undefined> {
    return this.page.evaluate(() => {
      const canvas = document.querySelector(
        '[data-testid="schemaView"] falkordb-canvas'
      ) as { getViewport?: () => SchemaViewport | undefined } | null;

      return canvas?.getViewport?.();
    });
  }

  /** Every relationship placement in the schema, sorted and de-duplicated. */
  public async getSchemaTriples(): Promise<SchemaTriple[]> {
    return this.readSchemaTriples();
  }

  /** Only the placements the canvas is actually drawing. */
  public async getVisibleSchemaTripleStrings(): Promise<string[]> {
    const triples = await this.readSchemaTriples(true);
    return triples
      .map(({ source, relationship, target }) => `${source}-[${relationship}]->${target}`)
      .sort();
  }

  private async readSchemaTriples(visibleOnly = false): Promise<SchemaTriple[]> {
    const { nodes, links } = await this.readSchemaCanvasData();
    const labelById = new Map(nodes.map((node) => [node.id, node.data?.[CAPTION_KEY] ?? ""]));
    // force-graph replaces the endpoint ids with node objects once it has run.
    const resolve = (endpoint: number | { id: number }) =>
      labelById.get(typeof endpoint === "object" ? endpoint.id : endpoint) ?? "";

    return links
      .filter((link) => !visibleOnly || link.visible !== false)
      .map((link) => ({
        source: resolve(link.source),
        relationship: link.relationship,
        target: resolve(link.target),
      }))
      .sort((a, b) =>
        `${a.relationship}${a.source}${a.target}`.localeCompare(
          `${b.relationship}${b.source}${b.target}`
        )
      );
  }

  /** Triples as `source-[relationship]->target` strings, sorted, for readable assertions. */
  public async getSchemaTripleStrings(): Promise<string[]> {
    const triples = await this.getSchemaTriples();
    return triples
      .map(({ source, relationship, target }) => `${source}-[${relationship}]->${target}`)
      .sort();
  }

  /**
   * Property keys and their value types per label, as the schema discovered
   * them. The reserved entries are what the view renders from, not properties,
   * so they are dropped.
   */
  public async getSchemaLabelKeys(): Promise<Record<string, Record<string, string>>> {
    const { nodes } = await this.readSchemaCanvasData();

    return Object.fromEntries(
      nodes.map(({ data }) => [data?.[CAPTION_KEY] ?? "", propertyKeysOf(data)])
    );
  }

  /** Property keys and their value types per relationship type. */
  public async getSchemaRelationshipKeys(): Promise<Record<string, Record<string, string>>> {
    const { links } = await this.readSchemaCanvasData();

    return Object.fromEntries(
      links.map(({ relationship, data }) => [relationship, propertyKeysOf(data)])
    );
  }

  /**
   * Waits for the canvas to stop simulating and for the deferred zoom to fit
   * the initial paint schedules to have run, so positions and viewport read
   * afterwards are the ones a refresh has to preserve.
   */
  public async waitForSchemaToSettle(): Promise<void> {
    await this.page.waitForFunction(
      () => {
        const host = document.querySelector(
          '[data-testid="schemaView"] falkordb-canvas'
        );

        return (
          host?.shadowRoot
            ?.querySelector("canvas")
            ?.getAttribute("data-engine-status") === "stopped"
        );
      },
      undefined,
      { timeout: 20000 }
    );

    await this.page.waitForTimeout(500);
  }

  /**
   * Waits until the schema holds `count` placements. The node set comes from the
   * graph info poll and the edges from a separate query, so the view settles a
   * moment after the tab is opened.
   */
  public async waitForSchemaTripleCount(
    count: number,
    timeout = 30000
  ): Promise<void> {
    await this.page.waitForFunction(
      (expected) => (window as any).schema?.()?.links?.length === expected,
      count,
      { timeout }
    );
  }
}
