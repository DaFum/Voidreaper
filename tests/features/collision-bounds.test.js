import test from "node:test";
import assert from "node:assert/strict";
import { boundsFromCenter } from "../../src/features/ship-assembly/placement/collision-bounds.js";

test("boundsFromCenter calculates bounds for size S", () => {
  const result = boundsFromCenter({ x: 100, y: 100 }, "S", "player-1");
  assert.deepEqual(result, {
    ownerId: "player-1",
    minX: 88,
    minY: 88,
    maxX: 112,
    maxY: 112,
  });
});

test("boundsFromCenter calculates bounds for size M", () => {
  const result = boundsFromCenter({ x: 100, y: 100 }, "M", "player-1");
  assert.deepEqual(result, {
    ownerId: "player-1",
    minX: 82,
    minY: 82,
    maxX: 118,
    maxY: 118,
  });
});

test("boundsFromCenter calculates bounds for size L", () => {
  const result = boundsFromCenter({ x: 100, y: 100 }, "L", "player-1");
  assert.deepEqual(result, {
    ownerId: "player-1",
    minX: 74,
    minY: 74,
    maxX: 126,
    maxY: 126,
  });
});

test("boundsFromCenter calculates bounds for size XL", () => {
  const result = boundsFromCenter({ x: 100, y: 100 }, "XL", "player-1");
  assert.deepEqual(result, {
    ownerId: "player-1",
    minX: 64,
    minY: 64,
    maxX: 136,
    maxY: 136,
  });
});

test("boundsFromCenter uses fallback half size (18) for invalid or missing size", () => {
  const resultMissing = boundsFromCenter({ x: 100, y: 100 }, undefined, "player-1");
  assert.deepEqual(resultMissing, {
    ownerId: "player-1",
    minX: 82,
    minY: 82,
    maxX: 118,
    maxY: 118,
  });

  const resultInvalid = boundsFromCenter({ x: 100, y: 100 }, "INVALID_SIZE", "player-1");
  assert.deepEqual(resultInvalid, {
    ownerId: "player-1",
    minX: 82,
    minY: 82,
    maxX: 118,
    maxY: 118,
  });
});

test("boundsFromCenter handles negative coordinates correctly", () => {
  const result = boundsFromCenter({ x: -50, y: -50 }, "M", "player-1");
  assert.deepEqual(result, {
    ownerId: "player-1",
    minX: -68,
    minY: -68,
    maxX: -32,
    maxY: -32,
  });
});
