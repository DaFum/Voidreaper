export function renderEffects(context, effects, camera, settings = {}, viewport = {}) {
  if (settings.reducedMotion) return;
  context.save();
  context.translate((viewport.width??context.canvas.clientWidth??context.canvas.width) / 2 - camera.x, (viewport.height??context.canvas.clientHeight??context.canvas.height) / 2 - camera.y);
  for (const effect of effects) {
    if (effect.type === "screen-shake" && settings.screenShake === false) continue;
    if (effect.type === "damage-flash" && settings.damageFlashes === false) continue;
    context.globalAlpha = Math.max(0, effect.life / (effect.maxLife || 1));
    context.fillStyle = effect.color ?? "#06ffa5";
    context.fillRect(effect.x - effect.size / 2, effect.y - effect.size / 2, effect.size, effect.size);
    if (settings.colorPatterns) { context.strokeStyle = "rgba(255,255,255,.6)"; context.strokeRect(effect.x - effect.size / 2, effect.y - effect.size / 2, effect.size, effect.size); }
  }
  context.restore();
  context.globalAlpha = 1;
}
