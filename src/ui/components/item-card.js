import { escapeHtml } from "../escape-html.js";
export function createItemCard(definition, { selected = false, locked = false, onSelect = null } = {}) {
  const card = document.createElement(onSelect ? "button" : "article");
  card.className = "item-card";
  card.dataset.itemId = definition.id;
  card.toggleAttribute("data-selected", selected);
  if (onSelect) {
    card.type = "button";
    card.toggleAttribute("aria-pressed", selected);
    card.disabled = locked;
    card.addEventListener("click", () => onSelect(definition));
  } else if (locked) card.setAttribute("aria-disabled", "true");
  card.innerHTML = `<span class="item-card__slot">${escapeHtml(definition.slot)}</span><strong>${escapeHtml(definition.name)}</strong><small>${escapeHtml(definition.description ?? definition.signature ?? definition.id)}</small><div>${(definition.tags ?? []).slice(0, 4).map(tag => `<i>${escapeHtml(tag.id ?? tag)}</i>`).join("")}</div><b>${definition.energyCost ?? 0} E</b>`;
  return card;
}
