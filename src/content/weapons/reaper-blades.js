import { createWeaponDefinition } from "./weapon-schema.js";
import { createOrbitController } from "../../features/combat/orbit-controller.js";

const orbit = createOrbitController();
const adapter = {
  createState: () => ({}), update: (context, _state, dt) => orbit.update(context, dt), fire: () => true,
  onEquip: () => {}, onUnequip: () => {}, getTelemetry: () => ({ blades: orbit.blades.length })
};

export default createWeaponDefinition({ id: "reaper-blades", name: "REAPER BLADES", energyCost: 28, heat: 2, tags: [{ id: "Weapon", value: 1 }, { id: "Orbit", value: 3 }, { id: "Kinetic", value: 2 }, { id: "Bleed", value: 2 }, { id: "Critical", value: 1 }], effects: ["deal-damage"], faultProfileId: "weapon-projectile", unlockSource: "research" }, adapter);
