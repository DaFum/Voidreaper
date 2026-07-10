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
  evolution("orphan-protocol", "Orphan Protocol", "drone-core", "forbidden", [{ type: "corruption", minimum: 50 }, { type: "tag", id: "Sacrifice", minimum: 1 }], ["summon-unit"], { permanentDownside: true }),
  evolution("thunder-crown", "Thunder Crown", "arc-generator", "regular", [{ type: "tag", id: "Arc", minimum: 4 }, { type: "tag", id: "Movement", minimum: 2 }], ["deal-damage"]),
  evolution("neural-storm", "Neural Storm", "arc-generator", "alternative", [{ type: "tag", id: "Shock", minimum: 3 }, { type: "tag", id: "Critical", minimum: 2 }], ["apply-status"]),
  evolution("blackout-gospel", "Blackout Gospel", "arc-generator", "forbidden", [{ type: "corruption", minimum: 50 }, { type: "load", minimum: 1.3 }], ["disable-module", "deal-damage"], { permanentDownside: true }),
  evolution("erasure-ray", "Erasure Ray", "void-beam", "regular", [{ type: "tag", id: "Beam", minimum: 4 }, { type: "tag", id: "Execute", minimum: 2 }], ["deal-damage"]),
  evolution("graviton-scalpel", "Graviton Scalpel", "void-beam", "alternative", [{ type: "tag", id: "Control", minimum: 3 }], ["move-enemy"]),
  evolution("mouth-of-nothing", "Mouth of Nothing", "void-beam", "forbidden", [{ type: "corruption", minimum: 75 }], ["spawn-zone"], { permanentDownside: true }),
  evolution("quantum-lattice", "Quantum Lattice", "mine-layer", "regular", [{ type: "tag", id: "Mine", minimum: 4 }, { type: "tag", id: "Arc", minimum: 2 }], ["spawn-zone"]),
  evolution("funeral-orbit", "Funeral Orbit", "mine-layer", "alternative", [{ type: "tag", id: "Mine", minimum: 4 }, { type: "tag", id: "Orbit", minimum: 2 }], ["spawn-zone"]),
  evolution("friendly-fire-doctrine", "Friendly Fire Doctrine", "mine-layer", "forbidden", [{ type: "corruption", minimum: 50 }, { type: "tag", id: "Explosive", minimum: 4 }], ["spawn-zone"], { permanentDownside: true }),
  evolution("blood-halo", "Blood Halo", "reaper-blades", "regular", [{ type: "tag", id: "Orbit", minimum: 4 }, { type: "tag", id: "Healing", minimum: 2 }], ["heal-player"]),
  evolution("guillotine-array", "Guillotine Array", "reaper-blades", "alternative", [{ type: "tag", id: "Execute", minimum: 2 }], ["deal-damage"]),
  evolution("cannibal-crown", "Cannibal Crown", "reaper-blades", "forbidden", [{ type: "corruption", minimum: 50 }, { type: "tag", id: "Sacrifice", minimum: 2 }], ["copy-affix"], { permanentDownside: true })
];
