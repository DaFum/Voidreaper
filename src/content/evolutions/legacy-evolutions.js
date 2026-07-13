export const LEGACY_EVOLUTIONS = Object.freeze([
  {
    id: "prism", name: "PRISM LANCE", icon: "⟁", weaponFamily: "railgun", kind: "regular", visible: true,
    requirements: [{ type: "upgrade", id: "multi", minimum: 1 }, { type: "upgrade", id: "bspeed", minimum: 1 }],
    description: "Durchschlägt alle Gegner · +50% Projektiltempo",
    effects: ["evolution-prism-lance"], tags: [{ id: "Projectile", value: 2 }, { id: "Pierce", value: 3 }]
  },
  {
    id: "singularity", name: "SINGULARITY", icon: "◉", weaponFamily: "nova", kind: "regular", visible: true,
    requirements: [{ type: "upgrade", id: "nova", minimum: 1 }, { type: "upgrade", id: "magnet", minimum: 1 }],
    description: "Nova-Abklingzeit −20% · bündelt Gegner",
    effects: ["evolution-singularity"], tags: [{ id: "Nova", value: 2 }, { id: "Control", value: 2 }]
  },
  {
    id: "bloodhalo", name: "BLOOD HALO", icon: "❂", weaponFamily: "reaper-blades", kind: "regular", visible: true,
    requirements: [{ type: "upgrade", id: "orbit", minimum: 1 }, { type: "upgrade", id: "regen", minimum: 1 }],
    description: "+2 Orbitalklingen · Lebensentzug",
    effects: ["evolution-blood-halo"], tags: [{ id: "Orbit", value: 2 }, { id: "Healing", value: 2 }]
  },
  {
    id: "reaperprot", name: "REAPER PROTOCOL", icon: "☠", weaponFamily: "railgun", kind: "alternative", visible: true,
    requirements: [{ type: "upgrade", id: "dmg", minimum: 1 }, { type: "upgrade", id: "crit", minimum: 1 }],
    description: "+15% kritische Trefferchance · Leere-Schaden",
    effects: ["evolution-reaper-protocol"], tags: [{ id: "Critical", value: 2 }, { id: "Void", value: 1 }]
  },
  {
    id: "tempest", name: "ION TEMPEST", icon: "※", weaponFamily: "arc-generator", kind: "regular", visible: true,
    requirements: [{ type: "upgrade", id: "rate", minimum: 1 }, { type: "upgrade", id: "speed", minimum: 1 }],
    description: "Kettenblitze springen weiter · +Bewegungstempo",
    effects: ["evolution-ion-tempest"], tags: [{ id: "Arc", value: 2 }, { id: "Movement", value: 2 }]
  }
]);
