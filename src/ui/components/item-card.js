import { escapeHtml } from "../escape-html.js";
export function createItemCard(definition, { selected = false, locked = false } = {}) {
  const button = document.createElement("button");
  button.className = "item-card";
  button.dataset.itemId = definition.id;
  button.toggleAttribute("aria-pressed", selected);
  button.disabled = locked;
  button.innerHTML = `<span class="item-card__slot">${escapeHtml(definition.slot)}</span><strong>${escapeHtml(definition.name)}</strong><small>${escapeHtml(definition.description ?? definition.signature ?? definition.id)}</small><div>${(definition.tags ?? []).slice(0, 4).map(tag => `<i>${escapeHtml(tag.id)}</i>`).join("")}</div><b>${definition.energyCost ?? 0} E</b>`;
  return button;
}
