// Auto-generated standalone bundle of renderers/ — no inter-module imports.

// ===== renderers/forged-abyss/seeded-visuals.js =====
// Unchanged from repo — seeded procedural helpers (kept for parity).
export function visualHash(value) {
  let hash = 2166136261;
  for (const character of String(value ?? 0)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function seededUnit(seed, channel = 0) {
  let value = visualHash(`${seed}:${channel}`) || 1;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  return (value >>> 0) / 0xffffffff;
}

export function seededSigned(seed, channel = 0) {
  return seededUnit(seed, channel) * 2 - 1;
}


// ===== renderers/forged-abyss/palettes.js =====
// Refined + expanded Forged Abyss palette.
// Same mood; adds tonal steps so renderers can do real top-lit shading,
// panel-line grooves and rim highlights. All original keys are preserved,
// so existing overrides (shipStyle.palette) keep working.
const FORGED_ABYSS_PALETTE = Object.freeze({
  // hull tones (dark -> light), used for directional sheen fills
  hullDeep: "#05090f",
  hull: "#0b131c",
  hullLight: "#16232e",
  metal: "#182a36",
  metalLight: "#2c4655",
  structure: "#22343f",
  plate: "#33505f",
  plateLight: "#527585",
  // armor
  armor: "#5f8496",
  armorLight: "#94bfce",
  // grooves + rims
  panelLine: "#070f16",
  edge: "#c7f9ff",
  rim: "#e9ffff",
  // energy
  energy: "#4fead0",
  energySoft: "#9ff6e6",
  glow: "#7ff0ff",
  // void / corruption
  void: "#4a155f",
  voidBright: "#7b2e97",
  fault: "#e07bff",
  // states
  damage: "#ff5470",
  cockpit: "#f2fdff",
  thruster: "#ffb04a",
  thrusterCore: "#fff2c2",
});

export const REGION_VISUAL_PALETTES = Object.freeze({
  "shattered-approach": Object.freeze({ floor: "#0a0d18", grid: "#49417a", accent: "#8c7cff", void: "#30104a" }),
  "furnace-expanse": Object.freeze({ floor: "#160806", grid: "#713420", accent: "#ff8a42", void: "#4d101c" }),
  "grave-circuit": Object.freeze({ floor: "#061113", grid: "#31585a", accent: "#67d8c3", void: "#173b3a" }),
  "null-cathedral": Object.freeze({ floor: "#100515", grid: "#64306f", accent: "#dd63ff", void: "#390c4a" }),
  "architects-crown": Object.freeze({ floor: "#071018", grid: "#326679", accent: "#9df6e4", void: "#182a56" }),
});

export function mergeVisualPalette(overrides = {}) {
  return { ...FORGED_ABYSS_PALETTE, ...overrides };
}


// ===== renderers/forged-abyss/primitives.js =====

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

export function mixColor(a, b, t) {
  const pa = parseInt(a.slice(1).length === 3 ? a.slice(1).split("").map((c) => c + c).join("") : a.slice(1), 16);
  const pb = parseInt(b.slice(1).length === 3 ? b.slice(1).split("").map((c) => c + c).join("") : b.slice(1), 16);
  const r = Math.round(((pa >> 16) & 255) * (1 - t) + ((pb >> 16) & 255) * t);
  const g = Math.round(((pa >> 8) & 255) * (1 - t) + ((pb >> 8) & 255) * t);
  const bl = Math.round((pa & 255) * (1 - t) + (pb & 255) * t);
  return `rgb(${r},${g},${bl})`;
}

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


// ===== renderers/enemies/enemy-visual-profiles.js =====
// Unchanged from repo.
const profile = (id, family, options = {}) => Object.freeze({
  id,
  family,
  points: options.points ?? 6,
  core: options.core ?? "void",
  armor: options.armor ?? 1,
  fins: options.fins ?? 0,
  asymmetry: options.asymmetry ?? 0,
  muzzle: options.muzzle ?? false,
  orbit: options.orbit ?? false,
});

const ENEMY_VISUAL_PROFILES = Object.freeze({
  swarm: profile("swarm", "drone", { points: 4, armor: .35, fins: 2 }),
  chaser: profile("chaser", "lancer", { points: 3, armor: .7, fins: 2 }),
  orbiter: profile("orbiter", "orbiter", { points: 6, orbit: true, armor: .55 }),
  spitter: profile("spitter", "artillery", { points: 5, muzzle: true, armor: .65 }),
  tank: profile("tank", "bulwark", { points: 8, armor: 1.4, fins: 2 }),
  splitter: profile("splitter", "carrier", { points: 6, armor: .8, fins: 4 }),
  bomber: profile("bomber", "rammer", { points: 4, armor: .85, fins: 3 }),
  shield: profile("shield", "warden", { points: 6, armor: 1.25, orbit: true }),
  warper: profile("warper", "rift", { points: 7, core: "rift", armor: .45, asymmetry: .24 }),
  leech: profile("leech", "parasite", { points: 5, core: "organic", armor: .5, asymmetry: .18 }),
  boss: profile("boss", "architect", { points: 12, core: "architect", armor: 1.6, fins: 6, orbit: true }),
});

export const ENEMY_VISUAL_PROFILE_IDS = Object.freeze(Object.keys(ENEMY_VISUAL_PROFILES));
const warned = new Set();
const FALLBACK = profile("fallback", "unknown", { points: 4, core: "warning", armor: 1 });

export function resolveEnemyVisualProfile(type) {
  const resolved = ENEMY_VISUAL_PROFILES[type];
  if (!resolved && !warned.has(type)) {
    warned.add(type);
    console.warn(`[visuals] missing enemy profile: ${type}`);
  }
  return resolved ?? FALLBACK;
}


// ===== renderers/enemies/enemy-renderer.js =====




// (TAU declared above)

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
      light: mixColor(shade(baseColor), "#ffffff", .45),
      base: shade(baseColor),
      dark: mixColor(shade(baseColor), "#000000", .5),
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
  ctx.save();
  ctx.beginPath();
  const topPts = pts.filter((p) => p.y < 0);
  if (topPts.length) {
    topPts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.strokeStyle = withAlpha(palette.rim ?? "#ffffff", .55);
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
  ctx.restore();

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
function palette_energy_hint(baseColor) {
  return "#48e5c2";
}


// ===== renderers/ship-assembly/path-primitives.js =====
// Unchanged from repo.
export function traceTaperedPlate(c, { length, frontWidth, rearWidth, notch = 0 }) {
  c.beginPath();
  c.moveTo(0, -frontWidth / 2);
  c.lineTo(length - notch, -rearWidth / 2);
  c.lineTo(length, 0);
  c.lineTo(length - notch, rearWidth / 2);
  c.lineTo(0, frontWidth / 2);
  c.closePath();
}
export function traceCapsule(c, length, r) {
  c.beginPath();
  c.arc(-length / 2, 0, r, Math.PI / 2, Math.PI * 1.5);
  c.arc(length / 2, 0, r, Math.PI * 1.5, Math.PI / 2);
  c.closePath();
}
export function tracePipe(c, from, to, bend = .35) {
  c.beginPath();
  c.moveTo(from.x, from.y);
  c.bezierCurveTo(from.x + (to.x - from.x) * bend, from.y, to.x - (to.x - from.x) * bend, to.y, to.x, to.y);
}
export function traceLens(c, x, y, rx, ry, rotation = 0) {
  c.beginPath();
  c.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
}
export function traceCoil(c, x, length, radius, turns = 4) {
  c.beginPath();
  for (let i = 0; i <= turns * 12; i++) {
    const t = i / (turns * 12);
    const px = x + t * length;
    const py = Math.sin(t * Math.PI * 2 * turns) * radius;
    i ? c.lineTo(px, py) : c.moveTo(px, py);
  }
}
export function traceLauncherDoor(c, x, y, w, h, open = 0) {
  c.beginPath();
  c.roundRect(x - w / 2 - open * w * .3, y - h / 2, w, h, 2);
}
export function traceCoolingFin(c, x, y, length, angle = 0) {
  c.save();
  c.translate(x, y);
  c.rotate(angle);
  traceTaperedPlate(c, { length, frontWidth: 5, rearWidth: 1, notch: 2 });
  c.restore();
}
export function traceThrusterNozzle(c, x, y, size) {
  c.beginPath();
  c.moveTo(x - size, y - size * .6);
  c.lineTo(x + size, y - size * .35);
  c.lineTo(x + size, y + size * .35);
  c.lineTo(x - size, y + size * .6);
  c.closePath();
}
export function traceShieldRing(c, x, y, r, gap = .35) {
  c.beginPath();
  c.arc(x, y, r, gap, Math.PI - gap);
  c.moveTo(x - r * Math.cos(gap), y - r * Math.sin(gap));
  c.arc(x, y, r, Math.PI + gap, Math.PI * 2 - gap);
}
export function traceBrokenPlateEdge(c, length, seed = 1) {
  c.beginPath();
  c.moveTo(0, 0);
  for (let i = 1; i <= 5; i++) c.lineTo((length * i) / 5, (i % 2 ? 1 : -1) * (2 + (seed + i) % 4));
}


// ===== renderers/ship-assembly/module-core-renderers.js =====


// (TAU declared above)
const damaged = (state) => state.damageState === "armor-broken" || state.damageState === "core-disrupted";

// Solid metal body with directional sheen, clipped specular highlight and a rim.
const paint = (ctx, state, trace, { span } = {}) => {
  const sp = span ?? state.size;
  const disrupted = state.damageState === "core-disrupted";
  const p = state.palette;
  trace();
  const g = ctx.createLinearGradient(0, -sp, 0, sp);
  if (disrupted) {
    g.addColorStop(0, mixColor(p.fault, "#ffffff", .2));
    g.addColorStop(.5, p.fault);
    g.addColorStop(1, mixColor(p.void, "#000000", .3));
  } else {
    g.addColorStop(0, p.plateLight ?? p.metalLight ?? "#2c4655");
    g.addColorStop(.5, p.metal);
    g.addColorStop(1, p.hullDeep ?? "#05090f");
  }
  ctx.fillStyle = g;
  ctx.fill();
  // clipped top-left specular
  ctx.save();
  trace();
  ctx.clip();
  const light = disrupted ? mixColor(p.fault, "#ffffff", .5) : (p.plateLight ?? "#527585");
  const hs = ctx.createRadialGradient(-sp * .35, -sp * .45, 0, -sp * .35, -sp * .45, sp * 1.3);
  hs.addColorStop(0, withAlpha(light, .45));
  hs.addColorStop(1, withAlpha(light, 0));
  ctx.fillStyle = hs;
  ctx.fillRect(-sp * 2.5, -sp * 2.5, sp * 5, sp * 5);
  ctx.restore();
  // rim
  ctx.strokeStyle = damaged(state) ? p.damage : p.edge;
  ctx.lineWidth = 1.8;
  trace();
  ctx.stroke();
};

const glow = (ctx, state, alpha = 1) => {
  const disrupted = state.damageState === "core-disrupted";
  const color = disrupted ? state.palette.fault : state.palette.energy;
  const prev = ctx.globalAlpha;
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = withAlpha(color, prev * alpha * .32);
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.globalAlpha = prev * alpha;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
};

const seedCount = (state, min, spread) => min + Math.abs(state.variantSeed ?? 0) % spread;

export function createModuleCoreRendererRegistry() {
  const renderers = new Map();
  const warnedRendererIds = new Set();

  const fallback = (ctx, state) => {
    const previousAlpha = ctx.globalAlpha;
    traceChamferedPlate(ctx, { width: state.size * 1.15, height: state.size * .8, chamfer: state.size * .2 });
    ctx.fillStyle = state.palette.damage;
    ctx.globalAlpha = previousAlpha * .3;
    ctx.fill();
    ctx.globalAlpha = previousAlpha;
    ctx.strokeStyle = state.palette.damage;
    ctx.lineWidth = 2;
    ctx.stroke();
    drawArmorHatch(ctx, { width: state.size, height: state.size * .65, color: state.palette.damage, spacing: 4, alpha: .7 });
    ctx.beginPath();
    ctx.moveTo(-state.size * .32, -state.size * .32);
    ctx.lineTo(state.size * .32, state.size * .32);
    ctx.moveTo(state.size * .32, -state.size * .32);
    ctx.lineTo(-state.size * .32, state.size * .32);
    ctx.stroke();
  };

  const registry = {
    register: (id, renderer) => renderers.set(id, renderer),
    has: (id) => renderers.has(id),
    render(id, ctx, state) {
      const renderer = renderers.get(id) ?? fallback;
      if (!renderers.has(id) && !warnedRendererIds.has(id)) {
        warnedRendererIds.add(id);
        console.warn(`[assembly] neutral fallback renderer: ${id}`);
      }
      ctx.save();
      if (state.damageState === "detached-preview") ctx.globalAlpha = .52;
      if (state.lod !== "low") drawContactShadow(ctx, { radius: state.size * .9, alpha: .3 });
      renderer(ctx, state);
      // mounting collar (was a plain arc) -> darker groove + light lip
      if (state.lod !== "low") {
        ctx.save();
        ctx.strokeStyle = withAlpha("#000000", .35);
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(0, 0, state.size * .78, Math.PI * .15, Math.PI * .85);
        ctx.stroke();
        ctx.strokeStyle = withAlpha(state.palette.armorLight ?? state.palette.armor, .5);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, state.size * .76, Math.PI * .15, Math.PI * .85);
        ctx.stroke();
        ctx.restore();
      }
      if (state.activity.heat > .55) {
        const heat = Math.min(1, state.activity.heat);
        ctx.strokeStyle = mixColor(state.palette.thruster, "#ffffff", heat * .3);
        ctx.lineWidth = 1.5;
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(-state.size * .4, side * state.size * .46);
          ctx.lineTo(state.size * (.1 + heat * .35), side * state.size * .58);
          ctx.stroke();
        }
      }
      if (state.activity.faulting || state.damageState === "core-disrupted")
        drawCracks(ctx, { radius: state.size * .72, color: state.palette.fault, seed: state.variantSeed, count: 3, alpha: .9 });
      else if (state.damageState === "armor-broken")
        drawCracks(ctx, { radius: state.size * .68, color: state.palette.damage, seed: state.variantSeed, count: 2, alpha: .8 });
      ctx.restore();
    },
    ids: () => [...renderers.keys()],
  };

  registry.register("core-linear-weapon", (ctx, s) => {
    paint(ctx, s, () => traceTaperedPlate(ctx, { length: s.size * 1.55, frontWidth: s.size * .55, rearWidth: s.size * .28, notch: s.size * .12 }), { span: s.size });
    for (let i = 0; i < seedCount(s, 3, 2); i++) {
      ctx.beginPath();
      ctx.ellipse(s.size * (.2 + i * .3), 0, s.size * .07, s.size * .22, 0, 0, TAU);
      glow(ctx, s, .35 + s.activity.charge * .65);
    }
    // muzzle bloom scales with firing/charge
    if (s.activity.firing || s.activity.charge > .1)
      drawBloomDot(ctx, { x: s.size * 1.5, radius: s.size * .5, color: s.palette.energy, alpha: .4 + s.activity.charge * .6 });
  });

  registry.register("core-missile-rack", (ctx, s) => {
    paint(ctx, s, () => traceCapsule(ctx, s.size * 1.35, s.size * .48));
    const bays = seedCount(s, 4, 3);
    for (let i = 0; i < bays; i++) {
      const x = -s.size * .45 + (i % Math.ceil(bays / 2)) * s.size * .45;
      const y = (i % 2 ? 1 : -1) * s.size * .22;
      traceLauncherDoor(ctx, x, y, s.size * .25, s.size * .2);
      ctx.fillStyle = withAlpha("#000000", .4);
      ctx.fill();
      traceLauncherDoor(ctx, x, y, s.size * .25, s.size * .2);
      glow(ctx, s, .45);
    }
  });

  registry.register("core-beam-emitter", (ctx, s) => {
    paint(ctx, s, () => traceTaperedPlate(ctx, { length: s.size * 1.25, frontWidth: s.size * .7, rearWidth: s.size * .2, notch: s.size * .18 }));
    traceLens(ctx, s.size * .42, 0, s.size * .22, s.size * .42);
    ctx.fillStyle = withAlpha(s.palette.energy, .25);
    ctx.fill();
    traceLens(ctx, s.size * .42, 0, s.size * .22, s.size * .42);
    glow(ctx, s, .5 + s.activity.charge * .5);
    drawBloomDot(ctx, { x: s.size * .42, radius: s.size * .38, color: s.palette.energySoft ?? s.palette.energy, alpha: .3 + s.activity.charge * .7 });
  });

  registry.register("core-mine-bay", (ctx, s) => {
    paint(ctx, s, () => traceCapsule(ctx, s.size * 1.15, s.size * .55));
    for (let i = 0; i < seedCount(s, 3, 3); i++) {
      ctx.beginPath();
      ctx.arc((i - 2) * s.size * .21, 0, s.size * .11, 0, TAU);
      ctx.fillStyle = withAlpha(s.palette.energy, .2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc((i - 2) * s.size * .21, 0, s.size * .11, 0, TAU);
      glow(ctx, s, .65);
    }
  });

  registry.register("core-drone-dock", (ctx, s) => {
    paint(ctx, s, () => traceTaperedPlate(ctx, { length: s.size * 1.2, frontWidth: s.size * .9, rearWidth: s.size * .7, notch: s.size * .1 }));
    for (const y of [-.24, .24]) {
      ctx.beginPath();
      ctx.moveTo(s.size * .12, s.size * y);
      ctx.lineTo(s.size * .85, s.size * y);
      glow(ctx, s, .55 + s.activity.activeUnits * .08);
    }
  });

  registry.register("core-shield-ring", (ctx, s) => {
    traceShieldRing(ctx, 0, 0, s.size * .66, s.size * .16);
    glow(ctx, s, .6 + s.activity.energyFlow * .4);
    ctx.beginPath();
    ctx.arc(0, 0, s.size * .22, 0, TAU);
    glow(ctx, s, .8);
    drawBloomDot(ctx, { radius: s.size * .5, color: s.palette.energy, alpha: .25 + s.activity.energyFlow * .4 });
  });

  registry.register("core-cooling-ribs", (ctx, s) => {
    paint(ctx, s, () => {
      ctx.beginPath();
      ctx.roundRect(-s.size * .68, -s.size * .13, s.size * 1.36, s.size * .26, s.size * .1);
    });
    for (let i = 0; i < seedCount(s, 5, 3); i++) {
      traceCoolingFin(ctx, -s.size * .5 + i * s.size * .2, -s.size * .22, s.size * .45, -Math.PI / 2);
      ctx.strokeStyle = s.activity.heat > .7 ? s.palette.damage : (s.palette.armorLight ?? s.palette.armor);
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
  });

  registry.register("core-reactor-chamber", (ctx, s) => {
    paint(ctx, s, () => traceCapsule(ctx, s.size * .75, s.size * .61));
    for (let i = 0; i < 3; i++) {
      traceCoil(ctx, -s.size * .35, s.size * .7, s.size * (.08 + i * .025), 4 + i);
      glow(ctx, s, .35 + s.activity.energyFlow * .55);
    }
    drawVoidCore(ctx, { radius: s.size * .28, palette: s.palette, time: s.time, seed: s.variantSeed, reducedMotion: s.lod === "low", intensity: .9 });
  });

  registry.register("core-sensor-lens", (ctx, s) => {
    paint(ctx, s, () => traceTaperedPlate(ctx, { length: s.size * .85, frontWidth: s.size * .7, rearWidth: s.size * .22, notch: 2 }));
    traceLens(ctx, s.size * .2, 0, s.size * .32, s.size * (.5 + (s.variantSeed % 3) * .08));
    ctx.fillStyle = withAlpha(s.palette.energy, .18);
    ctx.fill();
    traceLens(ctx, s.size * .2, 0, s.size * .32, s.size * (.5 + (s.variantSeed % 3) * .08));
    glow(ctx, s, .8);
  });

  registry.register("core-utility-cluster", (ctx, s) => {
    paint(ctx, s, () => traceCapsule(ctx, s.size * .9, s.size * .5));
    for (let i = 0; i < seedCount(s, 3, 3); i++) {
      ctx.beginPath();
      ctx.arc(Math.cos(i * 2.2) * s.size * .26, Math.sin(i * 2.2) * s.size * .26, s.size * .09, 0, TAU);
      glow(ctx, s, .55);
    }
  });

  registry.register("core-structural-spine", (ctx, s) => {
    paint(ctx, s, () => traceTaperedPlate(ctx, { length: s.size * 2.15, frontWidth: s.size * .58, rearWidth: s.size * .4, notch: s.size * .1 }));
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(i * s.size * .44, s.size * -.24);
      ctx.lineTo((i + 1) * s.size * .44, s.size * .24);
      ctx.strokeStyle = withAlpha(s.palette.armorLight ?? s.palette.armor, .6);
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  });

  registry.register("core-void-aperture", (ctx, s) => {
    if (s.lod !== "low") ctx.rotate(Math.sin(s.time * 1.7) * .08);
    ctx.beginPath();
    ctx.arc(0, 0, s.size * .62, 0, TAU);
    ctx.lineWidth = s.size * .22;
    glow(ctx, s, .8);
    drawVoidCore(ctx, { radius: s.size * .31, palette: s.palette, time: s.time, seed: s.variantSeed, reducedMotion: s.lod === "low", intensity: 1 });
  });

  registry.register("core-orbit-bearing", (ctx, s) => {
    paint(ctx, s, () => traceCapsule(ctx, s.size * .55, s.size * .55));
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(0, 0, s.size * (.56 + i * .16), s.size * (.22 + i * .08), i * .8 + s.time * .2, 0, TAU);
      glow(ctx, s, .45);
    }
  });

  registry.register("core-corrupted-organ", (ctx, s) => {
    ctx.beginPath();
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * TAU;
      const r = s.size * (.48 + Math.sin(i * 4 + s.variantSeed) * .12);
      i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    const g = ctx.createRadialGradient(-s.size * .2, -s.size * .2, s.size * .1, 0, 0, s.size * .6);
    g.addColorStop(0, s.palette.voidBright ?? s.palette.void);
    g.addColorStop(1, mixColor(s.palette.void, "#000000", .4));
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = s.palette.fault;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    drawVoidCore(ctx, { radius: s.size * .22, palette: s.palette, time: s.time, seed: s.variantSeed, reducedMotion: s.lod === "low", intensity: .82 });
    for (let i = 0; i < 3; i++) {
      traceThrusterNozzle(ctx, -s.size * .15 + i * s.size * .15, s.size * .32, s.size * .12);
      glow(ctx, s, .4);
    }
  });

  return registry;
}


// ===== renderers/ship-assembly/core-renderer.js =====


function tracePath(ctx, path) {
  ctx.beginPath();
  if (path.kind === "polygon") {
    path.points.forEach((point, index) => (index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)));
    ctx.closePath();
  }
  if (path.kind === "line") {
    ctx.moveTo(path.from.x, path.from.y);
    ctx.lineTo(path.to.x, path.to.y);
  }
  if (path.kind === "arc") ctx.arc(path.center.x, path.center.y, path.radius, path.start, path.end);
  if (path.kind === "lens")
    ctx.ellipse(path.center.x, path.center.y, path.radiusX, path.radiusY, path.rotation ?? 0, 0, Math.PI * 2);
}

export function renderShipCore(ctx, geometry, palette, { time = 0, lod = "high", seed = 0, layer = "all" } = {}) {
  const bounds = geometry.bounds;
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  const span = Math.max(width, height) / 2;
  const detailSeed = visualHash(seed);
  ctx.save();
  ctx.lineJoin = "round";

  if (layer !== "dynamic") {
    // sub-structure plate with directional sheen
    fillSheen(ctx, () => traceChamferedPlate(ctx, { width: width * .5, height: height * .86, chamfer: 8 }), {
      light: palette.plateLight ?? palette.metalLight ?? "#2c4655",
      base: palette.structure,
      dark: palette.hullDeep ?? palette.hull,
      span,
    });

    // hull plates: sheen fill + subtle underglow + edge stroke
    ctx.shadowBlur = lod === "low" ? 0 : 9;
    ctx.shadowColor = palette.energy;
    for (const path of geometry.hullPaths) {
      fillSheen(ctx, () => tracePath(ctx, path), {
        light: mixColor(palette.hull, "#ffffff", .28),
        base: palette.hull,
        dark: mixColor(palette.hull, "#000000", .55),
        span,
      });
      ctx.lineWidth = path.width ?? 2;
      ctx.strokeStyle = palette.edge;
      tracePath(ctx, path);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // hatch + recessed panel seams, clipped to inner hull
    if (lod !== "low") {
      ctx.save();
      traceChamferedPlate(ctx, { width: width * .48, height: height * .72, chamfer: 7 });
      ctx.clip();
      drawArmorHatch(ctx, { width: width * .55, height: height * .78, color: palette.armor, spacing: 9, alpha: .12 });
      // horizontal panel seams
      ctx.strokeStyle = withAlpha(palette.panelLine ?? "#070f16", .8);
      ctx.lineWidth = 1;
      for (let i = 1; i < 5; i += 1) {
        const y = bounds.minY + (height * i) / 5;
        ctx.beginPath();
        ctx.moveTo(bounds.minX, y);
        ctx.lineTo(bounds.maxX, y);
        ctx.stroke();
      }
      // top rim highlight
      ctx.strokeStyle = withAlpha(palette.rim ?? "#ffffff", .18);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bounds.minX + width * .1, bounds.minY + height * .06);
      ctx.lineTo(bounds.maxX - width * .1, bounds.minY + height * .06);
      ctx.stroke();
      ctx.restore();
    }

    ctx.strokeStyle = palette.armor;
    for (const path of [...geometry.armorPaths, ...geometry.structurePaths]) {
      ctx.lineWidth = path.width ?? 2;
      tracePath(ctx, path);
      ctx.stroke();
    }
    for (const path of geometry.detailPaths) {
      ctx.strokeStyle = palette.metalLight ?? palette.metal;
      tracePath(ctx, path);
      ctx.stroke();
    }
    for (const [path, color] of [[geometry.cockpitPath, palette.cockpit], [geometry.reactorPath, palette.energy]]) {
      ctx.lineWidth = path.width ?? 2;
      tracePath(ctx, path);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = palette.edge;
      ctx.stroke();
    }
    if (geometry.voidPaths.length)
      for (const path of geometry.voidPaths) {
        tracePath(ctx, path);
        ctx.strokeStyle = palette.fault;
        ctx.stroke();
      }
    if ((lod === "high" || lod === "ultra") && palette.corrupted)
      drawCracks(ctx, { radius: Math.min(width, height) * .3, color: palette.fault, seed: detailSeed, count: lod === "ultra" ? 5 : 3, alpha: .42 });
  }

  if (layer !== "static") {
    drawVoidCore(ctx, {
      x: geometry.reactorPath.center?.x ?? 0,
      y: geometry.reactorPath.center?.y ?? 18,
      radius: Math.max(4, Math.min(geometry.reactorPath.radiusX ?? 7, geometry.reactorPath.radiusY ?? 7)),
      palette,
      time,
      seed: detailSeed,
      reducedMotion: lod === "low",
      intensity: .82,
    });
    for (const path of geometry.lightPaths) {
      if (path.kind === "line")
        drawEnergyRail(ctx, { from: path.from, to: path.to, color: palette.energy, width: path.width ?? 2, flow: time, reducedMotion: lod === "low" });
      else {
        const baseAlpha = ctx.globalAlpha;
        tracePath(ctx, path);
        ctx.strokeStyle = palette.energy;
        ctx.globalAlpha = baseAlpha * .76;
        if (lod === "ultra") {
          ctx.setLineDash([4, 4]);
          ctx.lineDashOffset = -time * 10;
        }
        ctx.stroke();
        if (lod === "ultra") ctx.setLineDash([]);
        ctx.globalAlpha = baseAlpha;
      }
    }
    for (const anchor of geometry.thrusterAnchors) {
      const flame = 8 + (lod === "low" ? 0 : Math.sin(time * 9 + anchor.x) * 2);
      // additive bloom at the nozzle root
      drawBloomDot(ctx, { x: anchor.x, y: anchor.y + 1, radius: 7, color: palette.thruster, alpha: .8 });
      const gradient = ctx.createLinearGradient(anchor.x, anchor.y, anchor.x, anchor.y + flame);
      gradient.addColorStop(0, palette.thrusterCore ?? palette.cockpit);
      gradient.addColorStop(.45, palette.thruster);
      gradient.addColorStop(1, "rgba(255,80,20,0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(anchor.x - 3, anchor.y);
      ctx.lineTo(anchor.x, anchor.y + flame);
      ctx.lineTo(anchor.x + 3, anchor.y);
      ctx.fill();
      if (lod === "ultra") {
        const baseAlpha = ctx.globalAlpha;
        ctx.fillStyle = palette.thrusterCore ?? palette.cockpit;
        for (let i = 0; i < 3; i++) {
          const px = anchor.x - 2 + Math.abs(Math.sin(time * 5 + i)) * 4;
          const py = anchor.y + flame + ((time * 15 + i * 5) % 10);
          ctx.globalAlpha = baseAlpha * (1 - ((time * 15 + i * 5) % 10) / 10);
          ctx.fillRect(px, py, 1.5, 1.5);
        }
        ctx.globalAlpha = baseAlpha;
      }
    }
  }
  ctx.restore();
}

