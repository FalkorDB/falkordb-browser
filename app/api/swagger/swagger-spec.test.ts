import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { z } from "zod";
import swaggerSpec from "./swagger-spec.ts";
import { fixRequest, optimizeRequest } from "../validate-body.ts";

type JsonSchema = { required?: string[]; properties?: Record<string, Record<string, unknown>> };

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
    const response = swaggerSpec.paths["/api/user/{user}"].patch.responses["200"]
      .content["application/json"].schema as JsonSchema;
    const reauthentication = response.properties?.requiresReauthentication;
    assert.equal(reauthentication?.type, "boolean");
    assert.match(String(reauthentication?.description ?? ""), /current user's own password/);
    assert.equal(response.properties?.aclSaved?.type, "boolean");
  });
});
