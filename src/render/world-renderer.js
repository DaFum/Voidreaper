import { getRegionRules } from "../features/sectors/region-rules.js";
import { renderRegionWorld } from "./regions/region-world-renderer.js";

export function renderWorld(context, run, camera, viewport = {}) {
  const width=viewport.width??context.canvas.clientWidth??context.canvas.width,height=viewport.height??context.canvas.clientHeight??context.canvas.height;
  const rules = getRegionRules(run.campaign?.map?.regions?.[run.campaign.regionIndex]?.id, run.time);
  context.save();
  context.translate(width / 2 - camera.x, height / 2 - camera.y);
  const arena = run.arena ?? 1400;
  renderRegionWorld(context,{regionId:rules.region.id,camera,viewport:{width,height},arena,time:run.time??0,seed:run.seed??0,reducedMotion:run.settings?.reducedMotion??false});
  if (rules.visibility < 1) {
    context.fillStyle = `rgba(4, 1, 10, ${1 - rules.visibility})`;
    context.fillRect(-arena, -arena, arena * 2, arena * 2);
  }
  context.restore();
}
