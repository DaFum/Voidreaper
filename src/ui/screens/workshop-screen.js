import { escapeHtml } from "../escape-html.js";
import { uiConfirm } from "../components/modal-dialog.js";
const ACTION_LABELS = { swap: "Modul wechseln", reroll: "Affix rerollen", lock: "Affix sperren", socket: "Sockel öffnen", stabilize: "Stabilisieren", corrupt: "Korruptieren", overclock: "Reaktor übertakten" };

export function workshopDisabledReason(session, preview) {
  if (preview.allowed) return null;
  if (session.actionPoints - session.used < preview.points) return "nicht genügend Aktionspunkte";
  return "benötigter Reparaturdienst nicht verfügbar";
}

export function renderWorkshopScreen(root, { service, session, target, onAction, onLeave }) {
  if (!root) return;
  root.innerHTML = `<section class="service-screen"><header>COLD FORGE <b>${escapeHtml(session.actionPoints - session.used)} AP</b></header><h3>${escapeHtml(target?.name ?? "Kein System gewählt")}</h3><div class="workshop-actions" data-tutorial-id="workshop-actions"></div><aside data-preview>Aktion wählen, um Kosten und endgültige Folgen zu prüfen.</aside><button class="btn small" data-leave>ZURÜCK ZUR KARTE</button></section>`;
  const actions = root.querySelector(".workshop-actions");
  for (const [id, label] of Object.entries(ACTION_LABELS)) {
    const button = document.createElement("button");
    button.className = "btn small";
    button.textContent = label;
    const preview = service.preview(session, id, target);
    button.disabled = !preview.allowed;
    const disabledReason = workshopDisabledReason(session, preview);
    if (disabledReason) button.setAttribute("aria-label", `${label} – ${disabledReason}`);
    button.addEventListener("click", async () => {
      root.querySelector("[data-preview]").textContent = `${preview.points} AP · ${preview.consequence}`;
      if (preview.allowed && await uiConfirm(`${preview.consequence}\n\nEndgültig ausführen?`, { title: "COLD FORGE" })) onAction(id, target);
    });
    actions.append(button);
  }
  root.querySelector("[data-leave]").addEventListener("click", onLeave);
}
