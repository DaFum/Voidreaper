import test from "node:test";
import assert from "node:assert/strict";
import { createModuleCoreRendererRegistry } from "../../../src/render/ship-assembly/module-core-renderers.js";

test("createModuleCoreRendererRegistry registers and manages handlers", () => {
  const registry = createModuleCoreRendererRegistry();

  assert.equal(registry.has("core-linear-weapon"), true, "Has built-in renderer");
  assert.equal(registry.ids().includes("core-linear-weapon"), true, "ids() includes built-in renderer");

  const mockRenderer = test.mock.fn();
  registry.register("custom-renderer", mockRenderer);

  assert.equal(registry.has("custom-renderer"), true, "Has custom renderer");
  assert.equal(registry.ids().includes("custom-renderer"), true, "ids() includes custom renderer");
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
      addColorStop: test.mock.fn()
    }))
  };

  const mockRenderer = test.mock.fn();
  registry.register("test-renderer", mockRenderer);

  const state = { size: 10, palette: { damage: "#f00", armor: "#ccc", thruster: "#ff0" }, activity: { heat: 0 }, damageState: "intact", lod: "high" };

  registry.render("test-renderer", ctx, state);
  assert.equal(mockRenderer.mock.calls.length, 1, "Calls registered renderer");

  assert.doesNotThrow(() => {
    registry.render("unknown-renderer", ctx, state);
  }, "Fallback renderer should execute without errors");
});