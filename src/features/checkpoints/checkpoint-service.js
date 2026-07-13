import { createIdService } from "../../core/ids.js";
import { createRunRng } from "../../core/rng.js";

const COLLECTION = "__voidreaperCollection";

function encodeCollections(value) {
  if (value instanceof Map) return { [COLLECTION]: "Map", entries: [...value].map(([key, entry]) => [encodeCollections(key), encodeCollections(entry)]) };
  if (value instanceof Set) return { [COLLECTION]: "Set", values: [...value].map(encodeCollections) };
  if (Array.isArray(value)) return value.map(encodeCollections);
  if (!value || typeof value !== "object") return value;
  if (typeof value.toJSON === "function") return encodeCollections(value.toJSON());
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

function deriveIdCounter(value, runId) {
  let maximum = 0;
  const seen = new WeakSet();
  const visit = entry => {
    if (typeof entry === "string" && entry.startsWith(`${runId}-`)) {
      const suffix = entry.slice(entry.lastIndexOf("-") + 1);
      if (/^[0-9a-z]+$/i.test(suffix)) maximum = Math.max(maximum, Number.parseInt(suffix, 36));
      return;
    }
    if (entry && typeof entry === "object") { if (seen.has(entry)) return; seen.add(entry); }
    if (entry instanceof Map) { for (const [key, child] of entry) { visit(key); visit(child); } return; }
    if (entry instanceof Set || Array.isArray(entry)) { for (const child of entry) visit(child); return; }
    if (entry && typeof entry === "object") for (const child of Object.values(entry)) visit(child);
  };
  visit(value);
  return maximum;
}

export function serializeCheckpointRun(run) {
  return encodeCollections({
    ...run,
    services: undefined,
    ids: undefined,
    idCounter: run.ids?.snapshot?.() ?? deriveIdCounter(run, run.id),
    rng: { seed: run.rng.seed, state: run.rng.snapshot() },
  });
}

export function hydrateCheckpointRun(snapshot, services) {
  const run = decodeCollections(snapshot);
  run.pendingAssemblyItems ??= [];
  run.pools = asMap(run.pools);
  run.eventState = asMap(run.eventState);
  if (run.build.tags?.totals) { run.build.tags.totals = asMap(run.build.tags.totals); if (run.build.tags.provenance) run.build.tags.provenance = asMap(run.build.tags.provenance); } else run.build.tags = asMap(run.build.tags);
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
  run.ids = createIdService(run.id, Number.isFinite(run.idCounter) ? run.idCounter : deriveIdCounter(run, run.id));
  delete run.idCounter;
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
