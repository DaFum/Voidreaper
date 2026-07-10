import { createWeaponDefinition } from "./weapon-schema.js";
import { createDroneController } from "../../features/combat/drone-controller.js";

const controller = createDroneController();
const adapter = {
  createState: () => ({ spawnCooldown: 0 }),
  update(context, state, dt) { state.spawnCooldown -= dt; if (state.spawnCooldown <= 0) { controller.spawn(context, "drone-core"); state.spawnCooldown = 4; } controller.update(context, dt); },
  fire(context, _state, target) { if (!target) return false; for (const drone of controller.drones) context.emitEffect({ id: "spawn-projectile", payload: { x: drone.x, y: drone.y, damage: 7, speed: 500 } }, { target }); return controller.drones.length > 0; },
  onEquip: () => {}, onUnequip: () => {}, getTelemetry: () => ({ activeDrones: controller.drones.length })
};

export default createWeaponDefinition({
  id: "drone-core", name: "DRONE CORE", energyCost: 42, heat: 2,
  tags: [{ id: "Weapon", value: 1 }, { id: "Drone", value: 3 }, { id: "Summon", value: 2 }, { id: "Energy", value: 2 }],
  effects: ["summon-unit", "spawn-projectile"], faultProfileId: "weapon-drone", unlockSource: "challenge"
}, adapter);
