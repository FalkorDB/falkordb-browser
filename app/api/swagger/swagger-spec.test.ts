import assert from "node:assert/strict";
import { describe, it } from "node:test";
import swaggerSpec from "./swagger-spec.ts";

describe("AI assistance OpenAPI documentation", () => {
  it("documents Fix and Optimize request and response contracts", () => {
    const fix = swaggerSpec.paths["/api/chat/fix"].post;
    const fixSchema = fix.requestBody.content["application/json"].schema;
    assert.deepEqual(fixSchema.required, ["query", "errorMessage", "model"]);
    assert.deepEqual(fixSchema.properties.modelSource.enum, ["api-key", "local"]);
    assert.equal(fix.responses["200"].content["application/json"].schema.properties.correctedQuery.type, "string");
    assert.equal(fix.responses["413"].description, "Request body is too large");

    const optimize = swaggerSpec.paths["/api/chat/optimize"].post;
    const optimizeSchema = optimize.requestBody.content["application/json"].schema;
    assert.deepEqual(optimizeSchema.required, ["query", "graphName", "model"]);
    assert.equal(optimizeSchema.properties.guidance.maxLength, 2000);
    assert.deepEqual(optimize.responses["200"].content["application/json"].schema.required, [
      "explanation",
      "suggestions",
      "executionPlan",
    ]);
  });
});
