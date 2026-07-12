import test from "node:test";
import assert from "node:assert/strict";
import { buildModuleActivityState } from "../../src/features/ship-assembly/geometry/activity-state-adapter.js";

test("buildModuleActivityState", async (t) => {
  await t.test("returns default fallback values when no argument is provided", () => {
    const result = buildModuleActivityState();
    assert.deepEqual(result, {
      charge: 0,
      cooldown: 0,
      firing: false,
      heat: 0,
      energyFlow: 0,
      faulting: false,
      activeUnits: 0
    });
    assert.ok(Object.isFrozen(result), "Expected result to be frozen");
  });

  await t.test("returns default fallback values for an empty object", () => {
    const result = buildModuleActivityState({});
    assert.deepEqual(result, {
      charge: 0,
      cooldown: 0,
      firing: false,
      heat: 0,
      energyFlow: 0,
      faulting: false,
      activeUnits: 0
    });
    assert.ok(Object.isFrozen(result), "Expected result to be frozen");
  });

  await t.test("maps provided telemetry properties correctly", () => {
    const telemetry = {
      chargeRatio: 0.5,
      cooldownRatio: 0.25,
      firing: true,
      heatRatio: 0.75,
      energyFlowRatio: 1.0,
      faulting: true,
      activeUnits: 3
    };
    const result = buildModuleActivityState(telemetry);
    assert.deepEqual(result, {
      charge: 0.5,
      cooldown: 0.25,
      firing: true,
      heat: 0.75,
      energyFlow: 1.0,
      faulting: true,
      activeUnits: 3
    });
  });

  await t.test("converts truthy and falsy values to booleans for firing and faulting", () => {
    const truthyTelemetry = { firing: 1, faulting: "yes" };
    const truthyResult = buildModuleActivityState(truthyTelemetry);
    assert.equal(truthyResult.firing, true);
    assert.equal(truthyResult.faulting, true);

    const falsyTelemetry = { firing: 0, faulting: "" };
    const falsyResult = buildModuleActivityState(falsyTelemetry);
    assert.equal(falsyResult.firing, false);
    assert.equal(falsyResult.faulting, false);
  });

  await t.test("handles null telemetry gracefully by falling back to defaults", () => {
    const result = buildModuleActivityState(null);
    assert.deepEqual(result, {
      charge: 0,
      cooldown: 0,
      firing: false,
      heat: 0,
      energyFlow: 0,
      faulting: false,
      activeUnits: 0
    });
    assert.ok(Object.isFrozen(result), "Expected result to be frozen");
  });
});
