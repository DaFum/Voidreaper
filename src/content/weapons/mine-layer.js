import { createWeaponDefinition } from "./weapon-schema.js";
import { createMineController } from "../../features/combat/mine-controller.js";

// The controller holds per-run state (mine list); create it per equip via
// createState, never at module scope, or it leaks across runs.
const adapter = {
  createState: () => ({ cooldown: 0, controller: createMineController() }),
  update(context, state, dt) { state.controller.update(context, dt); state.cooldown -= dt; if (state.cooldown <= 0 && (context.player.vx)*(context.player.vx) + (context.player.vy)*(context.player.vy) > 25) { state.controller.place(context, { damage: 22 }); state.cooldown = 1.1; } },
  fire: () => false, onEquip: () => {}, onUnequip: () => {}, getTelemetry: (_context, state) => ({ activeMines: state.controller.mines.length })
};

export default createWeaponDefinition({ id: "mine-layer", name: "MINE LAYER", energyCost: 32, heat: 3, tags: [{ id: "Weapon", value: 1 }, { id: "Mine", value: 3 }, { id: "Explosive", value: 2 }, { id: "Control", value: 2 }, { id: "Cooldown", value: 1 }], effects: [{ id: "spawn-zone" }], faultProfileId: "weapon-projectile", unlockSource: "challenge" }, adapter);
