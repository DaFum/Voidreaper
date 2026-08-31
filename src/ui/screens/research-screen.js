import { escapeHtml } from "../escape-html.js";
import { animatePressFeedback, animate, MOTION_TIMINGS, MOTION_EASINGS } from "../motion/motion.js";
import { isReducedMotion } from "../motion/reduced-motion.js";

const previousNodeStates = new Map();

export function renderResearchScreen(
  container,
  nodes,
  { purchased = {}, canPurchase = () => false, onPurchase = () => {} } = {},
) {
  container.innerHTML = `<div class="research-grid">${nodes
    .map(
      (node) =>
        `<article class="research-node" data-id="${escapeHtml(node.id)}" data-state="${purchased[node.id] ? "owned" : canPurchase(node) ? "available" : "locked"}"><span>${escapeHtml(node.branch.replace("-", " ").toUpperCase())}</span><h3>${escapeHtml(node.name)}</h3><p>${escapeHtml(node.description)}</p><small>${
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

  if (!isReducedMotion()) {
    for (const node of nodes) {
      const currentState = purchased[node.id] ? "owned" : canPurchase(node) ? "available" : "locked";
      const prevState = previousNodeStates.get(node.id);
      if (prevState && prevState !== currentState) {
        const card = container.querySelector(`article[data-id="${node.id}"]`);
        if (card && typeof card.animate === "function") {
          if (currentState === "owned") {
            animate(card, { transform: ["scale(1)", "scale(1.04)", "scale(1)"] }, { duration: MOTION_TIMINGS.emphasis, ease: MOTION_EASINGS.impact });
          } else if (currentState === "available" && prevState === "locked") {
            animate(card, { opacity: [0.6, 1], transform: ["scale(0.96)", "scale(1)"] }, { duration: MOTION_TIMINGS.enter, ease: MOTION_EASINGS.ui });
          }
        }
      }
      previousNodeStates.set(node.id, currentState);
    }
  }

  container.onclick = (event) => {
    const button = event.target.closest("[data-research-id]");
    if (!button || button.disabled) return;
    const card = button.closest(".research-node");
    animatePressFeedback(button);
    if (card && !isReducedMotion() && typeof card.animate === "function") {
      animate(
        card,
        { transform: ["scale(1)", "scale(0.97)", "scale(1)"] },
        { duration: MOTION_TIMINGS.feedback, ease: MOTION_EASINGS.impact }
      );
    }
    button.disabled = true;
    onPurchase(button.dataset.researchId);
  };
}
