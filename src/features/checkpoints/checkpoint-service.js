import { createIdService } from "../../core/ids.js";
import { createRunRng } from "../../core/rng.js";

const COLLECTION = "__voidreaperCollection";

function encodeCollections(value) {
  if (value instanceof Map) return { [COLLECTION]: "Map", entries: [...value].map(([key, entry]) => [encodeCollections(key), encodeCollections(entry)]) };
  if (value instanceof Set) return { [COLLECTION]: "Set", values: [...value].map(encodeCollections) };
  if (Array.isArray(value)) return value.map(encodeCollections);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => typeof entry !== "function").map(([key, entry]) => [key, encodeCollections(entry)]));
}

function decodeCollections(value) {
  if (Array.isArray(value)) return value.map(decodeCollections);
  if (!value || typeof value !== "object") return value;
  if (value[COLLECTION] === "Map") return new Map(value.entries.map(([key, entry]) => [decodeCollections(key), decodeCollections(entry)]));
  if (value[COLLECTION] === "Set") return new Set(value.values.map(decodeCollections));
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, decodeCollections(entry)]));
}

const asMap = value => value instanceof Map ? value : new Map(Array.isArray(value) ? value : Object.entries(value ?? {}));
const asSet = value => value instanceof Set ? value : new Set(Array.isArray(value) ? value : Object.values(value ?? {}));

export function serializeCheckpointRun(run) {
  return encodeCollections({
    ...run,
    services: undefined,
    ids: undefined,
    rng: { seed: run.rng.seed, state: run.rng.snapshot() },
  });
}

export function hydrateCheckpointRun(snapshot, services) {
  const run = decodeCollections(snapshot);
  run.pools = asMap(run.pools);
  run.eventState = asMap(run.eventState);
  run.build.tags = asMap(run.build.tags);
  run.player.tags = asMap(run.player.tags);
  run.player.stats = asMap(run.player.stats);
  run.player.statusEffects = asMap(run.player.statusEffects);
  if (run.corruption) {
    run.corruption.discoveredSignatures = asSet(run.corruption.discoveredSignatures);
    run.corruption.committedTransformations = asSet(run.corruption.committedTransformations);
  }
  if (run.heat) {
    run.heat.sourceHeat = asMap(run.heat.sourceHeat);
    run.heat.disableCounts = asMap(run.heat.disableCounts);
  }
  run.rng = createRunRng(run.rng.seed, run.rng.state);
  run.ids = createIdService(run.id);
  run.services = services;
  return run;
}

export function createCheckpointService(saveStore, eventBus) {
  return {
    async writeAfterNode(run, nodeId) { if (!run.campaign.visitedNodeIds.includes(nodeId)) throw new Error("Checkpoint requires a completed node"); const checkpoint = { savedAt: new Date().toISOString(), nodeId, run: serializeCheckpointRun(run) }; await saveStore.setCheckpoint(checkpoint); eventBus?.emit("checkpoint-written", { nodeId }); return checkpoint; },
    hydrate(checkpoint, services) { return checkpoint ? { ...checkpoint, run: hydrateCheckpointRun(checkpoint.run, services) } : null; },
    async load(services) { return this.hydrate(await saveStore.getCheckpoint(), services); },
    async clear(reason = "run-ended") { await saveStore.clearCheckpoint(); eventBus?.emit("checkpoint-cleared", { reason }); }
  };
}
