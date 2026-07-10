function tracePath(ctx, path) {
  ctx.beginPath();
  if (path.kind === "polygon") { path.points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)); ctx.closePath(); }
  if (path.kind === "line") { ctx.moveTo(path.from.x, path.from.y); ctx.lineTo(path.to.x, path.to.y); }
  if (path.kind === "arc") ctx.arc(path.center.x, path.center.y, path.radius, path.start, path.end);
  if (path.kind === "lens") ctx.ellipse(path.center.x, path.center.y, path.radiusX, path.radiusY, path.rotation ?? 0, 0, Math.PI * 2);
}
export function renderShipCore(ctx, geometry, palette, { time = 0, lod = "high" } = {}) {
  ctx.save(); ctx.lineJoin = "round"; ctx.shadowBlur = lod === "low" ? 0 : 10; ctx.shadowColor = palette.energy;
  ctx.fillStyle = palette.hull; ctx.strokeStyle = palette.edge; ctx.lineWidth = 2;
  for (const path of geometry.hullPaths) { ctx.lineWidth = path.width ?? 2; tracePath(ctx, path); ctx.fill(); ctx.stroke(); }
  ctx.shadowBlur = 0; ctx.strokeStyle = palette.armor; for (const path of geometry.armorPaths) { ctx.lineWidth = path.width ?? 2; tracePath(ctx, path); ctx.stroke(); }
  ctx.strokeStyle = palette.energy; ctx.globalAlpha = .65 + Math.sin(time * 2.5) * .2; for (const path of geometry.lightPaths) { ctx.lineWidth = path.width ?? 2; tracePath(ctx, path); ctx.stroke(); }
  ctx.globalAlpha = 1; for (const [path, color] of [[geometry.cockpitPath,palette.cockpit],[geometry.reactorPath,palette.energy]]) { ctx.lineWidth = path.width ?? 2; tracePath(ctx, path); ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = palette.edge; ctx.stroke(); }
  for (const anchor of geometry.thrusterAnchors) { const flame = 7 + Math.sin(time * 9 + anchor.x) * 2; ctx.fillStyle = palette.thruster; ctx.beginPath(); ctx.moveTo(anchor.x-3,anchor.y); ctx.lineTo(anchor.x,anchor.y+flame); ctx.lineTo(anchor.x+3,anchor.y); ctx.fill(); }
  ctx.restore();
}
