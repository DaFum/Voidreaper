const evolution = (id, name, weaponFamily, kind, requirements, effects, options = {}) => ({ id, name, weaponFamily, kind, requirements, effects, visible: kind !== "forbidden", ...options });

export const WEAPON_EVOLUTIONS = [
  evolution("prism-lance", "Prism Lance", "railgun", "regular", [{ type: "tag", id: "Projectile", minimum: 3 }, { type: "tag", id: "Pierce", minimum: 2 }], ["evolution-prism-lance"]),
  evolution("event-horizon-driver", "Event Horizon Driver", "railgun", "alternative", [{ type: "tag", id: "Void", minimum: 2 }, { type: "tag", id: "Control", minimum: 2 }], ["spawn-zone"]),
  evolution("fractured-lance", "Fractured Lance", "railgun", "forbidden", [{ type: "corruption", minimum: 50 }, { type: "load", minimum: 1.3 }], ["spawn-projectile"], { permanentDownside: true }),
  evolution("solar-kiln", "Solar Kiln", "plasma-caster", "regular", [{ type: "tag", id: "Burn", minimum: 3 }, { type: "tag", id: "Heat", minimum: 2 }], ["spawn-zone"]),
  evolution("cinder-bloom", "Cinder Bloom", "plasma-caster", "alternative", [{ type: "tag", id: "Plasma", minimum: 3 }, { type: "tag", id: "Explosive", minimum: 2 }], ["spawn-zone"]),
  evolution("star-eater", "Star-Eater", "plasma-caster", "forbidden", [{ type: "corruption", minimum: 50 }, { type: "tag", id: "Sacrifice", minimum: 1 }], ["deal-damage"], { permanentDownside: true }),
  evolution("seraph-barrage", "Seraph Barrage", "missile-battery", "regular", [{ type: "tag", id: "Homing", minimum: 3 }], ["spawn-projectile"]),
  evolution("chain-cataclysm", "Chain Cataclysm", "missile-battery", "alternative", [{ type: "tag", id: "Explosive", minimum: 3 }, { type: "tag", id: "Chain", minimum: 2 }], ["spawn-projectile"]),
  evolution("judas-swarm", "Judas Swarm", "missile-battery", "forbidden", [{ type: "corruption", minimum: 50 }], ["spawn-projectile"], { permanentDownside: true }),
  evolution("aegis-constellation", "Aegis Constellation", "drone-core", "regular", [{ type: "tag", id: "Drone", minimum: 4 }, { type: "tag", id: "Shield", minimum: 2 }], ["grant-shield"]),
  evolution("predator-mesh", "Predator Mesh", "drone-core", "alternative", [{ type: "tag", id: "Drone", minimum: 4 }, { type: "tag", id: "Execute", minimum: 2 }], ["deal-damage"]),
  evolution("orphan-protocol", "Orphan Protocol", "drone-core", "forbidden", [{ type: "corruption", minimum: 50 }, { type: "tag", id: "Sacrifice", minimum: 1 }], ["summon-unit"], { permanentDownside: true })
];
