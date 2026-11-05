import { expect, test } from "@playwright/test";
import urls from "../config/urls.json";
import { getSSEGraphResult } from "../logic/api/apiCalls";

test("@admin Query helper preserves non-SSE JSON authentication errors", async () => {
  const origin = new URL(urls.loginUrl).origin;
  await expect(getSSEGraphResult(`${origin}/api/graph/unauthenticated?query=RETURN%201`, {
    Cookie: "",
  })).rejects.toThrow("Not authenticated");
});

test("@admin Query transports enforce read-only profiling and preserve SSE errors", async ({ playwright }) => {
  const origin = new URL(urls.loginUrl).origin;
  const request = await playwright.request.newContext({
    baseURL: origin, storageState: { cookies: [], origins: [] },
    extraHTTPHeaders: { Origin: origin },
  });
  const graph = `transport_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  let created = false;
  try {
    const csrf = await (await request.get("/api/auth/csrf")).json();
    const login = await request.post("/api/auth/callback/credentials", {
      headers: { "X-Auth-Return-Redirect": "1" },
      form: {
        csrfToken: csrf.csrfToken, callbackUrl: "graph",
        host: "localhost", port: "6379", username: "", password: "", tls: "false",
      },
    });
    expect(login.ok()).toBe(true);
    expect((await login.json()).url).toBe(`${origin}/graph`);

    const preflight = await request.fetch(`/api/graph/${graph}/profile`, {
      method: "OPTIONS",
      headers: {
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type,x-connection-id",
      },
    });
    expect(preflight.status()).toBe(204);
    expect(preflight.headers()["access-control-allow-origin"]).toBe(origin);
    expect(preflight.headers()["access-control-allow-headers"]).toContain("X-Connection-Id");

    expect((await request.post(`/api/graph/${graph}`)).ok()).toBe(true);
    created = true;
    const profile = await request.post(`/api/graph/${graph}/profile?readOnly=true`, {
      data: { query: "CREATE (:Forbidden)", timeout: 1 },
    });
    expect(profile.status()).toBe(403);
    const readOnly = await request.get(`/api/graph/${graph}`, {
      params: { query: "CREATE (:Forbidden)", timeout: 1 },
    });
    const readOnlyEvent = await readOnly.text();
    expect(readOnlyEvent).toContain("event: error");
    expect(JSON.parse(readOnlyEvent.split("data: ")[1]).status).toBe(400);

    const invalidQuery = await request.post(`/api/graph/${graph}`, {
      data: { query: "MATCH (", timeout: 1 },
    });
    const invalidQueryEvent = await invalidQuery.text();
    expect(invalidQueryEvent).toContain("event: error");
    expect(JSON.parse(invalidQueryEvent.split("data: ")[1]).status).toBe(400);

    const write = await request.post(`/api/graph/${graph}`, {
      data: { query: "CREATE (:Allowed)", timeout: 1 },
    });
    expect(await write.text()).toContain("event: result");
    const read = await request.post(`/api/graph/${graph}?readOnly=true`, {
      data: { query: "MATCH (n) RETURN labels(n) AS labels", timeout: 1 },
    });
    const event = (await read.text()).split("data: ")[1];
    expect(JSON.parse(event).data).toEqual([{ labels: ["Allowed"] }]);

    const rejected = await request.post(`/api/graph/${graph}`, {
      headers: { Origin: "https://untrusted.example", "Sec-Fetch-Site": "same-origin" },
      data: { query: "CREATE (:Forbidden)", timeout: 1 },
    });
    expect(rejected.status()).toBe(400);
  } finally {
    try {
      if (created) expect((await request.delete(`/api/graph/${graph}`)).ok()).toBe(true);
    } finally {
      try {
        const csrf = await (await request.get("/api/auth/csrf")).json();
        expect((await request.post("/api/auth/signout", { form: { csrfToken: csrf.csrfToken } })).ok()).toBe(true);
      } finally {
        await request.dispose();
      }
    }
  }
});
