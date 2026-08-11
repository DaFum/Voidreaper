const WEAPON_METHODS = Object.freeze(["createState", "update", "fire", "onEquip", "onUnequip", "getTelemetry"]);

export function assertWeaponAdapter(adapter, id = "weapon") {
  for (const method of WEAPON_METHODS) if (typeof adapter[method] !== "function") throw new Error(`${id} missing ${method}()`);
  return adapter;
}

export function createWeaponDefinition(data, adapter) {
  const visual = Object.freeze({ color: "#4fead0", glow: "#7ff0ff", width: 2, particleStyle: "spark", ...data.visual });
  return Object.freeze({ slot: "primary-weapon", energyCost: 20, faultProfileId: "weapon-projectile", effects: [], ...data, visual, adapter: assertWeaponAdapter(adapter, data.id) });
}
