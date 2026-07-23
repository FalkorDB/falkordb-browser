import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createAbortError, fetchOptions, getConnectionEpoch, getMetaStats, getSSEGraphResult, isAbortError, securedFetch, setActiveConnectionIdGlobal } from "./utils.ts";

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

  describe("fetchOptions", () => {
    it("returns graph metadata from /api/graph when present", async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = (async () =>
        new Response(JSON.stringify({
          opts: ["g1", "g2"],
          graphs: [{ name: "g1", type: "active", nodes: 1, edges: 2 }],
        }), { status: 200, headers: { "Content-Type": "application/json" } })) as typeof fetch;

      try {
        const result = await fetchOptions(noopToast, noopIndicator, "online");
        assert.deepEqual(result, {
          opts: ["g1", "g2"],
          graphs: [{ name: "g1", type: "active", nodes: 1, edges: 2 }],
          autoSelect: null,
        });
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it("falls back to active graph entries when metadata is missing", async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = (async () =>
        new Response(JSON.stringify({ opts: ["solo"] }), { status: 200, headers: { "Content-Type": "application/json" } })) as typeof fetch;

      try {
        const result = await fetchOptions(noopToast, noopIndicator, "online");
        assert.deepEqual(result, {
          opts: ["solo"],
          graphs: [{ name: "solo", type: "active", nodes: null, edges: null }],
          autoSelect: "solo",
        });
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
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
