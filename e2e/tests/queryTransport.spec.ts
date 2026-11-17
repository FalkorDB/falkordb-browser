import { expect, test } from "../infra/coverage";
import urls from "../config/urls.json";
import type { APIRequestContext } from "@playwright/test";
import { getSSEGraphResult } from "../logic/api/apiCalls";

/** Signs `request` in to the local FalkorDB and returns the post-login redirect URL. */
async function signIn(request: APIRequestContext, callbackUrl: string): Promise<string> {
  const csrf = await (await request.get("/api/auth/csrf")).json();
  const login = await request.post("/api/auth/callback/credentials", {
    headers: { "X-Auth-Return-Redirect": "1" },
    form: {
      csrfToken: csrf.csrfToken, callbackUrl,
      host: "localhost", port: "6379", username: "", password: "", tls: "false",
    },
  });
  expect(login.ok()).toBe(true);
  return (await login.json()).url;
}

async function signOut(request: APIRequestContext): Promise<void> {
  const csrf = await (await request.get("/api/auth/csrf")).json();
  expect((await request.post("/api/auth/signout", { form: { csrfToken: csrf.csrfToken } })).ok()).toBe(true);
}

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
    const anonymous = await request.get(`/api/graph/${graph}`, { params: { query: "RETURN 1" } });
    const anonymousEvent = await anonymous.text();
    expect(anonymousEvent).toContain("event: error");
    expect(JSON.parse(anonymousEvent.split("data: ")[1])).toMatchObject({ message: "Not authenticated", status: 401 });

    expect(await signIn(request, "graph")).toBe(`${origin}/graph`);

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
    const emptyBody = await request.post(`/api/graph/${graph}`, {
      headers: { "Content-Type": "application/json" },
    });
    expect(emptyBody.status()).toBe(200);
    expect(await emptyBody.json()).toEqual({ message: "Graph created successfully" });
    const whitespaceBody = await request.post(`/api/graph/${graph}`, {
      headers: { "Content-Type": "application/json" },
      data: Buffer.from(" \n"),
    });
    expect(whitespaceBody.status()).toBe(200);
    const malformedBody = await request.post(`/api/graph/${graph}`, {
      headers: { "Content-Type": "application/json" },
      data: Buffer.from("{"),
    });
    expect(malformedBody.status()).toBe(400);
    const nonStringQuery = await request.post(`/api/graph/${graph}`, { data: { query: 1 } });
    expect(nonStringQuery.status()).toBe(400);
    expect((await nonStringQuery.json()).message).toBe("Invalid parameter query");
    for (const [data, message] of [
      [{ query: "" }, "Missing parameter query"],
      [{ query: "RETURN 1", timeout: "soon" }, "Invalid parameter timeout"],
    ] as const) {
      const invalidInput = await (await request.post(`/api/graph/${graph}`, { data })).text();
      expect(invalidInput).toContain("event: error");
      expect(JSON.parse(invalidInput.split("data: ")[1])).toEqual({ message, status: 400 });
    }
    const profile = await request.post(`/api/graph/${graph}/profile?readOnly=true`, {
      data: { query: "CREATE (:Forbidden)", timeout: 1 },
    });
    expect(profile.status()).toBe(403);
    const writeProfile = await request.post(`/api/graph/${graph}/profile`, {
      data: { query: "CREATE (:Forbidden)" },
    });
    expect(writeProfile.status()).toBe(400);
    expect((await writeProfile.json()).message).toContain("Profile only supports valid read-only Cypher queries");
    const readProfile = await request.post(`/api/graph/${graph}/profile`, {
      data: { query: "RETURN 1" },
    });
    expect(readProfile.status()).toBe(200);
    expect((await readProfile.json()).result.length).toBeGreaterThan(0);
    const textProfile = await request.post(`/api/graph/${graph}/profile`, {
      headers: { "Content-Type": "text/plain" },
      data: "RETURN 1",
    });
    expect(textProfile.status()).toBe(415);
    const malformedProfile = await request.post(`/api/graph/${graph}/profile`, {
      headers: { "Content-Type": "application/json" },
      data: Buffer.from("{"),
    });
    expect(malformedProfile.status()).toBe(400);
    expect((await malformedProfile.json()).message).toBe("Invalid JSON");
    const missingQuery = await request.post(`/api/graph/${graph}/profile`, { data: { query: "" } });
    expect(missingQuery.status()).toBe(400);
    expect((await missingQuery.json()).message).toBe("Missing parameter query");
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
        await signOut(request);
      } finally {
        await request.dispose();
      }
    }
  }
});

test("@admin Sign-in redirects stay on the application origin", async ({ playwright }) => {
  const origin = new URL(urls.loginUrl).origin;
  for (const callbackUrl of ["https://untrusted.example/graph", "http://["]) {
    const request = await playwright.request.newContext({
      baseURL: origin, storageState: { cookies: [], origins: [] },
      extraHTTPHeaders: { Origin: origin },
    });
    try {
      expect(new URL(await signIn(request, callbackUrl)).origin).toBe(origin);
      await signOut(request);
    } finally {
      await request.dispose();
    }
  }
});
