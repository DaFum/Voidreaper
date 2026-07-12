import { createWeaponDefinition } from "./weapon-schema.js";
import { createNaniteController } from "../../features/combat/nanite-controller.js";

// The controller holds per-run state (infection map keyed by enemy id); create it
// per equip via createState, never at module scope, or it leaks across runs.
const adapter = { createState: () => ({ cooldown: 0, controller: createNaniteController() }), update: (_context, state, dt) => { state.cooldown -= dt; }, fire(context, state, target) { if (!target || state.cooldown > 0) return false; state.controller.infect(target, 2); state.cooldown = 0.5; return true; }, onEquip: () => {}, onUnequip: () => {}, getTelemetry: (_context, state) => state.controller.telemetry() };

export default createWeaponDefinition({ id: "nanite-swarm", name: "NANITE SWARM", energyCost: 38, heat: 3, tags: [{ id: "Weapon", value: 1 }, { id: "Summon", value: 2 }, { id: "Corrosion", value: 3 }, { id: "Chain", value: 1 }, { id: "Sacrifice", value: 1 }], effects: [{ id: "apply-status" }, { id: "summon-unit" }], faultProfileId: "weapon-drone", unlockSource: "blueprint" }, adapter);
