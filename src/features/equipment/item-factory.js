export function createItemInstance(definition, rollContext) {
  return {
    instanceId: rollContext.ids.create("item"),
    definitionId: definition.id,
    rarity: rollContext.rarity,
    itemPower: rollContext.itemPower,
    affixes: structuredClone(rollContext.affixes ?? []),
    sockets: structuredClone(rollContext.sockets ?? []),
    corruptionLevel: rollContext.corruptionLevel ?? 0,
    stability: rollContext.stability ?? 100,
    prototypeStatus: rollContext.prototypeStatus ?? "temporary",
    boundRunId: rollContext.runId ?? null,
    discoveredAt: new Date().toISOString()
  };
}
