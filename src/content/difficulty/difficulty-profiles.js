export const DIFFICULTY_PROFILES = Object.freeze([
  { id: "initiate", name: "Initiate", enemyDensity: .8, faultRate: .5, repairCost: .7, eliteSynergy: .6, loot: .9, protectCommonPrototypes: true, startingCorruption: 0 },
  { id: "standard", name: "Standard", enemyDensity: 1, faultRate: 1, repairCost: 1, eliteSynergy: 1, loot: 1, protectCommonPrototypes: false, startingCorruption: 0 },
  { id: "reaper", name: "Reaper", enemyDensity: 1.25, faultRate: 1.35, repairCost: 1.3, eliteSynergy: 1.4, loot: 1.25, protectCommonPrototypes: false, startingCorruption: 10 },
  { id: "abyssal", name: "Abyssal", enemyDensity: 1.5, faultRate: 1.7, repairCost: 1.6, eliteSynergy: 1.8, loot: 1.5, protectCommonPrototypes: false, startingCorruption: 25, extendedBossMechanics: true }
]);
const DIFFICULTY_BY_ID = new Map(DIFFICULTY_PROFILES.map(profile => [profile.id, profile]));
