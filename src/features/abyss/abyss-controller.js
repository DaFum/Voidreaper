import { ABYSS_MODIFIERS } from "../../content/abyss/abyss-modifiers.js";
import { changeRunCorruption } from "../corruption/run-corruption.js";

export function createAbyssController(eventBus) {
  return {
    enter(run) { run.mode = "abyss"; run.campaign.abyssDepth = 1; eventBus?.emit("abyss-entered", {}); return this.profile(run.campaign.abyssDepth); },
    profile(depth) { return { depth, enemyMultiplier: 1 + depth * .12, eliteMultiplier: 1 + depth * .08, corruptionGain: 4 + depth, faultMultiplier: 1 + depth * .06, lootMultiplier: 1 + depth * .1, extraction: depth % 3 === 0, boss: depth % 5 === 0, forbiddenTier: Math.floor(depth / 4), modifiers: ABYSS_MODIFIERS }; },
    advance(run) { run.campaign.abyssDepth += 1; changeRunCorruption(run, 4 + run.campaign.abyssDepth, "abyss-depth"); return this.profile(run.campaign.abyssDepth); },
    score(run) { return Math.floor(run.campaign.abyssDepth * 1000 + run.score + run.kills * 10 + run.campaign.bossProgress * 500 - run.time * 2 - (run.corruption.value ?? 0) * 3); }
  };
}
