import { clamp } from "../../core/math.js";

export function calculateLoad({ capacity, reserved }) {
  const ratio = capacity <= 0 ? 9.99 : reserved / capacity;
  const tier = ratio <= 1 ? "stable"
    : ratio <= 1.15 ? "strained"
      : ratio <= 1.35 ? "overloaded"
        : ratio <= 1.6 ? "critical"
          : "collapse";
  return { ratio, tier };
}

export const LOAD_MODIFIERS = Object.freeze({
  stable: { heatMultiplier: 1, faultPressure: 0, corruptionPerSecond: 0, overloadAffixMultiplier: 1 },
  strained: { heatMultiplier: 1.1, faultPressure: 0.15, corruptionPerSecond: 0, overloadAffixMultiplier: 1.05 },
  overloaded: { heatMultiplier: 1.25, faultPressure: 0.4, corruptionPerSecond: 0, overloadAffixMultiplier: 1.25 },
  critical: { heatMultiplier: 1.5, faultPressure: 0.8, corruptionPerSecond: 0.08, overloadAffixMultiplier: 1.5 },
  collapse: { heatMultiplier: 1.5, faultPressure: 1.5, corruptionPerSecond: 0.18, overloadAffixMultiplier: 2, forbiddenEnabled: true }
});

export function createEnergySystem({ eventBus } = {}) {
  return {
    initialize(player, { capacity, reserved, regeneration = 0 }) {
      player.resources.maxEnergy = capacity;
      player.resources.energy = capacity;
      player.energy = { capacity, reserved, regeneration, ...calculateLoad({ capacity, reserved }) };
      return player.energy;
    },
    update(player, dt) {
      if (!player.energy) return;
      player.resources.energy = clamp(player.resources.energy + player.energy.regeneration * dt, 0, player.energy.capacity);
    },
    spendBurst(player, amount, sourceId) {
      if (player.resources.energy < amount) return false;
      player.resources.energy -= amount;
      eventBus?.emit("energy-spent", { amount, sourceId, remaining: player.resources.energy });
      return true;
    },
    recalculate(player, reserved) {
      Object.assign(player.energy, { reserved, ...calculateLoad({ capacity: player.energy.capacity, reserved }) });
      eventBus?.emit("load-changed", player.energy);
      return player.energy;
    }
  };
}
