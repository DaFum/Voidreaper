import { escapeHtml } from "../escape-html.js";
export function renderExtractionScreen(root, { window, onHold, onCancel }) {
  if (!root) return;
  root.innerHTML = `<section class="service-screen extraction"><header>EXTRACTION WINDOW <b>${escapeHtml(window.reason.toUpperCase())}</b></header><h2>${window.marked.length} PROTOTYPEN MARKIERT</h2><p>Holdout ${Math.ceil(window.duration)} Sekunden. Gesicherte Systeme bleiben in diesem Run aktiv.</p><div class="bar"><i style="transform:scaleX(${window.elapsed / window.duration})"></i></div><button class="btn" data-hold>Extraktion halten</button><button class="btn small" data-cancel>Weiterkämpfen</button></section>`;
  root.querySelector("[data-hold]").addEventListener("click", onHold);
  root.querySelector("[data-cancel]").addEventListener("click", onCancel);
}
