import { CURRENT_SAVE_VERSION, createDefaultSave } from "./save-schema.js";

const clone = value => JSON.parse(JSON.stringify(value));

function mergeDefaults(defaults, value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return clone(defaults);
  const merged = { ...clone(defaults), ...value };
  for (const [key, defaultValue] of Object.entries(defaults)) {
    if (defaultValue && typeof defaultValue === "object" && !Array.isArray(defaultValue)) {
      merged[key] = mergeDefaults(defaultValue, value[key]);
    }
  }
  return merged;
}

export function migrateLegacySave(legacy = {}) {
  const save = createDefaultSave();
  save.profile.totalRuns = Number(legacy.totalRuns) || 0;
  save.profile.totalKills = Number(legacy.totalKills) || 0;
  save.currencies.voidShards = Number(legacy.shards) || 0;
  save.legacy.best = Number(legacy.best) || 0;
  save.legacy.dailyBest = clone(legacy.dailyBest ?? {});
  save.legacy.meta = clone(legacy.meta ?? {});
  save.legacy.achievements = [...new Set(legacy.ach ?? legacy.achievements ?? [])];
  save.migrationHistory.push({ from: "voidreaper-eternal", to: 2, at: new Date().toISOString() });
  return save;
}

export function migrateSave(input) {
  if (!input || typeof input !== "object") return createDefaultSave();
  if (!input.saveVersion) return migrateLegacySave(input);
  let save = mergeDefaults(createDefaultSave(), input);
  if (save.saveVersion > CURRENT_SAVE_VERSION) {
    console.warn(`Save version ${save.saveVersion} is newer than supported version ${CURRENT_SAVE_VERSION}.`);
    return save;
  }
  save.saveVersion = CURRENT_SAVE_VERSION;
  return save;
}
