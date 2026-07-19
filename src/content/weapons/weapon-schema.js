const WEAPON_METHODS = Object.freeze(["createState", "update", "fire", "onEquip", "onUnequip", "getTelemetry"]);

export function assertWeaponAdapter(adapter, id = "weapon") {
  for (const method of WEAPON_METHODS) if (typeof adapter[method] !== "function") throw new Error(`${id} missing ${method}()`);
  return adapter;
}

export function createWeaponDefinition(data, adapter) {
  return Object.freeze({ slot: "primary-weapon", energyCost: 20, faultProfileId: "weapon-projectile", effects: [], ...data, adapter: assertWeaponAdapter(adapter, data.id) });
}
