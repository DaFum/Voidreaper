import { escapeHtml } from "../escape-html.js";
export function renderExtractionScreen(root, { window: extractionWindow, onHold, onCancel }) {
  if (!root) return;
  root.innerHTML = `<section class="service-screen extraction" data-tutorial-id="extraction-options"><header>EXTRACTION WINDOW <b>${escapeHtml(extractionWindow.reason.toUpperCase())}</b></header><h2>${extractionWindow.marked.length} PROTOTYPEN MARKIERT</h2><p>Holdout ${escapeHtml(Math.ceil(extractionWindow.duration))} Sekunden. Gesicherte Systeme bleiben in diesem Run aktiv.</p><div class="bar"><i style="transform:scaleX(${escapeHtml(extractionWindow.elapsed / extractionWindow.duration)})"></i></div><button class="btn" data-hold>Extraktion halten</button><button class="btn small" data-cancel>Weiterkämpfen</button></section>`;
  root.querySelector("[data-hold]").addEventListener("click", onHold);
  root.querySelector("[data-cancel]").addEventListener("click", onCancel);
}
