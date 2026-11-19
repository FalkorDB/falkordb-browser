import { expect, test } from "@playwright/test";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ApiCalls from "../logic/api/apiCalls";
import CreateElementPanel from "../logic/POM/createElementComponent";
import urls from "../config/urls.json";
import { getRandomString } from "../infra/utils";

const FETCH_ALL_NODES = "MATCH (n) RETURN n";
const EMPTY_VALUE_ERROR = "Key or value cannot be empty";

test.describe("Create element panel Tests", () => {
  let browser: BrowserWrapper;
  let apicalls: ApiCalls;
  let graphName: string;

  test.beforeEach(async () => {
    browser = new BrowserWrapper();
    apicalls = new ApiCalls();
    graphName = getRandomString("createelement");
    await apicalls.addGraph(graphName);
  });

  test.afterEach(async () => {
    // Close first: a live graph page polls graph info, and that poll
    // re-creates a graph deleted out from under it.
    await browser.closeBrowser();

    const { message } = await apicalls.removeGraph(graphName, "admin");
    if (!message.includes("deleted")) {
      throw new Error(`Failed to remove ${graphName}: ${message}`);
    }
  });

  // The panel needs a loaded canvas to create into, so every test seeds nodes first.
  async function openGraph(seedQuery: string): Promise<CreateElementPanel> {
    await apicalls.runQuery(graphName, seedQuery);
    const graph = await browser.createNewPage(CreateElementPanel, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.loadGraph(graphName, FETCH_ALL_NODES);
    return graph;
  }

  test(`@readwrite create a node with a label and string, number and boolean properties`, async () => {
    const graph = await openGraph("CREATE (:Seed {name: 'seed'})");
    await graph.openNodePanel();

    await graph.addLabel("Person");
    await graph.addAttribute("name", "Alice");
    await graph.addAttribute("age", 42);
    await graph.addAttribute("active", true);

    await expect(graph.attributesCount).toHaveText("3");
    await expect(graph.attributeValue("name")).toHaveText("Alice");
    await expect(graph.attributeType("name")).toHaveText("string");
    await expect(graph.attributeValue("age")).toHaveText("42");
    await expect(graph.attributeType("age")).toHaveText("number");
    await expect(graph.attributeValue("active")).toHaveText("true");
    await expect(graph.attributeType("active")).toHaveText("boolean");

    await graph.clickCreate();
    await expect(graph.panel).toBeHidden();

    const { data } = await apicalls.runQuery(graphName, "MATCH (n:Person) RETURN n");
    expect(data).toHaveLength(1);
    expect(data[0].n.labels).toEqual(["Person"]);
    expect(data[0].n.properties).toEqual({ name: "Alice", age: 42, active: true });
  });

  test(`@readwrite empty or duplicate attribute keys are rejected`, async () => {
    const graph = await openGraph("CREATE (:Seed {name: 'seed'})");
    await graph.openNodePanel();

    // Nothing filled in.
    await graph.clickAddAttribute();
    await expect(graph.errorDescription).toHaveText(EMPTY_VALUE_ERROR);
    await expect(graph.attributesCount).toHaveText("0");

    await graph.addAttribute("dup", 1);
    await expect(graph.attributesCount).toHaveText("1");

    // Same key again.
    await graph.fillNewAttribute("dup", "other");
    await graph.clickAddAttribute();
    await expect(graph.errorDescription).toHaveText("An attribute with this key already exists");
    await expect(graph.attributesCount).toHaveText("1");
    await expect(graph.attributeValue("dup")).toHaveText("1");

    // Empty key with a value; clearing the key first keeps the message distinct from the previous toast's.
    await graph.fillNewAttribute("", "x");
    await graph.clickAddAttribute();
    await expect(graph.errorDescription).toHaveText(EMPTY_VALUE_ERROR);
    await expect(graph.attributesCount).toHaveText("1");

    // A number field cleared back to empty must stay empty, not become 0.
    await graph.fillNewAttribute("num", 5);
    await graph.clearNewValue();
    await expect(graph.newValue).toHaveValue("");
    await graph.clickAddAttribute();
    await expect(graph.newKey).toHaveValue("num");
    await expect(graph.newValue).toHaveValue("");
    await expect(graph.attributesCount).toHaveText("1");
    await expect(graph.attributeKey("num")).toBeHidden();

    await graph.fillNewAttribute("num", 7);
    await graph.clickAddAttribute();
    await expect(graph.attributeValue("num")).toHaveText("7");
    await expect(graph.attributeType("num")).toHaveText("number");
    await expect(graph.attributesCount).toHaveText("2");
  });

  test(`@readwrite Escape cancels an attribute edit without closing or clearing the draft`, async () => {
    const graph = await openGraph("CREATE (:Seed {name: 'seed'})");
    await graph.openNodePanel();

    await graph.addLabel("Person");
    await graph.addAttribute("name", "Alice");
    await graph.editAttributeWithPencil("name");
    await graph.fillEditValue("Bob");
    await graph.editValue.press("Escape");

    await expect(graph.panel).toBeVisible();
    await expect(graph.editValue).toBeHidden();
    await expect(graph.label("Person")).toBeVisible();
    await expect(graph.attributesCount).toHaveText("1");
    await expect(graph.attributeValue("name")).toHaveText("Alice");

    await graph.clickCreate();
    await expect(graph.panel).toBeHidden();

    const { data } = await apicalls.runQuery(graphName, "MATCH (n:Person) RETURN n");
    expect(data).toHaveLength(1);
    expect(data[0].n.labels).toEqual(["Person"]);
    expect(data[0].n.properties).toEqual({ name: "Alice" });
  });

  test(`@readwrite Escape cancels a new attribute row without closing or clearing the draft`, async () => {
    const graph = await openGraph("CREATE (:Seed {name: 'seed'})");
    await graph.openNodePanel();

    await graph.addLabel("Person");
    await graph.addAttribute("name", "Alice");
    await graph.fillNewAttribute("pending", "discard");
    await graph.newKey.press("Escape");

    await expect(graph.panel).toBeVisible();
    await expect(graph.label("Person")).toBeVisible();
    await expect(graph.attributesCount).toHaveText("1");
    await expect(graph.attributeValue("name")).toHaveText("Alice");
    await expect(graph.newKey).toHaveValue("");
    await expect(graph.newValue).toHaveValue("");

    await graph.clickCreate();
    await expect(graph.panel).toBeHidden();

    const { data } = await apicalls.runQuery(graphName, "MATCH (n:Person) RETURN n");
    expect(data).toHaveLength(1);
    expect(data[0].n.labels).toEqual(["Person"]);
    expect(data[0].n.properties).toEqual({ name: "Alice" });
  });

  test(`@readwrite create an edge between two selected nodes; type is required; swap reverses direction`, async () => {
    const graph = await openGraph("CREATE (:Seed {name: 'a'}), (:Seed {name: 'b'})");
    const [firstId, secondId] = await graph.openEdgePanel();

    const source = await graph.sourceNode.innerText();
    const target = await graph.targetNode.innerText();
    expect(source).not.toBe(target);

    // No type yet.
    await graph.clickCreate();
    await expect(graph.errorDescription).toHaveText("Edge must have a label (relationship type)");
    await expect(graph.panel).toBeVisible();
    const empty = await apicalls.runQuery(graphName, "MATCH ()-[e]->() RETURN count(e) AS c");
    expect(Number(empty.data[0].c)).toBe(0);

    await graph.swapNodes();
    await expect(graph.sourceNode).toHaveText(target);
    await expect(graph.targetNode).toHaveText(source);

    await graph.addLabel("KNOWS");
    // An edge takes a single type, so the add-label trigger goes away.
    await expect(graph.addLabelTrigger).toHaveCount(0);
    await graph.addAttribute("since", 2020);

    await graph.clickCreate();
    await expect(graph.panel).toBeHidden();

    const { data } = await apicalls.runQuery(
      graphName,
      "MATCH (a)-[e]->(b) RETURN ID(a) AS src, ID(b) AS dst, type(e) AS t, e"
    );
    expect(data).toHaveLength(1);
    // Swapped, so the node clicked second is the source.
    expect(Number(data[0].src)).toBe(secondId);
    expect(Number(data[0].dst)).toBe(firstId);
    expect(data[0].t).toBe("KNOWS");
    expect(data[0].e.properties).toEqual({ since: 2020 });
  });

  test(`@readwrite edit, cancel, save and delete an attribute; remove a label`, async () => {
    const graph = await openGraph("CREATE (:Seed {name: 'seed'})");
    await graph.openNodePanel();

    await graph.addLabel("Person");
    await graph.removeLabel("Person");
    await expect(graph.addLabelTrigger).toBeVisible();

    await graph.addAttribute("name", "Alice");
    await graph.addAttribute("age", 30);
    await graph.addAttribute("active", false);
    await graph.addAttribute("zero", 0);
    await expect(graph.attributesCount).toHaveText("4");

    // Cancel discards the edit.
    await graph.editAttributeWithPencil("name");
    await graph.fillEditValue("Bob");
    await graph.cancelAttributeEdit();
    await expect(graph.attributeValue("name")).toHaveText("Alice");

    // Save keeps it.
    await graph.editAttributeWithPencil("name");
    await graph.fillEditValue("Bob");
    await graph.saveAttributeEdit();
    await expect(graph.attributeValue("name")).toHaveText("Bob");

    // An empty value is rejected and the row stays in edit mode.
    await graph.editAttributeWithPencil("name");
    await graph.fillEditValue("");
    await graph.saveAttributeEdit();
    await expect(graph.errorDescription).toHaveText("Value cannot be empty");
    await expect(graph.editValue).toBeVisible();
    await graph.cancelAttributeEdit();
    await expect(graph.attributeValue("name")).toHaveText("Bob");

    // Clicking the value edits it too; the field starts from the current value.
    await graph.editAttributeByValue("age");
    await expect(graph.editValue).toHaveValue("30");
    await graph.fillEditValue("31");
    await graph.saveAttributeEditWithEnter();
    await expect(graph.attributeValue("age")).toHaveText("31");

    // Saving a false boolean unchanged keeps it rather than reporting it empty.
    await graph.editAttributeByValue("active");
    await expect(graph.editValue).toHaveAttribute("data-state", "unchecked");
    await graph.saveAttributeEdit();
    await expect(graph.editValue).toBeHidden();
    await expect(graph.attributeValue("active")).toHaveText("false");

    await graph.editAttributeByValue("active");
    await graph.toggleEditValue();
    await graph.saveAttributeEdit();
    await expect(graph.attributeValue("active")).toHaveText("true");

    // Saving a 0 number unchanged keeps it too.
    await graph.editAttributeByValue("zero");
    await expect(graph.editValue).toHaveValue("0");
    await graph.saveAttributeEdit();
    await expect(graph.editValue).toBeHidden();
    await expect(graph.attributeValue("zero")).toHaveText("0");
    await expect(graph.attributeType("zero")).toHaveText("number");

    // Changing the type resets the value to that type's default.
    await graph.editAttributeWithPencil("name");
    await graph.selectEditType("number");
    await expect(graph.editValue).toHaveValue("0");
    await graph.fillEditValue("5");
    await graph.saveAttributeEdit();
    await expect(graph.attributeType("name")).toHaveText("number");
    await expect(graph.attributeValue("name")).toHaveText("5");

    // Delete: cancelling keeps the row, confirming removes it.
    await expect(graph.attributesCount).toHaveText("4");
    await graph.deleteAttribute("age", false);
    await expect(graph.attributeKey("age")).toBeVisible();
    await expect(graph.attributesCount).toHaveText("4");

    await graph.deleteAttribute("age", true);
    await expect(graph.attributeKey("age")).toBeHidden();
    await expect(graph.attributesCount).toHaveText("3");

    // Only the edited values, with their types, reach the database.
    await graph.addLabel("Edited");
    await graph.clickCreate();
    await expect(graph.panel).toBeHidden();

    const { data } = await apicalls.runQuery(graphName, "MATCH (n:Edited) RETURN n");
    expect(data).toHaveLength(1);
    expect(data[0].n.labels).toEqual(["Edited"]);
    expect(data[0].n.properties).toEqual({ name: 5, active: true, zero: 0 });
  });

  test(`@readwrite closing the panel discards the draft`, async () => {
    const graph = await openGraph("CREATE (:Seed {name: 'seed'})");

    const closeActions = [
      () => graph.closePanel(),
      async () => {
        await graph.title.click();
        await graph.closeWithEscape();
      },
    ];

    for (const close of closeActions) {
      await graph.openNodePanel();
      await graph.addLabel("Draft");
      await graph.addAttribute("name", "Draft");
      await graph.fillNewAttribute("pending", "value");
      await expect(graph.attributesCount).toHaveText("1");

      await close();

      await graph.openNodePanel();
      await expect(graph.attributesCount).toHaveText("0");
      await expect(graph.label("Draft")).toBeHidden();
      await expect(graph.newKey).toHaveValue("");
      await graph.closePanel();
    }

    const { data } = await apicalls.runQuery(graphName, "MATCH (n) RETURN count(n) AS c");
    expect(Number(data[0].c)).toBe(1);
  });
});
