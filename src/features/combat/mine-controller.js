export function createMineController({ maximum = 16 } = {}) {
  const mines = [];
  return {
    place(context, payload = {}) {
      if (mines.length >= maximum) mines.shift();
      const mine = { id: context.run.ids.create("mine"), x: context.player.x, y: context.player.y, age: 0, armed: false, ...payload };
      mines.push(mine); context.run.zones.push(mine); return mine;
    },
    update(_context, dt) { for (const mine of mines) { mine.age += dt; mine.armed = mine.age >= 0.45; } },
    detonate(context, multiplier = 1) { for (const mine of mines.splice(0)) context.emitEffect({ id: "spawn-zone", payload: { ...mine, damage: (mine.damage ?? 18) * multiplier, radius: 54 } }); },
    get mines() { return mines; }
  };
}
