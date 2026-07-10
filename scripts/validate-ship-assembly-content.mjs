import { SHIPS } from "../src/content/ships/index.js";
import { WEAPONS } from "../src/content/weapons/index.js";
import { REACTORS } from "../src/content/reactors/reactors.js";
import { MODULES } from "../src/content/modules/index.js";
import { SHIP_FRAME_ASSEMBLY_PROFILES } from "../src/features/ship-assembly/content/ship-frame-assembly-profiles.js";
import { MODULE_VISUAL_PROFILES } from "../src/features/ship-assembly/content/module-visual-profiles.js";
import { resolveModuleAssemblyProfile } from "../src/features/ship-assembly/content/module-assembly-resolver.js";
import { getCoreGeometryIds } from "../src/features/ship-assembly/geometry/core-geometry-builders.js";
import { createModuleCoreRendererRegistry } from "../src/render/ship-assembly/module-core-renderers.js";
import { DAMAGE_BEHAVIORS } from "../src/content/ship-assembly/module-damage-behaviors.js";
import { BLUEPRINT_VERSION } from "../src/features/ship-assembly/blueprints/blueprint-schema.js";
import { migrateShipAssemblySave } from "../src/persistence/migrations/ship-assembly-migration.js";
const definitions=[...SHIPS,...WEAPONS,...REACTORS,...MODULES],errors=[],sizes=new Set(["S","M","L","XL"]),mounts=new Set(["axial","lateral","dorsal","ventral","structural","radial"]),energy=new Set(["standard","precision","heavy","thermal","void"]),banned=/placeholder|generic-final/i;
if(SHIP_FRAME_ASSEMBLY_PROFILES.length!==10)errors.push(`ship profiles: ${SHIP_FRAME_ASSEMBLY_PROFILES.length}`);
const coreIds=new Set(getCoreGeometryIds()),rendererIds=new Set(createModuleCoreRendererRegistry().ids()),visuals=new Map(MODULE_VISUAL_PROFILES.map(profile=>[profile.id,profile]));
for(const frame of SHIP_FRAME_ASSEMBLY_PROFILES){if(!coreIds.has(frame.coreGeometryId))errors.push(`${frame.id}: core renderer missing`);if(banned.test(frame.coreGeometryId))errors.push(`${frame.id}: forbidden final renderer id`);for(const port of frame.initialPorts){if(!sizes.has(port.sizeClass))errors.push(`${frame.id}/${port.key}: invalid port size`);if(!mounts.has(port.mountType))errors.push(`${frame.id}/${port.key}: invalid mount type`);if(!energy.has(port.energyClass))errors.push(`${frame.id}/${port.key}: invalid energy class`);}}
for(const visual of visuals.values()){if(!visual.rendererId||!rendererIds.has(visual.rendererId))errors.push(`${visual.id}: module renderer missing`);if(!DAMAGE_BEHAVIORS[visual.id])errors.push(`${visual.id}: damage behavior missing`);if(banned.test(visual.rendererId))errors.push(`${visual.id}: forbidden final renderer id`);}
for(const definition of definitions){const profile=resolveModuleAssemblyProfile(definition);if(!visuals.has(profile.visualProfileId))errors.push(`${definition.id}: visual profile missing`);if(!sizes.has(profile.sizeClass))errors.push(`${definition.id}: size missing`);if(!energy.has(profile.energyClass))errors.push(`${definition.id}: invalid energy class`);if(!profile.mountTypes?.length||profile.mountTypes.some(type=>!mounts.has(type)))errors.push(`${definition.id}: mounts invalid`);if(!Number.isFinite(profile.mass)||profile.mass<=0)errors.push(`${definition.id}: mass missing`);if(!(profile.damage?.armor>0&&profile.damage?.core>0))errors.push(`${definition.id}: damage missing`);if((profile.childPorts?.length??0)>4)errors.push(`${definition.id}: too many child ports`);if(banned.test(profile.rendererId??""))errors.push(`${definition.id}: forbidden renderer`);}
if(BLUEPRINT_VERSION!==1)errors.push(`blueprint version: ${BLUEPRINT_VERSION}`);if(typeof migrateShipAssemblySave!=="function")errors.push("ship assembly migration missing");
if(errors.length){console.error(errors.join("\n"));process.exit(1);} console.info(`[assembly] validated ${definitions.length} equipment profiles, ${SHIP_FRAME_ASSEMBLY_PROFILES.length} ship frames, ${MODULE_VISUAL_PROFILES.length} visual families`);
