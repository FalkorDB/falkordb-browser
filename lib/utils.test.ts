import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { convertToCanvasData, createAbortError, getConnectionEpoch, getMetaStats, getSchema, getSSEGraphResult, isAbortError, parsePanelSizePercent, securedFetch, setActiveConnectionIdGlobal, type GraphData } from "./utils.ts";

const noopToast = () => {};
const noopIndicator = () => {};

afterEach(() => {
  setActiveConnectionIdGlobal(null);
});

describe("API URL normalization", () => {
  it("normalizes relative securedFetch URLs to root-relative paths", async () => {
    const originalFetch = globalThis.fetch;
    const calls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ input, init });
      return new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } });
    }) as typeof fetch;

    try {
      setActiveConnectionIdGlobal("conn-123");

      const response = await securedFetch("api/graph/demo", {}, noopToast, noopIndicator);

      assert.equal(response.status, 200);
      assert.equal(calls.length, 1);
      assert.equal(String(calls[0].input), "/api/graph/demo");
      assert.equal(calls[0].init?.headers instanceof Headers, true);
      assert.equal((calls[0].init?.headers as Headers).get("X-Connection-Id"), "conn-123");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("normalizes relative EventSource URLs to root-relative paths", async () => {
    const OriginalEventSource = globalThis.EventSource;
    let lastInstance: {
      url: string;
      listeners: Record<string, (event: MessageEvent) => void>;
      close: () => void;
    } | undefined;

    class MockEventSource {
      url: string;

      listeners: Record<string, (event: MessageEvent) => void>;

      constructor(url: string) {
        this.url = url;
        this.listeners = {};
        lastInstance = this;
      }

      addEventListener(name: string, listener: (event: MessageEvent) => void) {
        this.listeners[name] = listener;
      }

      close() {}
    }

    globalThis.EventSource = MockEventSource as unknown as typeof EventSource;

    try {
      setActiveConnectionIdGlobal("conn-456");
      const promise = getSSEGraphResult("api/graph/demo?query=RETURN 1", noopToast, noopIndicator);

      assert.ok(lastInstance);
      assert.equal(lastInstance?.url, "/api/graph/demo?query=RETURN 1&connectionId=conn-456");

      lastInstance?.listeners.result({ data: JSON.stringify({ ok: true }) } as MessageEvent);

      await assert.doesNotReject(async () => {
        assert.deepEqual(await promise, { ok: true });
      });
    } finally {
      globalThis.EventSource = OriginalEventSource;
      setActiveConnectionIdGlobal(null);
    }
  });
});

type MockToast = { title?: unknown; description?: unknown; variant?: unknown };

type MockEventSourceInstance = {
  url: string;
  listeners: Record<string, (event: MessageEvent) => void>;
  onerror: ((event?: unknown) => void) | null;
  closed: boolean;
};

/** Installs a mock EventSource and returns the constructed instance plus a restore fn. */
function installMockEventSource(): {
  getInstance: () => MockEventSourceInstance;
  restore: () => void;
} {
  const Original = globalThis.EventSource;
  let instance: MockEventSourceInstance | undefined;

  class MockEventSource {
    url: string;

    listeners: Record<string, (event: MessageEvent) => void> = {};

    onerror: ((event?: unknown) => void) | null = null;

    closed = false;

    constructor(url: string) {
      this.url = url;
      instance = this as unknown as MockEventSourceInstance;
    }

    addEventListener(name: string, listener: (event: MessageEvent) => void) {
      this.listeners[name] = listener;
    }

    close() {
      this.closed = true;
    }
  }

  globalThis.EventSource = MockEventSource as unknown as typeof EventSource;

  return {
    getInstance: () => {
      if (!instance) throw new Error("EventSource was not constructed");
      return instance;
    },
    restore: () => {
      globalThis.EventSource = Original;
    },
  };
}

describe("getSSEGraphResult error handling", () => {
  it("routes a native EventSource error (no data) to the network/offline fallback", async () => {
    const mock = installMockEventSource();
    const toasts: MockToast[] = [];
    const indicators: string[] = [];
    try {
      const promise = getSSEGraphResult(
        "api/graph/demo?query=RETURN 1",
        (t) => { toasts.push(t as MockToast); },
        (i) => { indicators.push(i); },
      );
      const instance = mock.getInstance();

      // A native "error" event carries no data — the listener must not handle it.
      instance.listeners.error({ data: undefined } as unknown as MessageEvent);
      // The onerror fallback provides the network/offline handling.
      instance.onerror?.();

      await assert.rejects(promise, /Network or server error/);
      assert.equal(toasts.length, 1);
      assert.equal(toasts[0].description, "Network or server error");
      assert.equal(indicators.includes("offline"), true);
    } finally {
      mock.restore();
    }
  });

  it("handles a server-sent error event (with data) and suppresses the onerror fallback", async () => {
    const mock = installMockEventSource();
    const toasts: MockToast[] = [];
    try {
      const promise = getSSEGraphResult(
        "api/graph/demo?query=RETURN 1",
        (t) => { toasts.push(t as MockToast); },
        () => {},
      );
      const instance = mock.getInstance();

      instance.listeners.error({ data: JSON.stringify({ message: "boom", status: 400 }) } as MessageEvent);
      // A subsequent native onerror must be a no-op (already handled).
      instance.onerror?.();

      await assert.rejects(promise, /boom/);
      // Only the server-error toast fires, not the network fallback.
      assert.equal(toasts.length, 1);
    } finally {
      mock.restore();
    }
  });

  it("propagates options.query and the server message into the error toast payload", async () => {
    const mock = installMockEventSource();
    const toasts: Array<Record<string, unknown>> = [];
    try {
      const query = "MATCH (n) RETURN n";
      const promise = getSSEGraphResult(
        "api/graph/demo?query=RETURN 1",
        (t) => { toasts.push(t as Record<string, unknown>); },
        () => {},
        { query },
      );
      const instance = mock.getInstance();

      instance.listeners.error({ data: JSON.stringify({ message: "Syntax error near WHERE", status: 400 }) } as MessageEvent);

      await assert.rejects(promise);
      assert.equal(toasts.length, 1);
      const payload = toasts[0];
      // The originating query is carried through for error highlighting/debugging.
      assert.equal(payload.query, query);
      assert.equal(payload.variant, "destructive");
      assert.equal(typeof payload.title, "string");
      // The raw server message is preserved (verbatim or behind "See more").
      assert.ok(JSON.stringify(payload).includes("Syntax error near WHERE"));
    } finally {
      mock.restore();
    }
  });
});

describe("getMetaStats", () => {
  async function runMetaStats(payload: unknown): Promise<unknown> {
    const mock = installMockEventSource();
    try {
      const promise = getMetaStats("demo", () => {}, () => {});
      const instance = mock.getInstance();
      instance.listeners.result({ data: JSON.stringify(payload) } as MessageEvent);
      return await promise;
    } finally {
      mock.restore();
    }
  }

  it("returns [labels, relationships] entries for a valid response", async () => {
    const result = await runMetaStats({ data: [{ labels: { Person: 5 }, relationships: { KNOWS: 3 } }] });
    assert.deepEqual(result, [[["Person", 5]], [["KNOWS", 3]]]);
  });

  it("returns empty entries when labels/relationships are empty objects", async () => {
    const result = await runMetaStats({ data: [{ labels: {}, relationships: {} }] });
    assert.deepEqual(result, [[], []]);
  });

  it("returns undefined when labels is an array (malformed)", async () => {
    const result = await runMetaStats({ data: [{ labels: [], relationships: {} }] });
    assert.equal(result, undefined);
  });

  it("returns undefined when a metadata field is missing", async () => {
    const result = await runMetaStats({ data: [{ relationships: {} }] });
    assert.equal(result, undefined);
  });

  it("returns undefined for an empty name without opening a connection", async () => {
    const result = await getMetaStats("", () => {}, () => {});
    assert.equal(result, undefined);
  });
});

describe("connection epoch", () => {
  afterEach(() => setActiveConnectionIdGlobal(null));

  it("increments only when switching away from an established connection", () => {
    setActiveConnectionIdGlobal("a"); // null→id establishment → no bump
    const e1 = getConnectionEpoch();
    setActiveConnectionIdGlobal("a"); // same id → no bump
    assert.equal(getConnectionEpoch(), e1);
    setActiveConnectionIdGlobal("b"); // change → bump
    assert.equal(getConnectionEpoch(), e1 + 1);
    setActiveConnectionIdGlobal(null); // change → bump
    assert.equal(getConnectionEpoch(), e1 + 2);
  });

  it("does not bump on the initial null -> id establishment (first page load)", () => {
    setActiveConnectionIdGlobal(null);
    const e0 = getConnectionEpoch();
    setActiveConnectionIdGlobal("a"); // establish → no bump, so the first load isn't discarded
    assert.equal(getConnectionEpoch(), e0);
    setActiveConnectionIdGlobal("b"); // real switch → bump
    assert.equal(getConnectionEpoch(), e0 + 1);
  });

  it("detects A -> B -> A as a change (epoch differs from the first A)", () => {
    setActiveConnectionIdGlobal("a");
    const eA = getConnectionEpoch();
    setActiveConnectionIdGlobal("b");
    setActiveConnectionIdGlobal("a"); // same id as start, but connection was switched
    assert.notEqual(getConnectionEpoch(), eA);
  });
});

describe("abort helpers", () => {
  it("createAbortError produces an AbortError-named error recognized by isAbortError", () => {
    const err = createAbortError();
    assert.equal(err.name, "AbortError");
    assert.equal(isAbortError(err), true);
  });

  it("isAbortError recognizes native AbortError and rejects non-aborts", () => {
    const native = new Error("stop");
    native.name = "AbortError";
    assert.equal(isAbortError(native), true);
    // Real fetch / AbortController aborts reject with a DOMException, which is
    // not an `instanceof Error` in browsers — it must still be recognized.
    assert.equal(isAbortError(new DOMException("Aborted", "AbortError")), true);
    // Any object whose name is "AbortError" (defensive against host differences).
    assert.equal(isAbortError({ name: "AbortError" }), true);
    assert.equal(isAbortError(new Error("boom")), false);
    assert.equal(isAbortError(new DOMException("Timeout", "TimeoutError")), false);
    assert.equal(isAbortError(null), false);
    assert.equal(isAbortError("AbortError"), false);
  });
});

describe("getSSEGraphResult connection routing & cancellation", () => {
  afterEach(() => setActiveConnectionIdGlobal(null));

  it("uses an explicit connectionId in the stream URL instead of the global", async () => {
    const mock = installMockEventSource();
    try {
      setActiveConnectionIdGlobal("global-conn");
      const promise = getSSEGraphResult(
        "api/graph/demo?query=RETURN 1",
        () => {},
        () => {},
        { connectionId: "explicit-conn" },
      );
      const instance = mock.getInstance();
      assert.ok(instance.url.includes("connectionId=explicit-conn"));
      assert.ok(!instance.url.includes("global-conn"));
      instance.listeners.result({ data: JSON.stringify({ ok: true }) } as MessageEvent);
      assert.deepEqual(await promise, { ok: true });
    } finally {
      mock.restore();
    }
  });

  it("rejects with AbortError and never opens a stream when the signal is pre-aborted", async () => {
    const mock = installMockEventSource();
    const controller = new AbortController();
    controller.abort();
    try {
      await assert.rejects(
        getSSEGraphResult("api/graph/demo?query=1", () => {}, () => {}, { signal: controller.signal }),
        (e) => isAbortError(e),
      );
      // EventSource was never constructed.
      assert.throws(() => mock.getInstance());
    } finally {
      mock.restore();
    }
  });

  it("aborting in flight closes the stream, rejects AbortError, and suppresses toasts/indicator", async () => {
    const mock = installMockEventSource();
    const controller = new AbortController();
    const toasts: MockToast[] = [];
    const indicators: string[] = [];
    try {
      const promise = getSSEGraphResult(
        "api/graph/demo?query=1",
        (t) => { toasts.push(t as MockToast); },
        (i) => { indicators.push(i); },
        { signal: controller.signal },
      );
      const instance = mock.getInstance();

      controller.abort();
      assert.equal(instance.closed, true);

      // A late server error event that arrives after abort must not toast.
      instance.listeners.error?.({ data: JSON.stringify({ message: "boom", status: 500 }) } as MessageEvent);

      await assert.rejects(promise, (e) => isAbortError(e));
      assert.equal(toasts.length, 0);
      assert.equal(indicators.length, 0);
    } finally {
      mock.restore();
    }
  });

  it("getMetaStats resolves to undefined (no throw) when its request is aborted", async () => {
    const mock = installMockEventSource();
    const controller = new AbortController();
    controller.abort();
    try {
      const result = await getMetaStats("demo", () => {}, () => {}, false, { signal: controller.signal });
      assert.equal(result, undefined);
    } finally {
      mock.restore();
    }
  });
});

describe("convertToCanvasData", () => {
  it("forwards the per-relationship style dimensions onto the canvas links", () => {
    const link = {
      id: 1,
      relationship: "KNOWS",
      color: "#FF0000",
      visible: true,
      source: { id: 1 },
      target: { id: 2 },
      width: 3,
      fontSize: 18,
      arrowSize: 24,
      data: {},
    };

    const [converted] = convertToCanvasData({
      nodes: [],
      links: [link],
    } as unknown as GraphData).links;

    assert.equal(converted.width, 3);
    assert.equal(converted.fontSize, 18);
    assert.equal(converted.arrowSize, 24);
  });

  it("leaves the dimensions undefined when the relationship has no custom style, so the canvas applies its defaults", () => {
    const link = {
      id: 1,
      relationship: "KNOWS",
      color: "#FF0000",
      visible: true,
      source: { id: 1 },
      target: { id: 2 },
      data: {},
    };

    const [converted] = convertToCanvasData({
      nodes: [],
      links: [link],
    } as unknown as GraphData).links;

    assert.equal(converted.width, undefined);
    assert.equal(converted.fontSize, undefined);
    assert.equal(converted.arrowSize, undefined);
  });

  it("stamps the requested shape on every node, and leaves it to the canvas default when none is asked for", () => {
    const nodes = [
      { id: 1, labels: ["Person"], color: "#FF0000", visible: true, size: 10, expand: false, data: {} },
      { id: 2, labels: ["City"], color: "#00FF00", visible: true, size: 10, expand: false, data: {} },
    ];
    const graphData = { nodes, links: [] } as unknown as GraphData;

    assert.deepEqual(
      convertToCanvasData(graphData, "square").nodes.map(({ shape }) => shape),
      ["square", "square"],
    );
    assert.deepEqual(
      convertToCanvasData(graphData).nodes.map(({ shape }) => shape),
      [undefined, undefined],
    );
  });
});

describe("parsePanelSizePercent", () => {
  it("accepts a stored percentage", () => {
    assert.equal(parsePanelSizePercent("42"), 42);
    assert.equal(parsePanelSizePercent("33.5"), 33.5);
  });

  it("rejects anything that is not a usable percentage, so the caller keeps its default", () => {
    // Nothing stored yet.
    assert.equal(parsePanelSizePercent(null), undefined);
    assert.equal(parsePanelSizePercent(undefined), undefined);
    assert.equal(parsePanelSizePercent(""), undefined);
    // Not JSON at all: this used to throw inside an animation frame, where the
    // failure was swallowed and the panel silently kept the wrong width.
    assert.equal(parsePanelSizePercent("abc"), undefined);
    // Valid JSON, but not a number: would have produced a CSS size of `"30"%`.
    assert.equal(parsePanelSizePercent('"30"'), undefined);
    assert.equal(parsePanelSizePercent("null"), undefined);
    assert.equal(parsePanelSizePercent("[30]"), undefined);
    // A number, but not one a panel can be sized to.
    assert.equal(parsePanelSizePercent("0"), undefined);
    assert.equal(parsePanelSizePercent("-10"), undefined);
    assert.equal(parsePanelSizePercent("1e999"), undefined);
  });
});

type SchemaRow = Record<string, unknown>;

/**
 * Answers every schema query the way the server would, and records what was
 * asked. Unlike `installMockEventSource` this serves each instance: schema
 * discovery has several requests in flight at once.
 */
function installSchemaEventSource(respond: (query: string) => SchemaRow[] | undefined): {
  queries: string[];
  restore: () => void;
} {
  const Original = globalThis.EventSource;
  const queries: string[] = [];

  class MockEventSource {
    listeners: Record<string, (event: MessageEvent) => void> = {};

    onerror: ((event?: unknown) => void) | null = null;

    constructor(url: string) {
      const query = new URL(url, "http://localhost").searchParams.get("query") ?? "";

      queries.push(query);

      // The caller attaches its listeners as soon as the constructor returns,
      // so the answer waits a microtask.
      queueMicrotask(() => {
        this.listeners.result?.({ data: JSON.stringify({ data: respond(query) ?? [] }) } as MessageEvent);
      });
    }

    addEventListener(name: string, listener: (event: MessageEvent) => void) {
      this.listeners[name] = listener;
    }

    close() {}
  }

  globalThis.EventSource = MockEventSource as unknown as typeof EventSource;

  return { queries, restore: () => { globalThis.EventSource = Original; } };
}

const isEdgesQuery = (query: string) => query.startsWith("MATCH (a)-[e]->(b)");
const isLabelsQuery = (query: string) => query.startsWith("CALL db.labels()");
const isNodeKeysQuery = (query: string) => query.includes("UNWIND keys(n)");
const isEdgeKeysQuery = (query: string) => query.includes("UNWIND keys(e)");
const isIndexesQuery = (query: string) => query.startsWith("CALL db.indexes()");
const isConstraintsQuery = (query: string) => query.startsWith("CALL db.constraints()");

describe("getSchema", () => {
  it("returns the placements, the edgeless labels and the sampled property keys", async () => {
    const mock = installSchemaEventSource((query) => {
      if (isEdgesQuery(query)) {
        return [
          // Deliberately unsorted, and with one placement reported twice.
          { source: "Person", relationship: "LIVES_IN", target: "City" },
          { source: "Person", relationship: "KNOWS", target: "Person" },
          { source: "Person", relationship: "KNOWS", target: "Person" },
          // An unlabeled endpoint is folded into the "" label.
          { source: "", relationship: "KNOWS", target: "Person" },
        ];
      }

      // "Company" carries no edge, so only db.labels() knows about it.
      if (isLabelsQuery(query)) return [{ label: "Person" }, { label: "City" }, { label: "Company" }];

      if (isNodeKeysQuery(query)) {
        return [
          { owner: "Person", key: "name", keyType: "String" },
          { owner: "Person", key: "age", keyType: "Integer" },
          // FalkorDB enforces no schema: one key, two types across the sample.
          { owner: "Person", key: "age", keyType: "String" },
          { owner: "City", key: "name", keyType: "String" },
        ];
      }

      if (isEdgeKeysQuery(query)) return [{ owner: "KNOWS", key: "since", keyType: "Integer" }];

      return [];
    });

    try {
      const snapshot = await getSchema("demo", noopToast, noopIndicator);

      assert.deepEqual(snapshot?.edges, [
        { source: "", relationship: "KNOWS", target: "Person" },
        { source: "Person", relationship: "KNOWS", target: "Person" },
        { source: "Person", relationship: "LIVES_IN", target: "City" },
      ]);
      assert.deepEqual(snapshot?.labelKeys, {
        City: { name: "String" },
        Person: { age: "Integer | String", name: "String" },
      });
      assert.deepEqual(snapshot?.relationshipKeys, { KNOWS: { since: "Integer" } });
    } finally {
      mock.restore();
    }
  });

  it("samples keys for every label db.labels() reports plus the unlabeled group, and only for the relationship types that occur", async () => {
    const mock = installSchemaEventSource((query) => {
      if (isEdgesQuery(query)) return [{ source: "Person", relationship: "KNOWS", target: "Person" }];
      if (isLabelsQuery(query)) return [{ label: "Person" }, { label: "Company" }];
      return [];
    });

    try {
      await getSchema("demo", noopToast, noopIndicator);

      const nodeKeysQuery = mock.queries.find(isNodeKeysQuery) ?? "";
      const edgeKeysQuery = mock.queries.find(isEdgeKeysQuery) ?? "";

      assert.ok(nodeKeysQuery.includes("MATCH (n:`Person`)"));
      assert.ok(nodeKeysQuery.includes("MATCH (n:`Company`)"));
      // Nodes with no label are their own group and db.labels() misses them.
      assert.ok(nodeKeysQuery.includes("MATCH (n) WHERE size(labels(n)) = 0"));
      assert.ok(edgeKeysQuery.includes("MATCH ()-[e:`KNOWS`]->()"));
      // Every element scan stops at the sample size.
      assert.ok(nodeKeysQuery.includes("LIMIT 10"));
      assert.ok(edgeKeysQuery.includes("LIMIT 10"));
    } finally {
      mock.restore();
    }
  });

  it("never lets discovery write: every query is read-only", async () => {
    const urls: string[] = [];
    const Original = globalThis.EventSource;

    class RecordingEventSource {
      listeners: Record<string, (event: MessageEvent) => void> = {};

      onerror: ((event?: unknown) => void) | null = null;

      constructor(url: string) {
        urls.push(url);
        queueMicrotask(() => {
          this.listeners.result?.({ data: JSON.stringify({ data: [] }) } as MessageEvent);
        });
      }

      addEventListener(name: string, listener: (event: MessageEvent) => void) {
        this.listeners[name] = listener;
      }

      close() {}
    }

    globalThis.EventSource = RecordingEventSource as unknown as typeof EventSource;

    try {
      await getSchema("demo", noopToast, noopIndicator);

      assert.ok(urls.length > 0);
      urls.forEach((url) => assert.ok(url.includes("readOnly=true"), url));
    } finally {
      globalThis.EventSource = Original;
    }
  });

  it("escapes names so a backtick or a quote cannot break out of the query", async () => {
    const mock = installSchemaEventSource((query) => {
      if (isEdgesQuery(query)) return [{ source: "we`ird", relationship: "O'NEIL", target: "we`ird" }];
      if (isLabelsQuery(query)) return [{ label: "we`ird" }];
      return [];
    });

    try {
      await getSchema("demo", noopToast, noopIndicator);

      const nodeKeysQuery = mock.queries.find(isNodeKeysQuery) ?? "";
      const edgeKeysQuery = mock.queries.find(isEdgeKeysQuery) ?? "";

      // A backtick in a quoted name is doubled, and the literal is quoted too.
      assert.ok(nodeKeysQuery.includes("MATCH (n:`we``ird`)"));
      assert.ok(nodeKeysQuery.includes("'we`ird' AS owner"));
      assert.ok(edgeKeysQuery.includes("MATCH ()-[e:`O'NEIL`]->()"));
      assert.ok(edgeKeysQuery.includes("'O\\'NEIL' AS owner"));
    } finally {
      mock.restore();
    }
  });

  it("splits the key sampling into batches so one query never carries every label", async () => {
    const labels = Array.from({ length: 21 }, (_, i) => ({ label: `Label${i}` }));
    const mock = installSchemaEventSource((query) => {
      if (isEdgesQuery(query)) return [];
      if (isLabelsQuery(query)) return labels;
      return [];
    });

    try {
      await getSchema("demo", noopToast, noopIndicator);

      // 21 labels plus the unlabeled group is 22 owners, batched 20 at a time.
      const batches = mock.queries.filter(isNodeKeysQuery);
      assert.equal(batches.length, 2);
      assert.equal(batches[0].split("UNION").length, 20);
      assert.equal(batches[1].split("UNION").length, 2);
    } finally {
      mock.restore();
    }
  });

  it("asks nothing without a graph name, and gives up on a malformed placement response", async () => {
    const unusedMock = installSchemaEventSource(() => []);

    try {
      assert.equal(await getSchema("", noopToast, noopIndicator), undefined);
      assert.equal(unusedMock.queries.length, 0);
    } finally {
      unusedMock.restore();
    }

    const Original = globalThis.EventSource;

    class MalformedEventSource {
      listeners: Record<string, (event: MessageEvent) => void> = {};

      onerror: ((event?: unknown) => void) | null = null;

      constructor() {
        queueMicrotask(() => {
          this.listeners.result?.({ data: JSON.stringify({ data: "not rows" }) } as MessageEvent);
        });
      }

      addEventListener(name: string, listener: (event: MessageEvent) => void) {
        this.listeners[name] = listener;
      }

      close() {}
    }

    globalThis.EventSource = MalformedEventSource as unknown as typeof EventSource;

    try {
      assert.equal(await getSchema("demo", noopToast, noopIndicator), undefined);
    } finally {
      globalThis.EventSource = Original;
    }
  });

  it("skips rows that are not the shape the view needs instead of drawing garbage", async () => {
    const mock = installSchemaEventSource((query) => {
      if (isEdgesQuery(query)) {
        return [
          { source: "Person", relationship: "KNOWS", target: "Person" },
          // A row per way a response can be wrong.
          { source: "Person", relationship: 7, target: "Person" },
          { source: "Person", target: "Person" },
          ["Person", "KNOWS", "Person"] as unknown as SchemaRow,
        ];
      }

      if (isLabelsQuery(query)) return [{ label: "Person" }, { label: 42 }, {}];

      if (isNodeKeysQuery(query)) {
        return [
          { owner: "Person", key: "name", keyType: "String" },
          { owner: "Person", key: "age" },
          { owner: 1, key: "name", keyType: "String" },
        ];
      }

      return [];
    });

    try {
      const snapshot = await getSchema("demo", noopToast, noopIndicator);

      assert.deepEqual(snapshot?.edges, [{ source: "Person", relationship: "KNOWS", target: "Person" }]);
      assert.deepEqual(snapshot?.labelKeys, { Person: { name: "String" } });
    } finally {
      mock.restore();
    }
  });

  it("reports the indexes and constraints declared on a property, per side", async () => {
    const mock = installSchemaEventSource((query) => {
      if (isEdgesQuery(query)) return [{ source: "Person", relationship: "KNOWS", target: "Person" }];
      if (isLabelsQuery(query)) return [{ label: "Person" }];

      if (isIndexesQuery(query)) {
        return [
          // One property can be covered by more than one index.
          { label: "Person", types: { name: ["RANGE", "FULLTEXT"], bio: ["VECTOR"] }, entitytype: "NODE" },
          { label: "KNOWS", types: { since: ["RANGE"] }, entitytype: "RELATIONSHIP" },
        ];
      }

      if (isConstraintsQuery(query)) {
        return [
          { type: "UNIQUE", label: "Person", properties: ["name"], entitytype: "NODE", status: "OPERATIONAL" },
          // A property can be constrained without being the same one indexed.
          { type: "MANDATORY", label: "Person", properties: ["age"], entitytype: "NODE", status: "OPERATIONAL" },
          { type: "MANDATORY", label: "KNOWS", properties: ["since"], entitytype: "RELATIONSHIP", status: "OPERATIONAL" },
        ];
      }

      return [];
    });

    try {
      const snapshot = await getSchema("demo", noopToast, noopIndicator);

      assert.deepEqual(snapshot?.labelRules, {
        Person: {
          age: { indexes: [], unique: false, mandatory: true },
          bio: { indexes: ["VECTOR"], unique: false, mandatory: false },
          name: { indexes: ["FULLTEXT", "RANGE"], unique: true, mandatory: false },
        },
      });
      assert.deepEqual(snapshot?.relationshipRules, {
        KNOWS: { since: { indexes: ["RANGE"], unique: false, mandatory: true } },
      });
    } finally {
      mock.restore();
    }
  });

  it("promises nothing the graph does not enforce: a constraint that is not operational, or a row it cannot read", async () => {
    const mock = installSchemaEventSource((query) => {
      if (isEdgesQuery(query)) return [{ source: "Person", relationship: "KNOWS", target: "Person" }];
      if (isLabelsQuery(query)) return [{ label: "Person" }];

      if (isIndexesQuery(query)) {
        return [
          // A row per way a response can be wrong.
          { label: "Person", types: { name: ["RANGE"] }, entitytype: "SOMETHING_ELSE" },
          { label: 42, types: { name: ["RANGE"] }, entitytype: "NODE" },
          { label: "Person", types: ["name"], entitytype: "NODE" },
          { label: "Person", types: { name: "RANGE", bio: [7] }, entitytype: "NODE" },
        ];
      }

      if (isConstraintsQuery(query)) {
        return [
          // Not enforced yet, or never will be.
          { type: "UNIQUE", label: "Person", properties: ["email"], entitytype: "NODE", status: "UNDER CONSTRUCTION" },
          { type: "MANDATORY", label: "Person", properties: ["email"], entitytype: "NODE", status: "FAILED" },
          { type: "SOMETHING_ELSE", label: "Person", properties: ["name"], entitytype: "NODE", status: "OPERATIONAL" },
          { type: "UNIQUE", label: "Person", properties: "name", entitytype: "NODE", status: "OPERATIONAL" },
          { type: "UNIQUE", label: "Person", properties: [7], entitytype: "NODE", status: "OPERATIONAL" },
        ];
      }

      return [];
    });

    try {
      const snapshot = await getSchema("demo", noopToast, noopIndicator);

      // The one readable index row says nothing about which types cover the key.
      assert.deepEqual(snapshot?.labelRules, {
        Person: {
          bio: { indexes: [], unique: false, mandatory: false },
          name: { indexes: [], unique: false, mandatory: false },
        },
      });
      assert.deepEqual(snapshot?.relationshipRules, {});
    } finally {
      mock.restore();
    }
  });
});
