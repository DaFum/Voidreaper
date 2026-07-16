import test from "node:test";
import assert from "node:assert/strict";
import { createHitZoneIndex } from "../../../../src/features/ship-assembly/damage/hit-zone-index.js";

// A small helper to create a mock zone easily
function makeZone(id, x, y, shape) {
  return {
    id,
    transform: { position: { x, y } },
    shape
  };
}

test("createHitZoneIndex initial state", () => {
  const index = createHitZoneIndex();
  assert.equal(index.revision, -1);
  assert.deepEqual(index.all(), []);
  assert.deepEqual(index.query({ minX: 0, minY: 0, maxX: 10, maxY: 10 }), []);
});

test("createHitZoneIndex rebuild returns true when updated, false when unchanged", () => {
  const index = createHitZoneIndex();
  const zone1 = makeZone("z1", 0, 0, { radius: 10 });

  assert.equal(index.rebuild(1, [zone1]), true);
  assert.equal(index.revision, 1);
  assert.equal(index.all().length, 1);

  assert.equal(index.rebuild(1, [zone1]), false); // Same revision
  assert.equal(index.rebuild(2, [zone1]), true); // New revision
});

test("createHitZoneIndex query bounding box overlap logic", () => {
  const index = createHitZoneIndex();

  // Center is at 0,0. Radius is 10. Bounds: minX: -10, minY: -10, maxX: 10, maxY: 10
  const z1 = makeZone("z1", 0, 0, { radius: 10 });
  index.rebuild(1, [z1]);

  // Fully contained
  assert.equal(index.query({ minX: -5, minY: -5, maxX: 5, maxY: 5 }).length, 1);

  // Partially overlapping
  assert.equal(index.query({ minX: 5, minY: 5, maxX: 15, maxY: 15 }).length, 1);
  assert.equal(index.query({ minX: -15, minY: -15, maxX: -5, maxY: -5 }).length, 1);

  // Exactly touching edges (inclusive)
  assert.equal(index.query({ minX: 10, minY: 0, maxX: 20, maxY: 10 }).length, 1); // touching right edge
  assert.equal(index.query({ minX: 0, minY: 10, maxX: 10, maxY: 20 }).length, 1); // touching top edge
  assert.equal(index.query({ minX: -20, minY: 0, maxX: -10, maxY: 10 }).length, 1); // touching left edge
  assert.equal(index.query({ minX: 0, minY: -20, maxX: 10, maxY: -10 }).length, 1); // touching bottom edge

  // Non-overlapping (just outside)
  assert.equal(index.query({ minX: 11, minY: 0, maxX: 20, maxY: 10 }).length, 0); // outside right
  assert.equal(index.query({ minX: 0, minY: 11, maxX: 10, maxY: 20 }).length, 0); // outside top
  assert.equal(index.query({ minX: -20, minY: 0, maxX: -11, maxY: 10 }).length, 0); // outside left
  assert.equal(index.query({ minX: 0, minY: -20, maxX: 10, maxY: -11 }).length, 0); // outside bottom
});

test("createHitZoneIndex computes bounds correctly for different shapes", () => {
  const index = createHitZoneIndex();

  // 1. Circle (uses radius)
  const circle = makeZone("circle", 0, 0, { radius: 5 });
  // Bounds: -5 to 5

  // 2. Ring (uses outerRadius)
  const ring = makeZone("ring", 20, 0, { outerRadius: 6 });
  // Bounds: 14 to 26 (x), -6 to 6 (y)

  // 3. Capsule (uses length/2 + radius)
  const capsule = makeZone("capsule", 40, 0, { length: 20, radius: 2 });
  // length/2 = 10. + radius(2) = 12.
  // Bounds: 28 to 52 (x), -12 to 12 (y)

  // 4. Polygon (uses max absolute point coordinates)
  const polygon = makeZone("polygon", 60, 0, { points: [{ x: 3, y: -4 }, { x: -8, y: 2 }] });
  // Max abs is 8.
  // Bounds: 52 to 68 (x), -8 to 8 (y)

  // 5. Default (fallback to 24)
  const def = makeZone("default", 100, 0, {});
  // Bounds: 76 to 124 (x), -24 to 24 (y)

  index.rebuild(1, [circle, ring, capsule, polygon, def]);

  // Test Circle
  assert.equal(index.query({ minX: 5, minY: 0, maxX: 10, maxY: 5 }).find(z => z.id === "circle")?.id, "circle");
  assert.equal(index.query({ minX: 6, minY: 0, maxX: 10, maxY: 5 }).find(z => z.id === "circle"), undefined);

  // Test Ring
  assert.equal(index.query({ minX: 26, minY: 0, maxX: 30, maxY: 5 }).find(z => z.id === "ring")?.id, "ring");
  assert.equal(index.query({ minX: 27, minY: 0, maxX: 30, maxY: 5 }).find(z => z.id === "ring"), undefined);

  // Test Capsule
  assert.equal(index.query({ minX: 52, minY: 0, maxX: 60, maxY: 5 }).find(z => z.id === "capsule")?.id, "capsule");
  assert.equal(index.query({ minX: 53, minY: 0, maxX: 60, maxY: 5 }).find(z => z.id === "capsule"), undefined);

  // Test Polygon
  assert.equal(index.query({ minX: 68, minY: 0, maxX: 70, maxY: 5 }).find(z => z.id === "polygon")?.id, "polygon");
  assert.equal(index.query({ minX: 69, minY: 0, maxX: 70, maxY: 5 }).find(z => z.id === "polygon"), undefined);

  // Test Default
  assert.equal(index.query({ minX: 124, minY: 0, maxX: 130, maxY: 5 }).find(z => z.id === "default")?.id, "default");
  assert.equal(index.query({ minX: 125, minY: 0, maxX: 130, maxY: 5 }).find(z => z.id === "default"), undefined);
});
