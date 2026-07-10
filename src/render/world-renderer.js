import { getRegionRules } from "../features/sectors/region-rules.js";

export function renderWorld(context, run, camera) {
  const { width, height } = context.canvas;
  const rules = getRegionRules(run.campaign?.map?.regions?.[run.campaign.regionIndex]?.id, run.time);
  const gradient = context.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height));
  gradient.addColorStop(0, rules.region.palette[0]);
  gradient.addColorStop(1, rules.region.palette[1]);
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
  context.save();
  context.translate(width / 2 - camera.x, height / 2 - camera.y);
  context.strokeStyle = rules.arenaRule === "heat" ? "rgba(255, 122, 60, 0.12)" : "rgba(76, 201, 240, 0.08)";
  context.lineWidth = 1;
  const spacing = 64;
  const arena = run.arena ?? 1400;
  for (let x = -arena; x < arena; x += spacing) {
    context.beginPath(); context.moveTo(x, -arena); context.lineTo(x, arena); context.stroke();
  }
  if (rules.visibility < 1) {
    context.fillStyle = `rgba(4, 1, 10, ${1 - rules.visibility})`;
    context.fillRect(-arena, -arena, arena * 2, arena * 2);
  }
  context.restore();
}
