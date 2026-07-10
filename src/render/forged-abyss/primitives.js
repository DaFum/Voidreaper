import { seededSigned, seededUnit } from "./seeded-visuals.js";

export function traceChamferedPlate(ctx, {
  width,
  height,
  chamfer = Math.min(width, height) * .18,
  inset = 0
}) {
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

export function traceRib(ctx, { x = 0, y = 0, length, width = 3, rotation = 0 }) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  traceChamferedPlate(ctx, { width, height: length, chamfer: width * .4 });
  ctx.restore();
}

export function drawEnergyRail(ctx, {
  from,
  to,
  color,
  width = 2,
  flow = 0,
  alpha = .8,
  reducedMotion = false
}) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha *= alpha;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.setLineDash([Math.max(2, width * 2), Math.max(3, width * 3)]);
  ctx.lineDashOffset = reducedMotion ? 0 : -flow * 14;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.restore();
}

export function drawVoidCore(ctx, {
  x = 0,
  y = 0,
  radius,
  palette,
  time = 0,
  seed = 0,
  reducedMotion = false,
  intensity = 1
}) {
  const pulse = reducedMotion ? 1 : 1 + Math.sin(time * 2.1 + seededUnit(seed, 2) * Math.PI * 2) * .08;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(pulse, pulse);
  const gradient = ctx.createRadialGradient(-radius * .18, -radius * .22, radius * .06, 0, 0, radius);
  gradient.addColorStop(0, palette.cockpit);
  gradient.addColorStop(.22, palette.energy);
  gradient.addColorStop(.5, palette.fault);
  gradient.addColorStop(1, palette.void);
  ctx.fillStyle = gradient;
  ctx.globalAlpha *= intensity;
  ctx.beginPath();
  const points = 12;
  for (let index = 0; index < points; index += 1) {
    const angle = index / points * Math.PI * 2;
    const variance = .84 + seededUnit(seed, index + 10) * .22;
    const distance = radius * variance;
    const px = Math.cos(angle) * distance;
    const py = Math.sin(angle) * distance;
    index ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = palette.edge;
  ctx.lineWidth = Math.max(1, radius * .08);
  ctx.stroke();
  ctx.restore();
}

export function drawCracks(ctx, {
  x = 0,
  y = 0,
  radius,
  color,
  seed = 0,
  count = 4,
  alpha = .8
}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, radius * .05);
  ctx.globalAlpha *= alpha;
  for (let index = 0; index < count; index += 1) {
    const angle = seededUnit(seed, 30 + index) * Math.PI * 2;
    const bend = seededSigned(seed, 60 + index) * .38;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * radius * .18, Math.sin(angle) * radius * .18);
    ctx.lineTo(Math.cos(angle + bend) * radius * .58, Math.sin(angle + bend) * radius * .58);
    ctx.lineTo(Math.cos(angle - bend * .4) * radius, Math.sin(angle - bend * .4) * radius);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawArmorHatch(ctx, {
  width,
  height,
  color,
  spacing = 6,
  alpha = .25
}) {
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
