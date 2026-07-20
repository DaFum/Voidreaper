import {
  drawArmorHatch,
  drawCracks,
  drawEnergyRail,
  drawVoidCore,
  traceChamferedPlate,
  fillSheen,
  withAlpha,
  mixColor,
  drawBloomDot,
} from "../forged-abyss/primitives.js";
import { visualHash } from "../forged-abyss/seeded-visuals.js";

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
