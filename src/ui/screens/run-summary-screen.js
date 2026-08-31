import { escapeHtml } from "../escape-html.js";
import { animateListStagger, animatePanelEnter } from "../motion/motion.js";

export function renderRunSummary(
  root,
  { summary, assemblySnapshot, blueprints, onBlueprintChoice } = {},
) {
  if (!root) return;
  root.innerHTML = `<section class="service-screen run-summary" data-tutorial-id="run-summary"><header>RUN ABGESCHLOSSEN <b>KONSTRUKTION GESICHERT</b></header><h2>${summary?.victory ? "SIGNAL STABIL" : "SIGNAL ABGEBROCHEN"}</h2><div class="summary-grid"><p>KNOTEN <b>${escapeHtml(Object.keys(assemblySnapshot?.nodesById ?? {}).length)}</b></p><p>ABGETRENNT <b>${escapeHtml(assemblySnapshot?.detachedItems?.length ?? 0)}</b></p><p>MASSE <b>${escapeHtml(Math.round(summary?.flightProfile?.totalMass ?? 0))}</b></p></div><fieldset><legend>KONSTRUKTION ARCHIVIEREN</legend><button type="button" data-choice="new">NEUER BAUPLAN</button><button type="button" data-choice="variant">VETERANEN-VARIANTE</button><select data-replace><option value="">BESTEHENDEN ERSETZEN …</option>${(blueprints ?? []).map((item) => `<option value="${escapeHtml(item.blueprintId)}">${escapeHtml(item.name)}</option>`).join("")}</select><button type="button" data-choice="none">NICHT SPEICHERN</button></fieldset></section>`;

  const panel = root.querySelector(".service-screen");
  if (panel) {
    animatePanelEnter(panel, { yOffset: 10 });
  }

  const gridItems = root.querySelectorAll(".summary-grid p");
  if (gridItems.length > 0) {
    animateListStagger(gridItems, { staggerDelay: 0.05, yOffset: 6 });
  }

  root.onclick = (event) => {
    const choice = event.target.closest("[data-choice]")?.dataset.choice;
    if (choice)
      onBlueprintChoice?.(choice, {
        replaceBlueprintId: root.querySelector("[data-replace]").value || null,
        veteran: choice === "variant",
      });
  };
}
