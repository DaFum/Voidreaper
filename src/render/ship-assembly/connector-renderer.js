import { drawEnergyRail, fillSheen, mixColor, withAlpha } from "../forged-abyss/primitives.js";

export function renderConnector(ctx, connector, palette, { lod="high", energyFlow=0, layer="all" }={}) {
  ctx.save();
  ctx.lineCap="round";
  if (layer !== "dynamic") {
    // Spine
    ctx.beginPath();
    ctx.moveTo(connector.spine.from.x, connector.spine.from.y);
    ctx.lineTo(connector.spine.to.x, connector.spine.to.y);
    const sw = connector.spine.width;
    ctx.lineWidth = sw;
    ctx.strokeStyle = fillSheen(ctx, palette.structure, mixColor(palette.structure, "#ffffff", 0.1), {x:0, y:-10, w:0, h:20});
    ctx.stroke();

    // Rim highlight
    ctx.lineWidth = 1;
    ctx.strokeStyle = withAlpha(palette.rim || "#ffffff", 0.3);
    ctx.stroke();

    // Rails
    ctx.lineWidth = Math.max(1, sw * 0.18);
    ctx.strokeStyle = fillSheen(ctx, palette.edge, mixColor(palette.edge, "#ffffff", 0.15), {x:0, y:-10, w:0, h:20});
    for(const rail of [connector.leftRail, connector.rightRail]) {
      ctx.beginPath();
      ctx.moveTo(rail.from.x, rail.from.y);
      ctx.lineTo(rail.to.x, rail.to.y);
      ctx.stroke();
    }

    // Endpoints
    for(const endpoint of [connector.spine.from, connector.spine.to]) {
      ctx.fillStyle = fillSheen(ctx, palette.metal, mixColor(palette.metal, "#ffffff", 0.1), {x: endpoint.x, y: endpoint.y - 5, w: 0, h: 10});
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
