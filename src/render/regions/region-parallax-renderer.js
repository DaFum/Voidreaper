import { resolveRegionVisualProfile } from "./region-visual-profiles.js";
import { seededUnit, visualHash } from "../forged-abyss/seeded-visuals.js";

const NEBULA_SIZE = 720;
const SILHOUETTE_SIZE = 900;
const DUST_COUNT = 56;
const DUST_CELL = 1100;
const layerCache = new Map();

function hexToRgba(hex, alpha) {
  const value = parseInt(hex.slice(1), 16);
  return `rgba(${(value >> 16) & 255},${(value >> 8) & 255},${value & 255},${alpha})`;
}

// bake each element at all nine wrap offsets so the tile repeats seamlessly
function wrapped(ctx, size, paint) {
  for (const offsetX of [-size, 0, size]) for (const offsetY of [-size, 0, size]) {
    ctx.save();
    ctx.translate(offsetX, offsetY);
    paint();
    ctx.restore();
  }
}

function bakeNebula(profile, seed) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = NEBULA_SIZE;
  const bakeCtx = canvas.getContext("2d");
  const colors = [profile.palette.void, profile.palette.accent, profile.palette.grid];
  for (let index = 0; index < 9; index += 1) {
    const x = seededUnit(seed, index * 4) * NEBULA_SIZE;
    const y = seededUnit(seed, index * 4 + 1) * NEBULA_SIZE;
    const radius = 110 + seededUnit(seed, index * 4 + 2) * 210;
    const color = colors[index % colors.length];
    const alpha = .06 + seededUnit(seed, index * 4 + 3) * .08;
    wrapped(bakeCtx, NEBULA_SIZE, () => {
      const gradient = bakeCtx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, hexToRgba(color, alpha));
      gradient.addColorStop(1, hexToRgba(color, 0));
      bakeCtx.fillStyle = gradient;
      bakeCtx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    });
  }
  return canvas;
}

function traceSilhouette(ctx, profileId, size, variant) {
  ctx.beginPath();
  if (profileId === "shattered-approach") {
    ctx.moveTo(0, -size); ctx.lineTo(size * .5, size * .15); ctx.lineTo(-size * .1, size); ctx.lineTo(-size * .6, size * .05); ctx.closePath();
  } else if (profileId === "furnace-expanse") {
    const cut = size * .22;
    ctx.moveTo(-size + cut, -size * .4); ctx.lineTo(size - cut, -size * .4); ctx.lineTo(size, -size * .4 + cut); ctx.lineTo(size, size * .4 - cut); ctx.lineTo(size - cut, size * .4); ctx.lineTo(-size + cut, size * .4); ctx.lineTo(-size, size * .4 - cut); ctx.lineTo(-size, -size * .4 + cut); ctx.closePath();
  } else if (profileId === "grave-circuit") {
    ctx.rect(-size, -size * .35, size * 2, size * .7);
    ctx.moveTo(-size, -size * .35); ctx.lineTo(0, size * .35); ctx.lineTo(size, -size * .35);
  } else if (profileId === "null-cathedral") {
    ctx.moveTo(-size * .7, size); ctx.lineTo(-size * .7, 0); ctx.arc(0, 0, size * .7, Math.PI, 0); ctx.lineTo(size * .7, size);
  } else {
    ctx.arc(0, 0, size, variant * .8, variant * .8 + Math.PI * 1.4);
    ctx.moveTo(size * .55, 0); ctx.arc(0, 0, size * .55, 0, Math.PI * 2);
  }
}

function bakeSilhouettes(profile, seed) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SILHOUETTE_SIZE;
  const bakeCtx = canvas.getContext("2d");
  const filled = profile.id === "shattered-approach" || profile.id === "furnace-expanse";
  bakeCtx.lineJoin = "round";
  for (let index = 0; index < 10; index += 1) {
    const x = seededUnit(seed, 40 + index * 5) * SILHOUETTE_SIZE;
    const y = seededUnit(seed, 41 + index * 5) * SILHOUETTE_SIZE;
    const size = 55 + seededUnit(seed, 42 + index * 5) * 130;
    const rotation = seededUnit(seed, 43 + index * 5) * Math.PI * 2;
    const variant = seededUnit(seed, 44 + index * 5) * Math.PI;
    wrapped(bakeCtx, SILHOUETTE_SIZE, () => {
      bakeCtx.save();
      bakeCtx.translate(x, y);
      bakeCtx.rotate(rotation);
      traceSilhouette(bakeCtx, profile.id, size, variant);
      if (filled) { bakeCtx.fillStyle = hexToRgba(profile.palette.void, .14); bakeCtx.fill(); }
      bakeCtx.strokeStyle = hexToRgba(profile.palette.grid, .22);
      bakeCtx.lineWidth = 2;
      bakeCtx.stroke();
      bakeCtx.restore();
    });
  }
  return canvas;
}

function getLayers(regionId, profile) {
  if (typeof document === "undefined") return null;
  let layers = layerCache.get(regionId);
  if (!layers) {
    const seed = visualHash(`parallax:${regionId}`);
    layers = { nebula: bakeNebula(profile, seed), silhouettes: bakeSilhouettes(profile, seed) };
    layerCache.set(regionId, layers);
  }
  return layers;
}

// world-space tiling: a layer at parallax factor f sits at camera*(1-f), so it
// slides against the world as the camera moves
function drawTiledLayer(ctx, tile, camera, viewport, factor, driftX, driftY, alpha) {
  const size = tile.width;
  const anchorX = camera.x * (1 - factor) + driftX;
  const anchorY = camera.y * (1 - factor) + driftY;
  const left = camera.x - viewport.width / 2, top = camera.y - viewport.height / 2;
  const startX = anchorX + Math.floor((left - anchorX) / size) * size;
  const startY = anchorY + Math.floor((top - anchorY) / size) * size;
  ctx.save();
  ctx.globalAlpha *= alpha;
  for (let x = startX; x < left + viewport.width; x += size)
    for (let y = startY; y < top + viewport.height; y += size)
      ctx.drawImage(tile, x, y);
  ctx.restore();
}

export function renderRegionParallaxBackdrop(ctx, { regionId = "shattered-approach", camera = { x: 0, y: 0 }, viewport = { width: 1280, height: 720 }, time = 0, reducedMotion = false } = {}) {
  const profile = resolveRegionVisualProfile(regionId);
  const layers = getLayers(regionId, profile);
  if (!layers) return;
  const drift = reducedMotion ? 0 : time;
  drawTiledLayer(ctx, layers.nebula, camera, viewport, .12, drift * 2.4, drift * 1.1, 1);
  drawTiledLayer(ctx, layers.nebula, camera, viewport, .22, NEBULA_SIZE * .5 - drift * 1.6, NEBULA_SIZE * .3 + drift * .8, .6);
  drawTiledLayer(ctx, layers.silhouettes, camera, viewport, .45, drift * .9, 0, 1);
}

const wrapCoord = (value, min, span) => ((value - min) % span + span) % span + min;

export function renderRegionParallaxDust(ctx, { regionId = "shattered-approach", camera = { x: 0, y: 0 }, viewport = { width: 1280, height: 720 }, time = 0, seed = 0, reducedMotion = false } = {}) {
  const profile = resolveRegionVisualProfile(regionId);
  const dustSeed = visualHash(`dust:${regionId}:${seed}`);
  const left = camera.x - viewport.width / 2 - 40, top = camera.y - viewport.height / 2 - 40;
  const spanX = viewport.width + 80, spanY = viewport.height + 80;
  ctx.save();
  ctx.fillStyle = profile.palette.accent;
  for (let index = 0; index < DUST_COUNT; index += 1) {
    const depth = .65 + seededUnit(dustSeed, index * 3 + 2) * .3;
    const originX = seededUnit(dustSeed, index * 3) * DUST_CELL + camera.x * (1 - depth);
    const originY = seededUnit(dustSeed, index * 3 + 1) * DUST_CELL + camera.y * (1 - depth);
    const driftX = reducedMotion ? 0 : time * (4 + depth * 9);
    const bobY = reducedMotion ? 0 : Math.sin(time * .7 + index) * 6;
    const x = wrapCoord(originX + driftX, left, spanX);
    const y = wrapCoord(originY + bobY, top, spanY);
    const twinkle = reducedMotion ? 1 : .7 + .3 * Math.sin(time * 2 + index * 1.7);
    ctx.globalAlpha = (.06 + .16 * depth) * twinkle;
    const size = depth > .85 ? 2 : 1;
    ctx.fillRect(x, y, size, size);
  }
  ctx.restore();
}
