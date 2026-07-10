export function renderEntities(context, run, camera, assemblyRenderer, assemblyGeometry, viewport = {}) {
  const cx = (viewport.width??context.canvas.clientWidth??context.canvas.width) / 2 - camera.x;
  const cy = (viewport.height??context.canvas.clientHeight??context.canvas.height) / 2 - camera.y;
  context.save();
  context.translate(cx, cy);
  for (const enemy of run.enemies) {
    context.fillStyle = enemy.color ?? "#ff2d78";
    context.beginPath(); context.arc(enemy.x, enemy.y, enemy.radius ?? 12, 0, Math.PI * 2); context.fill();
  }
  for (const projectile of run.projectiles) {
    context.fillStyle = projectile.color ?? "#4cc9f0";
    context.beginPath(); context.arc(projectile.x, projectile.y, projectile.radius ?? 3, 0, Math.PI * 2); context.fill();
  }
  const rendered = assemblyRenderer?.renderPlayerShip(context, { geometrySnapshot: assemblyGeometry?.getSnapshot(), position: run.player, rotation: run.player.rotation ?? 0, time: run.time ?? 0 });
  if (!rendered) { context.fillStyle = "#efeaf7"; context.beginPath(); context.arc(run.player.x, run.player.y, run.player.radius, 0, Math.PI * 2); context.fill(); }
  context.restore();
}
