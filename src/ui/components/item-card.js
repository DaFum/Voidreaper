import { escapeHtml } from "../escape-html.js";
export function updateItemCard(
  card,
  definition,
  {
    selected = false,
    locked = false,
    state = locked ? "locked" : "available",
    statusLabel = state === "locked" ? "GESPERRT" : "VERFÜGBAR",
    statusDetail = "",
    actionLabel = state === "locked" ? "Freischaltweg ansehen" : "Slots wählen",
    equippedSlots = [],
    onSelect = null,
  } = {},
) {
  card.dataset.itemId = definition.id;
  card.dataset.state = state;
  card.toggleAttribute("data-selected", selected);
  if (onSelect) {
    card.setAttribute("aria-pressed", String(selected));
    const label = `${definition.name ?? definition.id}, ${statusLabel.toLowerCase()}${statusDetail ? `, ${statusDetail}` : ""}`;
    card.setAttribute("aria-label", label);
    card.title = label;
    card.disabled = locked;
    card._onSelectHandler = () => onSelect(definition);
  } else if (locked) card.setAttribute("aria-disabled", "true");

  const equipped = equippedSlots.length
    ? `<span class="item-card__equipped">${equippedSlots.map(escapeHtml).join(" · ")}</span>`
    : "";
  card.innerHTML = `<span class="item-card__status">${state === "locked" ? "🔒 " : ""}${escapeHtml(statusLabel)}</span><span class="item-card__slot">${escapeHtml(definition.slot)}</span><strong>${escapeHtml(definition.name)}</strong><small>${escapeHtml(definition.description ?? definition.signature ?? definition.id)}</small><div>${(
    definition.tags ?? []
  )
    .slice(0, 4)
    .map((tag) => `<i>${escapeHtml(tag.id ?? tag)}</i>`)
    .join(
      "",
    )}</div>${equipped}${statusDetail ? `<span class="item-card__reason">${escapeHtml(statusDetail)}</span>` : ""}<span class="item-card__action">${escapeHtml(actionLabel)}</span><b>${definition.energyCost ?? 0} E</b>`;
  return card;
}

export function createItemCard(definition, options = {}) {
  const card = document.createElement(options.onSelect ? "button" : "article");
  card.className = "item-card";
  if (options.onSelect) {
    card.type = "button";
    card.addEventListener("click", () => card._onSelectHandler?.());
  }
  return updateItemCard(card, definition, options);
}
