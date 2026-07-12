import { changeRunCorruption } from "../corruption/run-corruption.js";

export function createReactorService({ eventBus } = {}) {
  return {
    capacity(definition, context = {}) {
      if (definition.id === "hive-core") return definition.energyCapacity + (context.summonCount ?? 0) * 4;
      if (definition.id === "abyssal-heart") return definition.energyCapacity + (context.abyssDepth ?? 0) * 3;
      if (definition.id === "entropy-coil") return definition.energyCapacity + (context.rng?.integer(-12, 12) ?? 0);
      return definition.energyCapacity;
    },
    canEnableForbidden(definition) { return !definition.blocksForbiddenEvolutions; },
    canExtract(definition, meta) { return definition.extractable !== false || Boolean(meta?.unlocks?.["extract-abyssal-heart"]); },
    enterSector(definition, context) {
      if (definition.id === "pulse-reactor") eventBus?.emit("energy-pulse", { amount: 45, context });
      // Route through the corruption system so state actually changes and the
      // real corruption-changed event (with previous/value) reaches listeners.
      if (definition.id === "abyssal-heart" && context?.run) changeRunCorruption(context.run, 5, definition.id);
    }
  };
}
