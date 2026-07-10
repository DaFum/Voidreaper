export function renderEntities(context, run, camera) {
  const cx = context.canvas.width / 2 - camera.x;
  const cy = context.canvas.height / 2 - camera.y;
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
  context.fillStyle = "#efeaf7";
  context.beginPath(); context.arc(run.player.x, run.player.y, run.player.radius, 0, Math.PI * 2); context.fill();
  context.restore();
}
