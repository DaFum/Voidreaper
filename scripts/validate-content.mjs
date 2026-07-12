import { SHIPS } from "../src/content/ships/index.js";
import { WEAPONS } from "../src/content/weapons/index.js";
import { REACTORS } from "../src/content/reactors/reactors.js";
import { MODULES } from "../src/content/modules/index.js";
import { SOCKET_CHIPS } from "../src/content/sockets/socket-chips.js";
import { LEGACY_EVOLUTIONS } from "../src/content/evolutions/legacy-evolutions.js";
import { WEAPON_EVOLUTIONS } from "../src/content/evolutions/weapon-evolutions.js";
import { CORE_EFFECT_HANDLERS } from "../src/content/effects/core-effects.js";
import { CHALLENGES } from "../src/content/challenges/challenges.js";
import { RESEARCH_TREE } from "../src/content/research/research-tree.js";

const fail = message => { throw new Error(`[content] ${message}`); };
const exact = (label, values, count) => { if (values.length !== count) fail(`${label}: expected ${count}, received ${values.length}`); };
const required = (label, values, fields) => { const ids = new Set(); for (const value of values) { for (const field of fields) if (value[field] == null) fail(`${label} ${value.id ?? "?"}: missing ${field}`); if (ids.has(value.id)) fail(`${label}: duplicate id ${value.id}`); ids.add(value.id); } return ids; };
const assertNoDuplicates = (sets) => { const all = new Set(); for (const s of sets) { for (const id of s) { if (all.has(id)) fail(`Cross-catalog duplicate id: ${id}`); all.add(id); } } return all; };

exact("ships", SHIPS, 10); exact("weapons", WEAPONS, 10); exact("reactors", REACTORS, 12); exact("modules", MODULES, 120);
if (SOCKET_CHIPS.length < 24) fail(`socket chips: expected at least 24, received ${SOCKET_CHIPS.length}`);
const catalogIds = assertNoDuplicates([required("ships", SHIPS, ["id","name"]), required("weapons", WEAPONS, ["id","name"]), required("reactors", REACTORS, ["id","name"]), required("modules", MODULES, ["id","name","slot"]), required("socket chips", SOCKET_CHIPS, ["id","name"])]);
const moduleEffects = [
  "module-splitter-matrix", "module-critical-resonator", "module-blast-compressor", "module-chain-conductor", "module-sniper-kernel", "module-execution-protocol", "module-piercing-rail", "module-plasma-accelerant", "module-volatile-casing", "module-hunter-lock", "module-echo-chamber", "module-void-aperture", "module-bleed-serrator", "module-storm-capacitor", "module-mine-amplifier", "module-drone-weapon-link", "module-nanite-brood", "module-beam-lens", "module-orbit-expander", "module-nova-igniter", "module-recoil-harvester", "module-mark-of-ruin", "module-salvo-brain", "module-thermal-breach", "module-sacrificial-guidance", "module-gravity-warhead", "module-phase-ammunition", "module-predator-algorithm", "module-shock-puncture", "module-entropy-amplifier", "module-phase-shield", "module-reactive-armor", "module-nanite-repair", "module-emergency-cooling", "module-damage-router", "module-last-barrier", "module-kinetic-dampers", "module-void-insulation", "module-drone-screen", "module-thermal-plating", "module-blood-seal", "module-mirror-shell", "module-stasis-gel", "module-ablative-lattice", "module-guardian-node", "module-fault-grounding", "module-cold-blood-loop", "module-shock-absorber", "module-escape-vector", "module-phoenix-array", "module-gravity-siphon", "module-target-priority-core", "module-salvage-scanner", "module-affix-booster", "module-motion-battery", "module-extraction-beacon", "module-flux-condenser", "module-map-probe", "module-workshop-pass", "module-merchant-transponder", "module-heat-telemetry", "module-fault-predictor", "module-corruption-filter", "module-module-switcher", "module-socket-extractor", "module-prototype-locker", "module-scrap-compactor", "module-elite-tracker", "module-coolant-reservoir", "module-signal-decoder", "module-gravity-anchor", "module-shock-net", "module-mine-wall", "module-decoy-drone", "module-repulsion-wave", "module-void-tether", "module-chronolock", "module-target-scramble", "module-nanite-snare", "module-orbit-cage", "module-shield-pulse", "module-time-stop", "module-phase-jump", "module-emergency-vent", "module-hull-conversion", "module-drone-recall", "module-null-field", "module-fault-reset", "module-stasis-shell", "module-phoenix-trigger", "module-reactor-discharge", "module-remote-detonator", "module-orbital-strike", "module-void-gate", "module-drone-overclock", "module-blood-burst", "module-arc-cascade", "module-plasma-flood", "module-rail-salvo", "module-nanite-consume", "module-anomaly-cast", "module-execution-dive", "module-singularity-anchor", "module-missile-saturation", "module-reaper-unbound", "module-black-heart", "module-whispering-targeter", "module-parasitic-cooling", "module-inverted-shield", "module-hungry-socket", "module-broken-timer", "module-friendly-fire-core", "module-orphan-command", "module-mirror-wound", "module-unwritten-rule", "module-crown-of-static", "module-saint-of-machines", "module-grave-sun", "module-eye-beyond-zero", "module-last-perfect-engine"
];
const effects = new Set([...Object.keys(CORE_EFFECT_HANDLERS), "evolution-prism-lance", "evolution-singularity", "evolution-blood-halo", "evolution-reaper-protocol", "evolution-ion-tempest", "ship-gravewright-duration", "ship-furnace-pressure", "ship-vector-momentum", "ship-vesper-adaptation", "ship-null-choir-rule", "ship-bastion-entrench", "ship-harrow-harvest", "ship-shepherd-network", "ship-specter-phase", "ship-reliquary-threshold", "reactor-furnace-heart", "reactor-cold-star", "reactor-kill-energy", "reactor-hull-energy", "reactor-void-crucible", "reactor-pulse", "reactor-summon-energy", "reactor-entropy", "reactor-mirror", "reactor-null", "reactor-abyssal-growth", ...moduleEffects]);
for (const evolution of [...LEGACY_EVOLUTIONS, ...WEAPON_EVOLUTIONS]) for (const effect of evolution.effects) { if (!effect || typeof effect !== 'object' || !effect.id) fail(`evolution ${evolution.id}: effect is not an object with id: ${effect}`); if (!effects.has(effect.id)) fail(`evolution ${evolution.id}: unknown effect ${effect.id}`); }
for (const item of [...SHIPS, ...WEAPONS, ...REACTORS, ...MODULES]) {
  const itemEffects = [...(item.effects || []), ...(item.triggers?.flatMap(t => t.effects || []) || [])];
  for (const effect of itemEffects) { if (!effect || typeof effect !== 'object' || !effect.id) fail(`${item.id}: effect is not an object with id: ${effect}`); if (!effects.has(effect.id)) fail(`${item.id}: unknown effect ${effect.id}`); }
}
const currencies = new Set(["voidShards","bossCores","anomalyData","challengeSeals","salvageFragments"]);
for (const challenge of CHALLENGES) for (const currency of Object.keys(challenge.reward)) if (!currencies.has(currency)) fail(`challenge ${challenge.id}: unknown reward ${currency}`);
const featureUnlocks = new Set(["load-preview","workshop-lock","workshop-overclock","map-scan-1","map-reroll","furnace-path","grave-path","null-path","codex-analyzed","vault-30","vault-50","affix-extraction","salvage-missions"]);

const researchIds = new Set(RESEARCH_TREE.map(n => n.id));
for (const node of RESEARCH_TREE) {
  for (const prereq of node.prerequisites || []) {
    if (!researchIds.has(prereq)) fail(`research ${node.id}: unknown prerequisite ${prereq}`);
  }
}
function hasCycle(nodeId, visited = new Set(), path = new Set()) {
  if (path.has(nodeId)) return true;
  if (visited.has(nodeId)) return false;
  visited.add(nodeId);
  path.add(nodeId);
  const node = RESEARCH_TREE.find(n => n.id === nodeId);
  if (node) {
    for (const prereq of node.prerequisites || []) {
      if (hasCycle(prereq, visited, path)) return true;
    }
  }
  path.delete(nodeId);
  return false;
}
const visitedResearch = new Set();
for (const node of RESEARCH_TREE) {
  if (hasCycle(node.id, visitedResearch)) fail(`research ${node.id}: dependency cycle detected`);
}

const researchUnlocks = new Set(RESEARCH_TREE.flatMap(node => node.unlocks));
for (const node of RESEARCH_TREE) for (const unlock of node.unlocks) if (!catalogIds.has(unlock) && !featureUnlocks.has(unlock)) fail(`research ${node.id}: unknown unlock ${unlock}`);
for (const item of [...SHIPS, ...WEAPONS, ...REACTORS, ...MODULES]) {
  if (item.unlockSource === "research" && !researchUnlocks.has(item.id)) fail(`${item.id} requires research unlock but is not in any RESEARCH_TREE node.`);
}
console.info(`[content] valid · ${SHIPS.length} ships · ${WEAPONS.length} weapons · ${REACTORS.length} reactors · ${MODULES.length} modules · ${SOCKET_CHIPS.length} chips`);
