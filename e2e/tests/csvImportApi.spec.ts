import { createHmac, randomUUID } from "crypto";
import { existsSync, readdirSync } from "fs";
import path from "path";
import { expect, test } from "../infra/coverage";
import ApiCalls from "../logic/api/apiCalls";
import { getRandomString } from "../infra/utils";

const PEOPLE_CSV = "name,age\nalice,30\nbob,25\ncarol,41\n";
const CREATE_PEOPLE = "CREATE (:Person {name: row.name, age: toInteger(row.age)})";
// Fails inside FalkorDB, so the server keeps the temp file for a retry.
const BROKEN_BODY = "CREATE (:Person {name: row.name";
const INVALID_BODY = "Invalid request body.";
const REQUIRED_FIELDS = "filename and sizeBytes are required.";
const CSV_TEMP_DIR = process.env.CSV_LOCAL_TEMP_DIR;
const SIGNING_SECRET = process.env.CSV_TEMP_SIGNING_SECRET;

// The CI server runs with CSV_STORAGE=local and CSV_LOCAL_LOAD_URI_MODE=file.
test.describe("CSV temp storage and load-csv API", () => {
  let apiCall: ApiCalls;
  let graphs: string[];
  let keys: string[];

  test.beforeEach(async () => {
    apiCall = new ApiCalls();
    graphs = [];
    keys = [];
  });

  // Best-effort, so a cleanup failure never replaces the error that failed the test.
  test.afterEach(async () => {
    await Promise.all([
      ...keys.map((key) => apiCall.deleteCsvTemp(key).catch(() => undefined)),
      ...graphs.map((graph) => apiCall.removeGraph(graph).catch(() => undefined)),
    ]);
  });

  const upload = async (content: string): Promise<string> => {
    const { status, body } = await apiCall.uploadCsvTemp(content);
    expect(status).toBe(201);
    keys.push(body.key);
    return body.key;
  };

  const newGraphName = (): string => {
    const name = getRandomString("csvApi");
    graphs.push(name);
    return name;
  };

  const countNodes = async (graph: string, label: string): Promise<number> => {
    const result = await apiCall.runQuery(graph, `MATCH (n:${label}) RETURN count(n) AS c`);
    return Number(result.data[0].c);
  };

  test("@admin Validate that an uploaded CSV gets a UUID key and can be deleted before it is loaded", async () => {
    const key = await upload(PEOPLE_CSV);
    expect(key).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);

    expect(await apiCall.deleteCsvTemp(key)).toBe(204);

    const { status, body } = await apiCall.loadCsv(newGraphName(), {
      key,
      withHeaders: true,
      body: CREATE_PEOPLE,
    });
    expect(status).toBe(404);
    expect(body.message).toBe("Uploaded CSV not found. Please re-upload and try again.");

    // Deleting is idempotent: a file that is already gone is not an error.
    expect(await apiCall.deleteCsvTemp(key)).toBe(204);
  });

  test("@admin Validate that load-csv imports every CSV row and then consumes the temp file", async () => {
    const graph = newGraphName();
    const key = await upload(PEOPLE_CSV);

    const { status, body } = await apiCall.loadCsv(graph, { key, withHeaders: true, body: CREATE_PEOPLE });
    expect(status).toBe(200);
    expect(body.error).toBeUndefined();
    expect(body.message).toBe("LOAD CSV completed successfully.");

    expect(await countNodes(graph, "Person")).toBe(3);
    const ages = await apiCall.runQuery(graph, "MATCH (n:Person) RETURN sum(n.age) AS total");
    expect(Number(ages.data[0].total)).toBe(96);

    // The file is removed right after the response, so wait for it to disappear.
    await expect
      .poll(async () => (await apiCall.loadCsv(graph, { key, withHeaders: true, body: BROKEN_BODY })).status)
      .toBe(404);
  });

  test("@admin Validate that load-csv without headers treats the first line as a row", async () => {
    const graph = newGraphName();
    const key = await upload(PEOPLE_CSV);

    const { status, body } = await apiCall.loadCsv(graph, {
      key,
      withHeaders: false,
      body: "CREATE (:Row {first: row[0]})",
    });
    expect(status).toBe(200);
    expect(body.error).toBeUndefined();

    expect(await countNodes(graph, "Row")).toBe(4);
    const header = await apiCall.runQuery(graph, "MATCH (n:Row {first: 'name'}) RETURN count(n) AS c");
    expect(Number(header.data[0].c)).toBe(1);
  });

  test("@admin Validate that a failed load-csv query keeps the temp file so the import can be retried", async () => {
    const graph = newGraphName();
    const key = await upload(PEOPLE_CSV);

    const failed = await apiCall.loadCsv(graph, { key, withHeaders: true, body: BROKEN_BODY });
    expect(failed.status).toBe(200);
    expect(failed.body.error.status).toBe(422);
    expect(failed.body.error.message).toBeTruthy();
    expect(failed.body.message).toBeUndefined();

    const retried = await apiCall.loadCsv(graph, { key, withHeaders: true, body: CREATE_PEOPLE });
    expect(retried.status).toBe(200);
    expect(retried.body.message).toBe("LOAD CSV completed successfully.");
    expect(await countNodes(graph, "Person")).toBe(3);
  });

  const invalidLoadBodies: { name: string; data: (key: string) => unknown; message: string }[] = [
    { name: "malformed JSON", data: () => "{not json", message: "Invalid request body." },
    { name: "missing key", data: () => ({ body: CREATE_PEOPLE }), message: "key and a query body are required." },
    { name: "missing body", data: (key) => ({ key }), message: "key and a query body are required." },
    { name: "blank body", data: (key) => ({ key, body: "   " }), message: "key and a query body are required." },
    { name: "non-string key", data: () => ({ key: 7, body: CREATE_PEOPLE }), message: "key and a query body are required." },
    {
      name: "non-boolean withHeaders",
      data: (key) => ({ key, withHeaders: "yes", body: CREATE_PEOPLE }),
      message: "withHeaders must be a boolean.",
    },
    { name: "key that is not a UUID", data: () => ({ key: "../etc/passwd", body: CREATE_PEOPLE }), message: "Invalid key." },
    {
      name: "own LOAD CSV clause",
      data: (key) => ({ key, body: "LOAD CSV FROM 'file:///etc/passwd' AS r CREATE (:X)" }),
      message: "The query must not contain its own LOAD CSV clause.",
    },
  ];

  for (const { name, data, message } of invalidLoadBodies) {
    test(`@admin Validate that load-csv rejects a request with ${name} with 400`, async () => {
      const graph = newGraphName();

      const { status, body } = await apiCall.loadCsv(graph, data(randomUUID()));

      expect(status).toBe(400);
      expect(body.message).toBe(message);
      expect(await apiCall.getGraphs().then((result) => result.opts)).not.toContain(graph);
    });
  }

  test("@admin Validate that load-csv answers 404 for a well-formed key that was never uploaded", async () => {
    const graph = newGraphName();

    const { status, body } = await apiCall.loadCsv(graph, {
      key: randomUUID(),
      withHeaders: true,
      body: CREATE_PEOPLE,
    });

    expect(status).toBe(404);
    expect(body.message).toBe("Uploaded CSV not found. Please re-upload and try again.");
    expect(await apiCall.getGraphs().then((result) => result.opts)).not.toContain(graph);
  });

  test("@admin Validate that deleting a temp CSV with an invalid key is rejected with 400", async () => {
    expect(await apiCall.deleteCsvTemp("not-a-uuid")).toBe(400);
  });

  test("@admin Validate that upload rejects a file that is not a .csv with 400", async () => {
    const { status, body } = await apiCall.uploadCsvTemp(PEOPLE_CSV, "people.txt");

    expect(status).toBe(400);
    expect(body.message).toBe("Only .csv files are accepted.");
    expect(body.key).toBeUndefined();
  });

  test("@admin Validate that upload rejects an empty file with 400", async () => {
    const { status, body } = await apiCall.uploadCsvTemp("");

    expect(status).toBe(400);
    expect(body.message).toBe("The file is empty.");
  });

  test("@admin Validate that upload rejects binary content with 400", async () => {
    const { status, body } = await apiCall.uploadCsvTemp(Buffer.from([0x50, 0x4b, 0x00, 0x03, 0x04]));

    expect(status).toBe(400);
    expect(body.message).toContain("binary data");
  });

  // The serve endpoint takes no session: only a URL signed by the server (owner `o` + token `t`) works.
  const unsignedServeRequests: { name: string; query: string }[] = [
    { name: "no signature", query: "" },
    { name: "an owner that is not 32 hex characters", query: "?o=nope&t=123.abc" },
  ];

  for (const { name, query } of unsignedServeRequests) {
    test(`@admin Validate that serving an uploaded CSV with ${name} is refused with 404`, async () => {
      const key = await upload(PEOPLE_CSV);

      const { status, body } = await apiCall.getCsvTemp(key, query);

      expect(status).toBe(404);
      expect(body).toBe("Not found.");
    });
  }

  test("@admin Validate that serving a key that is not a UUID is refused with 404", async () => {
    const { status, body } = await apiCall.getCsvTemp("not-a-uuid", "?o=nope&t=123.abc");

    expect(status).toBe(404);
    expect(body).toBe("Not found.");
  });

  // These need the real owner directory and the server's signing secret, which only CI shares with the tests.
  test.describe("signed serve endpoint", () => {
    test.skip(
      !CSV_TEMP_DIR || !SIGNING_SECRET,
      "needs CI CSV temp dir and signing secret"
    );

    // The local storage keeps each file at <CSV_LOCAL_TEMP_DIR>/falkordb-browser-csv-temp/<owner>/<key>.csv.
    const findOwner = (key: string): string => {
      const base = path.join(CSV_TEMP_DIR!, "falkordb-browser-csv-temp");
      const owner = readdirSync(base, { withFileTypes: true }).find(
        (entry) => entry.isDirectory() && existsSync(path.join(base, entry.name, `${key}.csv`))
      )?.name;
      expect(owner, `no owner directory holds ${key}.csv under ${base}`).toBeDefined();
      return owner!;
    };

    const signature = (owner: string, key: string, expMs: number): string =>
      createHmac("sha256", SIGNING_SECRET!)
        .update(`csv-cap:${owner}.${key}.${expMs}`)
        .digest("hex")
        .slice(0, 32);

    const validQuery = (owner: string, key: string, expMs: number): string =>
      `?o=${owner}&t=${expMs}.${signature(owner, key, expMs)}`;

    const futureMs = (): number => Date.now() + 10 * 60 * 1000;

    test("@admin Validate that a correctly signed URL serves the uploaded CSV", async () => {
      const key = await upload(PEOPLE_CSV);
      const owner = findOwner(key);

      const { status, body } = await apiCall.getCsvTemp(key, validQuery(owner, key, futureMs()));

      expect(status).toBe(200);
      expect(body).toBe(PEOPLE_CSV);
    });

    const refusedSignedRequests: { name: string; query: (owner: string, key: string) => string }[] = [
      { name: "an owner but no token", query: (owner) => `?o=${owner}` },
      { name: "a token without an expiry", query: (owner) => `?o=${owner}&t=deadbeef` },
      { name: "a forged signature", query: (owner) => `?o=${owner}&t=${futureMs()}.${"0".repeat(32)}` },
      {
        name: "a tampered signature",
        query: (owner, key) => {
          const expMs = futureMs();
          const sig = signature(owner, key, expMs);
          return `?o=${owner}&t=${expMs}.${sig.slice(0, -1)}${sig.endsWith("0") ? "1" : "0"}`;
        },
      },
      {
        name: "a tampered expiry",
        query: (owner, key) => {
          const expMs = futureMs();
          return `?o=${owner}&t=${expMs + 1}.${signature(owner, key, expMs)}`;
        },
      },
      {
        name: "an expired token",
        query: (owner, key) => validQuery(owner, key, Date.now() - 1000),
      },
    ];

    for (const { name, query } of refusedSignedRequests) {
      test(`@admin Validate that serving an uploaded CSV with ${name} is refused with 404`, async () => {
        const key = await upload(PEOPLE_CSV);
        const owner = findOwner(key);

        const { status, body } = await apiCall.getCsvTemp(key, query(owner, key));

        expect(status).toBe(404);
        expect(body).toBe("Not found.");
      });
    }
  });

  const invalidDirectBodies: { name: string; data: unknown; message: string }[] = [
    { name: "malformed JSON", data: "{not json", message: INVALID_BODY },
    { name: "a JSON array", data: [], message: REQUIRED_FIELDS },
    { name: "a null body", data: "null", message: REQUIRED_FIELDS },
    { name: "no filename", data: { sizeBytes: 10 }, message: REQUIRED_FIELDS },
    { name: "a blank filename", data: { filename: "  ", sizeBytes: 10 }, message: REQUIRED_FIELDS },
    { name: "no size", data: { filename: "a.csv" }, message: REQUIRED_FIELDS },
    { name: "a zero size", data: { filename: "a.csv", sizeBytes: 0 }, message: REQUIRED_FIELDS },
    { name: "a non-numeric size", data: { filename: "a.csv", sizeBytes: "10" }, message: REQUIRED_FIELDS },
    { name: "a non-string content type", data: { filename: "a.csv", sizeBytes: 10, contentType: 5 }, message: REQUIRED_FIELDS },
  ];

  for (const { name, data, message } of invalidDirectBodies) {
    test(`@admin Validate that a direct upload request with ${name} is rejected with 400`, async () => {
      const { status, body } = await apiCall.requestCsvDirectUpload(data);

      expect(status).toBe(400);
      expect(body.message).toBe(message);
    });
  }

  test("@admin Validate that a direct upload request above the size limit is rejected with 413", async () => {
    const { status, body } = await apiCall.requestCsvDirectUpload({ filename: "big.csv", sizeBytes: 1e15 });

    expect(status).toBe(413);
    expect(body.message).toMatch(/exceeds the \d+ MB limit/);
  });

  test("@admin Validate that a direct upload request is refused for local CSV storage with 409", async () => {
    const { status, body } = await apiCall.requestCsvDirectUpload({ filename: "a.csv", sizeBytes: 10 });

    expect(status).toBe(409);
    expect(body.message).toBe("Direct upload is not enabled for local CSV storage.");
  });
});
