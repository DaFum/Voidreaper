import test from "node:test";
import assert from "node:assert/strict";
import { createDetachedDebris, updateDetachedDebris } from "../../../src/render/ship-assembly/detached-debris-renderer.js";

test("createDetachedDebris initializes with correct properties", () => {
  const geometry = { size: 10 };
  const debris = createDetachedDebris(geometry, { x: 10, y: 20, vx: 5, vy: -5, lod: "low" });

  assert.equal(debris.geometry, geometry);
  assert.equal(debris.x, 10);
  assert.equal(debris.y, 20);
  assert.equal(debris.vx, 5);
  assert.equal(debris.vy, -5);
  assert.equal(debris.rotation, 0); // Default
  assert.equal(debris.spin, 0.8); // Default
  assert.equal(debris.lifetime, 3); // Default
  assert.equal(debris.lod, "low");
  assert.equal(debris.age, 0); // Always initialized to 0
});

test("updateDetachedDebris correctly updates pool and removes old debris", () => {
  const geometry = { size: 10 };
  const pool = [
    createDetachedDebris(geometry, { x: 0, y: 0, vx: 10, vy: 10, lifetime: 2 }),
    createDetachedDebris(geometry, { x: 0, y: 0, lifetime: 0.5 })
  ];

  const updatedPool = updateDetachedDebris(pool, 1);

  assert.equal(updatedPool.length, 1, "Should filter out debris older than lifetime");

  const debris = updatedPool[0];
  assert.equal(debris.age, 1, "Age should increase by dt");
  assert.equal(debris.x, 10, "X should update based on vx and dt");
  assert.equal(debris.y, 10, "Y should update based on vy and dt");
  assert.equal(debris.rotation, 0.8, "Rotation should update based on spin and dt");
});