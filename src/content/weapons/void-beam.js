import { createWeaponDefinition } from "./weapon-schema.js";
import { createBeamController } from "../../features/combat/beam-controller.js";

const beam = createBeamController();
const adapter = {
  createState: beam.createState,
  update: beam.update,
  fire: () => true,
  onEquip: () => {}, onUnequip: () => {},
  getTelemetry: (_context, state) => beam.telemetry(state)
};

export default createWeaponDefinition({
  id: "void-beam", name: "VOID BEAM", energyCost: 44, heat: 8, corruption: 4,
  tags: [{ id: "Weapon", value: 1 }, { id: "Beam", value: 3 }, { id: "Void", value: 2 }, { id: "Corruption", value: 2 }, { id: "Control", value: 1 }],
  effects: [{ id: "deal-damage" }, { id: "move-enemy" }], faultProfileId: "weapon-beam", unlockSource: "blueprint"
}, adapter);
