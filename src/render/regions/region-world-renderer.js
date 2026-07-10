import { drawCracks, drawVoidCore, traceChamferedPlate } from "../forged-abyss/primitives.js";
import { mergeVisualPalette } from "../forged-abyss/palettes.js";
import { seededSigned, seededUnit, visualHash } from "../forged-abyss/seeded-visuals.js";
import { resolveRegionVisualProfile } from "./region-visual-profiles.js";

const TILE = 128;

function drawGrid(ctx, profile, bounds, time, reducedMotion) {
  const { palette } = profile;
  ctx.strokeStyle = palette.grid;
  ctx.globalAlpha = .22;
  ctx.lineWidth = 1;
  const startX = Math.floor(bounds.minX / TILE) * TILE;
  const startY = Math.floor(bounds.minY / TILE) * TILE;
  if (profile.grid === "cathedral") {
    for (let x = startX; x <= bounds.maxX; x += TILE) {
      ctx.beginPath();ctx.moveTo(x,bounds.maxY);ctx.lineTo(x,bounds.minY+40);
      ctx.arc(x+TILE/2,bounds.minY+40,TILE/2,Math.PI,0);ctx.stroke();
    }
  } else if (profile.grid === "segments") {
    ctx.save();ctx.rotate(reducedMotion?0:time*.025);
    for(let radius=TILE;radius<Math.max(bounds.maxX-bounds.minX,bounds.maxY-bounds.minY);radius+=TILE){
      ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*1.72);ctx.stroke();
    }
    ctx.restore();
  } else {
    for(let x=startX;x<=bounds.maxX;x+=TILE){ctx.beginPath();ctx.moveTo(x,bounds.minY);ctx.lineTo(profile.grid==="fracture"?x+TILE*.45:x,bounds.maxY);ctx.stroke();}
    for(let y=startY;y<=bounds.maxY;y+=TILE){ctx.beginPath();ctx.moveTo(bounds.minX,y);ctx.lineTo(bounds.maxX,profile.grid==="salvage"?y+TILE*.18:y);ctx.stroke();}
  }
  ctx.globalAlpha=1;
}

function drawMotif(ctx, profile, x, y, seed, time, reducedMotion) {
  const localPalette=mergeVisualPalette({armor:profile.palette.grid,edge:profile.palette.accent,energy:profile.palette.accent,void:profile.palette.void});
  const size=18+seededUnit(seed,1)*28;
  ctx.save();ctx.translate(x,y);ctx.rotate(seededUnit(seed,2)*Math.PI*2);ctx.globalAlpha=.12+seededUnit(seed,3)*.13;
  if(profile.id==="shattered-approach"){
    ctx.fillStyle=profile.palette.grid;ctx.strokeStyle=profile.palette.accent;ctx.beginPath();ctx.moveTo(0,-size);ctx.lineTo(size*.45,size*.25);ctx.lineTo(-size*.2,size);ctx.lineTo(-size*.55,size*.1);ctx.closePath();ctx.fill();ctx.stroke();
  }else if(profile.id==="furnace-expanse"){
    traceChamferedPlate(ctx,{width:size*1.8,height:size,chamfer:7});ctx.fillStyle=profile.palette.floor;ctx.strokeStyle=profile.palette.accent;ctx.fill();ctx.stroke();drawCracks(ctx,{radius:size*.7,color:profile.palette.accent,seed,count:3,alpha:.8});
  }else if(profile.id==="grave-circuit"){
    ctx.strokeStyle=profile.palette.accent;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-size,-size*.4);ctx.lineTo(size*.2,-size*.25);ctx.lineTo(size,size*.5);ctx.moveTo(-size*.7,size*.5);ctx.quadraticCurveTo(0,size,size*.7,size*.3);ctx.stroke();
  }else if(profile.id==="null-cathedral"){
    ctx.strokeStyle=profile.palette.accent;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-size*.7,size);ctx.lineTo(-size*.7,0);ctx.arc(0,0,size*.7,Math.PI,0);ctx.lineTo(size*.7,size);ctx.stroke();drawVoidCore(ctx,{radius:size*.3,palette:localPalette,time,seed,reducedMotion,intensity:.7});
  }else{
    ctx.strokeStyle=profile.palette.accent;ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.beginPath();ctx.arc(0,0,size,0,Math.PI*1.72);ctx.stroke();ctx.setLineDash([]);traceChamferedPlate(ctx,{width:size,height:size,chamfer:size*.2});ctx.stroke();
  }
  ctx.restore();
}

export function renderRegionWorld(ctx,{regionId="shattered-approach",camera={x:0,y:0},viewport={width:1280,height:720},arena=1400,time=0,seed=0,reducedMotion=false}={}){
  const profile=resolveRegionVisualProfile(regionId),width=viewport.width??1280,height=viewport.height??720;
  const bounds={minX:Math.max(-arena,camera.x-width*.72),maxX:Math.min(arena,camera.x+width*.72),minY:Math.max(-arena,camera.y-height*.72),maxY:Math.min(arena,camera.y+height*.72)};
  const gradient=ctx.createRadialGradient(camera.x,camera.y,0,camera.x,camera.y,Math.max(width,height));gradient.addColorStop(0,profile.palette.floor);gradient.addColorStop(1,"#020307");ctx.fillStyle=gradient;ctx.fillRect(-arena,-arena,arena*2,arena*2);
  drawGrid(ctx,profile,bounds,time,reducedMotion);
  const startX=Math.floor(bounds.minX/TILE)*TILE,startY=Math.floor(bounds.minY/TILE)*TILE;
  for(let x=startX;x<=bounds.maxX;x+=TILE)for(let y=startY;y<=bounds.maxY;y+=TILE){const cellSeed=visualHash(`${seed}:${regionId}:${x}:${y}`);if(seededUnit(cellSeed,0)>profile.density)continue;drawMotif(ctx,profile,x+seededSigned(cellSeed,4)*38,y+seededSigned(cellSeed,5)*38,cellSeed,time,reducedMotion);}
}
