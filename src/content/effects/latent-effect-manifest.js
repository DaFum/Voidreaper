// Ship-signature and reactor effect ids that are declared on content but whose
// runtime handlers are not implemented yet (the weapon/reactor systems are not
// wired into bootstrap). Shared by the content validator (typo detection) and
// the effect registry (declareLatent), so "known but not yet implemented"
// stays distinguishable from a misspelled effect id at runtime. Hand-maintained
// on purpose — deriving this from the catalogs would let a typo validate
// itself. Remove an id from here when its real handler is registered.
export const SHIP_EFFECT_IDS = Object.freeze([
  "ship-gravewright-duration",
  "ship-furnace-pressure",
  "ship-vector-momentum",
  "ship-vesper-adaptation",
  "ship-null-choir-rule",
  "ship-bastion-entrench",
  "ship-harrow-harvest",
  "ship-shepherd-network",
  "ship-specter-phase",
  "ship-reliquary-threshold"
]);

export const REACTOR_EFFECT_IDS = Object.freeze([
  "reactor-furnace-heart",
  "reactor-cold-star",
  "reactor-kill-energy",
  "reactor-hull-energy",
  "reactor-void-crucible",
  "reactor-pulse",
  "reactor-summon-energy",
  "reactor-entropy",
  "reactor-mirror",
  "reactor-null",
  "reactor-abyssal-growth"
]);
