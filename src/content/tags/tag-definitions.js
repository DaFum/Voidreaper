const groups = {
  delivery: ["Projectile", "Beam", "Orbit", "Drone", "Mine", "Aura", "Summon", "Nova"],
  damage: ["Kinetic", "Plasma", "Arc", "Void", "Bleed", "Burn", "Shock", "Corrosion"],
  behavior: ["Critical", "Pierce", "Chain", "Explosive", "Homing", "Echo", "Execute", "Control"],
  resource: ["Energy", "Heat", "Corruption", "Charge", "Cooldown", "Sacrifice", "Cooling", "Shield", "Healing", "Movement", "Loot", "Stability", "Revive", "Targeting", "Pickup", "Affix", "Socket", "Prototype", "Currency", "Navigation", "Crafting", "Merchant", "Extraction", "Fault", "Elite", "Loadout"],
  origin: ["Weapon", "ActiveModule", "PassiveModule", "Ship", "Reactor", "Affix", "Socket", "Relic", "Anomaly"]
};

export const TAG_DEFINITIONS = Object.freeze(Object.entries(groups).flatMap(([category, ids]) =>
  ids.map(id => ({ id, name: id, category }))
));
