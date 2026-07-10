export function createDroneController({ budget = 4 } = {}) {
  const drones = [];
  return {
    spawn(context, sourceId) {
      if (drones.length >= budget) return null;
      const drone = { id: context.run.ids.create("drone"), sourceId, angle: drones.length * Math.PI * 2 / budget, hull: 20, hostileUntil: 0, affixes: [] };
      drones.push(drone);
      context.run.summons.push(drone);
      return drone;
    },
    update(context, dt) {
      for (const [index, drone] of drones.entries()) {
        drone.angle += dt * 0.9;
        drone.x = context.player.x + Math.cos(drone.angle + index) * 72;
        drone.y = context.player.y + Math.sin(drone.angle + index) * 72;
        drone.target = context.findTarget({ from: drone, priority: "wounded" });
      }
    },
    destroy(id) {
      const index = drones.findIndex(drone => drone.id === id);
      if (index >= 0) return drones.splice(index, 1)[0];
      return null;
    },
    setBudget(value) { budget = Math.max(0, value); },
    get drones() { return drones; }
  };
}
