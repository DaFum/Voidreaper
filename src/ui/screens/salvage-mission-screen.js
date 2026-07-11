import { escapeHtml } from "../escape-html.js";
export function renderSalvageMission(root, mission, onStart) {
  root.innerHTML = `<section class="service-screen"><header>WRECK SIGNAL <b>${escapeHtml(mission.regionId)}</b></header><h2>${escapeHtml(mission.boss.carriedItem.name)}</h2><p>Der Prototype Carrier trägt das unveränderliche Original-Snapshot. Gegner übernehmen ${mission.enemyAffixes.map(affix => escapeHtml(affix.id)).join(" · ") || "keine"} Affixe.</p><div class="sector-map__graph">${mission.path.map(node => `<article class="sector-node"><b>◇</b><span>${escapeHtml(node.type)}</span><small>SEED ${node.seed}</small></article>`).join("")}</div><button class="btn" data-start-salvage>Bergungsmission starten</button></section>`;
  root.querySelector("[data-start-salvage]").addEventListener("click", onStart);
}
