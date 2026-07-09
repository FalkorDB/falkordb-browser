import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { getSSEGraphResult, securedFetch, setActiveConnectionIdGlobal } from "./utils.ts";

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
