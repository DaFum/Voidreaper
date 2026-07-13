import { SHIPS } from "../src/content/ships/index.js";
import { WEAPONS } from "../src/content/weapons/index.js";
import { REACTORS } from "../src/content/reactors/reactors.js";
import { MODULES } from "../src/content/modules/index.js";
import { SOCKET_CHIPS } from "../src/content/sockets/socket-chips.js";
import { LEGACY_EVOLUTIONS } from "../src/content/evolutions/legacy-evolutions.js";
import { WEAPON_EVOLUTIONS } from "../src/content/evolutions/weapon-evolutions.js";
import { CORE_EFFECT_HANDLERS } from "../src/content/effects/core-effects.js";
import { MODULE_EFFECT_IDS } from "../src/content/effects/module-effect-manifest.js";
import { CHALLENGES } from "../src/content/challenges/challenges.js";
import { RESEARCH_TREE } from "../src/content/research/research-tree.js";
import { SYNERGY_DEFINITIONS } from "../src/content/tags/synergy-definitions.js";
import { TAG_DEFINITIONS } from "../src/content/tags/tag-definitions.js";
import { ONBOARDING_STEPS } from "../src/content/onboarding/onboarding-steps.js";


const fail = message => { throw new Error(`[content] ${message}`); };
const exact = (label, values, count) => { if (values.length !== count) fail(`${label}: expected ${count}, received ${values.length}`); };
const required = (label, values, fields) => { const ids = new Set(); for (const value of values) { for (const field of fields) if (value[field] == null) fail(`${label} ${value.id ?? "?"}: missing ${field}`); if (ids.has(value.id)) fail(`${label}: duplicate id ${value.id}`); ids.add(value.id); } return ids; };
const assertNoDuplicates = (sets) => { const all = new Set(); for (const s of sets) { for (const id of s) { if (all.has(id)) fail(`Cross-catalog duplicate id: ${id}`); all.add(id); } } return all; };

exact("ships", SHIPS, 10); exact("weapons", WEAPONS, 10); exact("reactors", REACTORS, 12); exact("modules", MODULES, 120);
if (SOCKET_CHIPS.length < 24) fail(`socket chips: expected at least 24, received ${SOCKET_CHIPS.length}`);
const catalogIds = assertNoDuplicates([required("ships", SHIPS, ["id","name"]), required("weapons", WEAPONS, ["id","name"]), required("reactors", REACTORS, ["id","name"]), required("modules", MODULES, ["id","name","slot"]), required("socket chips", SOCKET_CHIPS, ["id","name"])]);

const effects = new Set([...Object.keys(CORE_EFFECT_HANDLERS), "evolution-prism-lance", "evolution-singularity", "evolution-blood-halo", "evolution-reaper-protocol", "evolution-ion-tempest", "ship-gravewright-duration", "ship-furnace-pressure", "ship-vector-momentum", "ship-vesper-adaptation", "ship-null-choir-rule", "ship-bastion-entrench", "ship-harrow-harvest", "ship-shepherd-network", "ship-specter-phase", "ship-reliquary-threshold", "reactor-furnace-heart", "reactor-cold-star", "reactor-kill-energy", "reactor-hull-energy", "reactor-void-crucible", "reactor-pulse", "reactor-summon-energy", "reactor-entropy", "reactor-mirror", "reactor-null", "reactor-abyssal-growth", ...MODULE_EFFECT_IDS]);
for (const evolution of WEAPON_EVOLUTIONS) for (const effect of evolution.effects) { if (!effect || typeof effect !== 'object' || !effect.id) fail(`evolution ${evolution.id}: effect is not an object with id: ${effect}`); if (!effects.has(effect.id)) fail(`evolution ${evolution.id}: unknown effect ${effect.id}`); }
for (const evolution of LEGACY_EVOLUTIONS) for (const effect of evolution.effects) { if (typeof effect !== 'string') fail(`evolution ${evolution.id}: legacy effect is not a string`); if (!effects.has(effect)) fail(`evolution ${evolution.id}: unknown effect ${effect}`); }
const validTags = new Set(TAG_DEFINITIONS.map(t => t.id));
for (const item of [...SHIPS, ...WEAPONS, ...REACTORS, ...MODULES]) {
  const itemEffects = [...(item.effects || []), ...(item.triggers?.flatMap(t => t.effects || []) || [])];
  for (const effect of itemEffects) { if (!effect || typeof effect !== 'object' || !effect.id) fail(`${item.id}: effect is not an object with id: ${effect}`); if (!effects.has(effect.id)) fail(`${item.id}: unknown effect ${effect.id}`); }
  for (const tag of (item.tags || [])) { const tagId = typeof tag === "string" ? tag : tag?.id; if (!validTags.has(tagId)) fail(`${item.id}: unknown tag ${tagId}`); }
}
const currencies = new Set(["voidShards","bossCores","anomalyData","challengeSeals","salvageFragments"]);
for (const challenge of CHALLENGES) for (const currency of Object.keys(challenge.reward)) if (!currencies.has(currency)) fail(`challenge ${challenge.id}: unknown reward ${currency}`);

const featureUnlocks = new Set(["load-preview","workshop-lock","workshop-overclock","map-scan-1","map-reroll","furnace-path","grave-path","null-path","codex-analyzed","vault-30","vault-50","affix-extraction","salvage-missions","vesper","railgun","regular-evolution","energy","overload","bastion","workshop","heat","active-module","corruption","forbidden-signature","extraction","prototype-vault"]);

for (const step of ONBOARDING_STEPS) {
  for (const unlock of step.unlocks) {
    if (!catalogIds.has(unlock) && !featureUnlocks.has(unlock)) fail(`onboarding step ${step.title}: unknown unlock ${unlock}`);
  }
}

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

for (const synergy of SYNERGY_DEFINITIONS) {
  for (const effect of synergy.effects || []) {
    if (!effect || typeof effect !== 'object' || !effect.id) fail("synergy " + synergy.id + ": effect is not an object with id: " + effect);
    if (!effects.has(effect.id)) fail("synergy " + synergy.id + ": unknown effect " + effect.id);
  }
}