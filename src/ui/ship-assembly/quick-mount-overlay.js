import { escapeHtml } from "../escape-html.js";
import {
  animatePanelEnter,
  animatePanelExit,
  animateListStagger,
  animatePressFeedback,
} from "../motion/motion.js";

export function createQuickMountOverlay(root, { onAction } = {}) {
  root.innerHTML = `<section class="quick-mount" role="dialog" aria-label="Modul montieren"><i class="quick-mount__scan"></i><header><span class="quick-mount__eyebrow">NEUES MODUL // MONTAGEFENSTER</span><h2 data-role="module-name">UNBEKANNTES MODUL</h2></header><canvas data-role="preview" data-tutorial-id="quick-mount-preview" width="480" height="240"></canvas><div class="quick-mount__reason" data-role="reason"></div><dl class="quick-mount__deltas" data-role="deltas"></dl><details><summary>DETAILDATEN</summary><div data-role="details"></div></details><footer data-tutorial-id="quick-mount-actions"><button type="button" data-action="previous" aria-label="Vorherige Position" title="Vorherige Position">◁</button><button type="button" class="quick-mount__confirm" data-action="confirm">MONTIEREN</button><button type="button" data-action="next" aria-label="Nächste Position" title="Nächste Position">▷</button><button type="button" data-action="defer">INS INVENTAR</button></footer></section>`;

  const panel = root.querySelector(".quick-mount");
  if (panel) {
    animatePanelEnter(panel, { yOffset: 12 });
  }

  root.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");
    const action = button?.dataset.action;
    if (action) {
      if (button) animatePressFeedback(button);
      if (action === "defer" || action === "confirm") {
        await animatePanelExit(panel);
      }
      onAction?.(action);
    }
  });

  return {
    root,
    canvas: root.querySelector("canvas"),
    render(model) {
      root.querySelector('[data-role="module-name"]').textContent = model.name;
      root.querySelector('[data-role="reason"]').textContent =
        model.reasons?.slice(0, 2).join(" · ") || "Strukturell kompatibel";

      const deltasContainer = root.querySelector('[data-role="deltas"]');
      deltasContainer.innerHTML = (model.deltas ?? [])
        .slice(0, 6)
        .map(
          ([key, value]) =>
            `<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd></div>`,
        )
        .join("");

      if (deltasContainer.children.length > 0) {
        animateListStagger(deltasContainer.children, { staggerDelay: 0.02, yOffset: 6 });
      }

      root.querySelector('[data-role="details"]').textContent = (
        model.details ?? []
      ).join(" · ");
    },
    dismiss() {
      return animatePanelExit(panel);
    },
  };
}
