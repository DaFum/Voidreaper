import { createWeaponDefinition } from "./weapon-schema.js";
import { createBasicWeaponAdapter } from "../../features/combat/weapon-controller.js";

export default createWeaponDefinition({
  id: "railgun", name: "RAILGUN", energyCost: 22, heat: 4,
  tags: [{ id: "Weapon", value: 1 }, { id: "Projectile", value: 2 }, { id: "Kinetic", value: 2 }, { id: "Critical", value: 1 }, { id: "Pierce", value: 1 }],
  effects: [{ id: "spawn-projectile" }], faultProfileId: "weapon-projectile", unlockSource: "blueprint"
}, createBasicWeaponAdapter({ cooldown: 0.42, effect: { id: "spawn-projectile", payload: { speed: 920, damage: 18, pierce: 1, color: "#4cc9f0" } } }));
