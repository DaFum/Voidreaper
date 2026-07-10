const card = (entry, state) => `
  <article class="synergy-entry" data-state="${state}">
    <strong>${entry.name}</strong>
    <span>${state === "active" ? "ACTIVE" : state === "near" ? "NEAR" : "BLOCKED"}</span>
    ${entry.missing?.length ? `<small>Fehlt: ${entry.missing.map(item => `${item.id} ${item.minimum}`).join(", ")}</small>` : ""}
  </article>`;

export function renderSynergyList(container, result) {
  container.innerHTML = [
    ...result.active.map(entry => card(entry, "active")),
    ...result.near.map(entry => card(entry, "near")),
    ...result.blocked.map(entry => card(entry, "blocked"))
  ].join("") || '<p class="inspector-empty">Noch keine bekannte Synergie.</p>';
}
