import { escapeHtml } from "../escape-html.js";
import { placeTutorialCard } from "./tutorial-position.js";

const STATIC_TUTORIAL_TARGETS = {
  game: "game-canvas",
  "resource-meters": "hud-resources",
  pausebtn: "hud-pause",
  resumebtn: "pause-resume",
  dodgebtn: "hud-dodge",
  "combat-actions": "hud-active-modules",
  cards: "levelup-options"
};

const TARGET_NOT_VISIBLE_MESSAGE = "Ziel ist nicht sichtbar. Öffne den zugehörigen Bereich.";

const IN_RUN_HINT = "Starte einen Run, um dieses Element zu sehen.";
const hangarTabHint = tab => `Öffne im Hangar den Tab »${tab}«.`;
const TARGET_LOCATION_HINTS = {
  "game-canvas": IN_RUN_HINT,
  "hud-dodge": IN_RUN_HINT,
  "hud-active-modules": IN_RUN_HINT,
  "hud-resources": IN_RUN_HINT,
  "hud-pause": IN_RUN_HINT,
  "hud-load": IN_RUN_HINT,
  "hud-heat": IN_RUN_HINT,
  "hud-corruption": IN_RUN_HINT,
  "pause-resume": "Öffne während eines Runs die Pause.",
  "levelup-options": "Erscheint im Run, sobald genug Beute gesammelt ist.",
  "fault-log": IN_RUN_HINT,
  "boss-health": "Erscheint im Run, sobald ein Boss aktiv ist.",
  "extraction-options": "Erscheint im Run, wenn ein Extraktionsfenster verfügbar ist.",
  "run-summary": "Erscheint nach dem Ende eines Runs.",
  "sector-map": "Starte über »Run starten« die Standard-Kampagne.",
  "sector-detail": "Wähle auf der Sektorkarte einen erreichbaren Knoten.",
  "merchant-offers": "Wähle auf der Sektorkarte einen Händler-Knoten.",
  "workshop-actions": "Wähle auf der Sektorkarte einen Werkstatt-Knoten.",
  "checkpoint-resume": "Erscheint auf der Sektorkarte, sobald ein Checkpoint existiert.",
  "anomaly-choices": "Wähle auf der Sektorkarte einen Anomalie-Knoten.",
  "quick-mount-preview": "Erscheint im Run, wenn du ein neues Modul erbeutest.",
  "quick-mount-actions": "Erscheint im Run, wenn du ein neues Modul erbeutest.",
  "workbench-stage": "Öffne die Werkbank über einen Werkstatt-Knoten im Run.",
  "workbench-actions": "Öffne die Werkbank über einen Werkstatt-Knoten im Run.",
  "loadout-screen": hangarTabHint("Loadout"),
  "catalog-grid": "Öffne im Hangar die Tabs »Schiffe«, »Waffen« oder »Module«.",
  "blueprint-library": hangarTabHint("Baupläne"),
  "blueprint-actions": hangarTabHint("Baupläne"),
  "research-grid": hangarTabHint("Forschung"),
  "prototype-vault": hangarTabHint("Prototypen"),
  "codex-filters": hangarTabHint("Codex"),
  "challenge-list": hangarTabHint("Herausforderungen"),
  "campaign-path-list": hangarTabHint("Kampagnen"),
  "salvage-signals": hangarTabHint("Bergung"),
  "simulator-start": hangarTabHint("Simulator"),
  "statistics-summary": hangarTabHint("Statistiken"),
  "settings-bindings": hangarTabHint("Einstellungen"),
  "settings-controls": hangarTabHint("Einstellungen"),
  "settings-reduced-motion": hangarTabHint("Einstellungen"),
  "settings-color-patterns": hangarTabHint("Einstellungen"),
  "touch-controls": "Sichtbar auf Touch-Geräten während eines Runs.",
  "hangar-tab-tutorials": "Kehre über »Hangar« zum Trainingsarchiv zurück."
};
const targetNotVisibleMessage = targetId => {
  const hint = TARGET_LOCATION_HINTS[targetId];
  return hint ? `Ziel ist nicht sichtbar. ${hint}` : TARGET_NOT_VISIBLE_MESSAGE;
};

export function applyTutorialTargets(root = document) {
  for (const [id, tutorialId] of Object.entries(STATIC_TUTORIAL_TARGETS)) {
    root.querySelector(`#${id}`)?.setAttribute("data-tutorial-id", tutorialId);
  }
}

export function createTutorialOverlay({ root, resolveTarget, onAction = () => {} }) {
  let model = null;
  let target = null;
  let targetId = null;
  let refreshFrame = null;
  let observing = false;

  const refresh = () => {
    if (!model?.active) return;
    target = targetId ? resolveTarget(targetId) : null;
    const ring = root.querySelector(".tutorial-focus");
    const card = root.querySelector(".tutorial-card");
    const status = root.querySelector('[data-role="status"]');
    if (!ring || !card) return;
    const statusText = target || !targetId ? "" : targetNotVisibleMessage(targetId);
    if (status && status.textContent !== statusText) status.textContent = statusText;
    ring.hidden = !target;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const size = { width: Math.min(360, card.offsetWidth || 360), height: card.offsetHeight || 240 };
    const pos = placeTutorialCard(rect, size, { width: innerWidth, height: innerHeight });
    Object.assign(ring.style, { left: `${rect.left - 6}px`, top: `${rect.top - 6}px`, width: `${rect.width + 12}px`, height: `${rect.height + 12}px` });
    Object.assign(card.style, { left: `${pos.left}px`, top: `${pos.top}px`, right: "auto", bottom: "auto" });
    card.dataset.side = pos.side;
  };

  const render = next => {
    model = next;
    setObserving(Boolean(next?.active));
    root.hidden = !next?.active;
    if (root.hidden) {
      root.replaceChildren();
      return;
    }
    const { chapter, step, stepIndex, stepCount, paused } = next.active;
    targetId = step.target ?? null;
    target = targetId ? resolveTarget(targetId) : null;
    root.innerHTML = `<div class="tutorial-veil" aria-hidden="true"></div><div class="tutorial-focus" aria-hidden="true"></div><section class="tutorial-card" role="dialog" aria-labelledby="tutorial-title"><span>${escapeHtml(chapter.title)} · ${escapeHtml(stepIndex + 1)}/${escapeHtml(stepCount)}</span><h2 id="tutorial-title">${escapeHtml(step.title)}</h2><p>${escapeHtml(step.body)}</p>${step.hint ? `<small>${escapeHtml(step.hint)}</small>` : ""}<p data-role="status" aria-live="polite">${target || !step.target ? "" : escapeHtml(targetNotVisibleMessage(step.target))}</p><footer><button data-action="back">ZURÜCK</button><button data-action="${paused ? "resume" : "pause"}">${paused ? "FORTSETZEN" : "PAUSIEREN"}</button><button data-action="skip">ÜBERSPRINGEN</button><button data-action="stop">BEENDEN</button>${(step.kind === "explanation" || step.optional) && !paused ? '<button data-action="next">WEITER</button>' : ""}</footer></section>`;
    root.onclick = event => {
      const action = event.target.closest("[data-action]")?.dataset.action;
      if (action) onAction(action);
    };
    requestAnimationFrame(refresh);
  };

  addEventListener("resize", refresh);
  addEventListener("scroll", refresh, true);
  const observer = new MutationObserver(() => {
    if (refreshFrame != null) return;
    refreshFrame = requestAnimationFrame(() => {
      refreshFrame = null;
      refresh();
    });
  });
  const setObserving = active => {
    if (active === observing) return;
    observing = active;
    if (active) observer.observe(document.body, { childList: true, subtree: true });
    else observer.disconnect();
  };
  return {
    render,
    refresh,
    destroy() {
      model = null;
      target = null;
      targetId = null;
      removeEventListener("resize", refresh);
      removeEventListener("scroll", refresh, true);
      observer.disconnect();
      observing = false;
      if (refreshFrame != null) cancelAnimationFrame(refreshFrame);
      root.onclick = null;
      root.replaceChildren();
    }
  };
}
