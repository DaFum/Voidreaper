import { CURRENT_SAVE_VERSION, createDefaultSave } from "./save-schema.js";
import { convertLegacyMeta } from "../content/migrations/legacy-meta-conversion.js";
import { migrateShipAssemblySave } from "./migrations/ship-assembly-migration.js";

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

const byId = value => Array.isArray(value) ? Object.fromEntries(value.map((entry, index) => [entry.instanceId ?? entry.id ?? String(index), entry])) : (value ?? {});

export function migrateLegacySave(legacy = {}) {
  const save = createDefaultSave();
  save.profile.totalRuns = Number(legacy.totalRuns) || 0;
  save.profile.totalKills = Number(legacy.totalKills) || 0;
  save.currencies.voidShards = Number(legacy.shards) || 0;
  save.legacy.best = Number(legacy.best) || 0;
  save.legacy.dailyBest = clone(legacy.dailyBest ?? {});
  save.legacy.meta = clone(legacy.meta ?? {});
  save.legacy.achievements = [...new Set(legacy.ach ?? legacy.achievements ?? [])];
  save.migrationHistory.push({ from: "voidreaper-eternal", to: CURRENT_SAVE_VERSION, at: new Date().toISOString() });
  return convertLegacyMeta(migrateShipAssemblySave(save,{fromVersion:0}));
}

export function migrateSave(input) {
  if (!input || typeof input !== "object") return createDefaultSave();
  if (!input.saveVersion) return migrateLegacySave(input);
  const originalVersion = input.saveVersion;

  const processedInput = { ...input };
  if (Array.isArray(processedInput.inventory)) processedInput.inventory = byId(processedInput.inventory);
  if (Array.isArray(processedInput.wreckSignals)) processedInput.wreckSignals = byId(processedInput.wreckSignals);
  if (Array.isArray(processedInput.codex)) processedInput.codex = byId(processedInput.codex);
  if (Array.isArray(processedInput.challenges)) processedInput.challenges = byId(processedInput.challenges);

  let save = mergeDefaults(createDefaultSave(), processedInput);
  if (save.saveVersion > CURRENT_SAVE_VERSION) {
    console.warn(`Save version ${save.saveVersion} is newer than supported version ${CURRENT_SAVE_VERSION}.`);
    return save;
  }
  if (originalVersion < CURRENT_SAVE_VERSION) {
    save.migrationBackups = save.migrationBackups || {};
    save.migrationBackups[`v${originalVersion}-${Date.now()}`] = clone(input);
    save.migrationHistory.push({ from: originalVersion, to: CURRENT_SAVE_VERSION, at: new Date().toISOString() });
  }
  save.saveVersion = CURRENT_SAVE_VERSION;
  return convertLegacyMeta(migrateShipAssemblySave(save,{fromVersion:originalVersion}));
}
