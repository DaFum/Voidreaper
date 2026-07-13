import { SHIPS } from "./src/content/ships/index.js";
import { WEAPONS } from "./src/content/weapons/index.js";
import { REACTORS } from "./src/content/reactors/reactors.js";
import { MODULES } from "./src/content/modules/index.js";
import { TAG_DEFINITIONS } from "./src/content/tags/tag-definitions.js";

const allTags = new Set();
for (const item of [...SHIPS, ...WEAPONS, ...REACTORS, ...MODULES]) {
  for (const tag of (item.tags || [])) {
    allTags.add(tag);
  }
}
console.log("Used tags:", Array.from(allTags));

const definedTags = new Set(TAG_DEFINITIONS.map(t => t.id));
for (const t of allTags) {
  if (!definedTags.has(t)) console.log("Missing tag:", t);
}
for (const t of definedTags) {
  if (!allTags.has(t)) console.log("Unused tag:", t);
}
