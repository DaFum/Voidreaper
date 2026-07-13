import { createItemCard } from "../components/item-card.js";
import { escapeHtml } from "../escape-html.js";


const TABS = ["Run starten", "Tutorials", "Loadout", "Schiffe", "Waffen", "Module", "Baupläne", "Forschung", "Prototypen", "Codex", "Herausforderungen", "Kampagnen", "Bergung", "Simulator", "Statistiken", "Einstellungen"];
const tutorialId = name => `hangar-tab-${name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")}`;

export const resolveCurrencies = currencies => typeof currencies === "function" ? currencies() : currencies;
export const resolveCheckpoint = checkpoint => typeof checkpoint === "function" ? checkpoint() : checkpoint;

export function createHangarScreen(container, { ships, weapons, modules, reactors, currencies = {}, checkpoint = null, isUnlocked = () => true, onStart = () => {}, onResume = () => {}, renderTab = () => {} }) {
  let tab = "Run starten";
  const render = () => {
    const currentCurrencies = resolveCurrencies(currencies) ?? {};
    const currentCheckpoint = resolveCheckpoint(checkpoint);
    const focusedTab = container.contains(document.activeElement) ? document.activeElement.dataset?.hangarTab : null;
    container.innerHTML = `<nav class="hangar-tabs" role="tablist" aria-label="Hangar-Bereiche">${TABS.map(name => `<button data-hangar-tab="${escapeHtml(name)}" data-tutorial-id="${tutorialId(name)}" role="tab" aria-selected="${name === tab}">${escapeHtml(name)}</button>`).join("")}</nav><section class="hangar-stage" data-active-tab="${tab}"><header class="hangar-signal"><span>VR // HANGAR LINK · ◇${currentCurrencies.voidShards ?? 0} · ⬡${currentCurrencies.bossCores ?? 0} · ◉${currentCurrencies.anomalyData ?? 0} · ✦${currentCurrencies.challengeSeals ?? 0} · ▱${currentCurrencies.salvageFragments ?? 0}</span><b>${ships.length} FRAMES · ${weapons.length} WEAPONS · ${reactors.length} CORES · ${modules.length} MODULES</b></header><div class="hangar-content"></div></section>`;
    const content = container.querySelector(".hangar-content");
    if (tab === "Run starten") content.innerHTML = `<div class="launch-console" data-tutorial-id="hangar-launch"><span>CAMPAIGN PATH // ARCHITECT</span><h3>BUILD THE IMPOSSIBLE.<br>PAY ITS PRICE.</h3><p>Loadout prüfen, Last bewusst wählen und den Run-Seed fixieren.</p><button class="btn" data-launch>Standard-Kampagne starten</button>${currentCheckpoint ? `<button class="btn small" data-resume data-tutorial-id="checkpoint-resume">Checkpoint fortsetzen · ${escapeHtml(currentCheckpoint.nodeId)}</button>` : ""}</div>`;
    else {
      const catalog = tab === "Schiffe" ? ships : tab === "Waffen" ? weapons : tab === "Module" ? modules : [];
      if (catalog.length) {
        const grid = document.createElement("div"); grid.className = "item-catalog"; grid.dataset.tutorialId = "catalog-grid";
        for (const definition of catalog) grid.append(createItemCard(definition, { locked: !isUnlocked(definition) }));
        content.append(grid);
      } else content.innerHTML = `<div class="hangar-placeholder"><strong>${escapeHtml(tab.toUpperCase())}</strong><span>Subsystem ist verbunden. Inhalte werden aus dem persistenten Meta-State geladen.</span></div>`;
    }
    renderTab(tab, content);
    if (focusedTab) container.querySelector(`[data-hangar-tab="${focusedTab}"]`)?.focus();
    container.querySelector('[role="tab"][aria-selected="true"]')?.scrollIntoView({ block: "nearest", inline: "nearest" });
  };
  container.addEventListener("click", event => {
    const tabButton = event.target.closest("[data-hangar-tab]");
    if (tabButton) { tab = tabButton.dataset.hangarTab; render(); return; }
    if (event.target.closest("[data-launch]")) onStart();
    if (event.target.closest("[data-resume]")) onResume(resolveCheckpoint(checkpoint));
  });
  render();
  return { render, show(name) { if (TABS.includes(name)) { tab = name; render(); } } };
}
