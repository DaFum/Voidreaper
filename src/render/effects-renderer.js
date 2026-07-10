export function renderEffects(context, effects, camera, settings = {}) {
  if (settings.reducedMotion) return;
  context.save();
  context.translate(context.canvas.width / 2 - camera.x, context.canvas.height / 2 - camera.y);
  for (const effect of effects) {
    context.globalAlpha = Math.max(0, effect.life / (effect.maxLife || 1));
    context.fillStyle = effect.color ?? "#06ffa5";
    context.fillRect(effect.x - effect.size / 2, effect.y - effect.size / 2, effect.size, effect.size);
  }
  context.restore();
  context.globalAlpha = 1;
}
