const EVENT_MODE = Object.freeze({
  "enemy-killed": "kill-charge",
  "critical-hit": "crit-charge",
  "player-moved": "movement-charge",
  "player-damaged": "damage-charge"
});

export function createChargeSystem(eventBus) {
  const modules = new Set();
  const subscriptions = Object.entries(EVENT_MODE).map(([event, mode]) => eventBus.on(event, payload => {
    for (const module of modules) {
      if (module.resourceModel !== mode) continue;
      const amount = mode === "movement-charge" ? payload.distance ?? 0 : mode === "damage-charge" ? payload.amount ?? 0 : 1;
      module.state.charge = Math.min(module.maximumCharge ?? module.activationCost, module.state.charge + amount);
    }
  }));
  return {
    track(module) { modules.add(module); return () => modules.delete(module); },
    resetSector() { for (const module of modules) if (module.resourceModel === "sector-charges") module.state.sectorCharges = module.maximumCharges ?? 1; },
    destroy() { subscriptions.forEach(unsubscribe => unsubscribe()); modules.clear(); }
  };
}
