export function createWeaponContext(run, services) {
  return {
    run,
    player: run.player,
    rng: run.rng,
    effects: services.effects,
    stats: services.stats,
    events: services.events,
    findTarget: options => services.targeting?.find(run, options) ?? run.enemies.find(enemy => !enemy.dead) ?? null,
    emitEffect(effect, extra = {}) { return services.effects.execute(effect, { run, ...this, ...extra }); }
  };
}
