export const CURRENT_SAVE_VERSION = 2;

export function createDefaultSave() {
  return {
    saveVersion: CURRENT_SAVE_VERSION,
    profile: {
      createdAt: new Date().toISOString(),
      totalRuns: 0,
      totalKills: 0
    },
    currencies: {
      voidShards: 0
    },
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
    unlocks: {
      vesper: true,
      railgun: true,
      "standard-core": true
    },
    inventory: {},
    blueprints: {},
    checkpoint: null,
    settings: {
      reducedMotion: false,
      screenShake: true,
      damageFlashes: true,
      crt: true,
      uiScale: 1,
      largeTouchControls: false,
      bindings: {}
    },
    migrationHistory: []
  };
}
