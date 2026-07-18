import test from "node:test";
import assert from "node:assert/strict";
import { resolveAssemblyLod } from "../../../src/render/ship-assembly/assembly-lod-policy.js";

test("resolveAssemblyLod correctly resolves low LOD based on overrides and thresholds", () => {
  assert.equal(resolveAssemblyLod({ userSetting: "low" }), "low", "Forces low when user setting is low");
  assert.equal(resolveAssemblyLod({ zoom: 0.5 }), "low", "Forces low when zoom is below threshold");
  assert.equal(resolveAssemblyLod({ visibleSegments: 20 }), "low", "Forces low when visibleSegments is high");
  assert.equal(resolveAssemblyLod({ particlePressure: 0.9 }), "low", "Forces low when particlePressure is high");
});

test("resolveAssemblyLod correctly resolves medium LOD based on overrides and thresholds", () => {
  assert.equal(resolveAssemblyLod({ userSetting: "medium", zoom: 0.8 }), "medium", "Forces medium when user setting is medium");
  assert.equal(resolveAssemblyLod({ zoom: 0.8 }), "medium", "Forces medium when zoom is medium");
  assert.equal(resolveAssemblyLod({ visibleSegments: 12 }), "medium", "Forces medium when visibleSegments is medium");
  assert.equal(resolveAssemblyLod({ particlePressure: 0.7 }), "medium", "Forces medium when particlePressure is medium");
});

test("resolveAssemblyLod correctly resolves ultra LOD when optimal", () => {
  assert.equal(resolveAssemblyLod({ userSetting: "ultra", zoom: 1.5, visibleSegments: 5, particlePressure: 0.2 }), "ultra");
});

test("resolveAssemblyLod defaults to high LOD", () => {
  assert.equal(resolveAssemblyLod({}), "high", "Returns high when conditions aren't triggering other levels");
  // Test undefined parameter logic via omitted properties check logic which relies on defaults
  assert.equal(resolveAssemblyLod({ zoom: 1, visibleSegments: 0, particlePressure: 0, userSetting: "high" }), "high");
});