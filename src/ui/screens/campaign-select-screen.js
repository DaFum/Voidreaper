export function renderCampaignSelect(root, paths, onSelect) {
  root.innerHTML = `<section class="codex"><header>CAMPAIGN ROUTER <b>${paths.length} PATHS</b></header><div class="codex__grid">${paths.map(path => `<button class="item-card" data-path="${path.id}"><span class="item-card__slot">${path.rewardFocus}</span><strong>${path.name}</strong><small>${path.description}</small><i>${path.regions.join(" → ")}</i></button>`).join("")}</div></section>`;
  root.addEventListener("click", event => { const button = event.target.closest("[data-path]"); if (button) onSelect(button.dataset.path); }, { once: true });
}
