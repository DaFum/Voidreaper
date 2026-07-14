import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../../src/main.js", import.meta.url), "utf8");

test("startup rejections render a user-facing fallback", () => {
  assert.match(source, /bootstrap\(\)\.catch/);
  assert.match(source, /START FEHLGESCHLAGEN/);
});
