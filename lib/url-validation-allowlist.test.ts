import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getDatabaseUrlEndpoint,
  isDatabaseEndpointAllowed,
  parseAllowedDatabaseEndpoints,
} from "./url-validation-allowlist.ts";

describe("URL validation database host allowlist", () => {
  it("fails closed when no endpoints are configured", () => {
    assert.deepEqual(parseAllowedDatabaseEndpoints(undefined), { status: "unconfigured" });
    assert.deepEqual(parseAllowedDatabaseEndpoints(" , "), { status: "unconfigured" });
  });

  it("normalizes exact hostnames and IPv6 endpoints", () => {
    const config = parseAllowedDatabaseEndpoints(" DB.Example.com.:6379,[::1]:6379 ");
    assert.equal(config.status, "configured");
    if (config.status !== "configured") return;

    assert.equal(isDatabaseEndpointAllowed({ hostname: "db.example.com", port: 6379 }, config.endpoints), true);
    assert.equal(isDatabaseEndpointAllowed({ hostname: "[::1]", port: 6379 }, config.endpoints), true);
  });

  it("requires a port and rejects malformed entries, schemes, and wildcards", () => {
    assert.deepEqual(
      parseAllowedDatabaseEndpoints("db.example.com"),
      { status: "invalid", entries: ["db.example.com"] },
    );
    assert.deepEqual(
      parseAllowedDatabaseEndpoints("*.example.com:6379"),
      { status: "invalid", entries: ["*.example.com:6379"] },
    );
    assert.deepEqual(
      parseAllowedDatabaseEndpoints("https://db.example.com:6379"),
      { status: "invalid", entries: ["https://db.example.com:6379"] },
    );
  });

  it("matches exact hostname and port, not suffixes or other ports", () => {
    const config = parseAllowedDatabaseEndpoints("db.example.com:6379");
    assert.equal(config.status, "configured");
    if (config.status !== "configured") return;

    assert.equal(isDatabaseEndpointAllowed({ hostname: "db.example.com", port: 6379 }, config.endpoints), true);
    assert.equal(isDatabaseEndpointAllowed({ hostname: "db.example.com", port: 6380 }, config.endpoints), false);
    assert.equal(isDatabaseEndpointAllowed({ hostname: "attacker-db.example.com", port: 6379 }, config.endpoints), false);
    assert.equal(isDatabaseEndpointAllowed({ hostname: "db.example.com.attacker.test", port: 6379 }, config.endpoints), false);
  });

  it("extracts supported database endpoints and their effective default port", () => {
    assert.deepEqual(getDatabaseUrlEndpoint("falkor://DB.Example.com:6379"), { hostname: "db.example.com", port: 6379 });
    assert.deepEqual(getDatabaseUrlEndpoint("rediss://[::1]:6379"), { hostname: "[::1]", port: 6379 });
    assert.deepEqual(getDatabaseUrlEndpoint("falkor://db.example.com"), { hostname: "db.example.com", port: 6379 });
    assert.equal(getDatabaseUrlEndpoint("https://db.example.com"), null);
    assert.equal(getDatabaseUrlEndpoint("not a URL"), null);
  });
});
