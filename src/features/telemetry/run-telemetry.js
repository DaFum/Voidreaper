export function createRunTelemetry() {
  const data = { damageBySource: {}, heatPeaks: [], faults: [], synergies: [], evolutionProgress: [], codexSignatures: [], prototypes: [] };
  return {
    data,
    damage(source, amount) { data.damageBySource[source] = (data.damageBySource[source] ?? 0) + amount; },
    heat(value, time) { if (value >= 85 && value > (data.heatPeaks.at(-1)?.value ?? 0)) data.heatPeaks.push({ value, time }); },
    fault(fault) { data.faults.push({ id: fault.id, time: fault.time }); },
    snapshot(run) { data.synergies = run.build.synergies.map(entry => entry.id ?? entry); data.evolutionProgress = run.build.evolutions; data.prototypes = run.inventory.filter(item => ["prototype", "relic"].includes(item.ownership)).map(item => ({ id: item.instanceId, secured: item.secured })); return structuredClone(data); },
    exportLocal() { return structuredClone(data); }
  };
}
