import { escapeHtml } from "../escape-html.js";
export function createItemCard(definition, {
  selected = false,
  locked = false,
  state = locked ? "locked" : "available",
  statusLabel = state === "locked" ? "GESPERRT" : "VERFÜGBAR",
  statusDetail = "",
  actionLabel = state === "locked" ? "Freischaltweg ansehen" : "Slots wählen",
  equippedSlots = [],
  onSelect = null
} = {}) {
  const card = document.createElement(onSelect ? "button" : "article");
  card.className = "item-card";
  card.dataset.itemId = definition.id;
  card.dataset.state = state;
  card.toggleAttribute("data-selected", selected);
  if (onSelect) {
    card.type = "button";
    card.setAttribute("aria-pressed", String(selected));
    card.setAttribute("aria-label", `${definition.name ?? definition.id}, ${statusLabel.toLowerCase()}${statusDetail ? `, ${statusDetail}` : ""}`);
    card.disabled = locked;
    card.addEventListener("click", () => onSelect(definition));
  } else if (locked) card.setAttribute("aria-disabled", "true");
  const equipped = equippedSlots.length ? `<span class="item-card__equipped">${equippedSlots.map(escapeHtml).join(" · ")}</span>` : "";
  card.innerHTML = `<span class="item-card__status">${state === "locked" ? "🔒 " : ""}${escapeHtml(statusLabel)}</span><span class="item-card__slot">${escapeHtml(definition.slot)}</span><strong>${escapeHtml(definition.name)}</strong><small>${escapeHtml(definition.description ?? definition.signature ?? definition.id)}</small><div>${(definition.tags ?? []).slice(0, 4).map(tag => `<i>${escapeHtml(tag.id ?? tag)}</i>`).join("")}</div>${equipped}${statusDetail ? `<span class="item-card__reason">${escapeHtml(statusDetail)}</span>` : ""}<span class="item-card__action">${escapeHtml(actionLabel)}</span><b>${definition.energyCost ?? 0} E</b>`;
  return card;
}
