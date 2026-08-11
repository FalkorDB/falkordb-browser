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

/** Raw shape of the canvas data the schema view renders. */
interface SchemaCanvasData {
  nodes: {
    id: number;
    data?: Record<string, string> & { label?: string };
    x?: number;
    y?: number;
  }[];
  links: {
    relationship: string;
    source: number | { id: number };
    target: number | { id: number };
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

  private get schemaRefresh(): Locator {
    return this.page.getByTestId("schemaRefresh");
  }

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
    return this.schemaContainer.getByTestId("elementCanvasSearchGraph");
  }

  private get schemaDataPanel(): Locator {
    return this.page.getByTestId("SchemaDataPanel");
  }

  public async clickSchemaTab(): Promise<void> {
    await interactWhenVisible(
      this.schemaTab,
      (el) => el.click(),
      "schema tab"
    );
  }

  public async clickSchemaRefresh(): Promise<void> {
    await interactWhenVisible(
      this.schemaRefresh,
      (el) => el.click(),
      "schema refresh"
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

  /** Selects the first element the search matches, which opens the details panel. */
  public async selectSchemaElementBySearch(text: string): Promise<void> {
    await interactWhenVisible(this.schemaSearch, (el) => el.fill(text), "schema search");
    // The suggestions are debounced, so Enter would be a no-op until they land.
    await this.schemaContainer
      .getByTestId("elementCanvasSuggestionsListGraph")
      .waitFor({ state: "visible" });
    await this.schemaSearch.press("Enter");
    await this.schemaDataPanel.waitFor({ state: "visible" });
  }

  public async getSchemaDataPanelName(): Promise<string | null> {
    return this.schemaDataPanel.getByTestId("SchemaDataPanelName").textContent();
  }

  /** The property keys the details panel lists, mapped to the type it shows for them. */
  public async getSchemaDataPanelKeys(): Promise<Record<string, string>> {
    const rows = await this.schemaDataPanel.locator("tbody tr").all();
    const entries = await Promise.all(
      rows.map(async (row) => {
        const cells = await row.locator("td").allTextContents();
        return [cells[0], cells[1]] as const;
      })
    );

    return Object.fromEntries(entries);
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
    return nodes.map((node) => node.data?.label ?? "").sort();
  }

  /** Current position of every node, keyed by label, for stability assertions. */
  public async getSchemaNodePositions(): Promise<Record<string, { x: number; y: number }>> {
    const { nodes } = await this.readSchemaCanvasData();

    return Object.fromEntries(
      nodes.map((node) => [
        node.data?.label ?? "",
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
    const { nodes, links } = await this.readSchemaCanvasData();
    const labelById = new Map(nodes.map((node) => [node.id, node.data?.label ?? ""]));
    // force-graph replaces the endpoint ids with node objects once it has run.
    const resolve = (endpoint: number | { id: number }) =>
      labelById.get(typeof endpoint === "object" ? endpoint.id : endpoint) ?? "";

    return links
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
   * them. `label` is the caption the view adds, not a property, so it is
   * dropped.
   */
  public async getSchemaLabelKeys(): Promise<Record<string, Record<string, string>>> {
    const { nodes } = await this.readSchemaCanvasData();

    return Object.fromEntries(
      nodes.map(({ data }) => {
        const { label, ...keys } = data ?? {};
        return [label ?? "", keys];
      })
    );
  }

  /** Property keys and their value types per relationship type. */
  public async getSchemaRelationshipKeys(): Promise<Record<string, Record<string, string>>> {
    const { links } = await this.readSchemaCanvasData();

    return Object.fromEntries(
      links.map(({ relationship, data }) => [relationship, data ?? {}])
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
