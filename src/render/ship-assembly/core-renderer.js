function tracePath(ctx, path) {
  ctx.beginPath();
  if (path.kind === "polygon") { path.points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)); ctx.closePath(); }
  if (path.kind === "line") { ctx.moveTo(path.from.x, path.from.y); ctx.lineTo(path.to.x, path.to.y); }
  if (path.kind === "arc") ctx.arc(path.center.x, path.center.y, path.radius, path.start, path.end);
  if (path.kind === "lens") ctx.ellipse(path.center.x, path.center.y, path.radiusX, path.radiusY, path.rotation ?? 0, 0, Math.PI * 2);
}
export function renderShipCore(ctx, geometry, palette, { time = 0, lod = "high", seed = 0 } = {}) {
  const bounds=geometry.bounds,width=bounds.maxX-bounds.minX,height=bounds.maxY-bounds.minY,detailSeed=visualHash(seed);
  ctx.save(); ctx.lineJoin = "round";
  ctx.fillStyle=palette.structure;traceChamferedPlate(ctx,{width:width*.5,height:height*.86,chamfer:8});ctx.fill();
  ctx.shadowBlur = lod === "low" ? 0 : 9; ctx.shadowColor = palette.energy;
  ctx.fillStyle = palette.hull; ctx.strokeStyle = palette.edge; ctx.lineWidth = 2;
  for (const path of geometry.hullPaths) { ctx.lineWidth = path.width ?? 2; tracePath(ctx, path); ctx.fill(); ctx.stroke(); }
  ctx.shadowBlur = 0;
  if(lod!=="low"){ctx.save();traceChamferedPlate(ctx,{width:width*.48,height:height*.72,chamfer:7});ctx.clip();drawArmorHatch(ctx,{width:width*.55,height:height*.78,color:palette.armor,spacing:9,alpha:.12});ctx.restore();}
  ctx.strokeStyle = palette.armor; for (const path of [...geometry.armorPaths,...geometry.structurePaths]) { ctx.lineWidth = path.width ?? 2; tracePath(ctx, path); ctx.stroke(); }
  for(const path of geometry.detailPaths){ctx.strokeStyle=palette.metal;tracePath(ctx,path);ctx.stroke();}
  ctx.globalAlpha = 1; for (const [path, color] of [[geometry.cockpitPath,palette.cockpit],[geometry.reactorPath,palette.energy]]) { ctx.lineWidth = path.width ?? 2; tracePath(ctx, path); ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = palette.edge; ctx.stroke(); }
  drawVoidCore(ctx,{x:geometry.reactorPath.center?.x??0,y:geometry.reactorPath.center?.y??18,radius:Math.max(4,Math.min(geometry.reactorPath.radiusX??7,geometry.reactorPath.radiusY??7)),palette,time,seed:detailSeed,reducedMotion:lod==="low",intensity:.82});
  for (const path of geometry.lightPaths) {
    if(path.kind==="line")drawEnergyRail(ctx,{from:path.from,to:path.to,color:palette.energy,width:path.width??2,flow:time,reducedMotion:lod==="low"});
    else{tracePath(ctx,path);ctx.strokeStyle=palette.energy;ctx.globalAlpha=.76;ctx.stroke();ctx.globalAlpha=1;}
  }
  if(geometry.voidPaths.length)for(const path of geometry.voidPaths){tracePath(ctx,path);ctx.strokeStyle=palette.fault;ctx.stroke();}
  if(lod==="high"&&(palette.void==="#24042e"||palette.energy==="#dd63ff"))drawCracks(ctx,{radius:Math.min(width,height)*.3,color:palette.fault,seed:detailSeed,count:3,alpha:.42});
  for (const anchor of geometry.thrusterAnchors) { const flame = 8 + (lod==="low"?0:Math.sin(time * 9 + anchor.x) * 2); const gradient=ctx.createLinearGradient(anchor.x,anchor.y,anchor.x,anchor.y+flame);gradient.addColorStop(0,palette.cockpit);gradient.addColorStop(.45,palette.thruster);gradient.addColorStop(1,"rgba(255,80,20,0)");ctx.fillStyle=gradient;ctx.beginPath(); ctx.moveTo(anchor.x-3,anchor.y); ctx.lineTo(anchor.x,anchor.y+flame); ctx.lineTo(anchor.x+3,anchor.y); ctx.fill(); }
  ctx.restore();
}
import { drawArmorHatch, drawCracks, drawEnergyRail, drawVoidCore, traceChamferedPlate } from "../forged-abyss/primitives.js";
import { visualHash } from "../forged-abyss/seeded-visuals.js";
