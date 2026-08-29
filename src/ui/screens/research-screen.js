import { escapeHtml } from "../escape-html.js";
export function renderResearchScreen(
  container,
  nodes,
  { purchased = {}, canPurchase = () => false, onPurchase = () => {} } = {},
) {
  container.innerHTML = `<div class="research-grid">${nodes
    .map(
      (node) =>
        `<article class="research-node" data-state="${purchased[node.id] ? "owned" : canPurchase(node) ? "available" : "locked"}"><span>${escapeHtml(node.branch.replace("-", " ").toUpperCase())}</span><h3>${escapeHtml(node.name)}</h3><p>${escapeHtml(node.description)}</p><small>${
          Object.entries(node.cost)
            .map(([currency, amount]) => `${amount} ${escapeHtml(currency)}`)
            .join(" · ") || "CONDITION"
        }</small><em>${node.unlocks.map(escapeHtml).join(" · ")}</em>${(() => {
          const isOwned = purchased[node.id];
          const canBuy = canPurchase(node);
          const disabled = isOwned || !canBuy;
          const label = isOwned ? "ERFORSCHT" : "FORSCHEN";
          const disabledReason =
            !isOwned && !canBuy ? "Voraussetzungen nicht erfüllt" : "";
          const titleAttr = disabledReason ? ` title="${disabledReason}"` : "";
          const visibleReason = disabledReason
            ? ` <small>(${disabledReason})</small>`
            : "";
          return `<button type="button" data-research-id="${escapeHtml(node.id)}" ${disabled ? "disabled" : ""}${titleAttr}>${label}${visibleReason}</button>`;
        })()}</article>`,
    )
    .join("")}</div>`;
  container.onclick = (event) => {
    const button = event.target.closest("[data-research-id]");
    if (!button || button.disabled) return;
    button.disabled = true;
    onPurchase(button.dataset.researchId);
  };
}
