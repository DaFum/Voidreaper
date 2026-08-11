import { drawEnergyRail, fillSheen, mixColor, withAlpha } from "../forged-abyss/primitives.js";

export function renderConnector(ctx, connector, palette, { lod="high", energyFlow=0, layer="all" }={}) {
  ctx.save();
  ctx.lineCap="round";
  if (layer !== "dynamic") {
    const sw = connector.spine.width;

    // Spine
    const baseSt = palette.structure;
    const lightSt = mixColor(baseSt, "#ffffff", 0.1);
    const darkSt = mixColor(baseSt, "#000000", 0.3);
    const gSt = ctx.createLinearGradient(0, -sw, 0, sw);
    gSt.addColorStop(0, lightSt);
    gSt.addColorStop(0.5, baseSt);
    gSt.addColorStop(1, darkSt);
    ctx.strokeStyle = gSt;
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
    ctx.lineWidth = Math.max(1, sw * 0.18);
    const baseR = palette.edge;
    const lightR = mixColor(baseR, "#ffffff", 0.15);
    const darkR = mixColor(baseR, "#000000", 0.2);
    const gR = ctx.createLinearGradient(0, -sw/2, 0, sw/2);
    gR.addColorStop(0, lightR);
    gR.addColorStop(0.5, baseR);
    gR.addColorStop(1, darkR);
    ctx.strokeStyle = gR;
    for(const rail of [connector.leftRail, connector.rightRail]) {
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
