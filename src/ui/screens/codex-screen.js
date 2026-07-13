import { CODEX_CATEGORIES, DISCOVERY_LEVELS } from "../../content/codex/codex-categories.js";
import { escapeHtml } from "../escape-html.js";
import { buildFocusSelector } from "../focus-restore.js";

export function renderCodexScreen(root, { entries, filters = {}, onFilter = () => {} }) {
  if (!root) return;
  const activeElement = typeof document !== 'undefined' ? document.activeElement : null;
  const focusedSelector = buildFocusSelector(root, activeElement);
  const selectionStart = activeElement?.selectionStart;
  const selectionEnd = activeElement?.selectionEnd;
  const grid = entries.length ? entries.map(entry => `<article data-level="${escapeHtml(entry.level)}"><span>${escapeHtml(entry.category)} · ${escapeHtml(entry.level)}</span><h3>${escapeHtml(entry.name)}</h3><p>${escapeHtml(entry.description)}</p><small>${entry.tags.map(escapeHtml).join(" · ")}</small></article>`).join("") : `<div class="codex__empty">KEINE PASSENDEN SIGNALE</div>`;
  root.innerHTML = `<section class="codex"><header>VOID CODEX <b>${entries.filter(entry => entry.level !== "unknown").length}/${entries.length} SIGNALS</b></header><div class="codex__filters"><select data-category aria-label="Kategorie"><option value="">Alle Kategorien</option>${CODEX_CATEGORIES.map(value => `<option value="${escapeHtml(value)}"${filters.category === value ? " selected" : ""}>${escapeHtml(value)}</option>`).join("")}</select><select data-status aria-label="Entdeckungsstatus"><option value="">Alle Status</option>${DISCOVERY_LEVELS.map(value => `<option value="${escapeHtml(value)}"${filters.status === value ? " selected" : ""}>${escapeHtml(value)}</option>`).join("")}</select><input data-tag placeholder="Tag" aria-label="Tag" value="${escapeHtml(filters.tag ?? "")}"><input data-source placeholder="Quelle" aria-label="Quelle" value="${escapeHtml(filters.source ?? "")}"></div><div class="codex__grid">${grid}</div></section>`;
  if (focusedSelector) {
    const newTarget = root.querySelector(focusedSelector);
    if (newTarget) {
      newTarget.focus();
      if (newTarget.tagName === "INPUT" && selectionStart != null) newTarget.setSelectionRange(selectionStart, selectionEnd);
    }
  }
  for (const control of root.querySelectorAll("select,input")) control.addEventListener("change", () => onFilter({ category: root.querySelector("[data-category]").value, status: root.querySelector("[data-status]").value, tag: root.querySelector("[data-tag]").value, source: root.querySelector("[data-source]").value }));
}

export function renderBuildHistory(root, builds, onToggleFavorite = () => {}) {
  root.innerHTML = `<div class="codex__grid">${builds.map(build => `<article><span>${escapeHtml(build.result)} · SEED ${build.seed}</span><h3>${escapeHtml(build.ship ?? "Unknown")} / ${escapeHtml(build.weapon ?? "Unknown")}</h3><p>${build.modules.map(escapeHtml).join(" · ")}</p><button data-favorite="${escapeHtml(build.id)}">${build.favorite ? "★ Favorit" : "☆ Favorisieren"}</button></article>`).join("")}</div>`;
  root.onclick = event => { const button = event.target.closest("[data-favorite]"); if (button) onToggleFavorite(button.dataset.favorite); };
}
