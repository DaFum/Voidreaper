import test from "node:test";
import assert from "node:assert/strict";
import { explainPlacement, scorePlacement } from "../../src/features/ship-assembly/placement/placement-score.js";

test("explainPlacement", async (t) => {
  const defaultMetrics = {
    fireLane: 0,
    protection: 0.5,
    energyPath: 0,
    balance: 0,
    newPorts: 0
  };
  const defaultDelta = {
    rotationalInertia: 0
  };

  await t.test("returns empty array when no thresholds are met", () => {
    const reasons = explainPlacement(defaultMetrics, defaultDelta);
    assert.deepEqual(reasons, []);
  });

  await t.test("identifies Beste Waffenlinie", () => {
    const reasons = explainPlacement({ ...defaultMetrics, fireLane: 0.75 }, defaultDelta);
    assert.deepEqual(reasons, ["Beste Waffenlinie"]);
  });

  await t.test("identifies Gut geschützt", () => {
    const reasons = explainPlacement({ ...defaultMetrics, protection: 0.75 }, defaultDelta);
    assert.deepEqual(reasons, ["Gut geschützt"]);
  });

  await t.test("identifies Kürzeste Energieleitung", () => {
    const reasons = explainPlacement({ ...defaultMetrics, energyPath: 0.8 }, defaultDelta);
    assert.deepEqual(reasons, ["Kürzeste Energieleitung"]);
  });

  await t.test("identifies Verbessert Balance", () => {
    const reasons = explainPlacement({ ...defaultMetrics, balance: 0.75 }, defaultDelta);
    assert.deepEqual(reasons, ["Verbessert Balance"]);
  });

  await t.test("identifies Öffnet Utility-Ports", () => {
    const reasons = explainPlacement({ ...defaultMetrics, newPorts: 2 }, defaultDelta);
    assert.deepEqual(reasons, ["Öffnet 2 Utility-Ports"]);
  });

  await t.test("identifies Erhöht Trägheit from delta", () => {
    const reasons = explainPlacement(defaultMetrics, { rotationalInertia: 0.1 });
    assert.deepEqual(reasons, ["Erhöht Trägheit"]);
  });

  await t.test("identifies Exponierte Außenposition", () => {
    const reasons = explainPlacement({ ...defaultMetrics, protection: 0.3 }, defaultDelta);
    assert.deepEqual(reasons, ["Exponierte Außenposition"]);
  });

  await t.test("does not identify reasons at exact threshold boundaries", () => {
    const boundaryMetrics = {
      fireLane: 0.7,
      protection: 0.35,
      energyPath: 0.75,
      balance: 0.7,
      newPorts: 1
    };
    const boundaryDelta = {
      rotationalInertia: 0.08
    };
    const reasons = explainPlacement(boundaryMetrics, boundaryDelta);
    assert.deepEqual(reasons, []);
  });

  await t.test("limits output to 4 reasons maximum", () => {
    const maxMetrics = {
      fireLane: 0.8,
      protection: 0.8,
      energyPath: 0.8,
      balance: 0.8,
      newPorts: 2
    };
    const maxDelta = {
      rotationalInertia: 0.1
    };
    const reasons = explainPlacement(maxMetrics, maxDelta);
    assert.equal(reasons.length, 4);
    assert.deepEqual(reasons, [
      "Beste Waffenlinie",
      "Gut geschützt",
      "Kürzeste Energieleitung",
      "Verbessert Balance"
    ]);
  });
});

test("scorePlacement", async (t) => {
  await t.test("calculates score correctly based on weights", () => {
    const metrics = {
      functionalPosition: 1,
      mountQuality: 1,
      balance: 1,
      energyPath: 1,
      protection: 1,
      fireLane: 1,
      blueprintMatch: 1,
      collisionRisk: 1,
      branchPenalty: 1,
      massAsymmetry: 1
    };
    // Expected: 2 + 1.5 + 1.2 + 1 + 0.9 + 1.4 + 1.6 - 3 - 1.1 - 1 = 9.6 - 5.1 = 4.5
    const score = scorePlacement(metrics);
    assert.ok(Math.abs(score - 4.5) < 0.0001, `Score was ${score}, expected 4.5`);
  });
});
