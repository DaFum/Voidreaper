export function createNaniteController({ budget = 24 } = {}) {
  const infections = new Map();
  return {
    infect(target, stacks = 1) {
      const nextStacks = Math.min(budget, (infections.get(target.id) ?? 0) + stacks);
      infections.set(target.id, nextStacks);
      target.naniteStacks = nextStacks;
    },
    onKilled(context, target) {
      const stacks = infections.get(target.id) ?? 0;
      infections.delete(target.id);
      if (stacks <= 0) return;

      // Avoid intermediate array allocations (.filter() and .slice()) in high-frequency loops
      const maxTargets = Math.min(3, stacks);
      const enemies = context.run.enemies;
      const targetLen = enemies.length;
      let found = 0;
      const nextStacks = Math.max(1, Math.floor(stacks / 2));
      for (let i = 0; i < targetLen; i++) {
        const enemy = enemies[i];
        if (!enemy.dead && enemy.id !== target.id) {
          this.infect(enemy, nextStacks);
          found++;
          if (found >= maxTargets) break;
        }
      }
    },
    consume(context) {
      // Avoid spread + reduce overhead
      let power = 0;
      for (const value of infections.values()) {
        power += value;
      }
      infections.clear();
      context.emitEffect({ id: "spawn-zone", payload: { x: context.player.x, y: context.player.y, damage: power * 3, radius: 80 } });
      return power;
    },
    telemetry: () => {
      let totalStacks = 0;
      for (const value of infections.values()) totalStacks += value;
      return { infected: infections.size, totalStacks };
    }
  };
}
