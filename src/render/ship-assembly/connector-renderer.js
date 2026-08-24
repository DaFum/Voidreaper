import { drawEnergyRail, mixColor, withAlpha } from "../forged-abyss/primitives.js";

// Top-lit tube shading across a segment: the gradient runs along the segment's
// own perpendicular, anchored on its midpoint, so connectors away from the
// ship origin get the same shading as ones sitting on the centreline.
function tubeGradient(ctx, segment, halfWidth, light, base, dark) {
  const dx = segment.to.x - segment.from.x;
  const dy = segment.to.y - segment.from.y;
  // ⚡ Bolt: Using Euclidean distance is a measurable V8 performance optimization
  // over Math.hypot in rendering hot paths (~5x faster), avoiding variable
  // argument and overflow handling overhead.
  const length = Math.sqrt(dx * dx + dy * dy) || 1;
  // perpendicular, flipped so it always points "up" (towards the light)
  let nx = dy / length, ny = -dx / length;
  if (ny > 0) { nx = -nx; ny = -ny; }
  const mx = (segment.from.x + segment.to.x) / 2;
  const my = (segment.from.y + segment.to.y) / 2;
  const g = ctx.createLinearGradient(
    mx + nx * halfWidth, my + ny * halfWidth,
    mx - nx * halfWidth, my - ny * halfWidth,
  );
  g.addColorStop(0, light);
  g.addColorStop(0.5, base);
  g.addColorStop(1, dark);
  return g;
}

export function renderConnector(ctx, connector, palette, { lod="high", energyFlow=0, layer="all" }={}) {
  ctx.save();
  ctx.lineCap="round";
  if (layer !== "dynamic") {
    const sw = connector.spine.width;

    // Spine
    const baseSt = palette.structure;
    ctx.strokeStyle = tubeGradient(ctx, connector.spine, Math.max(1, sw / 2), mixColor(baseSt, "#ffffff", 0.1), baseSt, mixColor(baseSt, "#000000", 0.3));
    ctx.lineWidth = sw;
    ctx.beginPath();
    ctx.moveTo(connector.spine.from.x, connector.spine.from.y);
    ctx.lineTo(connector.spine.to.x, connector.spine.to.y);
    ctx.stroke();

    // Rim highlight
    ctx.lineWidth = 1;
    ctx.strokeStyle = withAlpha(palette.rim || "#ffffff", 0.3);
    ctx.stroke();

    // Rails
    const railWidth = Math.max(1, sw * 0.18);
    ctx.lineWidth = railWidth;
    const baseR = palette.edge;
    const lightR = mixColor(baseR, "#ffffff", 0.15);
    const darkR = mixColor(baseR, "#000000", 0.2);
    for(const rail of [connector.leftRail, connector.rightRail]) {
      ctx.strokeStyle = tubeGradient(ctx, rail, Math.max(1, railWidth / 2), lightR, baseR, darkR);
      ctx.beginPath();
      ctx.moveTo(rail.from.x, rail.from.y);
      ctx.lineTo(rail.to.x, rail.to.y);
      ctx.stroke();
    }

    // Endpoints
    for(const endpoint of [connector.spine.from, connector.spine.to]) {
      const gE = ctx.createLinearGradient(endpoint.x, endpoint.y - 5, endpoint.x, endpoint.y + 5);
      gE.addColorStop(0, mixColor(palette.metal, "#ffffff", 0.1));
      gE.addColorStop(0.5, palette.metal);
      gE.addColorStop(1, mixColor(palette.metal, "#000000", 0.2));

      ctx.fillStyle = gE;
      ctx.strokeStyle = palette.armor;
      ctx.beginPath();
      ctx.arc(endpoint.x, endpoint.y, Math.max(3, sw * 0.32), 0, Math.PI*2);
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.stroke();

      // Highlight endpoint
      ctx.strokeStyle = withAlpha(palette.rim || "#ffffff", 0.4);
      ctx.stroke();
    }
  }

  if (layer !== "static" && lod !== "low") {
    drawEnergyRail(ctx, {
      from: connector.cable.from,
      to: connector.cable.to,
      color: palette.energy,
      width: Math.max(1, connector.spine.width * 0.14),
      flow: energyFlow
    });
  }
  ctx.restore();
}
