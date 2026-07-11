import { drawCracks, drawVoidCore, traceChamferedPlate } from "../forged-abyss/primitives.js";
import { mergeVisualPalette } from "../forged-abyss/palettes.js";
import { seededSigned, seededUnit, visualHash } from "../forged-abyss/seeded-visuals.js";
import { resolveRegionVisualProfile } from "./region-visual-profiles.js";
import { renderRegionParallaxBackdrop, renderRegionParallaxDust } from "./region-parallax-renderer.js";

const TILE = 128;

function drawGrid(ctx, profile, bounds, time, reducedMotion) {
  const { palette } = profile;
  ctx.strokeStyle = palette.grid;
  ctx.globalAlpha = .22;
  ctx.lineWidth = 1;
  const startX = Math.floor(bounds.minX / TILE) * TILE;
  const startY = Math.floor(bounds.minY / TILE) * TILE;
  // ⚡ Bolt Optimization: Batched Canvas Draw Calls
  // Each branch batches its geometry into one path and strokes it under the same
  // transformation matrix it was defined in (relevant for the rotated "segments" grid).
  // When drawing arcs in a batched path, moveTo() must be called explicitly beforehand
  // to avoid a connecting line extending from the previous sub-path to the arc's starting point.
  // Note: batching composites overlapping segments as one region, so crossings no longer
  // accumulate alpha; the resulting uniform grid tint is accepted in favor of performance.
  if (profile.grid === "cathedral") {
    ctx.beginPath();
    for (let x = startX; x <= bounds.maxX; x += TILE) {
      ctx.moveTo(x,bounds.maxY);ctx.lineTo(x,bounds.minY);
      for (let y = startY; y <= bounds.maxY; y += TILE) {
        ctx.moveTo(x, y);
        ctx.arc(x+TILE/2,y,TILE/2,Math.PI,0);
      }
    }
    ctx.stroke();
  } else if (profile.grid === "segments") {
    ctx.save();ctx.rotate(reducedMotion?0:time*.025);
    ctx.beginPath();
    // The rings are centered on the world origin, so they must reach the farthest
    // viewport corner from (0,0) — the viewport size alone leaves the grid blank
    // once the camera moves away from the origin.
    const maxDist = Math.hypot(Math.max(Math.abs(bounds.minX), Math.abs(bounds.maxX)), Math.max(Math.abs(bounds.minY), Math.abs(bounds.maxY)));
    for(let radius=TILE;radius<maxDist;radius+=TILE){
      ctx.moveTo(radius, 0);
      ctx.arc(0,0,radius,0,Math.PI*1.72);
    }
    ctx.stroke();
    ctx.restore();
  } else {
    ctx.beginPath();
    for(let x=startX;x<=bounds.maxX;x+=TILE){ctx.moveTo(x,bounds.minY);ctx.lineTo(profile.grid==="fracture"?x+TILE*.45:x,bounds.maxY);}
    for(let y=startY;y<=bounds.maxY;y+=TILE){ctx.moveTo(bounds.minX,y);ctx.lineTo(bounds.maxX,profile.grid==="salvage"?y+TILE*.18:y);}
    ctx.stroke();
  }
  ctx.globalAlpha=1;
}

const MOTIF_BAKE_SCALE = 2;
const MOTIF_CACHE_LIMIT = 512;
const motifSprites = new Map();

function motifSprite(profile, seed) {
  if (typeof document === "undefined") return null;
  const key = `${profile.id}:${seed}`;
  if (motifSprites.has(key)) return motifSprites.get(key);
  const size = 18 + seededUnit(seed, 1) * 28;
  const extent = Math.ceil(size * 1.4) + 6;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = extent * 2 * MOTIF_BAKE_SCALE;
  const spriteCtx = canvas.getContext("2d");
  if (!spriteCtx) return null;
  spriteCtx.setTransform(MOTIF_BAKE_SCALE, 0, 0, MOTIF_BAKE_SCALE, extent * MOTIF_BAKE_SCALE, extent * MOTIF_BAKE_SCALE);
  drawMotifShape(spriteCtx, profile, seed, 0, true);
  const sprite = { canvas, extent };
  if (motifSprites.size >= MOTIF_CACHE_LIMIT) motifSprites.delete(motifSprites.keys().next().value);
  motifSprites.set(key, sprite);
  return sprite;
}

function drawMotif(ctx, profile, x, y, seed, time, reducedMotion) {
  const sprite = motifSprite(profile, seed);
  if (sprite) { ctx.drawImage(sprite.canvas, x - sprite.extent, y - sprite.extent, sprite.extent * 2, sprite.extent * 2); return; }
  ctx.save();ctx.translate(x,y);drawMotifShape(ctx, profile, seed, time, reducedMotion);ctx.restore();
}

function drawMotifShape(ctx, profile, seed, time, reducedMotion) {
  const localPalette=mergeVisualPalette({armor:profile.palette.grid,edge:profile.palette.accent,energy:profile.palette.accent,void:profile.palette.void});
  const size=18+seededUnit(seed,1)*28;
  ctx.rotate(seededUnit(seed,2)*Math.PI*2);ctx.globalAlpha=.12+seededUnit(seed,3)*.13;
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
}

// floorAlpha < 1 lets a backdrop layer (GPU environment stage) shine through the arena floor.
export function renderRegionWorld(ctx,{regionId="shattered-approach",camera={x:0,y:0},viewport={width:1280,height:720},arena=1400,time=0,seed=0,reducedMotion=false,lowDetail=false,floorAlpha=1}={}){
  const profile=resolveRegionVisualProfile(regionId),width=viewport.width??1280,height=viewport.height??720;
  const bounds={minX:Math.max(-arena,camera.x-width*.72),maxX:Math.min(arena,camera.x+width*.72),minY:Math.max(-arena,camera.y-height*.72),maxY:Math.min(arena,camera.y+height*.72)};
  const gradient=ctx.createRadialGradient(camera.x,camera.y,0,camera.x,camera.y,Math.max(width,height));gradient.addColorStop(0,profile.palette.floor);gradient.addColorStop(1,"#020307");ctx.globalAlpha=floorAlpha;ctx.fillStyle=gradient;ctx.fillRect(-arena,-arena,arena*2,arena*2);ctx.globalAlpha=1;
  ctx.save();ctx.beginPath();ctx.rect(-arena,-arena,arena*2,arena*2);ctx.clip();
  if(!lowDetail)renderRegionParallaxBackdrop(ctx,{regionId,camera,viewport:{width,height},time,reducedMotion});
  drawGrid(ctx,profile,bounds,time,reducedMotion);
  const startX=Math.floor(bounds.minX/TILE)*TILE,startY=Math.floor(bounds.minY/TILE)*TILE;
  for(let x=startX;x<=bounds.maxX;x+=TILE)for(let y=startY;y<=bounds.maxY;y+=TILE){const cellSeed=visualHash(`${seed}:${regionId}:${x}:${y}`);if(seededUnit(cellSeed,0)>profile.density)continue;drawMotif(ctx,profile,x+seededSigned(cellSeed,4)*38,y+seededSigned(cellSeed,5)*38,cellSeed,time,reducedMotion);}
  renderRegionParallaxDust(ctx,{regionId,camera,viewport:{width,height},time,seed,reducedMotion});
  ctx.restore();
}
