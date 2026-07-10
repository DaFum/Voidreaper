import { drawEnergyRail } from "../forged-abyss/primitives.js";

export function renderConnector(ctx, connector, palette, { lod="high", energyFlow=0 }={}) {
  ctx.save();ctx.lineCap="round";
  ctx.strokeStyle=palette.structure;ctx.lineWidth=connector.spine.width;
  ctx.beginPath();ctx.moveTo(connector.spine.from.x,connector.spine.from.y);ctx.lineTo(connector.spine.to.x,connector.spine.to.y);ctx.stroke();
  ctx.lineWidth=Math.max(1,connector.spine.width*.18);ctx.strokeStyle=palette.edge;
  for(const rail of [connector.leftRail,connector.rightRail]){ctx.beginPath();ctx.moveTo(rail.from.x,rail.from.y);ctx.lineTo(rail.to.x,rail.to.y);ctx.stroke();}
  for(const endpoint of [connector.spine.from,connector.spine.to]){ctx.fillStyle=palette.metal;ctx.strokeStyle=palette.armor;ctx.beginPath();ctx.arc(endpoint.x,endpoint.y,Math.max(3,connector.spine.width*.32),0,Math.PI*2);ctx.fill();ctx.stroke();}
  if(lod!=="low")drawEnergyRail(ctx,{from:connector.cable.from,to:connector.cable.to,color:palette.energy,width:Math.max(1,connector.spine.width*.14),flow:energyFlow});
  ctx.restore();
}
