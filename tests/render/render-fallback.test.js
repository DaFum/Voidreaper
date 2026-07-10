import test from "node:test";
import assert from "node:assert/strict";
import { createAssemblyRenderer } from "../../src/render/ship-assembly/assembly-renderer.js";
import { renderRegionWorld } from "../../src/render/regions/region-world-renderer.js";
import { createBloomPass } from "../../src/render/post/bloom-pass.js";
import { renderRegionParallaxBackdrop, renderRegionParallaxDust } from "../../src/render/regions/region-parallax-renderer.js";
import { buildCoreGeometry } from "../../src/features/ship-assembly/geometry/core-geometry-builders.js";
import { SHIP_FRAME_ASSEMBLY_PROFILES } from "../../src/features/ship-assembly/content/ship-frame-assembly-profiles.js";

function createStubContext() {
  const gradient = { addColorStop() {} };
  const state = { canvas: { width: 320, height: 240 }, globalAlpha: 1, lineWidth: 1, shadowBlur: 0 };
  return new Proxy(state, {
    get(target, key) {
      if (key in target) return target[key];
      if (key === "createLinearGradient" || key === "createRadialGradient") return () => gradient;
      return () => {};
    },
    set(target, key, value) { target[key] = value; return true; }
  });
}

test("renderPlayerShip falls back to live drawing without DOM", () => {
  const frame = SHIP_FRAME_ASSEMBLY_PROFILES[0];
  const snapshot = {
    shipFrameId: frame.id,
    shipStyle: frame.style,
    coreGeometry: buildCoreGeometry(frame.coreGeometryId),
    nodes: [{ isRoot: true, nodeId: "root" }],
    connections: [],
    armor: [],
    decorators: [],
    totalBounds: null
  };
  const renderer = createAssemblyRenderer();
  const rendered = renderer.renderPlayerShip(createStubContext(), {
    geometrySnapshot: snapshot,
    position: { x: 0, y: 0 },
    time: 1.5,
    movement: { x: 1, y: 0, dodging: true }
  });
  assert.equal(rendered, true);
});

test("renderRegionWorld draws motifs without DOM sprite cache", () => {
  assert.doesNotThrow(() => renderRegionWorld(createStubContext(), {
    regionId: "null-cathedral",
    camera: { x: 0, y: 0 },
    viewport: { width: 640, height: 360 },
    arena: 700,
    time: 2,
    seed: 7
  }));
});

test("bloom pass is a no-op without DOM", () => {
  assert.doesNotThrow(() => createBloomPass().apply(createStubContext()));
});

test("region parallax layers degrade gracefully without DOM", () => {
  const options = { regionId: "furnace-expanse", camera: { x: 120, y: -60 }, viewport: { width: 640, height: 360 }, time: 3, seed: 11 };
  assert.doesNotThrow(() => renderRegionParallaxBackdrop(createStubContext(), options));
  assert.doesNotThrow(() => renderRegionParallaxDust(createStubContext(), options));
});
