import { createItemCard } from "../components/item-card.js";
import { escapeHtml } from "../escape-html.js";


const TABS = ["Run starten", "Tutorials", "Loadout", "Schiffe", "Waffen", "Module", "Baupläne", "Forschung", "Prototypen", "Codex", "Herausforderungen", "Kampagnen", "Bergung", "Simulator", "Statistiken", "Einstellungen"];
const tutorialId = name => `hangar-tab-${name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")}`;

export const resolveCurrencies = currencies => typeof currencies === "function" ? currencies() : currencies;
export const resolveCheckpoint = checkpoint => typeof checkpoint === "function" ? checkpoint() : checkpoint;

export function createHangarScreen(container, { ships, weapons, modules, reactors, currencies = {}, checkpoint = null, isUnlocked = () => true, onStart = () => {}, onResume = () => {}, renderTab = () => {} }) {
  let tab = "Run starten";
  let focusTabAfterRender = false;
  let focusMobileAfterRender = false;
  const activateTab = (name, { focus = false, mobile = false } = {}) => {
    if (!TABS.includes(name)) return false;
    tab = name;
    focusTabAfterRender = focus;
    focusMobileAfterRender = mobile;
    render();
    return true;
  };
  const closeAreaPanel = ({ restoreFocus = true } = {}) => {
    const panel = container.querySelector("[data-hangar-area-panel]");
    const trigger = container.querySelector("[data-hangar-area-toggle]");
    if (!panel || !trigger) return;
    panel.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    if (restoreFocus) trigger.focus();
  };
  const updateOverflowState = (projectedScrollLeft) => {
    const shell = container.querySelector(".hangar-tabs-shell");
    const tabs = container.querySelector(".hangar-tabs");
    if (!shell || !tabs) return;
    const scrollLeft = projectedScrollLeft ?? tabs.scrollLeft;
    const atStart = scrollLeft <= 3;
    const atEnd = scrollLeft + tabs.clientWidth >= tabs.scrollWidth - 3;
    shell.dataset.overflowStart = String(!atStart);
    shell.dataset.overflowEnd = String(!atEnd);
    shell.querySelector('[data-hangar-scroll="previous"]').disabled = atStart;
    shell.querySelector('[data-hangar-scroll="next"]').disabled = atEnd;
  };
  const positionActiveTab = () => {
    const tabs = container.querySelector(".hangar-tabs");
    const selected = container.querySelector('[role="tab"][aria-selected="true"]');
    if (!tabs || !selected || !tabs.clientWidth) return null;
    const tabStart = selected.offsetLeft;
    const tabEnd = tabStart + selected.offsetWidth;
    const visibleEnd = tabs.scrollLeft + tabs.clientWidth;
    let target = tabs.scrollLeft;
    if (tabStart < tabs.scrollLeft) target = Math.max(0, tabStart);
    else if (tabEnd > visibleEnd) {
      target = Math.min(tabs.scrollWidth - tabs.clientWidth, tabEnd - tabs.clientWidth);
    }
    tabs.scrollLeft = target;
    return target;
  };
  const refreshActiveNavigation = () => {
    updateOverflowState(positionActiveTab());
  };
  const render = () => {
    const currentCurrencies = resolveCurrencies(currencies) ?? {};
    const currentCheckpoint = resolveCheckpoint(checkpoint);
    container.innerHTML = `<div class="hangar-navigation"><div class="hangar-tabs-shell" data-overflow-start="false" data-overflow-end="false"><button type="button" class="hangar-tabs-scroll" data-hangar-scroll="previous" aria-label="Vorherige Bereiche anzeigen">‹</button><nav class="hangar-tabs" role="tablist" aria-label="Hangar-Bereiche">${TABS.map(name => `<button type="button" data-hangar-tab="${escapeHtml(name)}" data-tutorial-id="${tutorialId(name)}" role="tab" aria-selected="${name === tab}" tabindex="${name === tab ? "0" : "-1"}">${escapeHtml(name)}</button>`).join("")}</nav><button type="button" class="hangar-tabs-scroll" data-hangar-scroll="next" aria-label="Weitere Bereiche anzeigen">›</button></div><button type="button" class="hangar-area-toggle" data-hangar-area-toggle aria-expanded="false"><span>AKTIVER BEREICH</span><strong>${escapeHtml(tab)}</strong><i aria-hidden="true">⌄</i></button><section class="hangar-area-panel" data-hangar-area-panel role="dialog" aria-label="Hangar-Bereich wählen" hidden><header><span>BEREICH WÄHLEN</span><button type="button" data-hangar-area-close aria-label="Bereichsauswahl schließen">×</button></header><div>${TABS.map(name => `<button type="button" data-hangar-area="${escapeHtml(name)}"${name === tab ? ' aria-current="page"' : ""}>${escapeHtml(name)}</button>`).join("")}</div></section></div><section class="hangar-stage" data-active-tab="${escapeHtml(tab)}"><header class="hangar-signal"><span>VR // HANGAR LINK · ◇${currentCurrencies.voidShards ?? 0} · ⬡${currentCurrencies.bossCores ?? 0} · ◉${currentCurrencies.anomalyData ?? 0} · ✦${currentCurrencies.challengeSeals ?? 0} · ▱${currentCurrencies.salvageFragments ?? 0}</span><b>${ships.length} FRAMES · ${weapons.length} WEAPONS · ${reactors.length} CORES · ${modules.length} MODULES</b></header><div class="hangar-content"></div></section>`;
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
    const tabs = container.querySelector(".hangar-tabs");
    const selectedTab = container.querySelector('[role="tab"][aria-selected="true"]');
    const projectedScrollLeft = positionActiveTab();
    if (focusTabAfterRender) selectedTab?.focus();
    if (focusMobileAfterRender) container.querySelector("[data-hangar-area-toggle]")?.focus();
    focusTabAfterRender = false;
    focusMobileAfterRender = false;
    tabs?.addEventListener("scrollend", () => updateOverflowState(), { passive: true });
    updateOverflowState(projectedScrollLeft);
    requestAnimationFrame(() => requestAnimationFrame(refreshActiveNavigation));
  };
  container.addEventListener("click", event => {
    const tabButton = event.target.closest("[data-hangar-tab]");
    if (tabButton) { activateTab(tabButton.dataset.hangarTab, { focus: true }); return; }
    const areaButton = event.target.closest("[data-hangar-area]");
    if (areaButton) { activateTab(areaButton.dataset.hangarArea, { mobile: true }); return; }
    if (event.target.closest("[data-hangar-area-close]")) { closeAreaPanel(); return; }
    const areaToggle = event.target.closest("[data-hangar-area-toggle]");
    if (areaToggle) {
      const panel = container.querySelector("[data-hangar-area-panel]");
      const opening = panel.hidden;
      panel.hidden = !opening;
      areaToggle.setAttribute("aria-expanded", String(opening));
      if (opening) panel.querySelector('[data-hangar-area][aria-current="page"]')?.focus();
      return;
    }
    const scrollButton = event.target.closest("[data-hangar-scroll]");
    if (scrollButton) {
      const tabs = container.querySelector(".hangar-tabs");
      const direction = scrollButton.dataset.hangarScroll === "previous" ? -1 : 1;
      const distance = direction * Math.max(180, tabs.clientWidth * .7);
      const target = Math.max(0, Math.min(tabs.scrollWidth - tabs.clientWidth, tabs.scrollLeft + distance));
      const prefersReducedMotion = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const behavior = document.documentElement.dataset.reducedMotion === "true" || prefersReducedMotion ? "auto" : "smooth";
      if (typeof tabs.scrollBy === "function") tabs.scrollBy({ left: distance, behavior });
      else tabs.scrollLeft += distance;
      updateOverflowState(target);
      return;
    }
    if (event.target.closest("[data-launch]")) onStart();
    if (event.target.closest("[data-resume]")) onResume(resolveCheckpoint(checkpoint));
  });
  container.addEventListener("keydown", event => {
    const tabButton = event.target.closest("[data-hangar-tab]");
    if (tabButton && ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const index = TABS.indexOf(tab);
      const name = event.key === "Home" ? TABS[0]
        : event.key === "End" ? TABS.at(-1)
          : event.key === "ArrowLeft" ? TABS[(index - 1 + TABS.length) % TABS.length]
            : TABS[(index + 1) % TABS.length];
      activateTab(name, { focus: true });
      return;
    }
    const panel = event.target.closest("[data-hangar-area-panel]");
    if (!panel || panel.hidden) return;
    if (event.key === "Escape") { event.preventDefault(); closeAreaPanel(); return; }
    if (event.key !== "Tab") return;
    const controls = [...panel.querySelectorAll("button:not([disabled])")];
    if (!controls.length) return;
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  const startScreen = container.closest("#start");
  if (startScreen && typeof MutationObserver !== "undefined") {
    new MutationObserver(() => requestAnimationFrame(refreshActiveNavigation)).observe(startScreen, {
      attributes: true,
      attributeFilter: ["data-view"]
    });
  }
  render();
  return { render, show(name) { activateTab(name); } };
}
