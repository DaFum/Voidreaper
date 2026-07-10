import { createWeaponDefinition } from "./weapon-schema.js";
import { createBasicWeaponAdapter } from "../../features/combat/weapon-controller.js";

export default createWeaponDefinition({
  id: "missile-battery", name: "MISSILE BATTERY", energyCost: 34, heat: 9,
  tags: [{ id: "Weapon", value: 1 }, { id: "Projectile", value: 2 }, { id: "Homing", value: 2 }, { id: "Explosive", value: 2 }, { id: "Heat", value: 1 }],
  effects: ["spawn-projectile", "spawn-zone"], faultProfileId: "weapon-projectile", unlockSource: "research"
}, createBasicWeaponAdapter({ cooldown: 0.9, effect: { id: "spawn-projectile", payload: { speed: 330, damage: 30, homing: true, delay: 0.25, explosive: true } } }));
