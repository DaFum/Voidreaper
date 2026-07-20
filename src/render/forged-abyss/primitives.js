import { seededSigned, seededUnit } from "./seeded-visuals.js";

const TAU = Math.PI * 2;

// --- color utils -------------------------------------------------------------
// Convert a #rgb / #rrggbb color to rgba() with a given alpha. Falls back to the
// original string for named/rgb() colors so callers can pass anything.
export function withAlpha(color, alpha) {
  if (typeof color !== "string" || color[0] !== "#") return color;
  const hex = color.slice(1);
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

function mix(a, b, t) {
  const pa = parseInt(a.slice(1).length === 3 ? a.slice(1).split("").map((c) => c + c).join("") : a.slice(1), 16);
  const pb = parseInt(b.slice(1).length === 3 ? b.slice(1).split("").map((c) => c + c).join("") : b.slice(1), 16);
  const r = Math.round(((pa >> 16) & 255) * (1 - t) + ((pb >> 16) & 255) * t);
  const g = Math.round(((pa >> 8) & 255) * (1 - t) + ((pb >> 8) & 255) * t);
  const bl = Math.round((pa & 255) * (1 - t) + (pb & 255) * t);
  return `rgb(${r},${g},${bl})`;
}
export { mix as mixColor };

// --- plating ----------------------------------------------------------------
export function traceChamferedPlate(ctx, { width, height, chamfer = Math.min(width, height) * .18, inset = 0 }) {
  const left = -width / 2 + inset;
  const right = width / 2 - inset;
  const top = -height / 2 + inset;
  const bottom = height / 2 - inset;
  const cut = Math.max(0, Math.min(chamfer, (right - left) / 2, (bottom - top) / 2));
  ctx.beginPath();
  ctx.moveTo(left + cut, top);
  ctx.lineTo(right - cut, top);
  ctx.lineTo(right, top + cut);
  ctx.lineTo(right, bottom - cut);
  ctx.lineTo(right - cut, bottom);
  ctx.lineTo(left + cut, bottom);
  ctx.lineTo(left, bottom - cut);
  ctx.lineTo(left, top + cut);
  ctx.closePath();
}

// Fill the current-or-traced path with a top-lit vertical gradient so metal
// reads as a 3D surface. `trace` should leave a path ready to fill; if omitted
// the existing path is used.
export function fillSheen(ctx, trace, { light, base, dark, top = -1, bottom = 1, span = 1 }) {
  if (trace) trace();
  const g = ctx.createLinearGradient(0, top * span, 0, bottom * span);
  g.addColorStop(0, light);
  g.addColorStop(0.5, base);
  g.addColorStop(1, dark);
  ctx.fillStyle = g;
  ctx.fill();
}

// A single bright rim on the light-facing (top) edge — cheap fake specular.
export function strokeRim(ctx, trace, { color, width = 1.4, alpha = .7 }) {
  const prev = ctx.globalAlpha;
  ctx.save();
  if (trace) trace();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.globalAlpha = prev * alpha;
  ctx.stroke();
  ctx.restore();
}

// Recessed panel seams inside a plate footprint.
export function drawPanelSeams(ctx, { width, height, color, rows = 2, cols = 1, alpha = .5, inset = 0.14 }) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha *= alpha;
  ctx.lineWidth = 1;
  const x0 = -width / 2, x1 = width / 2, y0 = -height / 2, y1 = height / 2;
  for (let r = 1; r < rows; r += 1) {
    const y = y0 + (height * r) / rows;
    ctx.beginPath();
    ctx.moveTo(x0 + width * inset, y);
    ctx.lineTo(x1 - width * inset, y);
    ctx.stroke();
  }
  for (let c = 1; c < cols; c += 1) {
    const x = x0 + (width * c) / cols;
    ctx.beginPath();
    ctx.moveTo(x, y0 + height * inset);
    ctx.lineTo(x, y1 - height * inset);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawRivets(ctx, { points, color, radius = 1.3, alpha = .8 }) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha *= alpha;
  for (const p of points) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

// Soft contact shadow beneath a footprint — grounds modules onto the hull.
export function drawContactShadow(ctx, { radius, alpha = .35 }) {
  ctx.save();
  const g = ctx.createRadialGradient(0, radius * .2, radius * .2, 0, radius * .2, radius * 1.25);
  g.addColorStop(0, `rgba(0,0,0,${alpha})`);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, radius * .18, radius * 1.2, radius * .7, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

// Additive bloom dot for hot points (muzzles, vents, coil taps).
export function drawBloomDot(ctx, { x = 0, y = 0, radius, color, alpha = 1 }) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, withAlpha(color, .9 * alpha));
  g.addColorStop(.4, withAlpha(color, .35 * alpha));
  g.addColorStop(1, withAlpha(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.fill();
  ctx.restore();
}

// --- energy -----------------------------------------------------------------
export function drawEnergyRail(ctx, { from, to, color, width = 2, flow = 0, alpha = .8, reducedMotion = false }) {
  ctx.save();
  ctx.lineCap = "round";
  // soft underglow
  ctx.strokeStyle = withAlpha(color, alpha * .28);
  ctx.lineWidth = width * 3.2;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  // travelling dashes
  ctx.strokeStyle = color;
  ctx.globalAlpha *= alpha;
  ctx.lineWidth = width;
  ctx.setLineDash([Math.max(2, width * 2), Math.max(3, width * 3)]);
  ctx.lineDashOffset = reducedMotion ? 0 : -flow * 14;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.restore();
}

// Layered void core: bloom halo -> jagged plasma body -> inner hotspot ->
// bright containment ring -> a couple of orbiting sparks.
export function drawVoidCore(ctx, { x = 0, y = 0, radius, palette, time = 0, seed = 0, reducedMotion = false, intensity = 1 }) {
  const pulse = reducedMotion ? 1 : 1 + Math.sin(time * 2.1 + seededUnit(seed, 2) * TAU) * .08;
  ctx.save();
  ctx.translate(x, y);

  // halo
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const halo = ctx.createRadialGradient(0, 0, radius * .25, 0, 0, radius * 2.2);
  halo.addColorStop(0, withAlpha(palette.energy, .45 * intensity));
  halo.addColorStop(.45, withAlpha(palette.energy, .13 * intensity));
  halo.addColorStop(1, withAlpha(palette.energy, 0));
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 2.2, 0, TAU);
  ctx.fill();
  ctx.restore();

  ctx.scale(pulse, pulse);

  // plasma body
  const gradient = ctx.createRadialGradient(-radius * .22, -radius * .26, radius * .05, 0, 0, radius);
  gradient.addColorStop(0, palette.cockpit);
  gradient.addColorStop(.2, palette.energySoft ?? palette.energy);
  gradient.addColorStop(.48, palette.fault);
  gradient.addColorStop(.8, palette.voidBright ?? palette.void);
  gradient.addColorStop(1, palette.void);
  ctx.fillStyle = gradient;
  ctx.globalAlpha *= intensity;
  ctx.beginPath();
  const points = 14;
  for (let index = 0; index < points; index += 1) {
    const angle = (index / points) * TAU;
    const wobble = reducedMotion ? 0 : Math.sin(time * 3 + index) * .05;
    const variance = .82 + seededUnit(seed, index + 10) * .24 + wobble;
    const distance = radius * variance;
    const px = Math.cos(angle) * distance;
    const py = Math.sin(angle) * distance;
    index ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // inner hotspot
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const hot = ctx.createRadialGradient(-radius * .18, -radius * .2, 0, -radius * .18, -radius * .2, radius * .7);
  hot.addColorStop(0, withAlpha(palette.cockpit, .9));
  hot.addColorStop(1, withAlpha(palette.cockpit, 0));
  ctx.fillStyle = hot;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, TAU);
  ctx.fill();
  ctx.restore();

  // containment ring
  ctx.strokeStyle = palette.edge;
  ctx.lineWidth = Math.max(1, radius * .09);
  ctx.beginPath();
  ctx.arc(0, 0, radius * .96, 0, TAU);
  ctx.stroke();

  // orbiting sparks
  if (!reducedMotion) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = palette.cockpit;
    for (let i = 0; i < 3; i += 1) {
      const a = time * (1.4 + i * .5) + i * 2.1 + seededUnit(seed, i) * TAU;
      const rr = radius * (1.05 + i * .12);
      ctx.globalAlpha = .55;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * rr, Math.sin(a) * rr * .7, radius * .09, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }
  ctx.restore();
}

export function drawCracks(ctx, { x = 0, y = 0, radius, color, seed = 0, count = 4, alpha = .8 }) {
  ctx.save();
  ctx.translate(x, y);
  ctx.lineCap = "round";
  for (let index = 0; index < count; index += 1) {
    const angle = seededUnit(seed, 30 + index) * TAU;
    const bend = seededSigned(seed, 60 + index) * .38;
    const p0 = { x: Math.cos(angle) * radius * .18, y: Math.sin(angle) * radius * .18 };
    const p1 = { x: Math.cos(angle + bend) * radius * .58, y: Math.sin(angle + bend) * radius * .58 };
    const p2 = { x: Math.cos(angle - bend * .4) * radius, y: Math.sin(angle - bend * .4) * radius };
    // dark fracture underneath, bright hairline on top -> reads as depth
    for (const [c, w, a] of [["rgba(0,0,0,.55)", radius * .1, alpha], [color, radius * .045, 1]]) {
      ctx.strokeStyle = c;
      ctx.lineWidth = Math.max(1, w);
      ctx.globalAlpha = a * alpha;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function drawArmorHatch(ctx, { width, height, color, spacing = 6, alpha = .25 }) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha *= alpha;
  ctx.lineWidth = 1;
  for (let offset = -width - height; offset < width + height; offset += spacing) {
    ctx.beginPath();
    ctx.moveTo(-width / 2, offset);
    ctx.lineTo(width / 2, offset - width);
    ctx.stroke();
  }
  ctx.restore();
}
