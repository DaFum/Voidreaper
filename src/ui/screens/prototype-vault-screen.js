import { escapeHtml } from "../escape-html.js";

export function renderPrototypeVault(root, { items, capacity, overflowCount = 0, filters = {}, onFavorite = () => {}, onDismantle = () => {}, onFilter = null }) {
  const filterValue = key => escapeHtml(filters[key] ?? "");
  const hasFilter = Object.values(filters).some(Boolean);
  root.innerHTML = `<section class="codex"><header>PROTOTYPE VAULT <b>${items.length}/${capacity} · OVERFLOW ${overflowCount}</b></header><div class="codex__filters"><label>Familie <input data-family value="${filterValue("family")}" placeholder="Familie"></label><label>Tag <input data-tag value="${filterValue("tag")}" placeholder="Tag"></label><label>Seltenheit <input data-rarity value="${filterValue("rarity")}" placeholder="Seltenheit"></label><label>Herkunft <input data-source value="${filterValue("source")}" placeholder="Herkunft"></label></div><div class="codex__grid">${items.length ? items.map(item => `<article><span>${item.rarity} · ${item.stability ?? "stable"}</span><h3>${escapeHtml(item.name)}</h3><p>${(item.tags ?? []).map(tag => escapeHtml(tag.id ?? tag)).join(" · ")}</p><button data-favorite="${item.instanceId}" aria-label="Favorit" aria-pressed="${item.favorite ? "true" : "false"}">${item.favorite ? "★" : "☆"}</button><button data-dismantle="${item.instanceId}" ${item.favorite ? "disabled" : ""}>Zerlegen</button></article>`).join("") : `<div class="vault-empty"><strong>${hasFilter ? "KEINE TREFFER" : "VAULT LEER"}</strong><span>${hasFilter ? "Kein Prototyp entspricht den aktuellen Filtern." : "Extrahiere Prototypen aus Runs, um sie hier zu sichern."}</span></div>`}</div></section>`;
  root.onclick = event => { const favorite = event.target.closest("[data-favorite]"); const dismantle = event.target.closest("[data-dismantle]"); if (favorite) onFavorite(favorite.dataset.favorite); if (dismantle) onDismantle(dismantle.dataset.dismantle); };
  if (onFilter) root.onchange = event => {
    if (!event.target.closest(".codex__filters")) return;
    onFilter({ family: root.querySelector("[data-family]").value.trim(), tag: root.querySelector("[data-tag]").value.trim(), rarity: root.querySelector("[data-rarity]").value.trim(), source: root.querySelector("[data-source]").value.trim() });
  };
}
