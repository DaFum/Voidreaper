function serializableRun(run) {
  return {
    ...run,
    services: undefined,
    ids: undefined,
    rng: { seed: run.rng.seed, state: run.rng.snapshot() },
    pools: [...(run.pools ?? new Map()).entries()],
    eventState: [...(run.eventState ?? new Map()).entries()],
    build: { ...run.build, tags: [...(run.build.tags ?? new Map()).entries()] }
  };
}

export function createCheckpointService(saveStore, eventBus) {
  return {
    async writeAfterNode(run, nodeId) { if (!run.campaign.visitedNodeIds.includes(nodeId)) throw new Error("Checkpoint requires a completed node"); const checkpoint = { savedAt: new Date().toISOString(), nodeId, run: serializableRun(run) }; await saveStore.setCheckpoint(checkpoint); eventBus?.emit("checkpoint-written", { nodeId }); return checkpoint; },
    async load() { return saveStore.getCheckpoint(); },
    async clear(reason = "run-ended") { await saveStore.clearCheckpoint(); eventBus?.emit("checkpoint-cleared", { reason }); }
  };
}
