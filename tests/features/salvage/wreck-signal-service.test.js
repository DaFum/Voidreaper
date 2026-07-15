import test from "node:test";
import assert from "node:assert/strict";
import { createWreckSignalService } from "../../../src/features/salvage/wreck-signal-service.js";

test("Wreck Signal Service - create() modifiers logic", async (t) => {
  const service = createWreckSignalService();
  const mockItem = { instanceId: "test-item-123" };

  await t.test("default fallback values (corruption < 75, deathCause not overheat)", () => {
    const run = { corruption: 0, deathCause: "hull-collapse" };
    const signal = service.create(mockItem, run);
    assert.deepEqual(signal.modifiers, ["echo-affixes", "wreck-field"]);
  });

  await t.test("corruption exactly at the boundary - 74", () => {
    const run = { corruption: 74, deathCause: "hull-collapse" };
    const signal = service.create(mockItem, run);
    assert.deepEqual(signal.modifiers, ["echo-affixes", "wreck-field"]);
  });

  await t.test("corruption exactly at the boundary - 75", () => {
    const run = { corruption: 75, deathCause: "hull-collapse" };
    const signal = service.create(mockItem, run);
    assert.deepEqual(signal.modifiers, ["corrupted-hunters", "wreck-field"]);
  });

  await t.test("corruption > 75", () => {
    const run = { corruption: 100, deathCause: "hull-collapse" };
    const signal = service.create(mockItem, run);
    assert.deepEqual(signal.modifiers, ["corrupted-hunters", "wreck-field"]);
  });

  await t.test("deathCause strictly equal to 'overheat'", () => {
    const run = { corruption: 0, deathCause: "overheat" };
    const signal = service.create(mockItem, run);
    assert.deepEqual(signal.modifiers, ["echo-affixes", "thermal-storm"]);
  });

  await t.test("both high corruption and 'overheat' death cause", () => {
    const run = { corruption: 80, deathCause: "overheat" };
    const signal = service.create(mockItem, run);
    assert.deepEqual(signal.modifiers, ["corrupted-hunters", "thermal-storm"]);
  });
});
