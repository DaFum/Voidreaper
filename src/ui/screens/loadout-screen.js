import { LOADOUT_SLOT_LAYOUT } from "../../features/equipment/loadout-service.js";
import { escapeHtml } from "../escape-html.js";

export function loadoutStatus(inspection) {
  if (!inspection.sources.length) return { percent: 0, tier: "unconfigured" };
  return { percent: Math.round(inspection.load.ratio * 100), tier: inspection.load.tier };
}

export function loadoutTagIds(inspection) {
  const totals = inspection.tags?.totals ?? inspection.tags;
  return totals?.keys ? [...totals.keys()] : [];
}

export function renderLoadoutScreen(container, inspection, loadout,{blueprints=[],activeBlueprintId=null,onBlueprintChange}={}) {
  const status = loadoutStatus(inspection);
  container.innerHTML = `<div class="loadout-orbit"><div class="ship-core"><span>FRAME</span><strong>${escapeHtml(inspection.sources.find(source => source.slot === "ship")?.name ?? "NO SHIP")}</strong><small>${status.percent}% ${escapeHtml(status.tier)}</small></div>${Object.entries(LOADOUT_SLOT_LAYOUT).filter(([slot]) => slot !== "ship").flatMap(([slot, count]) => Array.from({ length: count }, (_, index) => `<button class="loadout-slot" data-slot="${escapeHtml(slot)}" data-index="${index}"><span>${escapeHtml(slot)}</span><b>${escapeHtml(loadout.slots[slot]?.[index]?.definitionId ?? "EMPTY")}</b></button>`)).join("")}</div><aside class="loadout-telemetry"><div><span>CAPACITY</span><b>${inspection.capacity}</b></div><div><span>RESERVED</span><b>${inspection.reserved}</b></div><div><span>HEAT</span><b>${inspection.expectedHeat}</b></div><div><span>CORRUPTION</span><b>${inspection.startingCorruption}</b></div><div><span>TAGS</span><b>${loadoutTagIds(inspection).map(escapeHtml).join(" · ")}</b></div><label>BAUPLAN-VORLAGE<select data-blueprint><option value="">OHNE VORLAGE</option>${blueprints.map(blueprint=>`<option value="${escapeHtml(blueprint.blueprintId)}" ${blueprint.blueprintId===activeBlueprintId?"selected":""}>${escapeHtml(blueprint.name)}</option>`).join("")}</select></label><small>Vorlagen geben keine Module oder Werte.</small></aside>`;container.querySelector("[data-blueprint]")?.addEventListener("change",event=>onBlueprintChange?.(event.target.value||null));
}
