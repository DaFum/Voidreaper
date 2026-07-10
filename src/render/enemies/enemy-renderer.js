import { drawCracks, drawVoidCore } from "../forged-abyss/primitives.js";
import { mergeVisualPalette } from "../forged-abyss/palettes.js";
import { seededSigned, visualHash } from "../forged-abyss/seeded-visuals.js";
import { resolveEnemyVisualProfile } from "./enemy-visual-profiles.js";

const TAU = Math.PI * 2;

function traceSilhouette(ctx, profile, radius, seed) {
  const points = profile.points;
  ctx.beginPath();
  for (let index = 0; index < points; index += 1) {
    const angle = index / points * TAU - Math.PI / 2;
    const alternating = profile.family === "architect" ? (index % 2 ? .68 : 1) : 1;
    const taper = profile.family === "lancer" && index !== 0 ? .72 : 1;
    const variance = 1 + seededSigned(seed, index) * profile.asymmetry;
    const distance = radius * alternating * taper * variance;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    index ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath();
}

function drawMechanicalDetails(ctx, profile, radius, palette, time, reducedMotion) {
  ctx.strokeStyle = palette.armor;
  ctx.lineWidth = Math.max(1, radius * .08);
  const ribs = Math.max(2, Math.min(6, profile.fins || Math.ceil(profile.armor * 3)));
  for (let index = 0; index < ribs; index += 1) {
    const side = index % 2 ? 1 : -1;
    const y = -radius * .35 + Math.floor(index / 2) * radius * .34;
    ctx.beginPath();
    ctx.moveTo(side * radius * .2, y);
    ctx.lineTo(side * radius * (.64 + profile.armor * .08), y + side * radius * .08);
    ctx.stroke();
  }
  if (profile.muzzle) {
    ctx.fillStyle = palette.metal;
    ctx.strokeStyle = palette.energy;
    ctx.fillRect(-radius * .16, -radius * 1.16, radius * .32, radius * .72);
    ctx.strokeRect(-radius * .16, -radius * 1.16, radius * .32, radius * .72);
  }
  if (profile.orbit) {
    ctx.save();
    if (!reducedMotion) ctx.rotate(time * .35);
    ctx.setLineDash([radius * .22, radius * .16]);
    ctx.strokeStyle = palette.energy;
    ctx.globalAlpha *= .7;
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
    const angle = index / 8 * TAU;
    const distance = radius + 8;
    index ? ctx.lineTo(Math.cos(angle) * distance, Math.sin(angle) * distance) : ctx.moveTo(distance, 0);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

export function renderForgedEnemy(ctx, enemy, {
  frozen = false,
  target = null,
  shade = color => color,
  reducedMotion = false
} = {}) {
  const profile = resolveEnemyVisualProfile(enemy.type);
  if (enemy.__visualSeed === undefined) enemy.__visualSeed = visualHash(`${enemy.type}:${Math.round(enemy.x)}:${Math.round(enemy.y)}`);
  const seed = enemy.__visualSeed;
  const baseColor = frozen ? "#7bb8d4" : enemy.color;
  const palette = mergeVisualPalette({
    armor: baseColor,
    edge: enemy.hitT > 0 ? "#ffffff" : baseColor,
    energy: enemy.elite?.tint ?? baseColor,
    fault: enemy.elite?.tint ?? "#dd63ff"
  });
  const radius = enemy.r;
  const time = enemy.wobble ?? 0;
  const facing = Math.atan2(enemy.vy, enemy.vx) + Math.PI / 2;
  const birthScale = enemy.birth > 0 ? Math.max(.05, 1 - enemy.birth / .35) : 1;
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.rotate(facing + (reducedMotion ? 0 : Math.sin(time) * .08));
  ctx.scale(birthScale, birthScale);
  ctx.globalAlpha *= birthScale;
  ctx.shadowColor = palette.energy;
  ctx.shadowBlur = enemy.boss ? 24 : enemy.elite ? 17 : 9;
  traceSilhouette(ctx, profile, radius, seed);
  ctx.fillStyle = enemy.hitT > 0 ? "#ffffff" : shade(baseColor);
  ctx.strokeStyle = palette.edge;
  ctx.lineWidth = enemy.boss ? 2.5 : 1.6;
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
  drawMechanicalDetails(ctx, profile, radius, palette, time, reducedMotion);
  drawVoidCore(ctx, {
    radius: radius * (enemy.boss ? .28 : .24),
    palette,
    time,
    seed,
    reducedMotion,
    intensity: enemy.hitT > 0 ? 1 : .9
  });
  if (profile.family === "rift" || profile.family === "parasite") {
    drawCracks(ctx, { radius: radius * .9, color: palette.fault, seed, count: 3, alpha: .8 });
  }
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
    ctx.strokeStyle = palette.energy;
    ctx.lineWidth = 3;
    ctx.setLineDash([9, 3]);
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, radius + 7, shieldFacing - .9, shieldFacing + .9);
    ctx.stroke();
    ctx.restore();
  }
  if (!enemy.boss && enemy.maxHp > 30 && enemy.hp < enemy.maxHp && enemy.birth <= 0) {
    const ratio = Math.max(0, Math.min(1, enemy.hp / enemy.maxHp));
    ctx.fillStyle = "rgba(0,0,0,.7)";
    ctx.fillRect(enemy.x - 17, enemy.y - radius - 12, 34, 5);
    ctx.fillStyle = enemy.elite?.tint ?? baseColor;
    ctx.fillRect(enemy.x - 16, enemy.y - radius - 11, 32 * ratio, 3);
  }
}
