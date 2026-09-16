import { expect, test } from "@playwright/test";
import { getRandomString } from "../infra/utils";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ApiCalls from "../logic/api/apiCalls";
import GraphPage from "../logic/POM/graphPage";
import urls from "../config/urls.json";

// Two kinds of "this query is wrong" live side by side in the editor and must not
// be confused:
//
//   - A *syntax* error comes from the bundled grammar, marks the text and
//     disables Run. Valid FalkorDB Cypher must never land here (issues #2056,
//     #2058).
//   - A *pre-flight* error is a query that parses fine but that we already know
//     the server will reject. Run stays enabled and the query is stopped at
//     submit time, where we can still offer the upload flow as the fix.
test.describe("Query pre-flight and FalkorDB grammar extensions", () => {
    let browser: BrowserWrapper;
    let apiCall: ApiCalls;
    let graphName: string | undefined;

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
        apiCall = new ApiCalls();
        graphName = undefined;
    });

    test.afterEach(async () => {
        const graphToRemove = graphName;
        graphName = undefined;

        if (graphToRemove) {
            await apiCall.removeGraph(graphToRemove).catch(() => { });
        }

        await browser.closeBrowser();
    });

    async function openGraph(): Promise<GraphPage> {
        graphName = getRandomString("graph");
        await apiCall.addGraph(graphName);

        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectGraphByName(graphName);
        return graph;
    }

    // -------------------------------------------------------------------------
    // Grammar — valid FalkorDB Cypher must not be marked as a syntax error.
    // Each test first types a query that *is* malformed, so a passing assertion
    // cannot come from the linter simply being asleep.
    // -------------------------------------------------------------------------

    const validQueries: { issue: string; label: string; query: string }[] = [
        {
            issue: "#2056",
            label: "LOAD CSV with a file:// source",
            query: "LOAD CSV FROM 'file://fuzz.csv' AS row RETURN row",
        },
        {
            issue: "#2056",
            label: "LOAD CSV WITH HEADERS and a FIELDTERMINATOR",
            query: "LOAD CSV WITH HEADERS FROM 'https://example.com/p.csv' AS row FIELDTERMINATOR ';' CREATE (:Person { name: row.name })",
        },
        {
            issue: "#2058",
            label: "CREATE VECTOR INDEX with an OPTIONS map",
            query: "CREATE VECTOR INDEX FOR (u:User) ON (u.embedding) OPTIONS { dimension: 4, similarityFunction: 'cosine' }",
        },
        {
            issue: "#2058",
            label: "CREATE FULLTEXT INDEX with an OPTIONS map",
            query: "CREATE FULLTEXT INDEX FOR (p:Person) ON (p.name) OPTIONS { weight: 2.0 }",
        },
        {
            issue: "#2058",
            label: "DROP VECTOR INDEX",
            query: "DROP VECTOR INDEX FOR (u:User) ON (u.embedding)",
        },
        {
            issue: "#2058",
            label: "an unqualified CREATE INDEX FOR",
            query: "CREATE INDEX FOR (p:Person) ON (p.name)",
        },
        {
            issue: "#2058",
            label: "an unqualified DROP INDEX FOR",
            query: "DROP INDEX FOR (p:Person) ON (p.name)",
        },
        {
            issue: "#2058",
            label: "the legacy CREATE INDEX ON :Label(prop) form",
            query: "CREATE INDEX ON :Person(name)",
        },
        {
            issue: "#2058",
            label: "the legacy DROP INDEX ON :Label(prop) form",
            query: "DROP INDEX ON :Person(name)",
        },
    ];

    validQueries.forEach(({ issue, label, query }) => {
        test(`@admin ${issue} ${label} is not a syntax error and leaves Run enabled`, async () => {
            const graph = await openGraph();

            // Positive control: prove the editor is linting in this session.
            await graph.insertQuery("MATCH (n) RETsURN n");
            expect(await graph.hasEditorErrorMarker()).toBe(true);

            await graph.insertQuery(query);
            expect(await graph.hasEditorErrorMarker()).toBe(false);
            expect(await graph.isEnabledEditorRun()).toBe(true);
        });
    });

    // -------------------------------------------------------------------------
    // The mirror image: the grammar must not be *more* permissive than FalkorDB
    // either, or the editor green-lights a query the server cannot parse. Each of
    // these was confirmed to be a parse error on a live server, so accepting them
    // here would be dead grammar that only delays the failure.
    // -------------------------------------------------------------------------

    const invalidQueries: { label: string; query: string }[] = [
        {
            label: "DROP INDEX with an OPTIONS map",
            query: "DROP VECTOR INDEX FOR (u:User) ON (u.embedding) OPTIONS { dimension: 4 }",
        },
        {
            label: "an unqualified CREATE INDEX with an OPTIONS map",
            query: "CREATE INDEX FOR (p:Person) ON (p.name) OPTIONS { weight: 2.0 }",
        },
        {
            label: "a qualified index on the legacy ON :Label(prop) form",
            query: "CREATE VECTOR INDEX ON :User(embedding)",
        },
    ];

    invalidQueries.forEach(({ label, query }) => {
        test(`@admin #2058 ${label} is a syntax error, as it is on the server`, async () => {
            const graph = await openGraph();

            await graph.insertQuery(query);
            expect(await graph.hasEditorErrorMarker()).toBe(true);
        });
    });

    // -------------------------------------------------------------------------
    // Pre-flight — parses, but FalkorDB rejects every scheme except https/file.
    // -------------------------------------------------------------------------

    test(`@admin A LOAD CSV source FalkorDB cannot fetch is blocked before the request`, async () => {
        const graph = await openGraph();
        const query = "LOAD CSV FROM 'ftp://example.com/people.csv' AS row RETURN row";

        await graph.insertQuery(query);

        // The query is well-formed, so it must not be marked or have Run disabled.
        expect(await graph.hasEditorErrorMarker()).toBe(false);
        expect(await graph.isEnabledEditorRun()).toBe(true);

        await graph.clickRunQuery(false);

        expect(await graph.getNotificationErrorToast()).toBe(true);
        // "This query cannot run" is only ever produced client-side; a server
        // rejection would title the toast "Error" or "Syntax Error". Seeing it
        // is what proves the request never left the browser.
        expect(await graph.getErrorToastTitle()).toBe("This query cannot run");
        expect(await graph.getErrorToastText()).toContain("ftp://");
    });

    test(`@admin The block offers the CSV upload flow as the fix`, async () => {
        const graph = await openGraph();

        await graph.insertQuery("LOAD CSV WITH HEADERS FROM 'people.csv' AS row RETURN row");
        await graph.clickRunQuery(false);

        expect(await graph.getErrorToastTitle()).toBe("This query cannot run");

        const uploadAction = graph.errorToast.getByRole("button", { name: "Upload CSV" });
        await expect(uploadAction).toBeVisible();
        await uploadAction.click();

        // Lands directly on the Load CSV tab of the upload dialog.
        await expect(graph.loadCsvTabTrigger).toHaveAttribute("data-state", "active");

        // …and does not leave the dialog stuck there: the toolbar's Upload button
        // is the ordinary Cypher upload, whoever opened the dialog last.
        await graph.uploadGraphCancel.click();
        await graph.uploadGraphToolbarTrigger.click();
        await expect(graph.uploadTabTrigger("cypher")).toHaveAttribute("data-state", "active");
    });

    test(`@admin A LOAD CSV source the browser cannot evaluate is left to the server`, async () => {
        const graph = await openGraph();

        // The URI comes from a parameter, so no client-side check can know what
        // it resolves to. Pre-flight must stay out of the way.
        await graph.insertQuery("LOAD CSV FROM $url AS row RETURN row");
        await graph.clickRunQuery(false);

        expect(await graph.getErrorToastTitle()).not.toBe("This query cannot run");
    });
});
