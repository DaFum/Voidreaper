import { normalize, perpendicular, scale, sub } from "../../features/ship-assembly/geometry/vector-math.js";
import { fillSheen, mixColor, withAlpha, drawContactShadow } from "../forged-abyss/primitives.js";

const FAMILY_DETAIL=Object.freeze({"tapered-blade":.52,"heavy-block":.92,"phase-shard":.38,"thermal-open":.3,"void-organic":.64,"carrier-frame":.48,"reaper-curve":.45,streamline:.34,"industrial-truss":.72,"null-fracture":.42});

export function renderAdaptiveArmor(ctx, plates, palette, { lod="high" }={}) {
  ctx.save();
  ctx.lineJoin="round";
  for(const plate of plates) {
    const n = perpendicular(normalize(sub(plate.end, plate.start))), w = 7 * (FAMILY_DETAIL[plate.family] ?? .5) * plate.taper;
    const a = { x: plate.start.x + n.x * w, y: plate.start.y + n.y * w };
    const b = { x: plate.end.x + n.x * w * .7, y: plate.end.y + n.y * w * .7 };
    const c = { x: plate.end.x - n.x * w * .7, y: plate.end.y - n.y * w * .7 };
    const d = { x: plate.start.x - n.x * w, y: plate.start.y - n.y * w };

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    if(plate.family === "reaper-curve" || plate.family === "void-organic") {
      ctx.quadraticCurveTo((a.x + b.x) / 2 + n.x * w * .35, (a.y + b.y) / 2 + n.y * w * .35, b.x, b.y);
    } else {
      ctx.lineTo(b.x, b.y);
    }
    ctx.lineTo(c.x, c.y);
    if(plate.family === "null-fracture" && plate.index % 2) {
      ctx.lineTo((a.x + d.x) / 2 - n.x * w * .25, (a.y + d.y) / 2 - n.y * w * .25);
    }
    ctx.lineTo(d.x, d.y);
    ctx.closePath();

    if (lod !== "low") {
      drawContactShadow(ctx, () => {
        ctx.fill();
      }, 3, 0.4);
    }

    const baseColor = plate.family === "void-organic" || plate.family === "null-fracture" ? palette.void : palette.armor;

    if (lod !== "low") {
      ctx.fillStyle = fillSheen(ctx, baseColor, mixColor(baseColor, "#ffffff", 0.15), {x: a.x, y: Math.min(a.y, b.y, c.y, d.y) - 5, w: 0, h: Math.abs(a.y - d.y) + 10});
    } else {
      ctx.fillStyle = baseColor;
    }

    ctx.strokeStyle = plate.family === "thermal-open" ? palette.thruster : palette.edge;
    ctx.lineWidth = plate.family === "heavy-block" ? 2.2 : 1.2;
    ctx.fill();
    ctx.stroke();

    if (lod !== "low") {
      ctx.save();
      ctx.clip();
      ctx.strokeStyle = withAlpha(palette.rim || "#ffffff", 0.35);
      ctx.lineWidth = 2;
      ctx.stroke();

      // Panel seams
      ctx.beginPath();
      ctx.moveTo((a.x + d.x) / 2, (a.y + d.y) / 2);
      ctx.lineTo((b.x + c.x) / 2, (b.y + c.y) / 2);
      ctx.strokeStyle = withAlpha("#000000", 0.4);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    if (plate.family === "industrial-truss" || plate.family === "carrier-frame") {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(c.x, c.y);
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(d.x, d.y);
      ctx.strokeStyle = palette.structure;
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function renderBalanceDecorators(ctx, decorators, palette) {
  ctx.save();
  ctx.strokeStyle = palette.armor;
  ctx.fillStyle = palette.structure;
  for(const d of decorators) {
    ctx.save();
    ctx.translate(d.position.x, d.position.y);
    ctx.rotate(d.rotation);
    ctx.scale(d.scale, d.scale);
    ctx.beginPath();
    if (d.kind === "cooling-ribs") {
      for(let i = -2; i <= 2; i++) {
        ctx.moveTo(i * 5, -8);
        ctx.lineTo(i * 7, 9);
      }
    } else if (d.kind === "counterweight") {
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.moveTo(-16, 0);
      ctx.lineTo(16, 0);
    } else {
      ctx.moveTo(-16, -6);
      ctx.lineTo(16, 0);
      ctx.lineTo(-16, 6);
      ctx.closePath();
    }
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}
