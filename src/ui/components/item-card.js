export function createItemCard(definition, { selected = false, locked = false } = {}) {
  const button = document.createElement("button");
  button.className = "item-card";
  button.dataset.itemId = definition.id;
  button.toggleAttribute("aria-pressed", selected);
  button.disabled = locked;
  button.innerHTML = `<span class="item-card__slot">${definition.slot}</span><strong>${definition.name}</strong><small>${definition.description ?? definition.signature ?? definition.id}</small><div>${(definition.tags ?? []).slice(0, 4).map(tag => `<i>${tag.id}</i>`).join("")}</div><b>${definition.energyCost ?? 0} E</b>`;
  return button;
}
