export function createMineController({ maximum = 16 } = {}) {
  const mines = [];
  // Mines live in both `mines` and the shared `run.zones`; any removal from the
  // local list must also drop the object from run.zones or it lingers as a live
  // zone for the rest of the run (cf. drone-controller re-syncing run.summons).
  const removeZone = (run, mine) => { const zones = run?.zones; if (!zones || typeof zones.indexOf !== "function" || !mine) return; const index = zones.indexOf(mine); if (index >= 0) zones.splice(index, 1); };
  return {
    place(context, payload = {}) {
      if (mines.length >= maximum) removeZone(context.run, mines.shift());
      const mine = { id: context.run.ids.create("mine"), x: context.player.x, y: context.player.y, age: 0, armed: false, ...payload };
      mines.push(mine); context.run.zones.push(mine); return mine;
    },
    update(_context, dt) { for (const mine of mines) { mine.age += dt; mine.armed = mine.age >= 0.45; } },
    detonate(context, multiplier = 1) { for (const mine of mines.splice(0)) { removeZone(context.run, mine); context.emitEffect({ id: "spawn-zone", payload: { ...mine, damage: (mine.damage ?? 18) * multiplier, radius: 54 } }); } },
    get mines() { return mines; }
  };
}
