export function createNaniteController({ budget = 24 } = {}) {
  const infections = new Map();
  return {
    infect(target, stacks = 1) { infections.set(target.id, Math.min(budget, (infections.get(target.id) ?? 0) + stacks)); target.naniteStacks = infections.get(target.id); },
    onKilled(context, target) { const stacks = infections.get(target.id) ?? 0; infections.delete(target.id); const nearby = context.run.enemies.filter(enemy => !enemy.dead && enemy.id !== target.id).slice(0, Math.min(3, stacks)); for (const enemy of nearby) this.infect(enemy, Math.max(1, Math.floor(stacks / 2))); },
    consume(context) { const power = [...infections.values()].reduce((sum, value) => sum + value, 0); infections.clear(); context.emitEffect({ id: "spawn-zone", payload: { x: context.player.x, y: context.player.y, damage: power * 3, radius: 80 } }); return power; },
    telemetry: () => ({ infected: infections.size, totalStacks: [...infections.values()].reduce((sum, value) => sum + value, 0) })
  };
}
