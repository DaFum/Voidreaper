import { CURRENT_SAVE_VERSION, createDefaultSave } from "./save-schema.js";
import { convertLegacyMeta } from "../content/migrations/legacy-meta-conversion.js";
import { migrateShipAssemblySave } from "./migrations/ship-assembly-migration.js";
import { migrateTutorialSave } from "./migrations/tutorial-migration.js";

const clone = value => JSON.parse(JSON.stringify(value));

const isPlainObject = value => value !== null && typeof value === "object" && !Array.isArray(value);

// Keys that must never be copied from (possibly hand-edited or imported) save
// JSON, or a crafted value would pollute Object.prototype during the merge.
const UNSAFE_KEYS = new Set(["__proto__", "constructor", "prototype"]);
const MAX_MIGRATION_BACKUPS = 3;

function mergeDefaults(defaults, value) {
  if (!isPlainObject(value)) return clone(defaults);
  const merged = clone(defaults);
  for (const key of Object.keys(value)) {
    if (UNSAFE_KEYS.has(key)) continue;
    if (isPlainObject(merged[key]) && isPlainObject(value[key])) {
      merged[key] = mergeDefaults(merged[key], value[key]);
    } else if (value[key] !== undefined) {
      merged[key] = clone(value[key]);
    }
  }
  return merged;
}

// Tolerate null/sparse elements (a single bad entry must not throw and abort
// the whole migration into a default-profile reset) and preserve entries that
// collide on id by suffixing the index instead of silently dropping them.
const byId = value => {
  if (!Array.isArray(value)) return value ?? {};
  // Build via Object.fromEntries so a persisted id of "__proto__" (or other
  // prototype key) becomes an own enumerable property instead of triggering the
  // prototype setter and silently dropping the entry.
  const seen = new Set();
  const entries = [];
  value.forEach((entry, index) => {
    if (entry == null || typeof entry !== "object") return;
    let key = entry.instanceId ?? entry.id ?? String(index);
    if (seen.has(key)) key = `${key}-${index}`;
    seen.add(key);
    entries.push([key, entry]);
  });
  return Object.fromEntries(entries);
};

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
  return convertLegacyMeta(migrateTutorialSave(migrateShipAssemblySave(save,{fromVersion:0}), { fromVersion: 0, legacyOnboarding: legacy.onboarding }));
}

export function migrateSave(input) {
  if (!input || typeof input !== "object") return createDefaultSave();
  if (!input.saveVersion) return migrateLegacySave(input);
  const originalVersion = input.saveVersion;

  const processedInput = { ...input };
  const legacyOnboarding = processedInput.onboarding;
  for (const key of ["inventory", "wreckSignals", "codex", "challenges"]) {
    if (Array.isArray(processedInput[key])) {
      processedInput[key] = byId(processedInput[key]);
    }
  }

  let save = mergeDefaults(createDefaultSave(), processedInput);
  if (save.saveVersion > CURRENT_SAVE_VERSION) {
    console.warn(`Save version ${save.saveVersion} is newer than supported version ${CURRENT_SAVE_VERSION}.`);
    return save;
  }
  if (originalVersion < CURRENT_SAVE_VERSION) {
    save.migrationBackups = save.migrationBackups || {};
    const backup = clone(input);
    delete backup.migrationBackups;
    delete backup.checkpoint;
    if (backup.shipBlueprints) {
      for (const bp of Object.values(backup.shipBlueprints)) {
        if (bp) delete bp.thumbnailDataUrl;
      }
    }
    save.migrationBackups[`v${originalVersion}-${Date.now()}`] = backup;
    const backupKeys = Object.keys(save.migrationBackups);
    for (const key of backupKeys.slice(0, -MAX_MIGRATION_BACKUPS)) delete save.migrationBackups[key];
    save.migrationHistory.push({ from: originalVersion, to: CURRENT_SAVE_VERSION, at: new Date().toISOString() });
  }
  save.saveVersion = CURRENT_SAVE_VERSION;
  return convertLegacyMeta(migrateTutorialSave(migrateShipAssemblySave(save,{fromVersion:originalVersion}), { fromVersion: originalVersion, legacyOnboarding, existingTutorial: processedInput.tutorial }));
}
