export function createOrbitController({ count = 2, radius = 70, speed = 2.4 } = {}) {
  const blades = Array.from({ length: count }, (_, index) => ({ index, angle: index * Math.PI * 2 / count }));
  return {
    update(context, dt) { for (const blade of blades) { blade.angle += speed * dt; blade.x = context.player.x + Math.cos(blade.angle) * radius; blade.y = context.player.y + Math.sin(blade.angle) * radius; } },
    release(context) { for (const blade of blades) context.emitEffect({ id: "spawn-projectile", payload: { x: blade.x, y: blade.y, damage: 20, homing: true } }); },
    get blades() { return blades; }
  };
}
