import { MODULE_VISUAL_PROFILE_BY_ID } from "./module-visual-profiles.js";
import { hashString } from "../../../core/rng.js";
const tagsOf = (definition) =>
  new Set(
    (definition.tags ?? []).map((tag) =>
      typeof tag === "string" ? tag : tag.id,
    ),
  );
function selectProfile(definition) {
  const tags = tagsOf(definition);
  if (definition.overrideVisualProfileId) return definition.overrideVisualProfileId;
  if (definition.slot === "reactor") return "reactor-aux";

  if (definition.unique) {
    if (tags.has("Corruption") || tags.has("Void")) return "corrupted-node";
    if (tags.has("Drone")) return "drone-bay";
    if (tags.has("Shield")) return "shield-emitter";
    if (tags.has("Cooling") || tags.has("Heat")) return "cooling-array";
    if (tags.has("Orbit")) return "orbit-hub";
    if (tags.has("Beam") || tags.has("Mine") || tags.has("Explosive") || tags.has("Homing") || tags.has("Projectile") || tags.has("Critical")) return "weapon-linear";
    return "structure-spine";
  }

  // Weapon classification first
  if (tags.has("Beam")) return "weapon-beam";
  if (tags.has("Mine")) return "weapon-mine";
  if (tags.has("Explosive") || tags.has("Homing")) return "weapon-missile";
  if (tags.has("Projectile") || tags.has("Critical") || definition.slot === "weapon") return "weapon-linear";

  // Generic gameplay tags
  if (tags.has("Drone") || tags.has("Summon")) return "drone-bay";
  if (tags.has("Shield") || tags.has("Hull") || tags.has("Armor") || tags.has("Healing") || tags.has("Revive") || tags.has("Dodge") || tags.has("Stability")) return "shield-emitter";
  if (tags.has("Cooling") || tags.has("Heat") || tags.has("Burn")) return "cooling-array";
  if (tags.has("Orbit") || tags.has("Control") || tags.has("Movement") || tags.has("Pickup") || tags.has("Extraction")) return "orbit-hub";
  if (tags.has("Void") || tags.has("Anomaly") || tags.has("Corruption") || tags.has("Fault") || tags.has("Sacrifice")) return "void-anomaly";
  if (tags.has("Structure") || tags.has("Adapter") || tags.has("Loadout") || tags.has("Socket") || tags.has("Crafting") || tags.has("Affix") || tags.has("Prototype")) return "structure-spine";
  if (tags.has("Sensor") || tags.has("Targeting") || tags.has("Loot") || tags.has("Navigation") || tags.has("Merchant") || tags.has("Codex") || tags.has("Elite")) return "sensor-array";
  if (tags.has("Energy") || tags.has("Charge") || tags.has("Cooldown") || tags.has("Currency")) return "reactor-aux";

  return "utility-node";
}
export function defaultChildPorts(visual, sizeClass) {
  const make = (key, size, mount, x, y, load, distance = 34) => ({
    key,
    sizeClass: size,
    mountType: mount,
    direction: { x, y },
    localPosition: { x: x * distance, y: y * distance },
    loadCapacity: load,
    energyClass: "standard",
    acceptedEnergyClasses: [
      "standard",
      "precision",
      "heavy",
      "thermal",
      "void",
    ],
  });
  if (visual.id === "structure-spine")
    return [
      make("branch-forward", "L", "structural", 0, 1, 14, 56),
      make("branch-port", "M", "lateral", -1, 0.2, 8, 72),
      make("branch-starboard", "M", "lateral", 1, 0.2, 8, 72),
      make("branch-dorsal", "S", "dorsal", 0, -1, 4, 48),
    ];
  if (["L", "XL"].includes(sizeClass))
    return [make("utility-branch", "M", "lateral", 1, 0.25, 8, 60)];
  if (sizeClass === "M")
    return [make("micro-port", "S", "dorsal", 0, 1, 4, 42)];
  return [];
}
const requiresWorkbench = (definition, profile) =>
  Boolean(
    profile.requiresWorkbench ||
    definition.corruption > 0 ||
    ["L", "XL"].includes(profile.sizeClass) ||
    profile.visualProfileId === "structure-spine" ||
    profile.visualProfileId === "corrupted-node",
  );
export function resolveModuleAssemblyProfile(definition) {
  if (definition.assembly) {
    const profile = structuredClone(definition.assembly);
    if (profile.variantSeed === undefined)
      profile.variantSeed = hashString(definition.id);
    profile.requiresWorkbench = requiresWorkbench(definition, profile);
    return profile;
  }
  const visualProfileId = selectProfile(definition),
    visual = MODULE_VISUAL_PROFILE_BY_ID.get(visualProfileId);
  if (!visual)
    throw new Error(
      `Unknown module visual profile "${visualProfileId}" for definition "${definition.id}"`,
    );
  const sizeClass = definition.assemblySizeClass ?? visual.sizeClass;
  const mass =
    definition.assemblyMass ?? { S: 3, M: 6, L: 11, XL: 18 }[sizeClass];
  const profile = {
    visualProfileId: visual.id,
    rendererId: visual.rendererId,
    variantSeed: hashString(definition.id),
    sizeClass,
    mountTypes: definition.assemblyMountTypes ?? visual.preferredMounts,
    loadDemand: definition.assemblyLoadDemand ?? Math.ceil(mass * 0.8),
    energyClass:
      definition.assemblyEnergyClass ??
      (tagsOf(definition).has("Void")
        ? "void"
        : tagsOf(definition).has("Heat")
          ? "thermal"
          : "standard"),
    mass,
    damage: definition.assemblyDamage ?? {
      armor: 28 + mass * 2,
      core: 18 + mass,
    },
    childPorts:
      definition.assemblyChildPorts ?? defaultChildPorts(visual, sizeClass),
    requiresWorkbench: false,
    hitShape:
      visual.id.includes("orbit") || visual.id.includes("shield")
        ? "ring"
        : visual.id.includes("weapon")
          ? "capsule"
          : "circle",
  };
  profile.requiresWorkbench = requiresWorkbench(definition, profile);
  return profile;
}
