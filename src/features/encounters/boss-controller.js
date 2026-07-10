export function createBossController(eventBus) {
  return {
    start(definition) { return { definition, health: definition.health, phase: 1, defeated: false }; },
    damage(state, amount, tags = []) { state.health = Math.max(0, state.health - amount); state.lastDamageTags = tags; if (!state.health && !state.defeated) { state.defeated = true; eventBus?.emit("mid-boss-defeated", { bossId: state.definition.id, reward: state.definition.reward }); } return state.health; },
    applyControl(state, duration) { const applied = duration * (1 - state.definition.controlResistance); state.controlRemaining = Math.max(state.controlRemaining ?? 0, applied); return applied; }
  };
}
