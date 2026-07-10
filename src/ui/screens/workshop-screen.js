const ACTION_LABELS = { swap: "Modul wechseln", reroll: "Affix rerollen", lock: "Affix sperren", socket: "Sockel öffnen", stabilize: "Stabilisieren", corrupt: "Korruptieren", overclock: "Reaktor übertakten" };

export function renderWorkshopScreen(root, { service, session, target, onAction }) {
  if (!root) return;
  root.innerHTML = `<section class="service-screen"><header>COLD FORGE <b>${session.actionPoints - session.used} AP</b></header><h3>${target?.name ?? "Kein System gewählt"}</h3><div class="workshop-actions"></div><aside data-preview>Aktion wählen, um Kosten und endgültige Folgen zu prüfen.</aside></section>`;
  const actions = root.querySelector(".workshop-actions");
  for (const [id, label] of Object.entries(ACTION_LABELS)) {
    const button = document.createElement("button");
    button.className = "btn small";
    button.textContent = label;
    button.addEventListener("click", () => {
      const preview = service.preview(session, id, target);
      root.querySelector("[data-preview]").textContent = `${preview.points} AP · ${preview.consequence}`;
      if (preview.allowed && confirm(`${preview.consequence}\n\nEndgültig ausführen?`)) onAction(id, target);
    });
    actions.append(button);
  }
}
