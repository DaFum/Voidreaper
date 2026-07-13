import test from "node:test";
import assert from "node:assert/strict";
import { boundsFromCenter, overlapsAny } from "../../src/features/ship-assembly/placement/collision-bounds.js";

// Preview bounds mirror the real module AABB from module-geometry-builders:
// extent = length/2 + radius = size * (lengthFactor/2 + 0.55), where the
// structural spine renders longer (2.25) than standard modules (1.45).
// Half-extents for standard modules: S:13, M:18, L:25, XL:34 -> * 1.275.
const SIZE = { S: 13, M: 18, L: 25, XL: 34 };
const halfFor = (size, rendererId) => (SIZE[size] ?? 18) * ((rendererId === "core-structural-spine" ? 2.25 : 1.45) / 2 + 0.55);

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

test("boundsFromCenter uses the wider extent for the structural spine renderer", () => {
  const spine = boundsFromCenter({ x: 0, y: 0 }, "L", "spine-1", "core-structural-spine");
  assertBounds(spine, { x: 0, y: 0 }, "spine-1", halfFor("L", "core-structural-spine"));
  // spine footprint (L = 25*1.675 = 41.875) is wider than a standard L (31.875)
  assert.ok(spine.maxX > boundsFromCenter({ x: 0, y: 0 }, "L", "std").maxX);
});

test("spine preview footprint detects an overlap a standard-extent footprint would miss", () => {
  const neighbour = boundsFromCenter({ x: 0, y: 0 }, "L", "a");
  const spineAt = x => boundsFromCenter({ x, y: 0 }, "L", "spine", "core-structural-spine");
  const standardAt = x => boundsFromCenter({ x, y: 0 }, "L", "std");
  // At 74px apart two standard L modules clear the check, but the wider spine overlaps.
  assert.equal(overlapsAny(standardAt(74), [neighbour]), false);
  assert.equal(overlapsAny(spineAt(74), [neighbour]), true);
});
