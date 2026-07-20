import {
  traceCapsule,
  traceCoil,
  traceCoolingFin,
  traceLauncherDoor,
  traceLens,
  traceShieldRing,
  traceThrusterNozzle,
  traceTaperedPlate,
} from "../../features/ship-assembly/geometry/path-primitives.js";
import {
  drawArmorHatch,
  drawCracks,
  drawVoidCore,
  traceChamferedPlate,
  withAlpha,
  mixColor,
  drawContactShadow,
  drawBloomDot,
} from "../forged-abyss/primitives.js";

const TAU = Math.PI * 2;
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
    ctx.save();
    if (s.lod !== "low") ctx.rotate(Math.sin(s.time * 1.7) * .08);
    ctx.beginPath();
    ctx.arc(0, 0, s.size * .62, 0, TAU);
    ctx.lineWidth = s.size * .22;
    glow(ctx, s, .8);
    drawVoidCore(ctx, { radius: s.size * .31, palette: s.palette, time: s.time, seed: s.variantSeed, reducedMotion: s.lod === "low", intensity: 1 });
    ctx.restore();
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
