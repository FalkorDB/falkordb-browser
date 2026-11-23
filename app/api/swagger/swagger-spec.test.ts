import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { z } from "zod";
import swaggerSpec from "./swagger-spec.ts";
import { fixRequest, optimizeRequest } from "../validate-body.ts";

type JsonSchema = {
  [key: string]: unknown;
  type?: string;
  description?: string;
  enum?: unknown[];
  required?: string[];
  properties?: Record<string, JsonSchema>;
  oneOf?: JsonSchema[];
  headers?: Record<string, { schema?: Record<string, unknown>; description?: string }>;
};

// Compares documented request constraints and defaults with the zod schema the route validates.
function assertMatchesZod(documented: JsonSchema, schema: z.ZodType) {
  const expected = z.toJSONSchema(schema, { io: "input" }) as JsonSchema;
  assert.deepEqual(documented.required, expected.required);
  assert.deepEqual(Object.keys(documented.properties ?? {}), Object.keys(expected.properties ?? {}));
  for (const [name, property] of Object.entries(expected.properties ?? {})) {
    for (const keyword of ["type", "minLength", "maxLength", "enum", "default"]) {
      assert.deepEqual(documented.properties?.[name][keyword], property[keyword], `${name}.${keyword}`);
    }
  }
}

describe("AI assistance OpenAPI documentation", () => {
  it("documents Fix request constraints and defaults from fixRequest", () => {
    assertMatchesZod(swaggerSpec.paths["/api/chat/fix"].post.requestBody.content["application/json"].schema, fixRequest);
  });

  it("documents Optimize request constraints and defaults from optimizeRequest", () => {
    assertMatchesZod(swaggerSpec.paths["/api/chat/optimize"].post.requestBody.content["application/json"].schema, optimizeRequest);
  });

  it("documents Fix and Optimize responses, including server errors", () => {
    const fix = swaggerSpec.paths["/api/chat/fix"].post;
    assert.equal(fix.responses["200"].content["application/json"].schema.properties.correctedQuery.type, "string");
    assert.equal(fix.responses["413"].description, "Request body is too large");
    assert.equal(fix.responses["500"].description, "Internal server error");

    const optimize = swaggerSpec.paths["/api/chat/optimize"].post;
    assert.deepEqual(optimize.responses["200"].content["application/json"].schema.required, [
      "explanation",
      "suggestions",
      "executionPlan",
    ]);
    assert.equal(optimize.responses["413"].description, "Request body is too large");
    assert.equal(optimize.responses["500"].description, "Internal server error");
  });
});

describe("User password update OpenAPI documentation", () => {
  it("documents when a user must sign in again after changing their own password", () => {
    const successResponse = swaggerSpec.paths["/api/user/{user}"].patch.responses["200"];
    const response = successResponse.content["application/json"].schema as JsonSchema;
    const reauthenticationProperty = response.properties?.requiresReauthentication;
    assert.equal(reauthenticationProperty?.type, "boolean");
    assert.match(String(reauthenticationProperty?.description ?? ""), /current user's own password/);
    assert.deepEqual(response.properties?.aclSaveStatus?.enum, ["saved", "failed", "unknown"]);
    const connection = response.properties?.reauthenticationConnection;
    assert.equal(connection?.type, "object");
    assert.match(String(connection?.description ?? ""), /TLS material is retained server-side/);
    assert.deepEqual(connection?.required, ["host", "port", "username", "tls"]);
    assert.deepEqual(connection?.properties, {
      host: { type: "string" },
      port: { type: "integer" },
      username: { type: "string" },
      tls: { type: "boolean" },
    });
    assert.equal(successResponse.headers?.["Set-Cookie"]?.schema?.type, "string");
    assert.match(successResponse.headers?.["Set-Cookie"]?.description ?? "", /browser session with an active connection/);
    assert.match(successResponse.headers?.["Set-Cookie"]?.description ?? "", /PAT self-updates may not set/);
    assert.equal(response.headers, undefined);

    const variants = response.oneOf ?? [];
    assert.equal(variants.length, 2);
    const ordinary = variants.find(variant => variant.properties?.requiresReauthentication?.enum?.[0] === false);
    const reauthenticationVariant = variants.find(variant => variant.properties?.requiresReauthentication?.enum?.[0] === true);
    assert.ok(ordinary);
    assert.deepEqual(ordinary.properties?.requiresReauthentication, { type: "boolean", enum: [false] });
    assert.deepEqual(ordinary.required, ["requiresReauthentication"]);
    assert.ok(reauthenticationVariant);
    assert.deepEqual(reauthenticationVariant.properties?.requiresReauthentication, { type: "boolean", enum: [true] });
    assert.deepEqual(reauthenticationVariant.required, [
      "requiresReauthentication",
      "aclSaveStatus",
      "reauthenticationConnection",
    ]);
  });
});
