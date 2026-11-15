import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { z } from "zod";
import swaggerSpec from "./swagger-spec.ts";
import { fixRequest, optimizeRequest } from "../validate-body.ts";

type JsonSchema = { required?: string[]; properties?: Record<string, Record<string, unknown>> };

// Compares the documented request body with the zod schema the route validates, so a changed
// limit, enum or required field fails here instead of silently drifting from the docs.
function assertMatchesZod(documented: JsonSchema, schema: z.ZodType) {
  const expected = z.toJSONSchema(schema, { io: "input" }) as JsonSchema;
  assert.deepEqual(documented.required, expected.required);
  assert.deepEqual(Object.keys(documented.properties ?? {}), Object.keys(expected.properties ?? {}));
  for (const [name, property] of Object.entries(expected.properties ?? {})) {
    for (const keyword of ["type", "minLength", "maxLength", "enum"]) {
      assert.deepEqual(documented.properties?.[name][keyword], property[keyword], `${name}.${keyword}`);
    }
  }
}

describe("AI assistance OpenAPI documentation", () => {
  it("documents the Fix request body exactly as fixRequest validates it", () => {
    assertMatchesZod(swaggerSpec.paths["/api/chat/fix"].post.requestBody.content["application/json"].schema, fixRequest);
  });

  it("documents the Optimize request body exactly as optimizeRequest validates it", () => {
    assertMatchesZod(swaggerSpec.paths["/api/chat/optimize"].post.requestBody.content["application/json"].schema, optimizeRequest);
  });

  it("documents Fix and Optimize responses, including server errors", () => {
    const fix = swaggerSpec.paths["/api/chat/fix"].post;
    assert.equal(fix.responses["200"].content["application/json"].schema.properties.correctedQuery.type, "string");
    assert.ok(fix.responses["413"]);
    assert.ok(fix.responses["500"]);

    const optimize = swaggerSpec.paths["/api/chat/optimize"].post;
    assert.deepEqual(optimize.responses["200"].content["application/json"].schema.required, [
      "explanation",
      "suggestions",
      "executionPlan",
    ]);
    assert.ok(optimize.responses["500"]);
  });
});
