import { drawCracks, drawBloomDot } from "../forged-abyss/primitives.js";

export function renderDamageOverlay(ctx, node, { time, palette, lod }) {
  ctx.save();
  ctx.translate(node.worldPosition.x, node.worldPosition.y);
  ctx.rotate(node.worldRotation);

  const isCore = node.damageState === "core-disrupted";
  const faultColor = isCore ? palette.fault : palette.damage;

  drawCracks(ctx, {
    x: 0,
    y: 0,
    radius: node.geometry.size * 1.2,
    seed: node.variantSeed,
    color: faultColor,
    alpha: isCore ? 0.8 : 0.6,
  });

  if (isCore) {
    drawBloomDot(ctx, {
      x: 0,
      y: 0,
      radius: node.geometry.size * 0.4,
      color: faultColor,
    });
  }

  if (lod !== "low") {
    for (let i = 0; i < 3; i++) {
      const a = node.variantSeed + i * 2.1 + time * 0.4;
      const r = node.geometry.size * 0.45;
      const alpha = 0.35 + Math.sin(time * 9 + i) * 0.3;
      drawBloomDot(ctx, {
        x: Math.cos(a) * r,
        y: Math.sin(a) * r,
        radius: 3,
        color: palette.damage,
        alpha,
      });
    }
  }
  ctx.restore();
}
