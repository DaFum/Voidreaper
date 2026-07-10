export function createMetaState() {
  return {
    currencies: { voidShards: 0, bossCores: 0, anomalyData: 0, challengeSeals: 0, salvageFragments: 0 },
    currencyHistory: {}, research: {}, unlocks: {}, blueprints: {}, shipBlueprints: {}, activeBlueprintId: null, blueprintLibraryVersion: 1, assemblyVisualPreferences: { lod: "auto", showBlueprintGhosts: true }, inventory: {}, overflow: {}, wreckSignals: {}, codex: {}, challenges: {},
    statistics: { runs: 0, victories: 0, kills: 0, deaths: 0, extractedPrototypes: 0, lostPrototypes: 0, bosses: {}, weapons: {}, ships: {} },
    records: { highscore: null, campaignTime: null, abyssDepth: null, daily: {}, bossRush: null },
    campaignPaths: { architect: { unlocked: true, completions: 0 } }, buildHistory: {}, onboarding: { skipped: false, completed: {} }
  };
}
