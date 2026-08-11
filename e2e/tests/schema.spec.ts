import test, { expect } from "playwright/test";
import BrowserWrapper from "../infra/ui/browserWrapper";
import SchemaView from "../logic/POM/schemaView";
import urls from "../config/urls.json";
import APICalls from "../logic/api/apiCalls";
import { getRandomString } from "../infra/utils";
import { TABS_STORAGE_KEY } from "@/lib/graphTabs";

/**
 * A deliberately messy fixture: FalkorDB enforces no schema, so the same
 * relationship type is placed between several different label pairs, one node
 * carries two labels and one carries none at all, and two nodes sharing a label
 * disagree on both which properties they have and what type they hold.
 */
const MESSY_GRAPH_QUERY = `
CREATE (p1:Person {name: 'p1', age: 30}),
       (p2:Person {name: 'p2', age: 'thirty', nickname: 'deuce'}),
       (c1:Company {name: 'c1'}),
       (ct1:City {name: 'ct1'}),
       (e1:Person:Employee {name: 'e1'}),
       (u1 {name: 'u1'})
CREATE (p1)-[:KNOWS {since: 2020}]->(p2),
       (p1)-[:KNOWS]->(u1),
       (p1)-[:LOCATED_IN]->(ct1),
       (c1)-[:LOCATED_IN]->(ct1),
       (e1)-[:WORKS_AT]->(c1),
       (c1)-[:OWNS]->(c1)
`;

/** Every placement MESSY_GRAPH_QUERY produces, as the schema view renders them. */
const EXPECTED_TRIPLES = [
    "Company-[LOCATED_IN]->City",
    "Company-[OWNS]->Company",
    // e1 is :Person:Employee, so its single edge shows up under both labels.
    "Employee-[WORKS_AT]->Company",
    "Person-[KNOWS]->Empty",
    "Person-[KNOWS]->Person",
    "Person-[LOCATED_IN]->City",
    "Person-[WORKS_AT]->Company",
].sort();

/** Labels of every node the schema view draws for that fixture. */
const EXPECTED_LABELS = ["City", "Company", "Employee", "Empty", "Person"];

test.describe("Schema View Tests", () => {
    let browser: BrowserWrapper;
    let apiCalls: APICalls;
    let GRAPH_NAME: string;
    let extraGraphName: string | undefined;

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
        apiCalls = new APICalls();
        GRAPH_NAME = getRandomString("schema");
        extraGraphName = undefined;
        await apiCalls.addGraph(GRAPH_NAME);
    });

    test.afterEach(async () => {
        // Close the page first: the graph page polls for graph info while a graph
        // is selected, and that poll re-creates a graph deleted out from under it.
        await browser.closeBrowser();
        await apiCalls.removeGraph(GRAPH_NAME);
        if (extraGraphName) await apiCalls.removeGraph(extraGraphName);
    });

    test("@admin check schema view tab is disabled when no graph is selected", async () => {
        // Two things can hand the page a graph without anyone asking: a tab strip
        // persisted into the stored auth state by the setup project, and the
        // picker auto-selecting when the instance holds exactly one graph. Clear
        // the strip and add a second graph so "nothing selected" is deterministic.
        extraGraphName = getRandomString("schema");
        await apiCalls.addGraph(extraGraphName);
        const schemaView = await browser.createNewPage(SchemaView);
        const page = await browser.getPage();
        // The strip is stored under a connection-scoped key, so match on the suffix.
        await page.addInitScript((key: string) => {
            Object.keys(window.localStorage)
                .filter((k) => k.endsWith(key))
                .forEach((k) => window.localStorage.removeItem(k));
        }, TABS_STORAGE_KEY);
        await page.goto(urls.graphUrl);
        expect(await schemaView.isSchemaTabEnabled()).toBe(false);
    });

    test("@admin check schema view tab is enabled once a graph is selected without running a query", async () => {
        const schemaView = await browser.createNewPage(SchemaView, urls.graphUrl);
        await schemaView.selectGraphByName(GRAPH_NAME);
        expect(await schemaView.isSchemaTabEnabled()).toBe(true);
        await schemaView.clickSchemaTab();
        expect(await schemaView.isSchemaTabSelected()).toBe(true);
        expect(await schemaView.isSchemaViewVisible()).toBe(true);
    });

    test("@admin check schema view shows an empty state for a graph with no labels", async () => {
        const schemaView = await browser.createNewPage(SchemaView, urls.graphUrl);
        await schemaView.selectGraphByName(GRAPH_NAME);
        await schemaView.clickSchemaTab();
        expect(await schemaView.getSchemaEmptyStateText()).toBe("This graph has no labels yet");
    });

    test("@admin check schema view shows one node per label", async () => {
        await apiCalls.runQuery(GRAPH_NAME, MESSY_GRAPH_QUERY);
        const schemaView = await browser.createNewPage(SchemaView, urls.graphUrl);
        await schemaView.selectGraphByName(GRAPH_NAME);
        await schemaView.clickSchemaTab();
        await schemaView.waitForSchemaTripleCount(EXPECTED_TRIPLES.length);
        expect(await schemaView.getSchemaLabels()).toEqual(EXPECTED_LABELS);
    });

    test("@admin check schema view shows every relationship placement exactly once", async () => {
        await apiCalls.runQuery(GRAPH_NAME, MESSY_GRAPH_QUERY);
        const schemaView = await browser.createNewPage(SchemaView, urls.graphUrl);
        await schemaView.selectGraphByName(GRAPH_NAME);
        await schemaView.clickSchemaTab();
        await schemaView.waitForSchemaTripleCount(EXPECTED_TRIPLES.length);
        expect(await schemaView.getSchemaTripleStrings()).toEqual(EXPECTED_TRIPLES);
    });

    test("@admin check schema view places one relationship type between several label pairs", async () => {
        await apiCalls.runQuery(GRAPH_NAME, MESSY_GRAPH_QUERY);
        const schemaView = await browser.createNewPage(SchemaView, urls.graphUrl);
        await schemaView.selectGraphByName(GRAPH_NAME);
        await schemaView.clickSchemaTab();
        await schemaView.waitForSchemaTripleCount(EXPECTED_TRIPLES.length);
        const triples = await schemaView.getSchemaTriples();
        const locatedIn = triples.filter((t) => t.relationship === "LOCATED_IN");
        expect(locatedIn).toEqual([
            { source: "Company", relationship: "LOCATED_IN", target: "City" },
            { source: "Person", relationship: "LOCATED_IN", target: "City" },
        ]);
    });

    test("@admin check schema view draws a self referencing relationship", async () => {
        await apiCalls.runQuery(GRAPH_NAME, MESSY_GRAPH_QUERY);
        const schemaView = await browser.createNewPage(SchemaView, urls.graphUrl);
        await schemaView.selectGraphByName(GRAPH_NAME);
        await schemaView.clickSchemaTab();
        await schemaView.waitForSchemaTripleCount(EXPECTED_TRIPLES.length);
        const triples = await schemaView.getSchemaTriples();
        expect(triples).toContainEqual({ source: "Company", relationship: "OWNS", target: "Company" });
    });

    test("@admin check schema view refresh picks up a newly added placement", async () => {
        await apiCalls.runQuery(GRAPH_NAME, MESSY_GRAPH_QUERY);
        const schemaView = await browser.createNewPage(SchemaView, urls.graphUrl);
        await schemaView.selectGraphByName(GRAPH_NAME);
        await schemaView.clickSchemaTab();
        await schemaView.waitForSchemaTripleCount(EXPECTED_TRIPLES.length);

        await apiCalls.runQuery(
            GRAPH_NAME,
            "MATCH (c:Company {name: 'c1'}), (p:Person {name: 'p1'}) CREATE (c)-[:KNOWS]->(p)"
        );

        await schemaView.clickSchemaRefresh();
        await schemaView.waitForSchemaTripleCount(EXPECTED_TRIPLES.length + 1);
        expect(await schemaView.getSchemaTripleStrings()).toContain("Company-[KNOWS]->Person");
    });

    test("@admin check schema view refresh keeps node positions and the viewport", async () => {
        await apiCalls.runQuery(GRAPH_NAME, MESSY_GRAPH_QUERY);
        const schemaView = await browser.createNewPage(SchemaView, urls.graphUrl);
        await schemaView.selectGraphByName(GRAPH_NAME);
        await schemaView.clickSchemaTab();
        await schemaView.waitForSchemaTripleCount(EXPECTED_TRIPLES.length);
        await schemaView.waitForSchemaToSettle();

        const positionsBefore = await schemaView.getSchemaNodePositions();
        const viewportBefore = await schemaView.getSchemaViewport();

        // A new placement between labels that are already on screen: the refresh
        // has real work to do, so the assertion can't pass by simply reading the
        // pre-refresh canvas.
        await apiCalls.runQuery(
            GRAPH_NAME,
            "MATCH (c:Company {name: 'c1'}), (p:Person {name: 'p1'}) CREATE (c)-[:KNOWS]->(p)"
        );

        await schemaView.clickSchemaRefresh();
        await schemaView.waitForSchemaTripleCount(EXPECTED_TRIPLES.length + 1);

        const positionsAfter = await schemaView.getSchemaNodePositions();
        expect(Object.keys(positionsAfter).sort()).toEqual(EXPECTED_LABELS);
        EXPECTED_LABELS.forEach((label) => {
            expect(positionsAfter[label].x).toBeCloseTo(positionsBefore[label].x, 1);
            expect(positionsAfter[label].y).toBeCloseTo(positionsBefore[label].y, 1);
        });

        const viewportAfter = await schemaView.getSchemaViewport();
        // The camera round-trips through a device-pixel transform, so it comes
        // back within a fraction of a world unit rather than bit-identical. A
        // re-fit would move it by orders of magnitude more.
        expect(viewportAfter?.zoom).toBeCloseTo(viewportBefore!.zoom, 1);
        expect(viewportAfter?.centerX).toBeCloseTo(viewportBefore!.centerX, 0);
        expect(viewportAfter?.centerY).toBeCloseTo(viewportBefore!.centerY, 0);
    });

    test("@admin check schema view keeps node positions and the viewport across a tab switch", async () => {
        await apiCalls.runQuery(GRAPH_NAME, MESSY_GRAPH_QUERY);
        const schemaView = await browser.createNewPage(SchemaView, urls.graphUrl);
        await schemaView.selectGraphByName(GRAPH_NAME);
        await schemaView.clickSchemaTab();
        await schemaView.waitForSchemaTripleCount(EXPECTED_TRIPLES.length);
        await schemaView.waitForSchemaToSettle();

        // Move the camera off the initial fit, so a re-fit on the way back would
        // be obvious rather than landing back where we started by chance.
        await schemaView.clickSchemaZoomIn();
        await schemaView.waitForSchemaToSettle();

        const positionsBefore = await schemaView.getSchemaNodePositions();
        const viewportBefore = await schemaView.getSchemaViewport();

        // The tabs unmount their content, so this drops the canvas entirely.
        await schemaView.clickGraphTab();
        await schemaView.clickSchemaTab();
        await schemaView.waitForSchemaTripleCount(EXPECTED_TRIPLES.length);
        await schemaView.waitForSchemaToSettle();

        const positionsAfter = await schemaView.getSchemaNodePositions();
        expect(Object.keys(positionsAfter).sort()).toEqual(EXPECTED_LABELS);
        EXPECTED_LABELS.forEach((label) => {
            expect(positionsAfter[label].x).toBeCloseTo(positionsBefore[label].x, 1);
            expect(positionsAfter[label].y).toBeCloseTo(positionsBefore[label].y, 1);
        });

        const viewportAfter = await schemaView.getSchemaViewport();
        expect(viewportAfter?.zoom).toBeCloseTo(viewportBefore!.zoom, 1);
        expect(viewportAfter?.centerX).toBeCloseTo(viewportBefore!.centerX, 0);
        expect(viewportAfter?.centerY).toBeCloseTo(viewportBefore!.centerY, 0);
    });

    test("@admin check schema view canvas controls zoom and fit the schema", async () => {
        await apiCalls.runQuery(GRAPH_NAME, MESSY_GRAPH_QUERY);
        const schemaView = await browser.createNewPage(SchemaView, urls.graphUrl);
        await schemaView.selectGraphByName(GRAPH_NAME);
        await schemaView.clickSchemaTab();
        await schemaView.waitForSchemaTripleCount(EXPECTED_TRIPLES.length);
        await schemaView.waitForSchemaToSettle();

        // The zoom the canvas picks on load is fitted to a graph that is still
        // spreading out, so the baseline is taken from an explicit fit instead.
        await schemaView.clickSchemaCenter();

        let fitted = 0;
        await expect.poll(async () => {
            const zoom = (await schemaView.getSchemaViewport())!.zoom;
            const settled = Math.abs(zoom - fitted) < 0.001;

            fitted = zoom;

            return settled;
        }).toBe(true);

        await schemaView.clickSchemaZoomIn();
        await expect.poll(async () => (await schemaView.getSchemaViewport())!.zoom).toBeGreaterThan(fitted);

        const zoomedIn = (await schemaView.getSchemaViewport())!.zoom;

        await schemaView.clickSchemaZoomOut();
        await expect.poll(async () => (await schemaView.getSchemaViewport())!.zoom).toBeLessThan(zoomedIn);

        await schemaView.clickSchemaZoomIn();
        await schemaView.clickSchemaZoomIn();
        await schemaView.clickSchemaCenter();
        await expect
            .poll(async () => (await schemaView.getSchemaViewport())!.zoom)
            .toBeCloseTo(fitted, 1);
    });

    test("@admin check schema view lists the property keys and types of every label and type", async () => {
        await apiCalls.runQuery(GRAPH_NAME, MESSY_GRAPH_QUERY);
        const schemaView = await browser.createNewPage(SchemaView, urls.graphUrl);
        await schemaView.selectGraphByName(GRAPH_NAME);
        await schemaView.clickSchemaTab();
        await schemaView.waitForSchemaTripleCount(EXPECTED_TRIPLES.length);

        // The keys of a label are the union of the keys of every node carrying
        // it, and a key held with two types reports both: FalkorDB enforces no
        // schema, so sampling a single node would be wrong.
        await expect.poll(async () => (await schemaView.getSchemaLabelKeys()).Person).toEqual({
            name: "String",
            age: "Integer | String",
            nickname: "String",
        });

        const labelKeys = await schemaView.getSchemaLabelKeys();
        expect(labelKeys.Company).toEqual({ name: "String" });
        expect(labelKeys.City).toEqual({ name: "String" });
        expect(labelKeys.Employee).toEqual({ name: "String" });
        // Unlabeled nodes are reported under the synthetic "Empty" label.
        expect(labelKeys.Empty).toEqual({ name: "String" });

        const relationshipKeys = await schemaView.getSchemaRelationshipKeys();
        expect(relationshipKeys.KNOWS).toEqual({ since: "Integer" });
        // A type whose edges carry no properties still has to show up.
        expect(relationshipKeys.OWNS).toEqual({});
    });

    test("@admin check schema view details panel shows the property keys of the selected label", async () => {
        await apiCalls.runQuery(GRAPH_NAME, MESSY_GRAPH_QUERY);
        const schemaView = await browser.createNewPage(SchemaView, urls.graphUrl);
        await schemaView.selectGraphByName(GRAPH_NAME);
        await schemaView.clickSchemaTab();
        await schemaView.waitForSchemaTripleCount(EXPECTED_TRIPLES.length);

        await schemaView.selectSchemaElementBySearch("Person");

        expect(await schemaView.getSchemaDataPanelName()).toBe("Person");
        // The panel is the graph view's, only the values are types.
        expect(await schemaView.getSchemaDataPanelKeys()).toEqual({
            name: "String",
            age: "Integer | String",
            nickname: "String",
        });
    });
});
