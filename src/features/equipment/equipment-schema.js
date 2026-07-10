export const EQUIPMENT_SLOT = Object.freeze({
  SHIP: "ship",
  PRIMARY_WEAPON: "primary-weapon",
  REACTOR: "reactor",
  PASSIVE: "passive",
  ACTIVE: "active",
  UTILITY: "utility",
  RELIC: "relic"
});

export const ITEM_RARITY = Object.freeze(["common", "uncommon", "rare", "epic", "legendary", "unique"]);

export const EQUIPMENT_REQUIRED_FIELDS = Object.freeze(["slot", "energyCost", "tags", "effects", "faultProfileId"]);
