import {
  drawCracks,
  drawVoidCore,
  fillSheen,
  drawBloomDot,
  drawContactShadow,
  withAlpha,
  mixColor,
} from "../forged-abyss/primitives.js";
import { mergeVisualPalette } from "../forged-abyss/palettes.js";
import { seededSigned, visualHash } from "../forged-abyss/seeded-visuals.js";
import { resolveEnemyVisualProfile } from "./enemy-visual-profiles.js";

const TAU = Math.PI * 2;

function silhouettePoints(profile, radius, seed) {
  const points = profile.points;
  const out = [];
  let maxD = 0;
  for (let index = 0; index < points; index += 1) {
    const angle = (index / points) * TAU - Math.PI / 2;
    const alternating = profile.family === "architect" ? (index % 2 ? .68 : 1) : 1;
    const taper = profile.family === "lancer" && index !== 0 ? .72 : 1;
    const variance = 1 + seededSigned(seed, index) * profile.asymmetry;
    const distance = radius * alternating * taper * variance;
    maxD = Math.max(maxD, distance);
    out.push({ x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, d: distance });
  }
  return { out, maxD };
}

function tracePolygon(ctx, pts, scale = 1) {
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p.x * scale, p.y * scale) : ctx.moveTo(p.x * scale, p.y * scale)));
  ctx.closePath();
}

function drawMechanicalDetails(ctx, profile, radius, palette, time, reducedMotion) {
  // ribbed plating with a bright top edge
  ctx.lineCap = "round";
  const ribs = Math.max(2, Math.min(6, profile.fins || Math.ceil(profile.armor * 3)));
  for (let index = 0; index < ribs; index += 1) {
    const side = index % 2 ? 1 : -1;
    const y = -radius * .35 + Math.floor(index / 2) * radius * .34;
    const x0 = side * radius * .2;
    const x1 = side * radius * (.64 + profile.armor * .08);
    const y1 = y + side * radius * .08;
    ctx.strokeStyle = "rgba(0,0,0,.45)";
    ctx.lineWidth = Math.max(1.5, radius * .1);
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.strokeStyle = palette.armorLight ?? palette.armor;
    ctx.lineWidth = Math.max(1, radius * .05);
    ctx.beginPath();
    ctx.moveTo(x0, y - radius * .04);
    ctx.lineTo(x1, y1 - radius * .04);
    ctx.stroke();
  }
  if (profile.muzzle) {
    ctx.save();
    fillSheen(ctx, () => ctx.rect(-radius * .16, -radius * 1.16, radius * .32, radius * .72), {
      light: palette.plateLight ?? palette.metalLight,
      base: palette.metal,
      dark: palette.hull,
      span: radius,
    });
    ctx.strokeStyle = palette.edge;
    ctx.lineWidth = 1.4;
    ctx.strokeRect(-radius * .16, -radius * 1.16, radius * .32, radius * .72);
    drawBloomDot(ctx, { y: -radius * 1.12, radius: radius * .34, color: palette.energy, alpha: .9 });
    ctx.restore();
  }
  if (profile.orbit) {
    ctx.save();
    if (!reducedMotion) ctx.rotate(time * .35);
    ctx.setLineDash([radius * .22, radius * .16]);
    ctx.strokeStyle = withAlpha(palette.energy, .7);
    ctx.lineWidth = Math.max(1.5, radius * .06);
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 1.12, radius * .72, .35, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
}

function drawEliteFrame(ctx, radius, color, time, reducedMotion) {
  ctx.save();
  if (!reducedMotion) ctx.rotate(-time * .25);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  for (let index = 0; index < 8; index += 1) {
    const angle = (index / 8) * TAU;
    const distance = radius + 8;
    index
      ? ctx.lineTo(Math.cos(angle) * distance, Math.sin(angle) * distance)
      : ctx.moveTo(distance, 0);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);
  // corner ticks for a heavier "flagged target" read
  for (let index = 0; index < 8; index += 1) {
    const angle = (index / 8) * TAU;
    const r0 = radius + 5, r1 = radius + 12;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * r0, Math.sin(angle) * r0);
    ctx.lineTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
    ctx.stroke();
  }
  ctx.restore();
}

export function renderForgedEnemy(ctx, enemy, {
  frozen = false,
  target = null,
  shade = (color) => color,
  reducedMotion = false,
} = {}) {
  const profile = resolveEnemyVisualProfile(enemy.type);
  if (enemy.__visualSeed === undefined)
    enemy.__visualSeed = visualHash(`${enemy.type}:${Math.round(enemy.x)}:${Math.round(enemy.y)}`);
  const seed = enemy.__visualSeed;
  const hit = enemy.hitT > 0;
  const baseColor = frozen ? "#7bb8d4" : enemy.color;
  const palette = mergeVisualPalette({
    armor: baseColor,
    armorLight: mixColor(baseColor, "#ffffff", .4),
    edge: hit ? "#ffffff" : mixColor(baseColor, "#ffffff", .55),
    energy: enemy.elite?.tint ?? mixColor(baseColor, palette_energy_hint(baseColor), .5),
    fault: enemy.elite?.tint ?? "#dd63ff",
  });
  const radius = enemy.r;
  const time = enemy.wobble ?? 0;
  const facing = Math.atan2(enemy.vy, enemy.vx) + Math.PI / 2;
  const birthScale = enemy.birth > 0 ? Math.max(.05, 1 - enemy.birth / .35) : 1;
  const { out: pts, maxD } = silhouettePoints(profile, radius, seed);

  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.rotate(facing + (reducedMotion ? 0 : Math.sin(time) * .08));
  ctx.scale(birthScale, birthScale);
  ctx.globalAlpha *= birthScale;

  // soft grounding shadow + outer energy aura for depth
  drawContactShadow(ctx, { radius: maxD, alpha: .3 });
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const aura = ctx.createRadialGradient(0, 0, maxD * .6, 0, 0, maxD * 1.35);
  aura.addColorStop(0, withAlpha(palette.energy, hit ? .5 : .22));
  aura.addColorStop(1, withAlpha(palette.energy, 0));
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, 0, maxD * 1.35, 0, TAU);
  ctx.fill();
  ctx.restore();

  ctx.lineJoin = "round";

  // 1) base hull with top-lit sheen
  if (hit) {
    tracePolygon(ctx, pts);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
  } else {
    fillSheen(ctx, () => tracePolygon(ctx, pts), {
      light: mixColor(baseColor, "#ffffff", .45),
      base: shade(baseColor),
      dark: mixColor(baseColor, "#000000", .5),
      span: maxD,
    });
  }
  // outline
  ctx.strokeStyle = palette.edge;
  ctx.lineWidth = enemy.boss ? 2.6 : 1.7;
  tracePolygon(ctx, pts);
  ctx.stroke();

  // 2) inset darker plate + panel spokes for layered depth
  ctx.save();
  tracePolygon(ctx, pts);
  ctx.clip();
  tracePolygon(ctx, pts, .62);
  ctx.fillStyle = withAlpha("#000000", .28);
  ctx.fill();
  // spokes from center to each vertex
  ctx.strokeStyle = withAlpha(palette.armorLight ?? palette.armor, .35);
  ctx.lineWidth = 1;
  pts.forEach((p) => {
    ctx.beginPath();
    ctx.moveTo(p.x * .58, p.y * .58);
    ctx.lineTo(p.x * .92, p.y * .92);
    ctx.stroke();
  });
  ctx.restore();

  // 3) top rim highlight on the light-facing edge only
  const n = pts.length;
  let startIndex = -1;
  for (let i = 0; i < n; i++) {
    if (pts[i].y < 0 && pts[(i - 1 + n) % n].y >= 0) {
      startIndex = i;
      break;
    }
  }
  if (startIndex !== -1) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts[startIndex].x, pts[startIndex].y);
    for (let i = 1; i < n; i++) {
      const idx = (startIndex + i) % n;
      if (pts[idx].y < 0) {
        ctx.lineTo(pts[idx].x, pts[idx].y);
      } else {
        break;
      }
    }
    ctx.strokeStyle = withAlpha(palette.rim ?? "#ffffff", .55);
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  }

  // 4) rivets at vertices
  ctx.save();
  ctx.fillStyle = withAlpha("#000000", .4);
  pts.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x * .88, p.y * .88, Math.max(1, radius * .05), 0, TAU);
    ctx.fill();
  });
  ctx.restore();

  drawMechanicalDetails(ctx, profile, radius, palette, time, reducedMotion);

  drawVoidCore(ctx, {
    radius: radius * (enemy.boss ? .3 : .26),
    palette,
    time,
    seed,
    reducedMotion,
    intensity: hit ? 1 : .92,
  });

  if (profile.family === "rift" || profile.family === "parasite")
    drawCracks(ctx, { radius: radius * .9, color: palette.fault, seed, count: 3, alpha: .85 });

  if (enemy.elite) drawEliteFrame(ctx, radius, enemy.elite.tint, time, reducedMotion);
  if (enemy.boss) {
    ctx.save();
    if (!reducedMotion) ctx.rotate(time * .22);
    ctx.strokeStyle = "#ffd166";
    ctx.lineWidth = 2;
    for (let ring = 0; ring < 2; ring += 1) {
      ctx.setLineDash([8 + ring * 3, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, radius * (1.08 + ring * .2), ring * .5, TAU - ring * .4);
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();

  if (enemy.shielded && enemy.birth <= 0 && target) {
    const shieldFacing = Math.atan2(target.y - enemy.y, target.x - enemy.x);
    ctx.save();
    // layered arc shield: soft glow band + bright edge
    ctx.strokeStyle = withAlpha(palette.energy, .28);
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, radius + 7, shieldFacing - .95, shieldFacing + .95);
    ctx.stroke();
    ctx.strokeStyle = palette.energy;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([9, 3]);
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, radius + 7, shieldFacing - .9, shieldFacing + .9);
    ctx.stroke();
    ctx.restore();
  }
  if (!enemy.boss && enemy.maxHp > 30 && enemy.hp < enemy.maxHp && enemy.birth <= 0) {
    const ratio = Math.max(0, Math.min(1, enemy.hp / enemy.maxHp));
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,.7)";
    ctx.fillRect(enemy.x - 17, enemy.y - radius - 12, 34, 5);
    const grad = ctx.createLinearGradient(enemy.x - 16, 0, enemy.x + 16, 0);
    const c = enemy.elite?.tint ?? baseColor;
    grad.addColorStop(0, mixColor(c, "#ffffff", .3));
    grad.addColorStop(1, c);
    ctx.fillStyle = grad;
    ctx.fillRect(enemy.x - 16, enemy.y - radius - 11, 32 * ratio, 3);
    ctx.restore();
  }
}

// Cheap warm/cool energy hint so tint stays in-mood even for odd base colors.
function palette_energy_hint() {
  return "#48e5c2";
}
