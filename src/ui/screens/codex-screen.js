import { CODEX_CATEGORIES, DISCOVERY_LEVELS } from "../../content/codex/codex-categories.js";

export function renderCodexScreen(root, { entries, onFilter = () => {} }) {
  if (!root) return;
  root.innerHTML = `<section class="codex"><header>VOID CODEX <b>${entries.filter(entry => entry.level !== "unknown").length}/${entries.length} SIGNALS</b></header><div class="codex__filters"><select data-category><option value="">Alle Kategorien</option>${CODEX_CATEGORIES.map(value => `<option>${value}</option>`).join("")}</select><select data-status><option value="">Alle Status</option>${DISCOVERY_LEVELS.map(value => `<option>${value}</option>`).join("")}</select><input data-tag placeholder="Tag"><input data-source placeholder="Quelle"></div><div class="codex__grid">${entries.map(entry => `<article data-level="${entry.level}"><span>${entry.category} · ${entry.level}</span><h3>${entry.name}</h3><p>${entry.description}</p><small>${entry.tags.join(" · ")}</small></article>`).join("")}</div></section>`;
  for (const control of root.querySelectorAll("select,input")) control.addEventListener("change", () => onFilter({ category: root.querySelector("[data-category]").value, status: root.querySelector("[data-status]").value, tag: root.querySelector("[data-tag]").value, source: root.querySelector("[data-source]").value }));
}
