import test from "node:test";
import assert from "node:assert/strict";
import { createModuleCoreRendererRegistry } from "../../../src/render/ship-assembly/module-core-renderers.js";

test("createModuleCoreRendererRegistry registers and manages handlers", () => {
  const registry = createModuleCoreRendererRegistry();

  assert.equal(
    registry.has("core-linear-weapon"),
    true,
    "Has built-in renderer",
  );
  assert.equal(
    registry.ids().includes("core-linear-weapon"),
    true,
    "ids() includes built-in renderer",
  );

  const mockRenderer = test.mock.fn();
  registry.register("custom-renderer", mockRenderer);

  assert.equal(registry.has("custom-renderer"), true, "Has custom renderer");
  assert.equal(
    registry.ids().includes("custom-renderer"),
    true,
    "ids() includes custom renderer",
  );
});

test("createModuleCoreRendererRegistry renders fallback and specific renderers", () => {
  const registry = createModuleCoreRendererRegistry();
  const ctx = {
    save: test.mock.fn(),
    restore: test.mock.fn(),
    beginPath: test.mock.fn(),
    closePath: test.mock.fn(),
    moveTo: test.mock.fn(),
    lineTo: test.mock.fn(),
    stroke: test.mock.fn(),
    fill: test.mock.fn(),
    arc: test.mock.fn(),
    ellipse: test.mock.fn(),
    createRadialGradient: test.mock.fn(() => ({
      addColorStop: test.mock.fn(),
    })),
    createLinearGradient: test.mock.fn(() => ({
      addColorStop: test.mock.fn(),
    })),
    clip: test.mock.fn(),
    fillRect: test.mock.fn(),
  };

  const mockRenderer = test.mock.fn();
  registry.register("test-renderer", mockRenderer);

  const state = {
    size: 10,
    palette: { damage: "#f00", armor: "#ccc", thruster: "#ff0" },
    activity: { heat: 0 },
    damageState: "intact",
    lod: "high",
  };

  registry.render("test-renderer", ctx, state);
  assert.equal(mockRenderer.mock.calls.length, 1, "Calls registered renderer");

  assert.doesNotThrow(() => {
    registry.render("unknown-renderer", ctx, state);
  }, "Fallback renderer should execute without errors");
});

test("createModuleCoreRendererRegistry renders all built-in ids without throwing (including string variantSeed)", () => {
  const registry = createModuleCoreRendererRegistry();
  const ctx = {
    save: test.mock.fn(),
    restore: test.mock.fn(),
    beginPath: test.mock.fn(),
    closePath: test.mock.fn(),
    moveTo: test.mock.fn(),
    lineTo: test.mock.fn(),
    stroke: test.mock.fn(),
    fill: test.mock.fn(),
    arc: test.mock.fn(),
    ellipse: test.mock.fn(),
    translate: test.mock.fn(),
    rotate: test.mock.fn(),
    scale: test.mock.fn(),
    setLineDash: test.mock.fn(),
    roundRect: test.mock.fn(),
    bezierCurveTo: test.mock.fn(),
    createRadialGradient: test.mock.fn(() => ({
      addColorStop: test.mock.fn(),
    })),
    createLinearGradient: test.mock.fn(() => ({
      addColorStop: test.mock.fn(),
    })),
    clip: test.mock.fn(),
    fillRect: test.mock.fn(),
  };

  const baseState = {
    size: 20,
    palette: {
      damage: "#f00",
      armor: "#ccc",
      thruster: "#ff0",
      void: "#000",
      energy: "#0f0",
    },
    activity: { heat: 0.5, firing: true, activeUnits: 1 },
    damageState: "intact",
    time: 1,
    lod: "ultra",
  };

  const ids = registry.ids();

  for (const id of ids) {
    assert.doesNotThrow(() => {
      registry.render(id, ctx, { ...baseState, variantSeed: 42 });
    }, `Renderer ${id} should not throw with numeric variantSeed`);

    assert.doesNotThrow(() => {
      registry.render(id, ctx, {
        ...baseState,
        variantSeed: "lab-string-seed",
      });
    }, `Renderer ${id} should not throw with string variantSeed`);
  }
});
