import { createItemCard } from "../components/item-card.js";

const TABS = ["Run starten", "Loadout", "Schiffe", "Waffen", "Module", "Baupläne", "Forschung", "Prototypen", "Codex", "Herausforderungen", "Kampagnen", "Bergung", "Simulator", "Statistiken", "Einstellungen"];

export function createHangarScreen(container, { ships, weapons, modules, reactors, currencies = {}, checkpoint = null, isUnlocked = () => true, onStart = () => {}, onResume = () => {}, renderTab = () => {} }) {
  let tab = "Run starten";
  const render = () => {
    container.innerHTML = `<nav class="hangar-tabs">${TABS.map(name => `<button data-hangar-tab="${name}" aria-current="${name === tab}">${name}</button>`).join("")}</nav><section class="hangar-stage" data-active-tab="${tab}"><header class="hangar-signal"><span>VR // HANGAR LINK · ◇${currencies.voidShards ?? 0} · ⬡${currencies.bossCores ?? 0} · ◉${currencies.anomalyData ?? 0} · ✦${currencies.challengeSeals ?? 0} · ▱${currencies.salvageFragments ?? 0}</span><b>${ships.length} FRAMES · ${weapons.length} WEAPONS · ${reactors.length} CORES · ${modules.length} MODULES</b></header><div class="hangar-content"></div></section>`;
    const content = container.querySelector(".hangar-content");
    if (tab === "Run starten") content.innerHTML = `<div class="launch-console"><span>CAMPAIGN PATH // ARCHITECT</span><h3>BUILD THE IMPOSSIBLE.<br>PAY ITS PRICE.</h3><p>Loadout prüfen, Last bewusst wählen und den Run-Seed fixieren.</p><button class="btn" data-launch>Standard-Kampagne starten</button>${checkpoint ? `<button class="btn small" data-resume>Checkpoint fortsetzen · ${checkpoint.nodeId}</button>` : ""}</div>`;
    else {
      const catalog = tab === "Schiffe" ? ships : tab === "Waffen" ? weapons : tab === "Module" ? modules : tab === "Loadout" ? [...ships, ...weapons, ...reactors] : [];
      if (catalog.length) {
        const grid = document.createElement("div"); grid.className = "item-catalog";
        for (const definition of catalog) grid.append(createItemCard(definition, { locked: !isUnlocked(definition) }));
        content.append(grid);
      } else content.innerHTML = `<div class="hangar-placeholder"><strong>${tab.toUpperCase()}</strong><span>Subsystem ist verbunden. Inhalte werden aus dem persistenten Meta-State geladen.</span></div>`;
    }
    renderTab(tab, content);
  };
  container.addEventListener("click", event => {
    const tabButton = event.target.closest("[data-hangar-tab]");
    if (tabButton) { tab = tabButton.dataset.hangarTab; render(); return; }
    if (event.target.closest("[data-launch]")) onStart();
    if (event.target.closest("[data-resume]")) onResume(checkpoint);
  });
  render();
  return { render, show(name) { if (TABS.includes(name)) { tab = name; render(); } } };
}
