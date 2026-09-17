import { expect, test } from "@playwright/test";
import { getRandomString } from "../infra/utils";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ApiCalls from "../logic/api/apiCalls";
import GraphPage from "../logic/POM/graphPage";
import urls from "../config/urls.json";

/**
 * Labels, relationship types and property keys cannot travel as query
 * parameters, so the API quotes them instead. These tests feed each of those
 * routes a name that is itself a Cypher fragment and assert it comes back as
 * data rather than executing — the sentinel nodes are the canary.
 */

// Closes the label/type position and appends a destructive clause.
const HOSTILE_LABEL = "Injected DETACH DELETE n //";
// Closes the property map as well, for the `{key: value}` position.
const HOSTILE_KEY = "k} ) DETACH DELETE n //";
const SENTINELS = 'CREATE (:Victim {name: "a"}), (:Victim {name: "b"})';

test.describe("Cypher identifier escaping", () => {
  let browser: BrowserWrapper;
  let apiCall: ApiCalls;

  test.beforeEach(async () => {
    browser = new BrowserWrapper();
    apiCall = new ApiCalls();
  });

  test.afterEach(async () => {
    await browser.closeBrowser();
  });

  const countVictims = async (graphName: string) => {
    const response = await apiCall.runQuery(
      graphName,
      "MATCH (n:Victim) RETURN count(n) AS c"
    );
    return Number(response.data[0].c);
  };

  test(`@readwrite Validate that a hostile node label added via API is stored literally`, async () => {
    const graphName = getRandomString("injection");
    await apiCall.addGraph(graphName);
    await apiCall.runQuery(graphName, SENTINELS);

    await apiCall.addGraphNodeLabel(graphName, "0", { label: HOSTILE_LABEL });

    expect(await countVictims(graphName)).toBe(2);
    const response = await apiCall.runQuery(
      graphName,
      "MATCH (n) WHERE ID(n) = 0 RETURN n"
    );
    expect(response.data[0].n.labels).toContain(HOSTILE_LABEL);

    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Validate that a hostile node label removed via API is not executed`, async () => {
    const graphName = getRandomString("injection");
    await apiCall.addGraph(graphName);
    await apiCall.runQuery(graphName, SENTINELS);
    await apiCall.addGraphNodeLabel(graphName, "0", { label: HOSTILE_LABEL });

    // Without this, a pair of no-op API calls would leave the label absent and
    // the sentinels intact, and the assertions below would pass vacuously.
    const beforeRemoval = await apiCall.runQuery(
      graphName,
      "MATCH (n) WHERE ID(n) = 0 RETURN n"
    );
    expect(beforeRemoval.data[0].n.labels).toContain(HOSTILE_LABEL);

    await apiCall.deleteGraphNodeLabel(graphName, "0", { label: HOSTILE_LABEL });

    expect(await countVictims(graphName)).toBe(2);
    const response = await apiCall.runQuery(
      graphName,
      "MATCH (n) WHERE ID(n) = 0 RETURN n"
    );
    expect(response.data[0].n.labels).not.toContain(HOSTILE_LABEL);

    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Validate that a hostile label and attribute key on node creation are stored literally`, async () => {
    const graphName = getRandomString("injection");
    await apiCall.addGraph(graphName);
    await apiCall.runQuery(graphName, SENTINELS);

    const created = await apiCall.createGraphElement(graphName, {
      type: true,
      label: [HOSTILE_LABEL],
      attributes: [[HOSTILE_KEY, "payload"]],
    });

    expect(created.status).toBe(200);
    expect(await countVictims(graphName)).toBe(2);
    const response = await apiCall.runQuery(
      graphName,
      `MATCH (n:\`${HOSTILE_LABEL}\`) RETURN n`
    );
    expect(response.data).toHaveLength(1);
    expect(response.data[0].n.properties[HOSTILE_KEY]).toBe("payload");

    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Validate that a hostile relationship type on edge creation is stored literally`, async () => {
    const graphName = getRandomString("injection");
    await apiCall.addGraph(graphName);
    await apiCall.runQuery(graphName, SENTINELS);

    const created = await apiCall.createGraphElement(graphName, {
      type: false,
      label: [HOSTILE_LABEL],
      attributes: [[HOSTILE_KEY, "payload"]],
      selectedNodes: [{ id: 0 }, { id: 1 }],
    });

    expect(created.status).toBe(200);
    expect(await countVictims(graphName)).toBe(2);
    const response = await apiCall.runQuery(
      graphName,
      `MATCH ()-[e:\`${HOSTILE_LABEL}\`]->() RETURN e`
    );
    expect(response.data).toHaveLength(1);
    expect(response.data[0].e.properties[HOSTILE_KEY]).toBe("payload");

    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Validate that an attribute value is passed as a parameter and never parsed`, async () => {
    const graphName = getRandomString("injection");
    await apiCall.addGraph(graphName);
    await apiCall.runQuery(graphName, SENTINELS);

    // The `\'` shape escapes the FalkorDB string literal that naive `''`
    // doubling would leave open.
    const hostileValue = "x\\'}) MATCH (v:Victim) DETACH DELETE v //";
    const created = await apiCall.createGraphElement(graphName, {
      type: true,
      label: ["Payload"],
      attributes: [["value", hostileValue]],
    });

    expect(created.status).toBe(200);
    expect(await countVictims(graphName)).toBe(2);
    const response = await apiCall.runQuery(
      graphName,
      "MATCH (n:Payload) RETURN n"
    );
    expect(response.data[0].n.properties.value).toBe(hostileValue);

    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Validate that creating an element on a read-only connection is rejected`, async () => {
    const graphName = getRandomString("injection");
    await apiCall.addGraph(graphName);
    await apiCall.runQuery(graphName, SENTINELS);

    const created = await apiCall.createGraphElement(
      graphName,
      { type: true, label: ["Blocked"], attributes: [] },
      true
    );

    expect(created.status).toBe(403);
    expect(created.body.message).toBe("Forbidden: read-only connection");
    const response = await apiCall.runQuery(
      graphName,
      "MATCH (n:Blocked) RETURN n"
    );
    expect(response.data).toHaveLength(0);

    await apiCall.removeGraph(graphName);
  });

  test(`@readonly Validate that a RO user cannot create an element`, async () => {
    const graphName = getRandomString("injection");
    await apiCall.addGraph(graphName);

    await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    const page = await browser.getPage();

    // Goes through the page so the request carries the read-only session.
    const created = await page.evaluate(async (name) => {
      const res = await fetch(`/api/graph/${name}/-1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: true, label: ["Blocked"], attributes: [] }),
      });
      return { status: res.status, body: await res.json() };
    }, graphName);

    expect(created.status).toBe(403);
    expect(created.body.message).toBe("Forbidden: read-only connection");

    await apiCall.removeGraph(graphName, "admin");
  });
});
