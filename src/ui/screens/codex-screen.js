import { CODEX_CATEGORIES, DISCOVERY_LEVELS } from "../../content/codex/codex-categories.js";

export function renderCodexScreen(root, { entries, onFilter = () => {} }) {
  if (!root) return;
  root.innerHTML = `<section class="codex"><header>VOID CODEX <b>${entries.filter(entry => entry.level !== "unknown").length}/${entries.length} SIGNALS</b></header><div class="codex__filters"><select data-category aria-label="Kategorie"><option value="">Alle Kategorien</option>${CODEX_CATEGORIES.map(value => `<option>${value}</option>`).join("")}</select><select data-status aria-label="Entdeckungsstatus"><option value="">Alle Status</option>${DISCOVERY_LEVELS.map(value => `<option>${value}</option>`).join("")}</select><input data-tag placeholder="Tag"><input data-source placeholder="Quelle"></div><div class="codex__grid">${entries.map(entry => `<article data-level="${entry.level}"><span>${entry.category} · ${entry.level}</span><h3>${entry.name}</h3><p>${entry.description}</p><small>${entry.tags.join(" · ")}</small></article>`).join("")}</div></section>`;
  for (const control of root.querySelectorAll("select,input")) control.addEventListener("change", () => onFilter({ category: root.querySelector("[data-category]").value, status: root.querySelector("[data-status]").value, tag: root.querySelector("[data-tag]").value, source: root.querySelector("[data-source]").value }));
}

export function renderBuildHistory(root, builds, onToggleFavorite = () => {}) {
  root.innerHTML = `<div class="codex__grid">${builds.map(build => `<article><span>${build.result} · SEED ${build.seed}</span><h3>${build.ship ?? "Unknown"} / ${build.weapon ?? "Unknown"}</h3><p>${build.modules.join(" · ")}</p><button data-favorite="${build.id}">${build.favorite ? "★ Favorit" : "☆ Favorisieren"}</button></article>`).join("")}</div>`;
  root.onclick = event => { const button = event.target.closest("[data-favorite]"); if (button) onToggleFavorite(button.dataset.favorite); };
}
