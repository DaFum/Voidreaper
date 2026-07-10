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

exact("ships", SHIPS, 10); exact("weapons", WEAPONS, 10); exact("reactors", REACTORS, 12); exact("modules", MODULES, 120);
if (SOCKET_CHIPS.length < 24) fail(`socket chips: expected at least 24, received ${SOCKET_CHIPS.length}`);
const catalogIds = new Set([...required("ships", SHIPS, ["id","name"]), ...required("weapons", WEAPONS, ["id","name"]), ...required("reactors", REACTORS, ["id","name"]), ...required("modules", MODULES, ["id","name","slot"]), ...required("socket chips", SOCKET_CHIPS, ["id","name"])]);
const effects = new Set([...Object.keys(CORE_EFFECT_HANDLERS), "evolution-prism-lance", "evolution-singularity", "evolution-blood-halo", "evolution-reaper-protocol", "evolution-ion-tempest"]);
for (const evolution of [...LEGACY_EVOLUTIONS, ...WEAPON_EVOLUTIONS]) for (const effect of evolution.effects) if (!effects.has(effect)) fail(`evolution ${evolution.id}: unknown effect ${effect}`);
const currencies = new Set(["voidShards","bossCores","anomalyData","challengeSeals","salvageFragments"]);
for (const challenge of CHALLENGES) for (const currency of Object.keys(challenge.reward)) if (!currencies.has(currency)) fail(`challenge ${challenge.id}: unknown reward ${currency}`);
const featureUnlocks = new Set(["load-preview","workshop-lock","workshop-overclock","map-scan-1","map-reroll","furnace-path","grave-path","null-path","codex-analyzed","vault-30","vault-50","affix-extraction","salvage-missions"]);
for (const node of RESEARCH_TREE) for (const unlock of node.unlocks) if (!catalogIds.has(unlock) && !featureUnlocks.has(unlock)) fail(`research ${node.id}: unknown unlock ${unlock}`);
console.info(`[content] valid · ${SHIPS.length} ships · ${WEAPONS.length} weapons · ${REACTORS.length} reactors · ${MODULES.length} modules · ${SOCKET_CHIPS.length} chips`);
