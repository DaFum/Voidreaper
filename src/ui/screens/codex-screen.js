import { CODEX_CATEGORIES, DISCOVERY_LEVELS } from "../../content/codex/codex-categories.js";
import { escapeHtml } from "../escape-html.js";

export function renderCodexScreen(root, { entries, filters = {}, onFilter = () => {} }) {
  if (!root) return;
  const grid = entries.length ? entries.map(entry => `<article data-level="${entry.level}"><span>${entry.category} · ${entry.level}</span><h3>${entry.name}</h3><p>${entry.description}</p><small>${entry.tags.join(" · ")}</small></article>`).join("") : `<div class="codex__empty">KEINE PASSENDEN SIGNALE</div>`;
  root.innerHTML = `<section class="codex"><header>VOID CODEX <b>${entries.filter(entry => entry.level !== "unknown").length}/${entries.length} SIGNALS</b></header><div class="codex__filters"><select data-category aria-label="Kategorie"><option value="">Alle Kategorien</option>${CODEX_CATEGORIES.map(value => `<option value="${value}"${filters.category === value ? " selected" : ""}>${value}</option>`).join("")}</select><select data-status aria-label="Entdeckungsstatus"><option value="">Alle Status</option>${DISCOVERY_LEVELS.map(value => `<option value="${value}"${filters.status === value ? " selected" : ""}>${value}</option>`).join("")}</select><input data-tag placeholder="Tag" aria-label="Tag" value="${escapeHtml(filters.tag ?? "")}"><input data-source placeholder="Quelle" aria-label="Quelle" value="${escapeHtml(filters.source ?? "")}"></div><div class="codex__grid">${grid}</div></section>`;
  for (const control of root.querySelectorAll("select,input")) control.addEventListener("change", () => onFilter({ category: root.querySelector("[data-category]").value, status: root.querySelector("[data-status]").value, tag: root.querySelector("[data-tag]").value, source: root.querySelector("[data-source]").value }));
}

export function renderBuildHistory(root, builds, onToggleFavorite = () => {}) {
  root.innerHTML = `<div class="codex__grid">${builds.map(build => `<article><span>${build.result} · SEED ${build.seed}</span><h3>${build.ship ?? "Unknown"} / ${build.weapon ?? "Unknown"}</h3><p>${build.modules.join(" · ")}</p><button data-favorite="${build.id}">${build.favorite ? "★ Favorit" : "☆ Favorisieren"}</button></article>`).join("")}</div>`;
  root.onclick = event => { const button = event.target.closest("[data-favorite]"); if (button) onToggleFavorite(button.dataset.favorite); };
}
