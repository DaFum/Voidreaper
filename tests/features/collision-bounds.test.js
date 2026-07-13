import test from "node:test";
import assert from "node:assert/strict";
import { boundsFromCenter } from "../../src/features/ship-assembly/placement/collision-bounds.js";

// Preview bounds mirror the real module AABB from module-geometry-builders:
// extent = length/2 + radius = size * (1.45/2 + 0.55). Half-extents:
// S:13, M:18, L:25, XL:34 -> * 1.275.
const FACTOR = 1.45 / 2 + 0.55;
const halfFor = size => ({ S: 13, M: 18, L: 25, XL: 34 }[size] ?? 18) * FACTOR;

function assertBounds(result, { x, y }, ownerId, half) {
  assert.equal(result.ownerId, ownerId);
  for (const [field, expected] of [
    ["minX", x - half], ["minY", y - half], ["maxX", x + half], ["maxY", y + half]
  ]) {
    assert.ok(Math.abs(result[field] - expected) < 1e-6, `${field}: ${result[field]} ≈ ${expected}`);
  }
}

test("boundsFromCenter calculates bounds for size S", () => {
  assertBounds(boundsFromCenter({ x: 100, y: 100 }, "S", "player-1"), { x: 100, y: 100 }, "player-1", halfFor("S"));
});

test("boundsFromCenter calculates bounds for size M", () => {
  assertBounds(boundsFromCenter({ x: 100, y: 100 }, "M", "player-1"), { x: 100, y: 100 }, "player-1", halfFor("M"));
});

test("boundsFromCenter calculates bounds for size L", () => {
  assertBounds(boundsFromCenter({ x: 100, y: 100 }, "L", "player-1"), { x: 100, y: 100 }, "player-1", halfFor("L"));
});

test("boundsFromCenter calculates bounds for size XL", () => {
  assertBounds(boundsFromCenter({ x: 100, y: 100 }, "XL", "player-1"), { x: 100, y: 100 }, "player-1", halfFor("XL"));
});

test("boundsFromCenter uses fallback half size (M) for invalid or missing size", () => {
  assertBounds(boundsFromCenter({ x: 100, y: 100 }, undefined, "player-1"), { x: 100, y: 100 }, "player-1", halfFor("M"));
  assertBounds(boundsFromCenter({ x: 100, y: 100 }, "INVALID_SIZE", "player-1"), { x: 100, y: 100 }, "player-1", halfFor("M"));
});

test("boundsFromCenter handles negative coordinates correctly", () => {
  assertBounds(boundsFromCenter({ x: -50, y: -50 }, "M", "player-1"), { x: -50, y: -50 }, "player-1", halfFor("M"));
});
