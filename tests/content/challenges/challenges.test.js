import test from "node:test";
import assert from "node:assert/strict";
import { createMasteryChallenges } from "../../../src/content/challenges/challenges.js";

test("createMasteryChallenges generates exactly 5 challenges per item", () => {
  const ships = [{ id: "vesper", name: "Vesper" }];
  const weapons = [{ id: "railgun", name: "Railgun" }];

  const challenges = createMasteryChallenges(ships, weapons);

  assert.equal(challenges.length, 10, "Creates 5 challenges per ship and 5 per weapon");

  const vesperChallenges = challenges.filter(c => c.category === "ship" && c.id.startsWith("mastery-vesper-"));
  assert.equal(vesperChallenges.length, 5, "Creates 5 challenges for vesper");

  const railgunChallenges = challenges.filter(c => c.category === "weapon" && c.id.startsWith("mastery-railgun-"));
  assert.equal(railgunChallenges.length, 5, "Creates 5 challenges for railgun");
});

test("createMasteryChallenges correctly configures mastery tiers and targets", () => {
  const ships = [{ id: "vesper", name: "Vesper" }];
  const challenges = createMasteryChallenges(ships, []);

  for (let i = 0; i < 5; i++) {
    const challenge = challenges[i];
    const tier = i + 1;
    assert.equal(challenge.mastery.tier, tier, `Tier should be ${tier}`);
    assert.equal(challenge.mastery.target, tier * 10, `Target should be ${tier * 10}`);
    assert.equal(challenge.reward.challengeSeals, tier, `Reward should be ${tier} seals`);
  }
});