import { test } from "node:test";
import assert from "node:assert/strict";
import { csvCell } from "./csv-export.ts";

test("CSV string cells neutralize formulas after whitespace and C0 controls", () => {
  for (const prefix of ["", " ", "\uFEFF", ...Array.from({ length: 32 }, (_, i) => String.fromCharCode(i))]) {
    for (const operator of ["=", "+", "-", "@"]) {
      const value = `${prefix}${operator}SUM(1,2)`;
      assert.equal(csvCell(value), `"'${value}"`);
    }
  }
  assert.equal(csvCell('plain "text"'), '"plain ""text"""');
  assert.equal(csvCell("not=a formula"), '"not=a formula"');
});
