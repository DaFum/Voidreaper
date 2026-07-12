import { createWeaponDefinition } from "./weapon-schema.js";
import { createDroneController } from "../../features/combat/drone-controller.js";

// The controller holds per-run state (drone list, budget); it must be created per
// equip via createState, never at module scope, or it leaks across runs.
const adapter = {
  createState: () => ({ spawnCooldown: 0, controller: createDroneController() }),
  update(context, state, dt) { state.spawnCooldown -= dt; if (state.spawnCooldown <= 0) { state.controller.spawn(context, "drone-core"); state.spawnCooldown = 4; } state.controller.update(context, dt); },
  fire(context, state, target) { if (!target) return false; for (const drone of state.controller.drones) context.emitEffect({ id: "spawn-projectile", payload: { x: drone.x, y: drone.y, damage: 7, speed: 500 } }, { target }); return state.controller.drones.length > 0; },
  onEquip: () => {}, onUnequip: () => {}, getTelemetry: (_context, state) => ({ activeDrones: state.controller.drones.length })
};

export default createWeaponDefinition({
  id: "drone-core", name: "DRONE CORE", energyCost: 42, heat: 2,
  tags: [{ id: "Weapon", value: 1 }, { id: "Drone", value: 3 }, { id: "Summon", value: 2 }, { id: "Energy", value: 2 }],
  effects: [{ id: "summon-unit" }, { id: "spawn-projectile" }], faultProfileId: "weapon-drone", unlockSource: "challenge"
}, adapter);
