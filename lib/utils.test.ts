import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { getMetaStats, getSSEGraphResult, securedFetch, setActiveConnectionIdGlobal } from "./utils.ts";

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
