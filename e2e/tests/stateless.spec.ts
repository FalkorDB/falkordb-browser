import { expect, test, type APIRequestContext } from "@playwright/test";
import { FalkorDB } from "falkordb";
import urls from "../config/urls.json";
import BrowserWrapper from "../infra/ui/browserWrapper";
import LoginPage from "../logic/POM/loginPage";

// Runs against a server started with SERVER_STATE=stateless (see the
// "Run stateless tests" job in .github/workflows/playwright.yml), on a
// FalkorDB that nothing else uses: every client on it other than the test's
// own is one the browser server opened, so they can be counted.

const DB = { host: "localhost", port: 6379 };

/** The test's own connection to FalkorDB, for watching the server's clients. */
let db: FalkorDB;
let ownId: number;

async function command<T>(args: string[]): Promise<T> {
  return (await db.connection).sendCommand<T>(args);
}

/** How many clients the browser server holds open on FalkorDB right now. */
async function serverClients(): Promise<number> {
  const list = await command<string>(["CLIENT", "LIST"]);
  return list
    .split("\n")
    .map((line) => /(?:^|\s)id=(\d+)/.exec(line)?.[1])
    .filter((id) => id !== undefined && Number(id) !== ownId).length;
}

/** Connections FalkorDB has accepted since it started. */
async function connectionsReceived(): Promise<number> {
  const info = await command<string>(["INFO", "stats"]);
  return Number(/total_connections_received:(\d+)/.exec(info)?.[1]);
}

/** Waits for the server to hold `count` clients, by default none at all. */
async function expectServerClients(count = 0) {
  await expect.poll(serverClients, { timeout: 15000 }).toBe(count);
}

test.describe("Stateless server (SERVER_STATE=stateless)", () => {
  let browser: BrowserWrapper;

  test.beforeAll(async () => {
    db = await FalkorDB.connect({ socket: DB });
    ownId = await command<number>(["CLIENT", "ID"]);
  });

  test.afterAll(async () => {
    await db.close();
  });

  test.beforeEach(async () => {
    browser = new BrowserWrapper();
  });

  test.afterEach(async () => {
    await browser.closeBrowser();
  });

  /**
   * Signs in through the login page and returns the signed-in request context.
   * The page is closed first, so its background polling doesn't open
   * connections while the test counts them.
   */
  async function signIn(): Promise<APIRequestContext> {
    const loginPage = await browser.createNewPage(LoginPage, urls.loginUrl);
    await loginPage.fillHost(DB.host);
    await loginPage.fillPort(String(DB.port));
    await loginPage.clickConnect();
    await loginPage.waitForSuccessfulLogin(urls.graphUrl);
    const context = browser.getContext();
    if (!context) throw new Error("No browser context after sign-in");
    await browser.closePage();
    return context.request;
  }

  test("@stateless Signing in leaves no connection open", async () => {
    await signIn();
    await expectServerClients();
  });

  test("@stateless Each request opens its own connection and closes it", async () => {
    const request = await signIn();
    await expectServerClients();

    const before = await connectionsReceived();
    const graph = `stateless_${Date.now()}`;
    const requests = 4;

    // One after another, so a cached client would be reused across them.
    const list = await request.get(`${urls.api.graphUrl}`);
    expect(list.status()).toBe(200);

    // A streamed (SSE) response: the client must outlive the handler's return
    // and stay open until the stream ends, or the query can't finish.
    const create = await request.get(`${urls.api.graphUrl}${graph}?query=${encodeURIComponent("CREATE (:Stateless {n: 1})")}`);
    expect(create.status()).toBe(200);
    expect(await create.text()).toContain("event: result");

    const read = await request.get(`${urls.api.graphUrl}${graph}?query=${encodeURIComponent("MATCH (n:Stateless) RETURN n.n AS n")}`);
    expect(await read.text()).toMatch(/event: result[\s\S]*"n":1/);

    const remove = await request.delete(`${urls.api.graphUrl}${graph}`);
    expect(remove.status()).toBe(200);

    expect(await connectionsReceived() - before).toBeGreaterThanOrEqual(requests);
    await expectServerClients();
  });

  test("@stateless Concurrent requests for one connection all succeed", async () => {
    const request = await signIn();

    const responses = await Promise.all(
      Array.from({ length: 10 }, () => request.get(`${urls.api.graphUrl}`))
    );
    responses.forEach((response) => expect(response.status()).toBe(200));

    await expectServerClients();
  });

  test("@stateless Abandoned requests don't leave connections open", async () => {
    const request = await signIn();
    const before = await connectionsReceived();

    // A timeout this short gives up on each request while the server is still
    // connecting, which closes the client from under it.
    const responses = await Promise.all(
      Array.from({ length: 10 }, () => request.get(`${urls.api.graphUrl}`, { timeout: 5 }).catch(() => undefined))
    );
    expect(responses.filter((response) => response === undefined).length).toBeGreaterThan(0);
    // Each request that got through opened a connection; one more shows an abandoned
    // request reached FalkorDB too, so the cleanup below is really exercised.
    const succeeded = responses.filter((response) => response !== undefined).length;
    await expect.poll(connectionsReceived, { timeout: 15000 }).toBeGreaterThan(before + succeeded);

    await expectServerClients();
    expect((await request.get(`${urls.api.graphUrl}`)).status()).toBe(200);
    await expectServerClients();
  });

  // Not specific to stateless mode: the route never caches its probe client.
  // Compared with the clients held before it, so it checks this route alone.
  test("@stateless Validating a URL closes its probe connection", async ({ request }) => {
    const held = await serverClients();
    const before = await connectionsReceived();

    const response = await request.post(`${urls.localHost}/api/validate-url`, {
      data: { url: `falkor://${DB.host}:${DB.port}` },
    });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ result: false });

    expect(await connectionsReceived()).toBeGreaterThan(before);
    await expectServerClients(held);
  });
});
