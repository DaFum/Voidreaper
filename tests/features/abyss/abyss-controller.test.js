import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { createAbyssController } from "../../../src/features/abyss/abyss-controller.js";
import { ABYSS_MODIFIERS } from "../../../src/content/abyss/abyss-modifiers.js";

describe("createAbyssController", () => {
  it("enters abyss, updates run, emits event and returns profile", () => {
    const emit = mock.fn();
    const eventBus = { emit };
    const controller = createAbyssController(eventBus);

    const run = { campaign: { abyssDepth: 0 }, mode: "normal" };
    const profile = controller.enter(run);

    assert.equal(run.mode, "abyss");
    assert.equal(run.campaign.abyssDepth, 1);
    assert.equal(emit.mock.calls.length, 1);
    assert.deepEqual(emit.mock.calls[0].arguments, ["abyss-entered", {}]);
    assert.equal(profile.depth, 1);
    assert.equal(profile.enemyMultiplier, 1.12);
  });

  it("handles enter without eventBus correctly", () => {
    const controller = createAbyssController(null);
    const run = { campaign: { abyssDepth: 0 }, mode: "normal" };
    assert.doesNotThrow(() => controller.enter(run));
  });

  it("generates correct profile for a given depth", () => {
    const controller = createAbyssController({});
    const depth = 5;
    const profile = controller.profile(depth);

    assert.deepEqual(profile, {
      depth: 5,
      enemyMultiplier: 1 + 5 * 0.12,
      eliteMultiplier: 1 + 5 * 0.08,
      corruptionGain: 4 + 5,
      faultMultiplier: 1 + 5 * 0.06,
      lootMultiplier: 1 + 5 * 0.1,
      extraction: false, // 5 % 3 !== 0
      boss: true, // 5 % 5 === 0
      forbiddenTier: 1, // Math.floor(5 / 4)
      modifiers: ABYSS_MODIFIERS
    });
  });

  it("advances depth and returns profile", () => {
    const controller = createAbyssController({});

    const changeMock = mock.fn();

    const run = {
      campaign: { abyssDepth: 2 },
      mode: "abyss",
      time: 100,
      corruption: { value: 0, pending: 0, highest: 0 },
      services: {
        corruption: {
          change: changeMock
        }
      }
    };

    const profile = controller.advance(run);

    assert.equal(run.campaign.abyssDepth, 3);
    assert.equal(profile.depth, 3);
    assert.equal(profile.extraction, true); // 3 % 3 === 0

    // Check that changeRunCorruption correctly called the system service
    assert.equal(changeMock.mock.calls.length, 1);
    // run.corruption, amount = 4 + 3 = 7, sourceId = "abyss-depth", time = 100, options = { allowAbyss: true }
    assert.deepEqual(changeMock.mock.calls[0].arguments, [
      run.corruption, 7, "abyss-depth", 100, { allowAbyss: true }
    ]);
  });

  it("calculates score correctly", () => {
    const controller = createAbyssController({});
    const run = {
      campaign: { abyssDepth: 4, bossProgress: 2 },
      score: 1000,
      kills: 50,
      time: 100,
      corruption: { value: 20 }
    };

    const score = controller.score(run);

    // (4 * 1000) + 1000 + (50 * 10) + (2 * 500) - (100 * 2) - (20 * 3)
    // 4000 + 1000 + 500 + 1000 - 200 - 60 = 6240
    assert.equal(score, 6240);
  });

  it("calculates score correctly with missing corruption value", () => {
    const controller = createAbyssController({});
    const run = {
      campaign: { abyssDepth: 2, bossProgress: 0 },
      score: 500,
      kills: 10,
      time: 50,
      corruption: {}
    };

    const score = controller.score(run);

    // (2 * 1000) + 500 + (10 * 10) + (0 * 500) - (50 * 2) - (0 * 3)
    // 2000 + 500 + 100 + 0 - 100 - 0 = 2500
    assert.equal(score, 2500);
  });
});
