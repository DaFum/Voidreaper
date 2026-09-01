import { createItemCard, updateItemCard } from "../components/item-card.js";
import { escapeHtml } from "../escape-html.js";
import {
  deriveEquipmentCatalogEntries,
  LOADOUT_SLOT_LAYOUT,
} from "../../features/equipment/loadout-service.js";
import {
  animate,
  animateListStagger,
  animatePanelEnter,
  animatePanelExit,
  animatePressFeedback,
  animateSelectionIndicator,
} from "../motion/motion.js";
import { isReducedMotion } from "../motion/reduced-motion.js";

const TABS = [
  "Run starten",
  "Tutorials",
  "Loadout",
  "Schiffe",
  "Waffen",
  "Module",
  "Baupläne",
  "Forschung",
  "Prototypen",
  "Codex",
  "Herausforderungen",
  "Kampagnen",
  "Bergung",
  "Simulator",
  "Statistiken",
  "Einstellungen",
];
const tutorialId = (name) =>
  `hangar-tab-${name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")}`;
const UNLOCK_LABELS = Object.freeze({
  starter: "Startausrüstung",
  research: "Über Forschung freischalten",
  blueprint: "Durch Blaupause freischalten",
  challenge: "Über Herausforderung freischalten",
  secret: "Geheime Bedingung erfüllen",
});
const STATE_RANK = Object.freeze({ equipped: 0, available: 1, locked: 2 });
const CATALOG_CONFIG = Object.freeze({
  Schiffe: {
    title: "Schiffe",
    purpose: "Frames ansehen und ausrüsten",
    types: [],
  },
  Waffen: {
    title: "Waffen",
    purpose: "Primärwaffen ansehen und ausrüsten",
    types: [],
  },
  Module: {
    title: "Module",
    purpose: "Module nach Aufgabe filtern und ausrüsten",
    types: [
      ["passive", "Passiv"],
      ["active", "Aktiv"],
      ["utility", "Utility"],
      ["relic", "Relikt"],
    ],
  },
});
const SLOT_LABELS = Object.freeze({
  ship: "Schiff",
  "primary-weapon": "Waffe",
  passive: "Passiv",
  active: "Aktiv",
  utility: "Utility",
  relic: "Relikt",
});

export const resolveCurrencies = (currencies) =>
  typeof currencies === "function" ? currencies() : currencies;
export const resolveCheckpoint = (checkpoint) =>
  typeof checkpoint === "function" ? checkpoint() : checkpoint;
const resolveLoadout = (loadout) =>
  typeof loadout === "function" ? loadout() : loadout;
export const catalogUnlockLabel = (source) =>
  UNLOCK_LABELS[source] ?? "Freischaltbedingung noch unbekannt";

export function catalogEntries(
  entries,
  { query = "", status = "all", type = "all" } = {},
) {
  const normalizedQuery = query.trim().toLocaleLowerCase("de");
  return entries
    .map(({ unlocked: _unlocked, ...entry }) => {
      return {
        ...entry,
        unlockLabel: catalogUnlockLabel(entry.definition.unlockSource),
      };
    })
    .filter((entry) => {
      if (status === "available" && entry.state === "locked") return false;
      if (status === "locked" && entry.state !== "locked") return false;
      if (type !== "all" && entry.definition.slot !== type) return false;
      if (!normalizedQuery) return true;
      const searchable = [
        entry.definition.name,
        entry.definition.description,
        entry.definition.signature,
        ...(entry.definition.tags ?? []).map((tag) => tag.id ?? tag),
      ]
        .join(" ")
        .toLocaleLowerCase("de");
      return searchable.includes(normalizedQuery);
    })
    .sort(
      (left, right) =>
        STATE_RANK[left.state] - STATE_RANK[right.state] ||
        left.definition.name.localeCompare(right.definition.name, "de"),
    );
}

export function createHangarScreen(
  container,
  {
    ships,
    weapons,
    modules,
    reactors,
    currencies = {},
    checkpoint = null,
    loadout = null,
    isUnlocked = () => true,
    onEquip = async () => ({
      ok: false,
      message: "Ausrüsten ist nicht verfügbar.",
    }),
    onStart = () => {},
    onResume = () => {},
    renderTab = () => {},
  },
) {
  let tab = "Run starten";
  let focusTabAfterRender = false;
  let focusMobileAfterRender = false;
  let selectionRequestId = 0;

  const catalogState = Object.fromEntries(
    Object.keys(CATALOG_CONFIG).map((name) => [
      name,
      { query: "", status: "all", type: "all", selectedItemId: null },
    ]),
  );
  const slotLabel = (slot, index) =>
    `${SLOT_LABELS[slot] ?? slot} ${index + 1}`;
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
    const selected = container.querySelector(
      '[role="tab"][aria-selected="true"]',
    );
    if (!tabs || !selected || !tabs.clientWidth) return null;
    const tabStart = selected.offsetLeft;
    const tabEnd = tabStart + selected.offsetWidth;
    const visibleEnd = tabs.scrollLeft + tabs.clientWidth;
    let target = tabs.scrollLeft;
    if (tabStart < tabs.scrollLeft) target = Math.max(0, tabStart);
    else if (tabEnd > visibleEnd) {
      target = Math.min(
        tabs.scrollWidth - tabs.clientWidth,
        tabEnd - tabs.clientWidth,
      );
    }
    tabs.scrollLeft = target;

    // Update shared indicator position
    let indicator = tabs.querySelector(".hangar-tab-indicator");
    if (!indicator) {
      indicator = document.createElement("span");
      indicator.className = "hangar-tab-indicator";
      tabs.appendChild(indicator);
    }
    const targetBounds = selected.getBoundingClientRect();
    const containerBounds = tabs.getBoundingClientRect();
    animateSelectionIndicator(indicator, targetBounds, containerBounds, tabs.scrollLeft);

    return target;
  };
  const refreshActiveNavigation = () => {
    updateOverflowState(positionActiveTab());
  };
  const renderCatalog = (content, definitions) => {
    const definitionsById = new Map(definitions.map((d) => [d.id, d]));
    const config = CATALOG_CONFIG[tab];
    const state = catalogState[tab];
    const statusFilters = [
      ["all", "Alle"],
      ["available", "Verfügbar"],
      ["locked", "Gesperrt"],
    ];
    content.innerHTML = `<section class="hangar-catalog" data-catalog="${escapeHtml(tab)}"><header class="catalog-intro"><div><span data-catalog-title>${escapeHtml(config.title)}</span><p>${escapeHtml(config.purpose)}</p></div><strong data-catalog-progress></strong></header><div class="catalog-toolbar"><label>SUCHEN<input type="search" data-catalog-search value="${escapeHtml(state.query)}" placeholder="Name, Effekt oder Tag"></label><div class="catalog-filter-group" role="group" aria-label="Verfügbarkeit">${statusFilters.map(([value, label]) => `<button type="button" data-catalog-status="${value}" aria-pressed="${state.status === value}">${label}</button>`).join("")}</div>${config.types.length ? `<div class="catalog-filter-group" role="group" aria-label="Modultyp"><button type="button" data-catalog-type="all" aria-pressed="${state.type === "all"}">Alle</button>${config.types.map(([value, label]) => `<button type="button" data-catalog-type="${value}" aria-pressed="${state.type === value}">${label}</button>`).join("")}</div>` : ""}<span data-catalog-count aria-live="polite"></span></div><section class="catalog-selection" data-catalog-selection hidden></section><div class="item-catalog" data-catalog-results data-tutorial-id="catalog-grid"></div></section>`;
    const search = content.querySelector("[data-catalog-search]");
    const results = content.querySelector("[data-catalog-results]");
    const selection = content.querySelector("[data-catalog-selection]");
    const count = content.querySelector("[data-catalog-count]");
    const progress = content.querySelector("[data-catalog-progress]");
    const refreshCatalog = () => {
      const currentLoadout = resolveLoadout(loadout) ?? { slots: {} };
      const derivedEntries = deriveEquipmentCatalogEntries(definitions, {
        isUnlocked,
        loadout: currentLoadout,
      });
      const entries = catalogEntries(derivedEntries, {
        query: state.query,
        status: state.status,
        type: state.type,
      });
      progress.textContent = `${derivedEntries.filter((entry) => entry.unlocked).length} von ${definitions.length} freigeschaltet`;
      if (
        state.selectedItemId &&
        !entries.some((entry) => entry.definition.id === state.selectedItemId)
      )
        state.selectedItemId = null;
      count.textContent = `${entries.length} ${entries.length === 1 ? "Treffer" : "Treffer"}`;
      for (const control of content.querySelectorAll("[data-catalog-status]"))
        control.setAttribute(
          "aria-pressed",
          String(control.dataset.catalogStatus === state.status),
        );
      for (const control of content.querySelectorAll("[data-catalog-type]"))
        control.setAttribute(
          "aria-pressed",
          String(control.dataset.catalogType === state.type),
        );

      // Catalog DOM state continuity with FLIP positioning
      const existingCards = new Map();
      const oldPositions = new Map();

      for (const card of results.children) {
        if (card.getAttribute && card.getAttribute("data-catalog-empty")) continue;
        const id = card.dataset.itemId;
        if (id) {
          existingCards.set(id, card);
          if (!isReducedMotion() && typeof card.getBoundingClientRect === "function") {
            oldPositions.set(id, card.getBoundingClientRect());
          }
        }
      }

      const emptyState = results.querySelector("[data-catalog-empty]");
      if (emptyState) emptyState.remove();

      const newCards = [];
      const survivingCards = [];
      const entryIds = new Set(entries.map((e) => e.definition.id));

      const emptyHtml = `<div class="catalog-empty" data-catalog-empty><strong>Keine Treffer</strong><span>Suche oder Filter blenden derzeit alle Einträge aus.</span><button type="button" data-catalog-reset>Filter zurücksetzen</button></div>`;

      if (!entries.length) {
        if (existingCards.size > 0 && !isReducedMotion()) {
          const exitPromises = [];
          for (const [id, card] of existingCards.entries()) {
            card.style.pointerEvents = "none";
            const token = (card._exitToken = (card._exitToken || 0) + 1);
            if (typeof card.animate === "function") {
              card._exitAnim = animate(
                card,
                { opacity: [1, 0], transform: ["scale(1)", "scale(0.92)"] },
                { duration: 0.12 }
              );
              if (card._exitAnim?.finished) {
                const removalPromise = card._exitAnim.finished
                  .then(() => {
                    if (card._exitToken === token && card.parentNode) {
                      card.remove();
                    }
                  })
                  .catch(() => {});
                exitPromises.push(removalPromise);
              } else {
                card.remove();
              }
            } else {
              card.remove();
            }
          }

          if (exitPromises.length > 0) {
            queueMicrotask(() => {
              Promise.allSettled(exitPromises).then(() => {
                if (results.children.length === 0 && !results.querySelector("[data-catalog-empty]")) {
                  results.innerHTML = emptyHtml;
                }
              });
            });
          } else {
            results.replaceChildren();
            results.innerHTML = emptyHtml;
          }
        } else {
          results.replaceChildren();
          results.innerHTML = emptyHtml;
        }
      } else {
        for (const [id, card] of existingCards.entries()) {
          if (!entryIds.has(id)) {
            if (!isReducedMotion() && typeof card.animate === "function") {
              card.style.pointerEvents = "none";
              const token = (card._exitToken = (card._exitToken || 0) + 1);
              card._exitAnim = animate(card, { opacity: [1, 0], transform: ["scale(1)", "scale(0.92)"] }, { duration: 0.12 });
              if (card._exitAnim?.finished) {
                card._exitAnim.finished
                  .then(() => {
                    if (card._exitToken === token && card.parentNode) {
                      card.remove();
                    }
                  })
                  .catch(() => {});
              }
            } else {
              card.remove();
            }
          } else {
            if (card._exitAnim) {
              try { card._exitAnim.cancel(); } catch { /* ignore cancel errors */ }
              card._exitAnim = null;
              card._exitToken = (card._exitToken || 0) + 1;
            }
            card.style.pointerEvents = "";
            card.style.opacity = "1";
            card.style.transform = "none";
          }
        }

        const fragment = document.createDocumentFragment();
        for (const entry of entries) {
          const statusLabel =
            entry.state === "equipped"
              ? "AUSGERÜSTET"
              : entry.state === "locked"
                ? "GESPERRT"
                : "VERFÜGBAR";
          const actionLabel =
            entry.state === "equipped"
              ? "Belegung ändern"
              : entry.state === "locked"
                ? "Freischaltweg ansehen"
                : "Slots wählen";

          const isSelected = entry.definition.id === state.selectedItemId;
          const cardOptions = {
            selected: isSelected,
            state: entry.state,
            statusLabel,
            statusDetail: entry.state === "locked" ? entry.unlockLabel : "",
            actionLabel,
            equippedSlots: entry.equippedSlots.map(({ slot, index }) =>
              slotLabel(slot, index),
            ),
            onSelect: (definition) => {
              state.selectedItemId = definition.id;
              refreshCatalog();
            },
          };

          let card;
          if (existingCards.has(entry.definition.id)) {
            card = existingCards.get(entry.definition.id);
            const hadFocus = document.activeElement === card || (card.contains && card.contains(document.activeElement));
            updateItemCard(card, entry.definition, cardOptions);
            if (hadFocus && typeof card.focus === "function") card.focus();
            survivingCards.push(card);
          } else {
            card = createItemCard(entry.definition, cardOptions);
            newCards.push(card);
          }
          fragment.append(card);
        }

        results.append(fragment);

        if (!isReducedMotion()) {
          for (const card of survivingCards) {
            const id = card.dataset.itemId;
            const oldRect = oldPositions.get(id);
            if (oldRect && typeof card.getBoundingClientRect === "function") {
              const newRect = card.getBoundingClientRect();
              const dx = oldRect.left - newRect.left;
              const dy = oldRect.top - newRect.top;
              if ((dx !== 0 || dy !== 0) && typeof card.animate === "function") {
                animate(
                  card,
                  { transform: [`translate(${dx}px, ${dy}px)`, "translate(0px, 0px)"] },
                  { duration: 0.18, ease: [0.16, 1, 0.3, 1] }
                );
              }
            }
          }

          if (newCards.length > 0) {
            animateListStagger(newCards, { staggerDelay: 0.02, maxItems: 8 });
          }
        }
      }

      // Selection panel full lifecycle transition with token guard against exit race conditions
      const selectedEntry = entries.find(
        (entry) => entry.definition.id === state.selectedItemId,
      );

      const requestId = ++selectionRequestId;

      if (!selectedEntry) {
        if (!selection.hidden) {
          selection.hidden = true;
          if (!isReducedMotion()) {
            selection.dataset.exiting = "true";
            animatePanelExit(selection).then(() => {
              if (requestId !== selectionRequestId) return;
              delete selection.dataset.exiting;
              selection.replaceChildren();
            }).catch(() => {
              if (requestId !== selectionRequestId) return;
              delete selection.dataset.exiting;
              selection.replaceChildren();
            });
          } else {
            selection.replaceChildren();
          }
        }
        return;
      }

      const isOpening = selection.hidden || selection.dataset.exiting === "true";
      delete selection.dataset.exiting;
      selection.hidden = false;

      let html = "";
      if (selectedEntry.state === "locked") {
        html = `<header><div><small>GESPERRT</small><strong>${escapeHtml(selectedEntry.definition.name)}</strong></div><button type="button" data-catalog-selection-close aria-label="Auswahl schließen" title="Auswahl schließen">×</button></header><p>${escapeHtml(selectedEntry.unlockLabel)}</p><p data-catalog-message role="status" aria-live="polite"></p>`;
      } else {
        const slot = selectedEntry.definition.slot;
        const configuredCount = LOADOUT_SLOT_LAYOUT[slot] ?? 0;
        const slotCount = currentLoadout.slots?.[slot]?.length ?? configuredCount;
        const slotActions = Array.from({ length: slotCount }, (_, index) => {
          const current =
            currentLoadout.slots?.[slot]?.[index]?.definitionId ?? null;
          const currentName =
            definitionsById.get(current)?.name ??
            definitions.find((d) => d.id === current)?.name ??
            current ??
            "Leer";
          return `<button type="button" data-catalog-equip data-slot="${escapeHtml(slot)}" data-index="${index}"><span>${escapeHtml(slotLabel(slot, index))}</span><strong>${escapeHtml(currentName)}</strong><small>${current ? "Ersetzen" : "Hier ausrüsten"}</small></button>`;
        }).join("");
        html = `<header><div><small>${escapeHtml(selectedEntry.state === "equipped" ? "AUSGERÜSTET" : "VERFÜGBAR")}</small><strong>${escapeHtml(selectedEntry.definition.name)}</strong></div><button type="button" data-catalog-selection-close aria-label="Auswahl schließen" title="Auswahl schließen">×</button></header><div class="catalog-selection__slots">${slotActions}</div><p data-catalog-message role="status" aria-live="polite"></p>`;
      }

      selection.innerHTML = html;

      if (!isReducedMotion()) {
        if (isOpening) {
          animatePanelEnter(selection, { yOffset: 6 });
        } else {
          // Content update crossfade
          animate(selection, { opacity: [0.5, 1] }, { duration: 0.12 });
        }
      }
    };
    search.addEventListener("input", (event) => {
      state.query = event.target.value;
      refreshCatalog();
    });
    content.addEventListener("click", async (event) => {
      const status = event.target.closest("[data-catalog-status]")?.dataset
        .catalogStatus;
      if (status) {
        state.status = status;
        refreshCatalog();
        return;
      }
      const type = event.target.closest("[data-catalog-type]")?.dataset
        .catalogType;
      if (type) {
        state.type = type;
        refreshCatalog();
        return;
      }
      if (event.target.closest("[data-catalog-reset]")) {
        Object.assign(state, {
          query: "",
          status: "all",
          type: "all",
          selectedItemId: null,
        });
        search.value = "";
        refreshCatalog();
        return;
      }
      if (event.target.closest("[data-catalog-selection-close]")) {
        state.selectedItemId = null;
        refreshCatalog();
        return;
      }
      const equip = event.target.closest("[data-catalog-equip]");
      if (!equip) return;
      const selectedItemId = state.selectedItemId;
      state.selectedItemId = null;
      equip.disabled = true;
      const result = await onEquip(
        equip.dataset.slot,
        Number(equip.dataset.index),
        selectedItemId,
      );
      if (result?.ok) return;
      state.selectedItemId = selectedItemId;
      equip.disabled = false;
      content.querySelector("[data-catalog-message]").textContent =
        result?.message ?? "Ausrüsten fehlgeschlagen.";
    });
    refreshCatalog();
  };
  const render = () => {
    const currentCurrencies = resolveCurrencies(currencies) ?? {};
    const currentCheckpoint = resolveCheckpoint(checkpoint);
    const activeTabId = `hangar-panel-tab-${tutorialId(tab)}`;
    container.innerHTML = `<div class="hangar-navigation"><div class="hangar-tabs-shell" data-overflow-start="false" data-overflow-end="false"><button type="button" class="hangar-tabs-scroll" data-hangar-scroll="previous" aria-label="Vorherige Bereiche anzeigen" title="Vorherige Bereiche anzeigen">‹</button><nav class="hangar-tabs" role="tablist" aria-label="Hangar-Bereiche">${TABS.map((name) => `<button type="button" id="hangar-panel-tab-${tutorialId(name)}" data-hangar-tab="${escapeHtml(name)}" data-tutorial-id="${tutorialId(name)}" role="tab" aria-selected="${name === tab}" tabindex="${name === tab ? "0" : "-1"}">${escapeHtml(name)}</button>`).join("")}</nav><button type="button" class="hangar-tabs-scroll" data-hangar-scroll="next" aria-label="Weitere Bereiche anzeigen" title="Weitere Bereiche anzeigen">›</button></div><button type="button" class="hangar-area-toggle" data-hangar-area-toggle aria-expanded="false"><span>AKTIVER BEREICH</span><strong>${escapeHtml(tab)}</strong><i aria-hidden="true">⌄</i></button><section class="hangar-area-panel" data-hangar-area-panel role="dialog" aria-label="Hangar-Bereich wählen" hidden><header><span>BEREICH WÄHLEN</span><button type="button" data-hangar-area-close aria-label="Bereichsauswahl schließen" title="Bereichsauswahl schließen">×</button></header><div>${TABS.map((name) => `<button type="button" data-hangar-area="${escapeHtml(name)}"${name === tab ? ' aria-current="page"' : ""}>${escapeHtml(name)}</button>`).join("")}</div></section></div><section class="hangar-stage" role="tabpanel" aria-labelledby="${activeTabId}" data-active-tab="${escapeHtml(tab)}"><header class="hangar-signal"><span>VR // HANGAR LINK · ◇${currentCurrencies.voidShards ?? 0} · ⬡${currentCurrencies.bossCores ?? 0} · ◉${currentCurrencies.anomalyData ?? 0} · ✦${currentCurrencies.challengeSeals ?? 0} · ▱${currentCurrencies.salvageFragments ?? 0}</span><b>${ships.length} FRAMES · ${weapons.length} WEAPONS · ${reactors.length} CORES · ${modules.length} MODULES</b></header><div class="hangar-content"></div></section>`;
    const content = container.querySelector(".hangar-content");
    if (tab === "Run starten")
      content.innerHTML = `<div class="launch-console" data-tutorial-id="hangar-launch"><span>CAMPAIGN PATH // ARCHITECT</span><h3>BUILD THE IMPOSSIBLE.<br>PAY ITS PRICE.</h3><p>Loadout prüfen, Last bewusst wählen und den Run-Seed fixieren.</p><button type="button" class="btn" data-launch>Standard-Kampagne starten</button>${currentCheckpoint ? `<button type="button" class="btn small" data-resume data-tutorial-id="checkpoint-resume">Checkpoint fortsetzen · ${escapeHtml(currentCheckpoint.nodeId)}</button>` : ""}</div>`;
    else if (tab === "Schiffe") renderCatalog(content, ships);
    else if (tab === "Waffen") renderCatalog(content, weapons);
    else if (tab === "Module") renderCatalog(content, modules);
    else
      content.innerHTML = `<div class="hangar-placeholder"><strong>${escapeHtml(tab.toUpperCase())}</strong><span>Subsystem ist verbunden. Inhalte werden aus dem persistenten Meta-State geladen.</span></div>`;
    renderTab(tab, content);

    if (!isReducedMotion()) {
      animatePanelEnter(content, { yOffset: 6 });
    }

    const tabs = container.querySelector(".hangar-tabs");
    const selectedTab = container.querySelector(
      '[role="tab"][aria-selected="true"]',
    );
    const projectedScrollLeft = positionActiveTab();
    if (focusTabAfterRender) selectedTab?.focus();
    if (focusMobileAfterRender)
      container.querySelector("[data-hangar-area-toggle]")?.focus();
    focusTabAfterRender = false;
    focusMobileAfterRender = false;
    tabs?.addEventListener("scrollend", () => updateOverflowState(), {
      passive: true,
    });
    updateOverflowState(projectedScrollLeft);
    requestAnimationFrame(() => requestAnimationFrame(refreshActiveNavigation));
  };
  container.addEventListener("click", (event) => {
    const tabButton = event.target.closest("[data-hangar-tab]");
    if (tabButton) {
      animatePressFeedback(tabButton);
      activateTab(tabButton.dataset.hangarTab, { focus: true });
      return;
    }
    const areaButton = event.target.closest("[data-hangar-area]");
    if (areaButton) {
      activateTab(areaButton.dataset.hangarArea, { mobile: true });
      return;
    }
    if (event.target.closest("[data-hangar-area-close]")) {
      closeAreaPanel();
      return;
    }
    const areaToggle = event.target.closest("[data-hangar-area-toggle]");
    if (areaToggle) {
      const panel = container.querySelector("[data-hangar-area-panel]");
      const opening = panel.hidden;
      panel.hidden = !opening;
      areaToggle.setAttribute("aria-expanded", String(opening));
      if (opening)
        panel.querySelector('[data-hangar-area][aria-current="page"]')?.focus();
      return;
    }
    const scrollButton = event.target.closest("[data-hangar-scroll]");
    if (scrollButton) {
      const tabs = container.querySelector(".hangar-tabs");
      const direction =
        scrollButton.dataset.hangarScroll === "previous" ? -1 : 1;
      const distance = direction * Math.max(180, tabs.clientWidth * 0.7);
      const target = Math.max(
        0,
        Math.min(
          tabs.scrollWidth - tabs.clientWidth,
          tabs.scrollLeft + distance,
        ),
      );
      const prefersReducedMotion = globalThis.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const behavior =
        document.documentElement.dataset.reducedMotion === "true" ||
        prefersReducedMotion
          ? "auto"
          : "smooth";
      if (typeof tabs.scrollBy === "function")
        tabs.scrollBy({ left: distance, behavior });
      else tabs.scrollLeft += distance;
      updateOverflowState(target);
      return;
    }
    if (event.target.closest("[data-launch]")) onStart();
    if (event.target.closest("[data-resume]"))
      onResume(resolveCheckpoint(checkpoint));
  });
  container.addEventListener("keydown", (event) => {
    const tabButton = event.target.closest("[data-hangar-tab]");
    if (
      tabButton &&
      ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
    ) {
      event.preventDefault();
      const index = TABS.indexOf(tab);
      const name =
        event.key === "Home"
          ? TABS[0]
          : event.key === "End"
            ? TABS.at(-1)
            : event.key === "ArrowLeft"
              ? TABS[(index - 1 + TABS.length) % TABS.length]
              : TABS[(index + 1) % TABS.length];
      activateTab(name, { focus: true });
      return;
    }
    const panel = event.target.closest("[data-hangar-area-panel]");
    if (!panel || panel.hidden) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeAreaPanel();
      return;
    }
    if (event.key !== "Tab") return;
    const controls = [...panel.querySelectorAll("button:not([disabled])")];
    if (!controls.length) return;
    const first = controls[0],
      last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  const startScreen = container.closest("#start");
  if (startScreen && typeof MutationObserver !== "undefined") {
    const observer = new MutationObserver(() => {
      if (!container.isConnected) {
        observer.disconnect();
        return;
      }
      requestAnimationFrame(refreshActiveNavigation);
    });
    observer.observe(startScreen, {
      attributes: true,
      attributeFilter: ["data-view"],
    });
  }
  render();
  return {
    render,
    show(name) {
      activateTab(name);
    },
  };
}
