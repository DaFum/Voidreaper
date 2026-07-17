import test from "node:test";
import assert from "node:assert/strict";
import { normalizeNodeType, NODE_TYPES } from "../../../src/content/sectors/node-types.js";

test("normalizeNodeType returns valid node types as-is", () => {
  for (const key of Object.keys(NODE_TYPES)) {
    assert.equal(normalizeNodeType(key), key, `Normalizes ${key} to itself`);
  }
});

test("normalizeNodeType returns combat for invalid or missing types", () => {
  assert.equal(normalizeNodeType("unknown-type"), "combat", "Falls back to combat for unknown types");
  assert.equal(normalizeNodeType(""), "combat", "Falls back to combat for empty string");
  assert.equal(normalizeNodeType(undefined), "combat", "Falls back to combat for undefined");
  assert.equal(normalizeNodeType(null), "combat", "Falls back to combat for null");
});