import { escapeHtml } from "../escape-html.js";
import { placeTutorialCard } from "./tutorial-position.js";

const STATIC_TUTORIAL_TARGETS = {
  game: "game-canvas",
  "resource-meters": "hud-resources",
  pausebtn: "hud-pause",
  resumebtn: "pause-resume",
  dodgebtn: "hud-dodge",
  "combat-actions": "hud-active-modules",
  levelopts: "levelup-options"
};

const TARGET_NOT_VISIBLE_MESSAGE = "Ziel ist nicht sichtbar. Öffne den zugehörigen Bereich.";

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

  const refresh = () => {
    if (!model?.active) return;
    target = targetId ? resolveTarget(targetId) : null;
    const ring = root.querySelector(".tutorial-focus");
    const card = root.querySelector(".tutorial-card");
    const status = root.querySelector('[data-role="status"]');
    if (!ring || !card) return;
    const statusText = target || !targetId ? "" : TARGET_NOT_VISIBLE_MESSAGE;
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
    root.hidden = !next?.active;
    if (root.hidden) {
      root.replaceChildren();
      return;
    }
    const { chapter, step, stepIndex, stepCount, paused } = next.active;
    targetId = step.target ?? null;
    target = targetId ? resolveTarget(targetId) : null;
    root.innerHTML = `<div class="tutorial-veil" aria-hidden="true"></div><div class="tutorial-focus" aria-hidden="true"></div><section class="tutorial-card" role="dialog" aria-labelledby="tutorial-title"><span>${escapeHtml(chapter.title)} · ${stepIndex + 1}/${stepCount}</span><h2 id="tutorial-title">${escapeHtml(step.title)}</h2><p>${escapeHtml(step.body)}</p>${step.hint ? `<small>${escapeHtml(step.hint)}</small>` : ""}<p data-role="status" aria-live="polite">${target || !step.target ? "" : TARGET_NOT_VISIBLE_MESSAGE}</p><footer><button data-action="back">ZURÜCK</button><button data-action="${paused ? "resume" : "pause"}">${paused ? "FORTSETZEN" : "PAUSIEREN"}</button><button data-action="skip">ÜBERSPRINGEN</button><button data-action="stop">BEENDEN</button>${(step.kind === "explanation" || step.optional) && !paused ? '<button data-action="next">WEITER</button>' : ""}</footer></section>`;
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
  observer.observe(document.body, { childList: true, subtree: true });
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
      if (refreshFrame != null) cancelAnimationFrame(refreshFrame);
      root.replaceChildren();
    }
  };
}
