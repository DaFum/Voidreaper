import { escapeHtml } from "../escape-html.js";
export function renderCampaignSelect(root, paths, onSelect) {
  root.innerHTML = `<section class="codex"><header>CAMPAIGN ROUTER <b>${paths.length} ${paths.length === 1 ? "PATH" : "PATHS"}</b></header><div class="codex__grid">${paths.map(path => `<button type="button" class="item-card" data-path="${escapeHtml(path.id)}"><span class="item-card__slot">${escapeHtml(path.rewardFocus)}</span><strong>${escapeHtml(path.name)}</strong><small>${escapeHtml(path.description)}</small><i>${path.regions.map(escapeHtml).join(" → ")}</i></button>`).join("")}</div></section>`;
  root.onclick = event => { const button = event.target.closest("[data-path]"); if (button) onSelect(button.dataset.path); };
}
