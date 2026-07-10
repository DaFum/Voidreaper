export function renderWorld(context, run, camera) {
  const { width, height } = context.canvas;
  const gradient = context.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height));
  gradient.addColorStop(0, "#12052a");
  gradient.addColorStop(1, "#04010a");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
  context.save();
  context.translate(width / 2 - camera.x, height / 2 - camera.y);
  context.strokeStyle = "rgba(76, 201, 240, 0.08)";
  context.lineWidth = 1;
  const spacing = 64;
  const arena = run.arena ?? 1400;
  for (let x = -arena; x < arena; x += spacing) {
    context.beginPath(); context.moveTo(x, -arena); context.lineTo(x, arena); context.stroke();
  }
  context.restore();
}
