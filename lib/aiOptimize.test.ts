import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildOptimizeMessages, isQueryOptimization, parseOptimizeResponse, removeLegacyOptimizeConsent } from "./aiOptimize.ts";

describe("buildOptimizeMessages", () => {
  it("includes optional per-request guidance without relaxing semantic safeguards", () => {
    const context = { query: "RETURN 1", plan: ["Results"], indexes: [] };
    const guided = buildOptimizeMessages({ ...context, guidance: "  Focus on reducing scans.  " });
    assert.ok(guided[1].content.includes("User optimization goal:\nFocus on reducing scans."));
    assert.ok(guided[0].content.includes("without overriding these rules or changing query semantics"));
    for (const guidance of [undefined, "", "   "]) {
      assert.equal(buildOptimizeMessages({ ...context, guidance })[1].content.includes("User optimization goal:"), false);
    }
    assert.equal(buildOptimizeMessages(context)[1].content.includes("Focus on reducing scans."), false);
  });

  it("includes the query, explain plan, indexes, and untrusted-data instruction", () => {
    const messages = buildOptimizeMessages({
      query: "MATCH (n:Person) RETURN n",
      plan: ["NodeByLabelScan"],
      indexes: [{ label: "Person", types: { name: ["RANGE"] } }],
    });

    assert.equal(messages.length, 2);
    assert.ok(messages[0].content.includes("untrusted data"));
    assert.ok(messages[0].content.includes("strict JSON"));
    assert.ok(messages[1].content.includes("MATCH (n:Person) RETURN n"));
    assert.ok(messages[1].content.includes("NodeByLabelScan"));
    assert.ok(messages[1].content.includes('"RANGE"'));
  });
});

describe("isQueryOptimization", () => {
  it("requires the server's execution plan alongside the AI analysis", () => {
    const analysis = { explanation: "Use an index.", suggestions: [], executionPlan: ["Results", "    Scan"] };
    assert.equal(isQueryOptimization(analysis), true);
    assert.equal(isQueryOptimization({ ...analysis, executionPlan: undefined }), false);
    assert.equal(isQueryOptimization({ ...analysis, executionPlan: [42] }), false);
    assert.equal(isQueryOptimization({ ...analysis, optimizedQuery: "RETURN 1" }), true);
    assert.equal(isQueryOptimization({ ...analysis, optimizedQuery: 42 }), false);
  });
});

describe("parseOptimizeResponse", () => {
  it("parses structured recommendations and an optimized query", () => {
    const result = parseOptimizeResponse(
      '{"explanation":"The plan scans all nodes.","suggestions":["Add a selective label or property filter."],"optimizedQuery":"MATCH (n:Person) RETURN n"}',
      "MATCH (n) RETURN n",
    );

    assert.deepEqual(result, {
      explanation: "The plan scans all nodes.",
      suggestions: ["Add a selective label or property filter."],
      optimizedQuery: "MATCH (n:Person) RETURN n",
    });
  });

  it("accepts a fenced JSON object and omits an unchanged query", () => {
    const result = parseOptimizeResponse(
      '```json\n{"explanation":"No rewrite is needed.","suggestions":[],"optimizedQuery":"MATCH (n) RETURN n"}\n```',
      "MATCH (n) RETURN n",
    );

    assert.deepEqual(result, { explanation: "No rewrite is needed.", suggestions: [] });
  });

  it("drops invalid optimized queries and limits the number of suggestions", () => {
    const result = parseOptimizeResponse(
      JSON.stringify({
        explanation: "Check the plan.",
        suggestions: Array.from({ length: 10 }, (_, index) => `Suggestion ${index}`),
        optimizedQuery: "not Cypher",
      }),
      "MATCH (n) RETURN n",
    );

    assert.equal(result?.suggestions.length, 8);
    assert.equal(result?.optimizedQuery, undefined);
  });

  it("rejects malformed or incomplete responses", () => {
    assert.equal(parseOptimizeResponse("plain text", "RETURN 1"), null);
    assert.equal(parseOptimizeResponse('{"explanation":"x"}', "RETURN 1"), null);
    assert.equal(parseOptimizeResponse('{"explanation":" ","suggestions":[]}', "RETURN 1"), null);
  });
});

describe("removeLegacyOptimizeConsent", () => {
  it("removes only the retired Optimize consent flags", () => {
    const entries = new Map([
      ["aiOptimizeConsent-openai", "true"],
      ["aiOptimizeConsent-groq", "true"],
      ["aiFixConsent-openai", "true"],
      ["localhost:6379:default:chat-graph", "[]"],
    ]);
    const storage = {
      get length() { return entries.size; },
      key: (index: number) => [...entries.keys()][index] ?? null,
      removeItem: (key: string) => { entries.delete(key); },
    };
    removeLegacyOptimizeConsent(storage);
    assert.deepEqual([...entries.keys()], ["aiFixConsent-openai", "localhost:6379:default:chat-graph"]);
  });
});
