import { createWeaponDefinition } from "./weapon-schema.js";
import { createAnomalyController } from "../../features/combat/anomaly-controller.js";

const anomaly = createAnomalyController();
const adapter = { createState: anomaly.createState, update: () => {}, fire(context, state) { anomaly.roll(context, state); return true; }, onEquip: () => {}, onUnequip: () => {}, getTelemetry: (_context, state) => ({ lastEffect: state.lastEffect }) };

export default createWeaponDefinition({ id: "anomaly-engine", name: "ANOMALY ENGINE", energyCost: 40, heat: 5, corruption: 6, tags: [{ id: "Weapon", value: 1 }, { id: "Anomaly", value: 3 }, { id: "Echo", value: 2 }, { id: "Corruption", value: 2 }], effects: ["deal-damage", "teleport", "spawn-zone"], faultProfileId: "standard", unlockSource: "blueprint" }, adapter);
