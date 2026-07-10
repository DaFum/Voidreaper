const node = (id, name, cost, unlocks, description) => ({ id, name, branch: "arsenal", cost: { voidShards: cost }, prerequisites: [], unlocks, description });

export const PHASE_TWO_UNLOCKS = Object.freeze([
  node("research-railgun", "Railgun Schematics", 20, ["railgun"], "Präzise Kinetikwaffe und reguläre Evolutionsanalyse."),
  node("research-plasma", "Plasma Containment", 35, ["plasma-caster"], "Plasmabeschleuniger und Hitze-Telemetrie."),
  node("research-missile", "Guidance Lattice", 45, ["missile-battery"], "Zielsuchende Salven und Explosionsaffixe."),
  node("research-reaper", "Reaper Geometry", 45, ["reaper-blades"], "Orbitalklingen und Blood-Halo-Signatur."),
  { id: "challenge-drone", name: "Drone Mastery", branch: "challenge", cost: {}, prerequisites: [], unlocks: ["drone-core"], description: "Drohnen über Challenge-Flag." },
  { id: "challenge-arc", name: "Arc Mastery", branch: "challenge", cost: {}, prerequisites: [], unlocks: ["arc-generator"], description: "Arc über Challenge-Flag." },
  { id: "challenge-mine", name: "Mine Mastery", branch: "challenge", cost: {}, prerequisites: [], unlocks: ["mine-layer"], description: "Minen über Challenge-Flag." },
  { id: "blueprint-void", name: "Void Beam Blueprint", branch: "blueprint", cost: {}, prerequisites: [], unlocks: ["void-beam"], description: "Null-Cathedral-Blaupause." },
  { id: "blueprint-nanite", name: "Nanite Swarm Blueprint", branch: "blueprint", cost: {}, prerequisites: [], unlocks: ["nanite-swarm"], description: "Grave-Circuit-Blaupause." },
  { id: "blueprint-anomaly", name: "Anomaly Engine Blueprint", branch: "blueprint", cost: {}, prerequisites: [], unlocks: ["anomaly-engine"], description: "Unbekannte Anomalie-Signatur." }
]);
