import { assertWeaponAdapter } from "../../content/weapons/weapon-schema.js";
import { createWeaponContext } from "./weapon-context.js";

export function createWeaponController(services) {
  let equipped = null;
  return {
    equip(definition, run) {
      if (equipped) equipped.definition.adapter.onUnequip(equipped.context, equipped.state);
      assertWeaponAdapter(definition.adapter, definition.id);
      const context = createWeaponContext(run, services);
      const state = definition.adapter.createState(context);
      equipped = { definition, state, context, shots: 0 };
      definition.adapter.onEquip(context, state);
      return equipped;
    },
    update(dt) {
      if (!equipped) return;
      equipped.definition.adapter.update(equipped.context, equipped.state, dt);
    },
    fire(target) {
      if (!equipped) return false;
      const fired = equipped.definition.adapter.fire(equipped.context, equipped.state, target);
      if (fired) { const weaponClass=equipped.definition.recoilClass??(equipped.definition.id.includes("rail")?"rail":equipped.definition.tags?.includes?.("Beam")?"beam":"default");equipped.shots += 1; services.recoil?.apply?.(equipped.context.run.player,{weaponClass,worldPosition:equipped.context.mountPosition,direction:equipped.context.aimDirection}); }
      return fired;
    },
    telemetry() {
      if (!equipped) return null;
      return { weaponId: equipped.definition.id, shots: equipped.shots, ...equipped.definition.adapter.getTelemetry(equipped.context, equipped.state) };
    },
    get equipped() { return equipped; }
  };
}

export function createBasicWeaponAdapter({ cooldown = 0.45, effect }) {
  return {
    createState: () => ({ cooldown: 0 }),
    update: (_context, state, dt) => { state.cooldown = Math.max(0, state.cooldown - dt); },
    fire(context, state, target) {
      if (state.cooldown > 0) return false;
      const resolvedTarget = target ?? context.findTarget();
      if (!resolvedTarget) return false;
      state.cooldown = cooldown;
      context.emitEffect({ ...effect, target: resolvedTarget });
      context.events.emit("shot-fired", { context, target: resolvedTarget });
      return true;
    },
    onEquip: () => {},
    onUnequip: () => {},
    getTelemetry: (_context, state) => ({ readyIn: state.cooldown })
  };
}
