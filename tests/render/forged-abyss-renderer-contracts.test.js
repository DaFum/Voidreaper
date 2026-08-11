import test from "node:test";
import assert from "node:assert/strict";
import { renderAdaptiveArmor, renderBalanceDecorators } from "../../src/render/ship-assembly/adaptive-armor-renderer.js";
import { renderConnector } from "../../src/render/ship-assembly/connector-renderer.js";
import { renderDamageOverlay } from "../../src/render/ship-assembly/damage-overlay-renderer.js";
import { renderForgedEnemy } from "../../src/render/enemies/enemy-renderer.js";

// The forged-abyss primitives take a single options object and canvas rejects
// non-finite gradient coordinates, so a mis-shaped call throws at draw time —
// where no unit test used to look. This stub context is deliberately strict:
// anything a real 2D context would reject is an assertion failure here.
function createStrictContext(hooks = {}) {
  const gradient = {
    addColorStop(offset, color) {
      assert.ok(Number.isFinite(offset) && offset >= 0 && offset <= 1, `color stop offset out of range: ${offset}`);
      assert.equal(typeof color, "string", `color stop is not a string: ${color}`);
      assert.ok(!color.includes("NaN") && color !== "undefined", `malformed color stop: ${color}`);
    },
  };
  const state = { canvas: { width: 320, height: 240 }, globalAlpha: 1, lineWidth: 1, shadowBlur: 0 };
  return new Proxy(state, {
    get(target, key) {
      if (key in target) return target[key];
      if (key === "createLinearGradient" || key === "createRadialGradient")
        return (...args) => {
          for (const arg of args) assert.ok(Number.isFinite(arg), `non-finite ${key} coordinate: ${args}`);
          hooks[key]?.(...args);
          return gradient;
        };
      if (key === "measureText") return () => ({ width: 10 });
      return (...args) => {
        for (const arg of args)
          assert.ok(typeof arg !== "number" || Number.isFinite(arg), `non-finite argument to ${key}: ${args}`);
        hooks[key]?.(...args);
      };
    },
    set(target, key, value) {
      if (typeof value === "string")
        assert.ok(!value.includes("NaN") && value !== "undefined", `malformed ${key}: ${value}`);
      target[key] = value;
      hooks.__set?.(key, value);
      return true;
    },
  });
}

const PALETTE = {
  armor: "#334455", armorLight: "#5a7788", void: "#221133", edge: "#889999", thruster: "#ff8800",
  structure: "#556677", rim: "#e9ffff", metal: "#2a3a48", energy: "#4fead0", fault: "#e07bff", damage: "#ff6d9d",
};
const LODS = ["low", "medium", "high", "ultra"];
const PLATES = ["heavy-block", "void-organic", "null-fracture", "reaper-curve", "industrial-truss", "thermal-open"]
  .map((family, index) => ({
    start: { x: index * 12 - 30, y: 40 + index * 3 },
    end: { x: index * 12 - 18, y: 62 + index * 3 },
    family, taper: 1, index,
  }));
const CONNECTOR = {
  spine: { from: { x: -40, y: 55 }, to: { x: 12, y: 78 }, width: 6 },
  leftRail: { from: { x: -40, y: 52 }, to: { x: 12, y: 75 } },
  rightRail: { from: { x: -40, y: 58 }, to: { x: 12, y: 81 } },
  cable: { from: { x: -40, y: 55 }, to: { x: 12, y: 78 } },
};

test("renderAdaptiveArmor draws every plate family at every LOD", () => {
  for (const lod of LODS) renderAdaptiveArmor(createStrictContext(), PLATES, PALETTE, { lod });
  // call sites omit the options argument entirely, which must stay drawable
  renderAdaptiveArmor(createStrictContext(), PLATES, PALETTE);
});

test("renderBalanceDecorators draws every decorator kind", () => {
  renderBalanceDecorators(createStrictContext(), [
    { position: { x: 1, y: 2 }, rotation: .3, scale: 1, kind: "cooling-ribs" },
    { position: { x: 3, y: 4 }, rotation: 0, scale: 1.2, kind: "counterweight" },
    { position: { x: 5, y: 6 }, rotation: 1, scale: .8, kind: "fin" },
  ], PALETTE);
});

test("renderConnector draws every layer at every LOD", () => {
  for (const lod of LODS)
    for (const layer of ["static", "dynamic", "all"])
      renderConnector(createStrictContext(), CONNECTOR, PALETTE, { lod, layer, energyFlow: 1.3 });
});

test("connector shading follows the connector, not the ship origin", () => {
  const coordinates = [];
  const ctx = createStrictContext({ createLinearGradient: (...args) => coordinates.push(args) });
  renderConnector(ctx, CONNECTOR, PALETTE, { layer: "static" });
  assert.ok(coordinates.length >= 3, "expected gradients for the spine and both rails");
  const midpoint = (segment) => [
    (segment.from.x + segment.to.x) / 2,
    (segment.from.y + segment.to.y) / 2,
  ];
  const anchors = [
    midpoint(CONNECTOR.spine), midpoint(CONNECTOR.leftRail), midpoint(CONNECTOR.rightRail),
    [CONNECTOR.spine.from.x, CONNECTOR.spine.from.y], [CONNECTOR.spine.to.x, CONNECTOR.spine.to.y],
  ];
  for (const [x0, y0, x1, y1] of coordinates) {
    const centre = [(x0 + x1) / 2, (y0 + y1) / 2];
    assert.ok(
      anchors.some(([ax, ay]) => Math.hypot(ax - centre[0], ay - centre[1]) < 1e-6),
      `gradient is centred at ${centre} instead of on the geometry it shades`,
    );
  }
});

test("renderDamageOverlay draws both damage states at every LOD", () => {
  for (const lod of LODS)
    for (const damageState of ["armor-broken", "core-disrupted"])
      renderDamageOverlay(createStrictContext(), {
        worldPosition: { x: 30, y: -20 }, worldRotation: .4, damageState,
        variantSeed: 91231, geometry: { size: 14 },
      }, { time: 2.5, palette: PALETTE, lod });
});

const ENEMY_POINTS = {
  swarm: 4, chaser: 3, orbiter: 6, spitter: 5, tank: 8, splitter: 6,
  bomber: 4, shield: 6, warper: 7, leech: 5, boss: 12,
};

test("the enemy rim highlight only traces silhouette edges, never chords", () => {
  for (const [type, points] of Object.entries(ENEMY_POINTS)) {
    for (let offset = 0; offset < 12; offset += 1) {
      const segments = [];
      let path = [], cursor = null, strokeStyle = "", lineWidth = 0;
      const ctx = createStrictContext({
        beginPath: () => { path = []; cursor = null; },
        moveTo: (x, y) => { cursor = [x, y]; },
        lineTo: (x, y) => { if (cursor) path.push([cursor, [x, y]]); cursor = [x, y]; },
        // the rim pass is the only 1.2px stroke in the rim colour
        stroke: () => { if (lineWidth === 1.2 && String(strokeStyle).startsWith("rgba(233,255,255")) segments.push(...path); },
        __set: (key, value) => { if (key === "strokeStyle") strokeStyle = value; if (key === "lineWidth") lineWidth = value; },
      });
      renderForgedEnemy(ctx, {
        type, x: offset, y: -offset, r: 18, vx: 1, vy: .4,
        wobble: 1.1, hitT: 0, birth: 0, color: "#ff6d9d", elite: null, boss: type === "boss",
      }, { time: 1 });

      for (const [[ax, ay], [bx, by]] of segments) {
        const outerRadius = Math.max(Math.hypot(ax, ay), Math.hypot(bx, by));
        // any segment longer than the widest possible edge has skipped vertices
        const longestEdge = 2 * outerRadius * Math.sin(Math.PI / points) * 1.05;
        assert.ok(
          Math.hypot(bx - ax, by - ay) <= longestEdge,
          `${type}: rim segment spans a chord instead of an edge`,
        );
      }
    }
  }
});
