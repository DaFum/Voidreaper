const fault = (id, name, tier, effectId) => ({ id, name, tier, effectId });

export const FAULTS = Object.freeze([
  fault("target-drift", "Target Drift", "light", "move-enemy"),
  fault("scatter-spike", "Scatter Spike", "light", "apply-status"),
  fault("energy-surge", "Energy Cost Surge", "light", "change-resource"),
  fault("drone-pause", "Drone Pause", "light", "disable-module"),
  fault("early-detonation", "Early Detonation", "medium", "spawn-zone"),
  fault("proximity-mine", "Proximity Mine", "medium", "spawn-zone"),
  fault("shield-inversion", "Shield Inversion", "medium", "apply-status"),
  fault("beam-drag", "Beam Drag", "medium", "teleport"),
  fault("module-shutdown", "Module Shutdown", "heavy", "disable-module"),
  fault("projectile-reflection", "Projectile Reflection", "heavy", "spawn-projectile"),
  fault("hostile-drone", "Hostile Drone", "heavy", "summon-unit"),
  fault("reactor-zone", "Reactor Discharge Zone", "heavy", "spawn-zone")
]);

const byTier = tier => FAULTS.filter(entry => entry.tier === tier).map(entry => entry.id);

export const FAULT_PROFILES = Object.freeze([
  { id: "standard", name: "Standard Systems", light: byTier("light"), medium: byTier("medium"), heavy: byTier("heavy") },
  { id: "weapon-projectile", name: "Projectile Feed", light: ["target-drift", "scatter-spike"], medium: ["early-detonation"], heavy: ["projectile-reflection"] },
  { id: "weapon-drone", name: "Drone Link", light: ["drone-pause"], medium: ["shield-inversion"], heavy: ["hostile-drone"] },
  { id: "weapon-beam", name: "Beam Conduit", light: ["energy-surge"], medium: ["beam-drag"], heavy: ["module-shutdown"] },
  { id: "reactor", name: "Reactor Core", light: ["energy-surge"], medium: ["shield-inversion"], heavy: ["reactor-zone"] }
]);
