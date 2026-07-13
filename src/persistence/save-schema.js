import { createMetaState } from "../runtime/create-meta-state.js";

export const CURRENT_SAVE_VERSION = 6;

export function createDefaultSave() {
  const meta = createMetaState();
  return {
    saveVersion: CURRENT_SAVE_VERSION,
    profile: {
      createdAt: new Date().toISOString(),
      totalRuns: 0,
      totalKills: 0
    },
    currencies: meta.currencies,
    currencyHistory: meta.currencyHistory,
    legacy: {
      best: 0,
      dailyBest: {},
      meta: {},
      achievements: []
    },
    loadouts: {
      primary: null,
      saved: {}
    },
    research: meta.research,
    unlocks: {
      ...meta.unlocks,
      vesper: true,
      railgun: true,
      "standard-core": true
    },
    inventory: meta.inventory,
    overflow: meta.overflow,
    blueprints: meta.blueprints,
    shipBlueprints: meta.shipBlueprints,
    activeBlueprintId: meta.activeBlueprintId,
    blueprintLibraryVersion: meta.blueprintLibraryVersion,
    assemblyVisualPreferences: meta.assemblyVisualPreferences,
    wreckSignals: meta.wreckSignals,
    codex: meta.codex,
    challenges: meta.challenges,
    statistics: meta.statistics,
    records: meta.records,
    campaignPaths: meta.campaignPaths,
    buildHistory: meta.buildHistory,
    tutorial: meta.tutorial,
    checkpoint: null,
    settings: {
      reducedMotion: false,
      screenShake: true,
      damageFlashes: true,
      crt: true,
      uiScale: 1,
      largeTouchControls: false,
      colorPatterns: true,
      bindings: {}
    },
    migrationHistory: [],
    migrationBackups: {}
  };
}
