import { createWeaponDefinition } from "./weapon-schema.js";
import { createBasicWeaponAdapter } from "../../features/combat/weapon-controller.js";

export default createWeaponDefinition({
  id: "arc-generator", name: "ARC GENERATOR", energyCost: 36, heat: 6,
  tags: [{ id: "Weapon", value: 1 }, { id: "Arc", value: 3 }, { id: "Chain", value: 2 }, { id: "Shock", value: 2 }, { id: "Energy", value: 1 }],
  effects: ["deal-damage", "apply-status"], faultProfileId: "weapon-beam", unlockSource: "challenge"
}, createBasicWeaponAdapter({ cooldown: 0.72, effect: { id: "deal-damage", amount: 16, chainCount: 3, statusId: "shock" } }));
