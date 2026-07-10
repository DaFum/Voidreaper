function canPay(module, context, multiplier = 1) {
  const state = module.state;
  const cost = (module.activationCost ?? 0) * multiplier;
  if (module.resourceModel === "energy") return context.energy >= cost;
  if (module.resourceModel === "heat") return context.heat + cost <= (context.maxHeat ?? 100);
  if (module.resourceModel === "corruption") return true;
  if (module.resourceModel === "sacrifice") return context.summons?.length >= cost;
  if (module.resourceModel === "cooldown") return state.remaining <= 0;
  if (module.resourceModel === "sector-charges") return state.sectorCharges >= multiplier;
  return (state.charge ?? 0) >= cost;
}

export function createActiveModuleSystem({ effects, eventBus } = {}) {
  return {
    equip(definition, instanceId) {
      return {
        ...definition,
        instanceId,
        state: { remaining: 0, charge: definition.startingCharge ?? 0, sectorCharges: definition.maximumCharges ?? 0, disabledRemaining: 0, faultModifier: null }
      };
    },
    update(module, dt) {
      if (!module) return;
      module.state.remaining = Math.max(0, module.state.remaining - dt);
      module.state.disabledRemaining = Math.max(0, module.state.disabledRemaining - dt);
    },
    activate(module, context) {
      if (!module || module.state.disabledRemaining > 0 || module.state.faultModifier === "blocked") return false;
      const multiplier = module.state.faultModifier === "double-cost" ? 2 : 1;
      if (!canPay(module, context, multiplier)) return false;
      const cost = (module.activationCost ?? 0) * multiplier;
      if (module.resourceModel === "energy") context.spendEnergy(cost, module.instanceId);
      else if (module.resourceModel === "heat") context.addHeat(cost, module.instanceId);
      else if (module.resourceModel === "corruption") context.addCorruption(cost, module.instanceId);
      else if (module.resourceModel === "sacrifice") context.summons.splice(0, cost);
      else if (module.resourceModel === "cooldown") module.state.remaining = module.cooldown * multiplier;
      else if (module.resourceModel === "sector-charges") module.state.sectorCharges -= multiplier;
      else module.state.charge -= cost;
      for (const effect of module.effects ?? []) effects.execute({ ...effect, sourceId: module.instanceId }, context);
      eventBus?.emit("active-module-used", { module, context });
      return true;
    },
    disable(module, duration) {
      if (module) module.state.disabledRemaining = Math.min(3, Math.max(module.state.disabledRemaining, duration));
    },
    applyFault(module, modifier) { if (module) module.state.faultModifier = modifier; },
    clearFault(module) { if (module) module.state.faultModifier = null; },
    readiness(module) {
      if (!module) return { ready: false, label: "EMPTY" };
      if (module.resourceModel === "sector-charges") return { ready: module.state.sectorCharges > 0, label: `${module.state.sectorCharges} CHARGES` };
      if (module.resourceModel === "cooldown") return { ready: module.state.remaining <= 0, label: `${module.state.remaining.toFixed(1)}s` };
      return { ready: (module.state.charge ?? 0) >= (module.activationCost ?? 0), label: `${Math.floor(module.state.charge ?? 0)} / ${module.activationCost ?? 0}` };
    }
  };
}
