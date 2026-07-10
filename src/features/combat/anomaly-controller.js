const DEFAULT_EFFECTS = [{ value: "damage", weight: 4 }, { value: "echo", weight: 2 }, { value: "teleport", weight: 1 }, { value: "zone", weight: 2 }];

export function createAnomalyController(effects = DEFAULT_EFFECTS) {
  return {
    createState: () => ({ lastEffect: null, weights: structuredClone(effects) }),
    roll(context, state, { repeatLast = false } = {}) {
      const effect = repeatLast && state.lastEffect ? state.lastEffect : context.rng.weighted(state.weights);
      state.lastEffect = effect;
      if (effect === "damage") context.emitEffect({ id: "deal-damage", amount: context.rng.range(10, 45) });
      else if (effect === "echo") context.events.emit("shot-fired", { context, anomalyEcho: true });
      else if (effect === "teleport") context.emitEffect({ id: "teleport", x: context.rng.range(-300, 300), y: context.rng.range(-300, 300) });
      else context.emitEffect({ id: "spawn-zone", payload: { radius: context.rng.range(40, 100), damage: context.rng.range(8, 28) } });
      return effect;
    }
  };
}
