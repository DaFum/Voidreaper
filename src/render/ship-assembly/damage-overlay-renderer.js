import { drawCracks, drawBloomDot } from "../forged-abyss/primitives.js";

export function renderDamageOverlay(ctx, node, { time, palette, lod }) {
  ctx.save();
  ctx.translate(node.worldPosition.x, node.worldPosition.y);
  ctx.rotate(node.worldRotation);

  const isCore = node.damageState === "core-disrupted";
  const faultColor = isCore ? palette.fault : palette.damage;

  drawCracks(ctx, 0, 0, node.geometry.size * 1.2, node.variantSeed, faultColor, isCore ? 0.8 : 0.6);

  if (isCore) {
    drawBloomDot(ctx, 0, 0, node.geometry.size * 0.4, faultColor);
  }

  if (lod !== "low") {
    for (let i = 0; i < 3; i++) {
      const a = node.variantSeed + i * 2.1 + time * 0.4;
      const r = node.geometry.size * 0.45;
      const alpha = 0.35 + Math.sin(time * 9 + i) * 0.3;
      ctx.globalAlpha = alpha;
      drawBloomDot(ctx, Math.cos(a) * r, Math.sin(a) * r, 3, palette.damage);
    }
  }
  ctx.restore();
}
