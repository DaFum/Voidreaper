const chip = (id, name, tags, behavior) => ({ id, name, slot: "socket", tags, behavior });

export const SOCKET_CHIPS = Object.freeze([
  chip("echo-chip", "Echo Chip", ["Echo"], "repeat-third-effect"),
  chip("thermal-vent", "Thermal Vent", ["Heat", "Nova"], "overheat-damage-wave"),
  chip("hunter-kernel", "Hunter Kernel", ["Targeting", "Elite"], "prioritize-elites"),
  chip("mirror-shard", "Mirror Shard", ["Echo", "Projectile"], "mirror-projectiles"),
  chip("null-seal", "Null Seal", ["Corruption", "Stability"], "reduce-corruption-block-forbidden"),
  chip("blood-circuit", "Blood Circuit", ["Healing", "Charge"], "healing-charges-active"),
  chip("rail-splinter", "Rail Splinter", ["Projectile", "Pierce"], "split-after-pierce"),
  chip("plasma-seed", "Plasma Seed", ["Plasma", "Burn"], "burn-spawns-zone"),
  chip("seraph-eye", "Seraph Eye", ["Homing", "Critical"], "retarget-on-kill"),
  chip("hive-memory", "Hive Memory", ["Drone", "Summon"], "replace-lost-drone"),
  chip("storm-link", "Storm Link", ["Arc", "Chain"], "chain-through-player"),
  chip("void-mouth", "Void Mouth", ["Beam", "Void"], "beam-consumes-pickups"),
  chip("grave-trigger", "Grave Trigger", ["Mine", "Cooldown"], "mines-follow-corpse"),
  chip("reaper-tooth", "Reaper Tooth", ["Orbit", "Bleed"], "blade-returns-on-kill"),
  chip("grey-spore", "Grey Spore", ["Corrosion", "Summon"], "infection-clones"),
  chip("probability-knot", "Probability Knot", ["Anomaly", "Echo"], "store-last-anomaly"),
  chip("coolant-vein", "Coolant Vein", ["Cooling"], "movement-vents-heat"),
  chip("flux-prism", "Flux Prism", ["Currency", "Loot"], "convert-heal-to-flux"),
  chip("phase-thread", "Phase Thread", ["Dodge", "Movement"], "dodge-leaves-decoy"),
  chip("shield-lens", "Shield Lens", ["Shield", "Beam"], "shield-focuses-beam"),
  chip("fault-anchor", "Fault Anchor", ["Fault", "Stability"], "redirect-light-fault"),
  chip("salvage-mark", "Salvage Mark", ["Loot", "Prototype"], "mark-elite-drop"),
  chip("workshop-key", "Workshop Key", ["Crafting"], "free-first-socket-action"),
  chip("abyss-signal", "Abyss Signal", ["Void", "Corruption"], "abyss-depth-scales-chip")
]);
