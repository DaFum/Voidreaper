export function renderEntities(context, run, camera, assemblyRenderer, assemblyGeometry, viewport = {}) {
  const width = viewport.width ?? context.canvas.clientWidth ?? context.canvas.width;
  const height = viewport.height ?? context.canvas.clientHeight ?? context.canvas.height;

  const halfWidth = width / 2;
  const halfHeight = height / 2;

  const cx = halfWidth - camera.x;
  const cy = halfHeight - camera.y;

  // Calculate AABB viewport boundaries for culling
  const cullLeft = camera.x - halfWidth;
  const cullRight = camera.x + halfWidth;
  const cullTop = camera.y - halfHeight;
  const cullBottom = camera.y + halfHeight;

  context.save();
  context.translate(cx, cy);

  for (const enemy of run.enemies) {
    const r = enemy.radius ?? 12;
    // Spatial culling: skip rendering if entirely outside viewport AABB
    if (enemy.x + r < cullLeft || enemy.x - r > cullRight || enemy.y + r < cullTop || enemy.y - r > cullBottom) {
      continue;
    }
    context.fillStyle = enemy.color ?? "#ff2d78";
    context.beginPath(); context.arc(enemy.x, enemy.y, r, 0, Math.PI * 2); context.fill();
  }

  for (const projectile of run.projectiles) {
    const r = projectile.radius ?? 3;
    // Spatial culling: skip rendering if entirely outside viewport AABB
    if (projectile.x + r < cullLeft || projectile.x - r > cullRight || projectile.y + r < cullTop || projectile.y - r > cullBottom) {
      continue;
    }
    context.fillStyle = projectile.color ?? "#4cc9f0";
    context.beginPath(); context.arc(projectile.x, projectile.y, r, 0, Math.PI * 2); context.fill();
  }
  const rendered = assemblyRenderer?.renderPlayerShip(context, { geometrySnapshot: assemblyGeometry?.getSnapshot(), position: run.player, rotation: run.player.rotation ?? 0, time: run.time ?? 0 });
  if (!rendered) { context.fillStyle = "#efeaf7"; context.beginPath(); context.arc(run.player.x, run.player.y, run.player.radius, 0, Math.PI * 2); context.fill(); }
  context.restore();
}
