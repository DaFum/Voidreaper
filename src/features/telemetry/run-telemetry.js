export function createRunTelemetry() {
  let currentEpisodePeak = null;
  const data = { damageBySource: {}, heatPeaks: [], faults: [], assemblyDamage: [], flightProfiles: [], synergies: [], evolutionProgress: [], codexSignatures: [], prototypes: [] };
  return {
    data,
    damage(source, amount) { data.damageBySource[source] = (data.damageBySource[source] ?? 0) + amount; },
    heat(value, time) { if (value >= 85) { if (!currentEpisodePeak || value > currentEpisodePeak.value) { const peak = { value, time }; if (currentEpisodePeak && data.heatPeaks.at(-1)?.time === currentEpisodePeak.time) { data.heatPeaks[data.heatPeaks.length - 1] = peak; } else { data.heatPeaks.push(peak); } currentEpisodePeak = peak; } } else { currentEpisodePeak = null; } },
    fault(fault) { data.faults.push({ id: fault.id, time: fault.time }); },
    moduleDamage(event) { data.assemblyDamage.push(structuredClone(event)); },
    flightProfile(profile,time) { data.flightProfiles.push({time,totalMass:profile.totalMass,lateralImbalance:profile.lateralImbalance}); },
    snapshot(run) { data.synergies = run.build.synergies.map(entry => entry.id ?? entry); data.evolutionProgress = run.build.evolutions; data.prototypes = run.inventory.filter(item => ["prototype", "relic"].includes(item.ownership)).map(item => ({ id: item.instanceId, secured: item.secured })); return structuredClone(data); },
    exportLocal() { return structuredClone(data); }
  };
}
