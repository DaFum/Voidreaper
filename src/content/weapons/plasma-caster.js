import { createWeaponDefinition } from "./weapon-schema.js";
import { createBasicWeaponAdapter } from "../../features/combat/weapon-controller.js";

export default createWeaponDefinition({
  id: "plasma-caster", name: "PLASMA CASTER", energyCost: 30, heat: 11,
  tags: [{ id: "Weapon", value: 1 }, { id: "Projectile", value: 1 }, { id: "Plasma", value: 2 }, { id: "Burn", value: 2 }, { id: "Heat", value: 2 }, { id: "Explosive", value: 1 }],
  effects: ["spawn-projectile", "spawn-zone"], faultProfileId: "weapon-projectile", unlockSource: "research"
}, createBasicWeaponAdapter({ cooldown: 0.65, effect: { id: "spawn-projectile", payload: { speed: 420, damage: 24, radius: 8, status: "burn", color: "#ff8f1f" } } }));
