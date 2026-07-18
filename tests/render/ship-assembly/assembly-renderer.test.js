import test from "node:test";
import assert from "node:assert/strict";
import { createAssemblyRenderer } from "../../../src/render/ship-assembly/assembly-renderer.js";

test("createAssemblyRenderer initializes and handles empty/missing geometry", () => {
  const renderer = createAssemblyRenderer();
  const ctx = {
    save: test.mock.fn(),
    restore: test.mock.fn(),
    translate: test.mock.fn(),
    rotate: test.mock.fn()
  };

  const result = renderer.renderPlayerShip(ctx, { geometrySnapshot: null, position: { x: 0, y: 0 } });
  assert.equal(result, false, "Returns false if no coreGeometry is provided in snapshot");

  const resultEmpty = renderer.renderPlayerShip(ctx, { geometrySnapshot: {}, position: { x: 0, y: 0 } });
  assert.equal(resultEmpty, false, "Returns false if coreGeometry is missing");
});

test("createAssemblyRenderer renders successfully with basic geometry", () => {
  const renderer = createAssemblyRenderer();
  const ctx = {
    save: test.mock.fn(),
    restore: test.mock.fn(),
    translate: test.mock.fn(),
    rotate: test.mock.fn(),
    drawImage: test.mock.fn(),
    beginPath: test.mock.fn(),
    moveTo: test.mock.fn(),
    lineTo: test.mock.fn(),
    closePath: test.mock.fn(),
    fill: test.mock.fn(),
    stroke: test.mock.fn(),
    ellipse: test.mock.fn(),
    arc: test.mock.fn(),
    createLinearGradient: test.mock.fn(() => ({ addColorStop: test.mock.fn() })),
    createRadialGradient: test.mock.fn(() => ({ addColorStop: test.mock.fn() })),
    fillRect: test.mock.fn(),
    clip: test.mock.fn(),
    scale: test.mock.fn()
  };

  const snapshot = {
    coreGeometry: {
        bounds: { minX: -10, maxX: 10, minY: -10, maxY: 10 },
        hullPaths: [],
        armorPaths: [],
        structurePaths: [],
        detailPaths: [],
        cockpitPath: { kind: "line", from: {x:0, y:0}, to: {x:0, y:0} },
        reactorPath: { kind: "line", from: {x:0, y:0}, to: {x:0, y:0} },
        voidPaths: [],
        lightPaths: [],
        thrusterAnchors: []
    },
    connections: [],
    decorators: [],
    armor: [],
    nodes: [],
    shipFrameId: 1,
    shipStyle: { palette: {} }
  };

  const result = renderer.renderPlayerShip(ctx, { geometrySnapshot: snapshot, position: { x: 0, y: 0 } });
  assert.equal(result, true, "Returns true when successfully rendering");
  assert.equal(ctx.save.mock.calls.length >= 1, true, "Context save should be called");
  assert.equal(ctx.restore.mock.calls.length >= 1, true, "Context restore should be called");
});