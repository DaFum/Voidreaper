import { SHIPS } from "../src/content/ships/index.js";
import { WEAPONS } from "../src/content/weapons/index.js";
import { REACTORS } from "../src/content/reactors/reactors.js";
import { MODULES } from "../src/content/modules/index.js";
import { SHIP_FRAME_ASSEMBLY_PROFILES } from "../src/features/ship-assembly/content/ship-frame-assembly-profiles.js";
import { MODULE_VISUAL_PROFILES } from "../src/features/ship-assembly/content/module-visual-profiles.js";
import { resolveModuleAssemblyProfile } from "../src/features/ship-assembly/content/module-assembly-resolver.js";
const definitions=[...SHIPS,...WEAPONS,...REACTORS,...MODULES]; const errors=[];
if(SHIP_FRAME_ASSEMBLY_PROFILES.length!==10)errors.push(`ship profiles: ${SHIP_FRAME_ASSEMBLY_PROFILES.length}`);
const visuals=new Set(MODULE_VISUAL_PROFILES.map(profile=>profile.id));
for(const definition of definitions){const profile=resolveModuleAssemblyProfile(definition); if(!visuals.has(profile.visualProfileId))errors.push(`${definition.id}: visual profile missing`); if(!profile.sizeClass)errors.push(`${definition.id}: size missing`); if(!profile.mountTypes?.length)errors.push(`${definition.id}: mounts missing`); if(!Number.isFinite(profile.mass))errors.push(`${definition.id}: mass missing`); if(!(profile.damage?.armor>0&&profile.damage?.core>0))errors.push(`${definition.id}: damage missing`);}
if(errors.length){console.error(errors.join("\n"));process.exit(1);} console.info(`[assembly] validated ${definitions.length} equipment profiles, ${SHIP_FRAME_ASSEMBLY_PROFILES.length} ship frames, ${MODULE_VISUAL_PROFILES.length} visual families`);
