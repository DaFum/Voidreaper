import { LOADOUT_SLOT_LAYOUT } from "../../features/equipment/loadout-service.js";
import { escapeHtml } from "../escape-html.js";

export function loadoutStatus(inspection) {
  if (!inspection?.sources?.length) return { percent: 0, tier: "unconfigured" };
  return { percent: Math.round(inspection.load.ratio * 100), tier: inspection.load.tier };
}

function loadoutTagIds(inspection) {
  const totals = inspection.tags?.totals ?? inspection.tags;
  return totals?.keys ? [...totals.keys()] : [];
}

export function loadoutDefinitionNames(inspection) {
  return new Map((inspection?.sources ?? [])
    .filter(source => source && (source.id ?? source.definitionId) && source.name)
    .map(source => [source.id ?? source.definitionId, source.name]));
}

export function renderLoadoutScreen(container, inspection, loadout,{blueprints=[],activeBlueprintId=null,choicesBySlot={},onBlueprintChange,onEquip,onUnequip,onNavigate}={}) {
  const status = loadoutStatus(inspection);
  const definitionNames = loadoutDefinitionNames(inspection);
  const frameName = inspection?.sources?.find(source => source.slot === "ship")?.name ?? loadout.slots.ship?.[0]?.definitionId ?? "NO SHIP";
  const slots = Object.entries(LOADOUT_SLOT_LAYOUT).flatMap(([slot, count]) => Array.from({ length: count }, (_, index) => {
    const item = loadout.slots[slot]?.[index] ?? null;
    const itemName = item ? definitionNames.get(item.definitionId) ?? item.definitionId : "EMPTY";
    const classes = slot === "ship" ? "ship-core loadout-slot" : "loadout-slot";
    return `<button class="${classes}" data-slot="${escapeHtml(slot)}" data-index="${index}" aria-label="${escapeHtml(slot)} ${escapeHtml(index + 1)}: ${escapeHtml(slot === "ship" ? frameName : itemName)}"><span>${slot === "ship" ? "FRAME" : escapeHtml(slot)}</span><strong>${escapeHtml(slot === "ship" ? frameName : itemName)}</strong>${slot === "ship" ? `<small>${escapeHtml(status.percent)}% ${escapeHtml(status.tier)}</small>` : ""}</button>`;
  })).join("");
  container.innerHTML = `<div class="loadout-orbit">${slots}</div><section class="loadout-picker" data-picker hidden></section><aside class="loadout-telemetry"><div><span>CAPACITY</span><b>${escapeHtml(inspection?.capacity ?? 0)}</b></div><div><span>RESERVED</span><b>${escapeHtml(inspection?.reserved ?? 0)}</b></div><div><span>HEAT</span><b>${escapeHtml(inspection?.expectedHeat ?? 0)}</b></div><div><span>CORRUPTION</span><b>${escapeHtml(inspection?.startingCorruption ?? 0)}</b></div><div><span>TAGS</span><b>${loadoutTagIds(inspection).map(escapeHtml).join(" · ")}</b></div><label>BAUPLAN-VORLAGE<select data-blueprint><option value="">OHNE VORLAGE</option>${blueprints.map(blueprint=>`<option value="${escapeHtml(blueprint.blueprintId)}" ${blueprint.blueprintId===activeBlueprintId?"selected":""}>${escapeHtml(blueprint.name)}</option>`).join("")}</select></label><small>Vorlagen geben keine Module oder Werte.</small></aside>`;
  const picker = container.querySelector("[data-picker]");
  const closePicker = () => { picker.hidden = true; picker.replaceChildren(); };
  const openPicker = (slot, index) => {
    const choices = choicesBySlot[slot] ?? [];
    const current = loadout.slots[slot]?.[index] ?? null;
    const emptyState = `<div class="loadout-picker__empty" data-picker-empty><p>Keine freigeschalteten Komponenten. Neue Optionen erhältst du über Forschung oder Bergung.</p><div><button data-picker-navigate="Forschung">Forschung öffnen</button><button data-picker-navigate="Bergung">Bergung öffnen</button></div></div>`;
    picker.hidden = false;
    picker.innerHTML = `<header><small>${escapeHtml(slot)} ${escapeHtml(index + 1)}</small><button data-picker-close aria-label="Auswahl schließen">×</button></header><div class="item-catalog">${choices.map(definition => `<button class="item-card" data-choice="${escapeHtml(definition.id)}" aria-pressed="${definition.id === current?.definitionId}"><strong>${escapeHtml(definition.name ?? definition.id)}</strong><small>${escapeHtml(definition.description ?? definition.id)}</small></button>`).join("") || emptyState}</div><button data-unequip${current ? "" : " disabled"}>ENTFERNEN</button>`;
    picker.onclick = event => {
      const definitionId = event.target.closest("[data-choice]")?.dataset.choice;
      if (definitionId) { onEquip?.(slot, index, definitionId); closePicker(); return; }
      const area = event.target.closest("[data-picker-navigate]")?.dataset.pickerNavigate;
      if (area) { onNavigate?.(area); return; }
      if (event.target.closest("[data-unequip]")) { onUnequip?.(slot, index); closePicker(); return; }
      if (event.target.closest("[data-picker-close]")) closePicker();
    };
  };
  container.querySelector(".loadout-orbit")?.addEventListener("click", event => {
    const control = event.target.closest("[data-slot]");
    if (control) openPicker(control.dataset.slot, Number(control.dataset.index));
  });
  container.querySelector("[data-blueprint]")?.addEventListener("change",event=>onBlueprintChange?.(event.target.value||null));
}
