import { expect, test } from "@playwright/test";
import { getRandomString } from "../infra/utils";
import ApiCalls from "../logic/api/apiCalls";

test.describe("Node Count API Tests", () => {
  let apiCall: ApiCalls;

  test.beforeEach(async () => {
    apiCall = new ApiCalls();
  });

  test(`@admin Verify node counting fix - nodes with multiple outgoing edges are counted correctly`, async () => {
    const graphName = getRandomString("nodecount");
    await apiCall.addGraph(graphName);

    try {
      // Create a scenario that would expose the old counting bug:
      // - Node A with 2 outgoing edges (to B and C)
      // - Nodes B and C with no outgoing edges
      // Old buggy query would count: A twice (2 edges) + B once + C once = 4 nodes
      // Fixed query should count: A once + B once + C once = 3 nodes
      const createQuery = `
        CREATE (a:Person {name: 'Alice'}),
               (b:Person {name: 'Bob'}),
               (c:Person {name: 'Charlie'}),
               (a)-[:KNOWS]->(b),
               (a)-[:KNOWS]->(c)
        RETURN a, b, c
      `;

      await apiCall.runQuery(graphName, createQuery);

      // Get the count via API
      const count = await apiCall.getGraphCount(graphName);
      const nodesCount = count.result.data[0].nodes;
      const edgesCount = count.result.data[0].edges;

      // Verify the counts are correct
      expect(nodesCount).toBe(3); // Should be exactly 3 nodes, not 4
      expect(edgesCount).toBe(2); // Should be exactly 2 edges

    } finally {
      await apiCall.removeGraph(graphName);
    }
  });

  test(`@admin Verify node counting with isolated nodes - nodes without edges are counted correctly`, async () => {
    const graphName = getRandomString("isolated");
    await apiCall.addGraph(graphName);

    try {
      // Create a scenario with isolated nodes (no edges)
      // This tests that OPTIONAL MATCH behavior is correctly handled
      const createQuery = `
        CREATE (a:Person {name: 'Alice'}),
               (b:Person {name: 'Bob'}),
               (c:Person {name: 'Charlie'})
        RETURN a, b, c
      `;

      await apiCall.runQuery(graphName, createQuery);

      // Get the count via API
      const count = await apiCall.getGraphCount(graphName);
      const nodesCount = count.result.data[0].nodes;
      const edgesCount = count.result.data[0].edges;

      // Verify the counts - should count all nodes even with no edges
      expect(nodesCount).toBe(3);
      expect(edgesCount).toBe(0);

    } finally {
      await apiCall.removeGraph(graphName);
    }
  });

  test(`@admin Verify node counting with complex graph structure`, async () => {
    const graphName = getRandomString("complex");
    await apiCall.addGraph(graphName);

    try {
      // Create a more complex graph to thoroughly test the counting logic
      // Node distribution: some with multiple edges, some with one, some with none
      const createQuery = `
        CREATE (a:Person {name: 'Alice'}),
               (b:Person {name: 'Bob'}),
               (c:Person {name: 'Charlie'}),
               (d:Person {name: 'David'}),
               (e:Person {name: 'Eve'}),
               (a)-[:KNOWS]->(b),
               (a)-[:KNOWS]->(c),
               (a)-[:KNOWS]->(d),
               (b)-[:FOLLOWS]->(e),
               (c)-[:LIKES]->(d)
        RETURN a, b, c, d, e
      `;

      await apiCall.runQuery(graphName, createQuery);

      // Get the count via API
      const count = await apiCall.getGraphCount(graphName);
      const nodesCount = count.result.data[0].nodes;
      const edgesCount = count.result.data[0].edges;

      // Expected: 5 nodes, 5 edges
      // With old bug: Alice (3 edges) = 3, Bob (1 edge) = 1, Charlie (1 edge) = 1, 
      //               David (0 outgoing) = 1, Eve (0 outgoing) = 1 = 7 total (wrong)
      // With fix: Alice + Bob + Charlie + David + Eve = 5 total (correct)
      expect(nodesCount).toBe(5);
      expect(edgesCount).toBe(5);

    } finally {
      await apiCall.removeGraph(graphName);
    }
  });
});