import test from "node:test";
import assert from "node:assert/strict";
import { createBuildSimulator } from "../../src/features/simulator/build-simulator.js";

test("configured simulations are deterministic and meaningful", () => {
  const simulator = createBuildSimulator();
  const config = { seed: 42, enemyId: "boss-dummy", density: 2.5, duration: 45 };
  const first = simulator.create(config);
  const second = simulator.create(config);

  const firstSummary = simulator.simulate(first);
  const secondSummary = simulator.simulate(second);

  assert.deepEqual(firstSummary, secondSummary);
  assert.ok(firstSummary.dps > 0);
  assert.ok(firstSummary.triggers > 0);
  assert.equal(first.simulator.elapsed, 45);
  assert.equal(first.simulator.enemyId, "boss-dummy");
  assert.equal(firstSummary.seed, 42);
});

test("simulation duration is bounded", () => {
  const simulator = createBuildSimulator();
  const run = simulator.create({ duration: 999 });
  simulator.simulate(run);
  assert.equal(run.simulator.elapsed, 300);
});

test("valid simulator bounds can trigger thermal faults", () => {
  const simulator = createBuildSimulator();
  let observedFault = false;

  for (let seed = 1; seed <= 20 && !observedFault; seed += 1) {
    const run = simulator.create({ seed, density: 5, duration: 300 });
    const summary = simulator.simulate(run);
    observedFault = summary.faults.includes("thermal-fault");
  }

  assert.equal(observedFault, true);
});
