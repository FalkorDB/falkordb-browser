import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { setActiveConnectionIdGlobal, uploadFileWithProgress, type ToastFn } from "./utils.ts";

class FakeXMLHttpRequest {
  static latest: FakeXMLHttpRequest;
  upload: { onprogress?: (event: { lengthComputable: boolean; loaded: number; total: number }) => void } = {};
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;
  ontimeout: (() => void) | null = null;
  method = "";
  url = "";
  headers = new Headers();
  responseHeaders = new Headers();
  body?: FormData;
  status = 0;
  responseText = "";
  abortCount = 0;

  constructor() { FakeXMLHttpRequest.latest = this; }
  open(method: string, url: string) { this.method = method; this.url = url; }
  setRequestHeader(name: string, value: string) { this.headers.set(name, value); }
  getResponseHeader(name: string) { return this.responseHeaders.get(name); }
  send(body: FormData) { this.body = body; }
  abort() { this.abortCount += 1; this.onabort?.(); }
}

const originalXHR = Object.getOwnPropertyDescriptor(globalThis, "XMLHttpRequest");
const file = () => new File(["name\nAlice\n"], "people.csv", { type: "text/csv" });

beforeEach(() => {
  Object.defineProperty(globalThis, "XMLHttpRequest", { configurable: true, value: FakeXMLHttpRequest });
});

afterEach(() => {
  if (originalXHR) Object.defineProperty(globalThis, "XMLHttpRequest", originalXHR);
  else Reflect.deleteProperty(globalThis, "XMLHttpRequest");
  setActiveConnectionIdGlobal(null);
});

describe("uploadFileWithProgress", () => {
  it("pins the connection, sends the file and reports computable progress", async () => {
    setActiveConnectionIdGlobal("connection-1");
    const indicators: string[] = [];
    const progress: number[] = [];
    const toasts: Parameters<ToastFn>[0][] = [];
    const result = uploadFileWithProgress("api/upload", file(), (toast) => toasts.push(toast), (value) => indicators.push(value), (value) => progress.push(value));
    const xhr = FakeXMLHttpRequest.latest;

    assert.equal(xhr.method, "POST");
    assert.equal(xhr.url, "/api/upload");
    assert.equal(xhr.headers.get("X-Connection-Id"), "connection-1");
    const sentFile = xhr.body?.get("file");
    assert.ok(sentFile instanceof File);
    assert.equal(sentFile.name, "people.csv");
    assert.equal(await sentFile.text(), "name\nAlice\n");

    xhr.upload.onprogress?.({ lengthComputable: false, loaded: 1, total: 3 });
    xhr.upload.onprogress?.({ lengthComputable: true, loaded: 1, total: 3 });
    xhr.status = 201;
    xhr.responseText = '{"id":"file-1"}';
    xhr.onload?.();

    assert.deepEqual(await result, { ok: true, status: 201, body: '{"id":"file-1"}' });
    assert.deepEqual(progress, [33]);
    assert.deepEqual(indicators, ["online"]);
    assert.deepEqual(toasts, []);
  });

  it("returns HTTP failures with a helpful toast and marks server failures offline", async () => {
    for (const [status, expectedIndicators] of [[400, []], [401, ["offline"]], [503, ["offline"]]] as const) {
      const indicators: string[] = [];
      const toasts: Parameters<ToastFn>[0][] = [];
      const result = uploadFileWithProgress("/api/upload", file(), (toast) => toasts.push(toast), (value) => indicators.push(value));
      const xhr = FakeXMLHttpRequest.latest;
      assert.equal(xhr.headers.has("X-Connection-Id"), false);
      xhr.status = status;
      xhr.responseText = '{"message":"Upload rejected"}';
      xhr.onload?.();

      assert.deepEqual(await result, { ok: false, status, body: '{"message":"Upload rejected"}' });
      assert.equal(toasts.length, 1);
      assert.equal(toasts[0].variant, "destructive");
      assert.equal(toasts[0].rawMessage, "Upload rejected");
      assert.deepEqual(indicators, expectedIndicators);
    }
  });

  it("reports network errors and timeouts", async () => {
    for (const [event, description] of [
      ["onerror", "Network error while uploading the file. Please try again."],
      ["ontimeout", "Upload timed out. Please try again."],
    ] as const) {
      const indicators: string[] = [];
      const toasts: Parameters<ToastFn>[0][] = [];
      const result = uploadFileWithProgress("/api/upload", file(), (toast) => toasts.push(toast), (value) => indicators.push(value));
      FakeXMLHttpRequest.latest[event]?.();
      assert.deepEqual(await result, { ok: false, status: 0, body: "" });
      assert.equal(toasts[0].description, description);
      assert.deepEqual(indicators, ["offline"]);
    }
  });

  it("cancels a pending upload without reporting an outage", async () => {
    const controller = new AbortController();
    const indicators: string[] = [];
    const toasts: Parameters<ToastFn>[0][] = [];
    const result = uploadFileWithProgress("/api/upload", file(), (toast) => toasts.push(toast), (value) => indicators.push(value), undefined, controller.signal);
    controller.abort();
    assert.deepEqual(await result, { ok: false, status: 0, body: "" });
    assert.deepEqual(toasts, []);
    assert.deepEqual(indicators, []);
  });

  it("detaches cancellation after the upload finishes", async () => {
    const controller = new AbortController();
    const result = uploadFileWithProgress("/api/upload", file(), () => {}, () => {}, undefined, controller.signal);
    const xhr = FakeXMLHttpRequest.latest;
    xhr.status = 200;
    xhr.onload?.();
    assert.deepEqual(await result, { ok: true, status: 200, body: "" });
    controller.abort();
    assert.equal(xhr.abortCount, 0);
  });

  it("does not start an already cancelled upload", async () => {
    const controller = new AbortController();
    controller.abort();
    let constructed = false;
    Object.defineProperty(globalThis, "XMLHttpRequest", {
      configurable: true,
      value: class { constructor() { constructed = true; } },
    });
    const result = await uploadFileWithProgress(
      "/api/upload", file(), () => assert.fail("unexpected toast"), () => assert.fail("unexpected indicator"), undefined, controller.signal,
    );
    assert.deepEqual(result, { ok: false, status: 0, body: "" });
    assert.equal(constructed, false);
  });
});
