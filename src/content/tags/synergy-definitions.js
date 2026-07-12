export const SYNERGY_DEFINITIONS = Object.freeze([
  { id: "ballistic-convergence", name: "Ballistic Convergence", type: "threshold", requirements: [{ id: "Projectile", minimum: 4 }, { id: "Pierce", minimum: 2 }], effects: [{ id: "spawn-projectile" }] },
  { id: "plasma-discharge", name: "Plasma Discharge", type: "cross", requirements: [{ id: "Burn", minimum: 2 }, { id: "Shock", minimum: 2 }], effects: [{ id: "deal-damage" }] },
  { id: "critical-charge", name: "Critical Charge", type: "trigger", requirements: [{ id: "Critical", minimum: 3 }, { id: "Charge", minimum: 1 }], effects: [{ id: "change-cooldown" }] },
  { id: "thermal-fracture", name: "Thermal Fracture", type: "conflict", requirements: [{ id: "Cooling", minimum: 2 }, { id: "Heat", minimum: 3 }], effects: [{ id: "trigger-fault" }] },
  { id: "choir-collapse", name: "Unbekannte Signatur // CHOIR", type: "forbidden", requirements: [{ id: "Void", minimum: 3 }, { id: "Echo", minimum: 2 }], minimumCorruption: 50, minimumLoad: 1.3, effects: [{ id: "mark-evolution" }] }
]);
